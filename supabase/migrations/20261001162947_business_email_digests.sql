-- Email is queued only for real in-app events. Auth and credit receipts keep
-- their separate delivery paths. The user's email preference is independent
-- from whether the in-app notification was suppressed.
create table private.business_email_outbox (
  notification_id uuid primary key references public.notifications(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  claimed_at timestamptz,
  sent_at timestamptz,
  discarded_at timestamptz,
  attempts integer not null default 0,
  last_error text
);
create index business_email_outbox_pending_idx
  on private.business_email_outbox (user_id, created_at)
  where sent_at is null and discarded_at is null;
alter table private.business_email_outbox enable row level security;
revoke all on private.business_email_outbox from public, anon, authenticated;

create table private.business_email_dispatch (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  claimed_at timestamptz,
  last_sent_at timestamptz
);
alter table private.business_email_dispatch enable row level security;
revoke all on private.business_email_dispatch from public, anon, authenticated;

create function private.queue_business_email()
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
revoke all on function private.queue_business_email() from public, anon, authenticated;
create trigger queue_business_email_after_notification
  after insert on public.notifications
  for each row execute function private.queue_business_email();

create function private.discard_disabled_business_email()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.email = false and new.category in ('applications', 'messages', 'jobs') then
    update private.business_email_outbox e
    set discarded_at = now(), claimed_at = null
    from public.notifications n
    where e.notification_id = n.id and e.user_id = new.user_id
      and public.notification_category(n.type) = new.category
      and e.sent_at is null and e.discarded_at is null;
  end if;
  return new;
end;
$$;
revoke all on function private.discard_disabled_business_email() from public, anon, authenticated;
create trigger discard_disabled_business_email_after_preference
  after insert or update of email on public.notification_preferences
  for each row execute function private.discard_disabled_business_email();

-- Service-only claim returns at most 20 users and 100 events per user. Row
-- locks plus a 10-minute lease protect overlapping scheduler invocations.
create function public.claim_business_email_digests(p_limit integer default 20)
returns table (recipient_user_id uuid, notification_ids uuid[], items jsonb)
language plpgsql security definer set search_path = '' as $$
declare v_recipient record;
begin
  for v_recipient in
    select d.user_id
    from private.business_email_dispatch d
    where (d.last_sent_at is null or d.last_sent_at <= now() - interval '2 hours')
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
revoke all on function public.claim_business_email_digests(integer) from public, anon, authenticated;
grant execute on function public.claim_business_email_digests(integer) to service_role;

create function public.finish_business_email_digest(
  p_user_id uuid, p_notification_ids uuid[], p_sent boolean, p_error text default null
) returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_sent then
    update private.business_email_outbox
    set sent_at = now(), claimed_at = null, last_error = null
    where user_id = p_user_id and notification_id = any(p_notification_ids)
      and sent_at is null and discarded_at is null and claimed_at is not null;
    update private.business_email_dispatch
    set last_sent_at = now(), claimed_at = null where user_id = p_user_id;
  else
    update private.business_email_outbox
    set claimed_at = null, last_error = left(coalesce(p_error, 'Send failed'), 500)
    where user_id = p_user_id and notification_id = any(p_notification_ids)
      and sent_at is null and discarded_at is null;
    update private.business_email_dispatch set claimed_at = null
    where user_id = p_user_id;
  end if;
end;
$$;
revoke all on function public.finish_business_email_digest(uuid,uuid[],boolean,text) from public, anon, authenticated;
grant execute on function public.finish_business_email_digest(uuid,uuid[],boolean,text) to service_role;

-- Vercel Hobby limits native cron to daily. Supabase pg_cron calls a protected
-- Vercel route every 30 minutes; the two-hour cap is enforced above per user.
create extension if not exists pg_net with schema extensions;
create function private.invoke_business_email_digest()
returns void language plpgsql security definer set search_path = '' as $$
declare v_secret text;
begin
  select decrypted_secret into v_secret from vault.decrypted_secrets
  where name = 'expertpro_business_digest_secret' limit 1;
  if v_secret is null then return; end if;
  perform net.http_post(
    url := 'https://www.expertpro.app/api/cron/business-email-digests',
    headers := jsonb_build_object('Authorization', 'Bearer ' || v_secret,
                                  'Content-Type', 'application/json'),
    body := '{}'::jsonb,
    timeout_milliseconds := 5000
  );
end;
$$;
revoke all on function private.invoke_business_email_digest() from public, anon, authenticated;
select cron.schedule('expertpro-business-email-digests', '*/30 * * * *',
  'select private.invoke_business_email_digest()');
