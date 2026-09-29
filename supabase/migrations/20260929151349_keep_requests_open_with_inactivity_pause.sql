-- Requests stay open until assigned. Inactive requests are warned, then
-- paused (never deleted). Offers still use their existing 30-day expiry.
alter table public.listings
  add column if not exists last_activity_at timestamptz not null default now(),
  add column if not exists inactivity_paused boolean not null default false;

-- Give existing live requests a full grace period from rollout.
update public.listings
set expires_at = null, last_activity_at = now()
where status = 'active' and type in ('request', 'urgent');

create index if not exists applications_listing_created_idx
  on public.applications (listing_id, created_at desc);

create or replace function private.prepare_listing_lifecycle()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'UPDATE' then
    -- The marker is written by maintenance only, not by the client.
    if current_user not in ('postgres', 'service_role')
       and new.inactivity_paused is distinct from old.inactivity_paused then
      new.inactivity_paused := old.inactivity_paused;
    end if;
    if current_user not in ('postgres', 'service_role') then
      new.last_activity_at := old.last_activity_at;
      if new.updated_at is distinct from old.updated_at then
        new.updated_at := now();
      end if;
    end if;
    if old.status = 'paused' and new.status = 'active' then
      new.last_activity_at := now();
      new.inactivity_paused := false;
    end if;
  end if;
  if new.type in ('request', 'urgent') then
    new.expires_at := null;
  end if;
  return new;
end;
$$;
revoke all on function private.prepare_listing_lifecycle() from public, anon, authenticated;
create trigger trg_prepare_listing_lifecycle
  before insert or update on public.listings
  for each row execute function private.prepare_listing_lifecycle();

create or replace function private.note_listing_application_activity()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.listings set last_activity_at = now()
  where id = new.listing_id and status = 'active' and type in ('request', 'urgent');
  return new;
end;
$$;
revoke all on function private.note_listing_application_activity() from public, anon, authenticated;
create trigger trg_note_listing_application_activity
  after insert on public.applications
  for each row execute function private.note_listing_application_activity();

-- A listing already paid for must not cost another credit when the system
-- temporarily paused it for inactivity. Other free-plan checks stay intact.
create or replace function public.enforce_listing_limits()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  owner_tier text;
  active_count integer;
  v_balance integer;
begin
  if new.status is distinct from 'active' then return new; end if;
  if tg_op = 'UPDATE' and old.status = 'active' then return new; end if;
  if tg_op = 'UPDATE' and old.status = 'paused' and old.inactivity_paused then
    return new;
  end if;
  if new.type = 'urgent' then return new; end if;
  select coalesce(subscription_tier, 'free') into owner_tier
  from public.profiles where id = new.user_id;
  if owner_tier is distinct from 'free' then return new; end if;
  select count(*) into active_count from public.listings
  where user_id = new.user_id and status = 'active'
    and type <> 'urgent' and id is distinct from new.id;
  if active_count = 0 then return new; end if;
  select credit_balance into v_balance from public.profiles
  where id = new.user_id for update;
  if coalesce(v_balance, 0) < 1 then
    raise exception 'Već imaš 1 besplatan aktivan oglas. Za dodatni oglas potreban je 1 kredit — kupi na /krediti.';
  end if;
  update public.profiles set credit_balance = credit_balance - 1 where id = new.user_id;
  return new;
end;
$$;

alter table public.notifications drop constraint notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type in (
    'new_application', 'application_accepted', 'application_rejected',
    'application_selected', 'application_confirmed', 'application_declined',
    'new_message', 'new_review', 'listing_expired', 'account_approved',
    'urgent_nearby', 'job_finish_requested', 'job_completed',
    'job_finish_reminder', 'listing_inactive_check', 'listing_auto_paused'
  ));

create or replace function private.pause_inactive_requests()
returns void language plpgsql set search_path = '' as $$
begin
  insert into public.notifications (user_id, type, title, message, link, body, data)
  select l.user_id, 'listing_inactive_check', 'Da li ti još treba: ' || l.title,
    'Oglas nema novih prijava već 7 dana. Ako ti još treba radnik, otvori oglas ili ga osveži. U suprotnom će biti pauziran za 2 dana.',
    '/dashboard/oglasi', 'Proveri da li je oglas i dalje aktuelan.',
    jsonb_build_object('listing_id', l.id)
  from public.listings l
  where l.status = 'active' and l.type in ('request', 'urgent')
    and greatest(l.last_activity_at, l.updated_at, l.created_at) <= now() - interval '7 days'
    and not exists (
      select 1 from public.notifications n
      where n.type = 'listing_inactive_check'
        and n.data->>'listing_id' = l.id::text
        and n.created_at > greatest(l.last_activity_at, l.updated_at, l.created_at)
    );

  with paused as (
    update public.listings l set status = 'paused', inactivity_paused = true
    where l.status = 'active' and l.type in ('request', 'urgent')
      and greatest(l.last_activity_at, l.updated_at, l.created_at) <= now() - interval '9 days'
      and exists (
        select 1 from public.notifications n
        where n.type = 'listing_inactive_check'
          and n.data->>'listing_id' = l.id::text
          and n.created_at > greatest(l.last_activity_at, l.updated_at, l.created_at)
          and n.created_at <= now() - interval '2 days'
      )
    returning l.id, l.user_id, l.title
  )
  insert into public.notifications (user_id, type, title, message, link, body, data)
  select user_id, 'listing_auto_paused', 'Oglas je pauziran: ' || title,
    'Oglas je sklonjen sa berze zbog neaktivnosti. Možeš ga ponovo aktivirati u Mojim oglasima.',
    '/dashboard/oglasi', 'Aktiviraj oglas ako ti još treba radnik.',
    jsonb_build_object('listing_id', id)
  from paused;
end;
$$;
revoke all on function private.pause_inactive_requests() from public, anon, authenticated;
select cron.schedule(
  'expertpro-inactive-requests', '5 3 * * *',
  'select private.pause_inactive_requests()'
);
