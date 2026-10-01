-- Push is opt-in per device. The subscription endpoint is restricted to known
-- browser push services so a forged row cannot turn the sender into SSRF.
alter table public.notification_preferences
  add column push boolean not null default true;

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique check (
    length(endpoint) <= 2048 and endpoint ~
    '^https://(fcm\.googleapis\.com|updates\.push\.services\.mozilla\.com|web\.push\.apple\.com|[a-z0-9-]+\.notify\.windows\.com)/'
  ),
  p256dh text not null check (length(p256dh) between 40 and 256),
  auth text not null check (length(auth) between 16 and 128),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index push_subscriptions_user_idx on public.push_subscriptions(user_id);
alter table public.push_subscriptions enable row level security;
create policy "Users read own push subscriptions"
  on public.push_subscriptions for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Users insert own push subscriptions"
  on public.push_subscriptions for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Users update own push subscriptions"
  on public.push_subscriptions for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Users delete own push subscriptions"
  on public.push_subscriptions for delete to authenticated
  using ((select auth.uid()) = user_id);
grant select, insert, update, delete on public.push_subscriptions to authenticated;

create table private.push_deliveries (
  notification_id uuid not null references public.notifications(id) on delete cascade,
  subscription_id uuid not null references public.push_subscriptions(id) on delete cascade,
  created_at timestamptz not null default now(),
  claimed_at timestamptz,
  sent_at timestamptz,
  discarded_at timestamptz,
  attempts integer not null default 0,
  last_error text,
  primary key(notification_id, subscription_id)
);
create index push_deliveries_pending_idx on private.push_deliveries(created_at)
  where sent_at is null and discarded_at is null;
alter table private.push_deliveries enable row level security;
revoke all on private.push_deliveries from public, anon, authenticated;

create function private.invoke_push_dispatch()
returns void language plpgsql security definer set search_path = '' as $$
declare v_secret text;
begin
  select decrypted_secret into v_secret from vault.decrypted_secrets
  where name = 'expertpro_business_digest_secret' limit 1;
  if v_secret is null then return; end if;
  perform net.http_post(
    url := 'https://www.expertpro.app/api/push/dispatch',
    headers := jsonb_build_object('Authorization', 'Bearer ' || v_secret,
                                  'Content-Type', 'application/json'),
    body := '{}'::jsonb,
    timeout_milliseconds := 5000
  );
end;
$$;
revoke all on function private.invoke_push_dispatch() from public, anon, authenticated;

create function private.queue_push_delivery()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_category text;
begin
  if new.suppressed then return new; end if;
  v_category := public.notification_category(new.type);
  if v_category is not null and exists (
    select 1 from public.notification_preferences p
    where p.user_id = new.user_id and p.category = v_category and p.push = false
  ) then return new; end if;
  insert into private.push_deliveries(notification_id,subscription_id)
  select new.id, s.id from public.push_subscriptions s
  where s.user_id = new.user_id;
  if found and new.type <> 'urgent_nearby' then
    perform private.invoke_push_dispatch();
  end if;
  return new;
end;
$$;
revoke all on function private.queue_push_delivery() from public, anon, authenticated;
create trigger queue_push_delivery_after_notification
  after insert on public.notifications
  for each row execute function private.queue_push_delivery();

create function private.discard_disabled_push()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.push = false or new.in_app = false then
    update private.push_deliveries d
    set discarded_at = now(), claimed_at = null
    from public.notifications n
    where d.notification_id = n.id and n.user_id = new.user_id
      and public.notification_category(n.type) = new.category
      and d.sent_at is null and d.discarded_at is null;
  end if;
  return new;
end;
$$;
revoke all on function private.discard_disabled_push() from public, anon, authenticated;
create trigger discard_disabled_push_after_preference
  after insert or update of push,in_app on public.notification_preferences
  for each row execute function private.discard_disabled_push();

