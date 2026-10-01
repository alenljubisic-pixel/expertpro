-- One global email rhythm; per-category email switches remain independent.
create table public.email_digest_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  frequency text not null default 'two_hours'
    check (frequency in ('two_hours', 'daily', 'off')),
  updated_at timestamptz not null default now()
);
alter table public.email_digest_settings enable row level security;
create policy "Users read own email digest settings"
  on public.email_digest_settings for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Users insert own email digest settings"
  on public.email_digest_settings for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Users update own email digest settings"
  on public.email_digest_settings for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
grant select, insert, update on public.email_digest_settings to authenticated;

create function private.discard_business_email_when_off()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.frequency = 'off' then
    update private.business_email_outbox
    set discarded_at = now(), claimed_at = null
    where user_id = new.user_id and sent_at is null and discarded_at is null;
    update private.business_email_dispatch
    set claimed_at = null where user_id = new.user_id;
  end if;
  return new;
end;
$$;
revoke all on function private.discard_business_email_when_off() from public, anon, authenticated;
create trigger discard_business_email_when_off
  after insert or update of frequency on public.email_digest_settings
  for each row execute function private.discard_business_email_when_off();

create or replace function private.queue_business_email()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_category text;
begin
  if new.type not in (
    'new_application', 'application_selected', 'application_confirmed',
    'application_accepted', 'application_rejected', 'application_declined',
    'job_finish_requested', 'job_completed', 'new_message'
  ) then return new; end if;

  v_category := public.notification_category(new.type);
  if exists (
    select 1 from public.notification_preferences p
    where p.user_id = new.user_id and p.category = v_category and p.email = false
  ) or exists (
    select 1 from public.email_digest_settings s
    where s.user_id = new.user_id and s.frequency = 'off'
  ) or not exists (
    select 1 from public.profiles p where p.id = new.user_id and p.is_active = true
  ) then return new; end if;

  insert into private.business_email_outbox (notification_id, user_id, created_at)
  values (new.id, new.user_id, new.created_at);
  insert into private.business_email_dispatch (user_id) values (new.user_id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create or replace function public.claim_business_email_digests(p_limit integer default 20)
returns table (recipient_user_id uuid, notification_ids uuid[], items jsonb)
language plpgsql security definer set search_path = '' as $$
declare v_recipient record;
begin
  for v_recipient in
    select d.user_id
    from private.business_email_dispatch d
    left join public.email_digest_settings s on s.user_id = d.user_id
    where coalesce(s.frequency, 'two_hours') <> 'off'
      and (d.last_sent_at is null or d.last_sent_at <= now() -
        case when s.frequency = 'daily' then interval '24 hours' else interval '2 hours' end)
      and (d.claimed_at is null or d.claimed_at <= now() - interval '10 minutes')
      and exists (
        select 1 from private.business_email_outbox e
        join public.notifications n on n.id = e.notification_id
        where e.user_id = d.user_id and e.sent_at is null and e.discarded_at is null
          and (e.claimed_at is null or e.claimed_at <= now() - interval '10 minutes')
          and not exists (
            select 1 from public.notification_preferences p
            where p.user_id = d.user_id
              and p.category = public.notification_category(n.type) and p.email = false
          )
      )
    order by d.last_sent_at nulls first, d.user_id
    limit least(greatest(coalesce(p_limit, 20), 1), 20)
    for update of d skip locked
  loop
    update private.business_email_dispatch set claimed_at = now()
    where user_id = v_recipient.user_id;

    with picked as (
      select e.notification_id from private.business_email_outbox e
      join public.notifications n on n.id = e.notification_id
      where e.user_id = v_recipient.user_id and e.sent_at is null and e.discarded_at is null
        and (e.claimed_at is null or e.claimed_at <= now() - interval '10 minutes')
        and not exists (
          select 1 from public.notification_preferences p
          where p.user_id = e.user_id
            and p.category = public.notification_category(n.type) and p.email = false
        )
      order by e.created_at, e.notification_id limit 100
      for update of e skip locked
    ), claimed as (
      update private.business_email_outbox e
      set claimed_at = now(), attempts = attempts + 1, last_error = null
      from picked where e.notification_id = picked.notification_id
      returning e.notification_id
    )
    select array_agg(notification_id) into notification_ids from claimed;

    if notification_ids is null then
      update private.business_email_dispatch set claimed_at = null
      where user_id = v_recipient.user_id;
      continue;
    end if;

    select jsonb_agg(jsonb_build_object(
      'type', n.type, 'title', n.title,
      'message', left(coalesce(n.message, ''), 140),
      'link', n.link, 'created_at', n.created_at
    ) order by n.created_at, n.id)
    into items from public.notifications n where n.id = any(notification_ids);
    recipient_user_id := v_recipient.user_id;
    return next;
  end loop;
end;
$$;
