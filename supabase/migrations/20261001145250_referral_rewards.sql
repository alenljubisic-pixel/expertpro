-- A referral uses the existing public, immutable profile username as its code.
-- New signups already receive two welcome credits; only the inviter earns
-- two additional credits after a genuine first listing stays active for 24h.
create table public.referrals (
  invited_user_id uuid primary key references public.profiles(id) on delete cascade,
  referrer_user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'rewarded', 'expired', 'limit_reached')),
  created_at timestamptz not null default now(),
  rewarded_at timestamptz,
  credited_listing_id uuid references public.listings(id) on delete set null,
  credits_awarded integer not null default 0 check (credits_awarded in (0, 2)),
  constraint referrals_no_self_invite check (invited_user_id <> referrer_user_id)
);
create index referrals_referrer_status_idx
  on public.referrals (referrer_user_id, status, created_at);
alter table public.referrals enable row level security;
revoke all on public.referrals from public, anon, authenticated;

-- Email/password registration stores the code only as an attribution hint.
-- The trigger validates it against the immutable public username and never
-- trusts metadata for credits or authorization.
create function private.capture_referral_on_profile_insert()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_code text;
begin
  select lower(trim(u.raw_user_meta_data->>'referral_code')) into v_code
  from auth.users u where u.id = new.id;

  if v_code ~ '^ep-[0-9a-f]{16}$' then
    insert into public.referrals (invited_user_id, referrer_user_id)
    select new.id, p.id
    from public.profiles p
    where p.username = v_code and p.id <> new.id and p.is_active = true
    on conflict (invited_user_id) do nothing;
  end if;
  return new;
end;
$$;
revoke all on function private.capture_referral_on_profile_insert() from public, anon, authenticated;
create trigger capture_referral_on_profile_insert
after insert on public.profiles
for each row execute function private.capture_referral_on_profile_insert();

-- OAuth cannot pass signup metadata consistently. The registration page keeps
-- the code through the OAuth redirect, then claims it after the first login.
create function public.claim_referral(p_code text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  v_user_id uuid := auth.uid();
  v_code text := lower(trim(coalesce(p_code, '')));
  v_referrer_id uuid;
begin
  if v_user_id is null or v_code !~ '^ep-[0-9a-f]{16}$' then
    return false;
  end if;
  if not exists (
    select 1 from auth.users u
    where u.id = v_user_id and u.created_at >= now() - interval '7 days'
  ) or not exists (
    select 1 from public.profiles p where p.id = v_user_id
  ) then
    return false;
  end if;
  if exists (select 1 from public.referrals r where r.invited_user_id = v_user_id)
     or exists (select 1 from public.listings l where l.user_id = v_user_id) then
    return false;
  end if;

  select p.id into v_referrer_id from public.profiles p
  where p.username = v_code and p.id <> v_user_id and p.is_active = true;
  if v_referrer_id is null then return false; end if;

  insert into public.referrals (invited_user_id, referrer_user_id)
  values (v_user_id, v_referrer_id)
  on conflict (invited_user_id) do nothing;
  return found;
end;
$$;
revoke all on function public.claim_referral(text) from public, anon, authenticated;
grant execute on function public.claim_referral(text) to authenticated;

create function public.my_referral_stats()
returns table (pending_count bigint, rewarded_count bigint, earned_credits bigint)
language sql stable security definer set search_path = '' as $$
  select count(*) filter (where r.status = 'pending'),
         count(*) filter (where r.status = 'rewarded'),
         coalesce(sum(r.credits_awarded), 0)
  from public.referrals r
  where r.referrer_user_id = (select auth.uid())
$$;
revoke all on function public.my_referral_stats() from public, anon, authenticated;
grant execute on function public.my_referral_stats() to authenticated;

alter table public.notifications drop constraint notifications_type_check;
alter table public.notifications add constraint notifications_type_check check (
  type in (
    'new_application', 'application_accepted', 'application_rejected',
    'application_selected', 'application_confirmed', 'application_declined',
    'new_message', 'new_review', 'listing_expired', 'account_approved',
    'urgent_nearby', 'job_finish_requested', 'job_completed',
    'job_finish_reminder', 'listing_inactive_check', 'listing_auto_paused',
    'support_ticket', 'credit_purchase_confirmed', 'referral_reward'
  )
);

-- SKIP LOCKED and the row lock on the referrer make crediting idempotent even
-- if a scheduled run overlaps a manual maintenance run.
create function private.process_referral_rewards()
returns integer language plpgsql security definer set search_path = '' as $$
declare
  v_ref record;
  v_rewarded_count integer;
  v_processed integer := 0;
begin
  update public.referrals
  set status = 'expired'
  where status = 'pending' and created_at < now() - interval '30 days';

  for v_ref in
    select r.invited_user_id, r.referrer_user_id, l.id as listing_id
    from public.referrals r
    join auth.users u on u.id = r.invited_user_id
      and u.email_confirmed_at is not null
    join public.profiles invited on invited.id = r.invited_user_id
      and invited.is_active = true and invited.is_approved = true
    join public.profiles referrer on referrer.id = r.referrer_user_id
      and referrer.is_active = true
    join lateral (
      select l.id from public.listings l
      where l.user_id = r.invited_user_id and l.status = 'active'
        and l.created_at >= r.created_at
        and l.created_at <= now() - interval '24 hours'
        and length(trim(coalesce(l.description, ''))) >= 80
      order by l.created_at, l.id limit 1
    ) l on true
    where r.status = 'pending'
    order by r.created_at
    for update of r skip locked
  loop
    perform 1 from public.profiles p
    where p.id = v_ref.referrer_user_id for update;
    select count(*) into v_rewarded_count from public.referrals r
    where r.referrer_user_id = v_ref.referrer_user_id and r.status = 'rewarded';

    if v_rewarded_count >= 5 then
      update public.referrals set status = 'limit_reached'
      where invited_user_id = v_ref.invited_user_id;
      continue;
    end if;

    update public.profiles set credit_balance = credit_balance + 2
    where id = v_ref.referrer_user_id;
    update public.referrals
    set status = 'rewarded', rewarded_at = now(), credits_awarded = 2,
        credited_listing_id = v_ref.listing_id
    where invited_user_id = v_ref.invited_user_id and status = 'pending';

    insert into public.notifications (user_id, type, title, message, link, data)
    values (v_ref.referrer_user_id, 'referral_reward', 'Nagrada za preporuku: +2 kredita',
      'Korisnik kog si pozvao objavio je prvi potpun oglas. Dodata su ti 2 kredita.',
      '/dashboard', jsonb_build_object('credits', 2));
    v_processed := v_processed + 1;
  end loop;
  return v_processed;
end;
$$;
revoke all on function private.process_referral_rewards() from public, anon, authenticated;

select cron.schedule(
  'expertpro-referral-rewards', '15 3 * * *',
  'select private.process_referral_rewards()'
);