-- A new urgent request is announced only to active providers in the same
-- city and category. One notification per person even with multiple offers.
create function private.notify_relevant_urgent_listing()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.type <> 'urgent' or new.status <> 'active' then return new; end if;
  insert into public.notifications(user_id,type,title,message,link,data)
  select distinct l.user_id, 'urgent_nearby',
    'Hitno u gradu ' || new.city || ': ' || left(new.title, 90),
    'Objavljen je novi hitan posao u tvojoj oblasti.',
    '/oglasi/' || new.id::text,
    jsonb_build_object('listing_id',new.id)
  from public.listings l
  join public.profiles p on p.id=l.user_id
  where l.type='offer' and l.status='active' and l.city=new.city
    and l.category_slug=new.category_slug and l.user_id<>new.user_id
    and p.is_active=true and coalesce(p.available,true)=true;
  if found then perform private.invoke_push_dispatch(); end if;
  return new;
end;
$$;
revoke all on function private.notify_relevant_urgent_listing() from public, anon, authenticated;
create trigger notify_relevant_urgent_listing_after_insert
  after insert on public.listings
  for each row execute function private.notify_relevant_urgent_listing();

create function public.claim_push_deliveries(p_limit integer default 50)
returns table (
  notification_id uuid, subscription_id uuid, recipient_user_id uuid,
  endpoint text, p256dh text, auth text, title text, body text, link text, notification_type text
)
language plpgsql security definer set search_path = '' as $$
begin
  return query
  with picked as (
    select d.notification_id, d.subscription_id
    from private.push_deliveries d
    join public.notifications n on n.id = d.notification_id
    where d.sent_at is null and d.discarded_at is null
      and d.attempts < 5 and d.created_at > now() - interval '24 hours'
      and (d.claimed_at is null or d.claimed_at < now() - interval '5 minutes')
      and n.suppressed = false
      and not exists (
        select 1 from public.notification_preferences p
        where p.user_id = n.user_id
          and p.category = public.notification_category(n.type)
          and (p.push = false or p.in_app = false)
      )
    order by d.created_at, d.notification_id
    limit least(greatest(coalesce(p_limit,50),1),50)
    for update of d skip locked
  ), claimed as (
    update private.push_deliveries d
    set claimed_at=now(), attempts=d.attempts+1, last_error=null
    from picked p where d.notification_id=p.notification_id
      and d.subscription_id=p.subscription_id
    returning d.notification_id,d.subscription_id
  )
  select c.notification_id,c.subscription_id,n.user_id,s.endpoint,s.p256dh,s.auth,
    left(n.title,120), 'Otvori ExpertPro da vidiš detalje.', n.link,n.type
  from claimed c
  join public.notifications n on n.id=c.notification_id
  join public.push_subscriptions s on s.id=c.subscription_id;
end;
$$;
revoke all on function public.claim_push_deliveries(integer) from public, anon, authenticated;
grant execute on function public.claim_push_deliveries(integer) to service_role;

create function public.finish_push_delivery(
  p_notification_id uuid, p_subscription_id uuid, p_sent boolean,
  p_gone boolean default false, p_error text default null
) returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_gone then
    delete from public.push_subscriptions where id=p_subscription_id;
  elsif p_sent then
    update private.push_deliveries set sent_at=now(),claimed_at=null,last_error=null
    where notification_id=p_notification_id and subscription_id=p_subscription_id
      and discarded_at is null;
  else
    update private.push_deliveries set claimed_at=null,last_error=left(coalesce(p_error,'Push failed'),500)
    where notification_id=p_notification_id and subscription_id=p_subscription_id
      and sent_at is null and discarded_at is null;
  end if;
end;
$$;
revoke all on function public.finish_push_delivery(uuid,uuid,boolean,boolean,text)
  from public, anon, authenticated;
grant execute on function public.finish_push_delivery(uuid,uuid,boolean,boolean,text)
  to service_role;

select cron.schedule('expertpro-push-dispatch', '* * * * *',
  'select private.invoke_push_dispatch()');
