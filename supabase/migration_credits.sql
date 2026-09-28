-- =============================================
-- Credits ("krediti") for the Hitna berza (urgent listings).
--
-- Model:
--   - 1 kredit = 1 objavljen "urgent" oglas (consumed atomically at insert
--     time by a DB trigger — never trusted to client code, since new
--     listings are inserted directly from the browser via the anon key).
--   - Sold in packages only (never a one-off per-listing charge), paid the
--     same manual IPS/bank-transfer way as Istaknut/Gold: user picks a
--     package, gets a reference code + the site's bank details (from the
--     existing payment_settings table), admin confirms in /admin/uplate,
--     credits land on the profile balance.
--   - Individuals get cheaper packages than companies/agencies — see
--     lib/credits.ts for the actual prices (not duplicated here).
--   - Upgrading a profile's subscription_tier from 'free' to any paid tier
--     (i.e. "Puno članstvo" approved) grants a one-time welcome bonus of
--     free credits automatically.
--
-- Requires migration_listing_promotions.sql to already be applied
-- (reuses public.payment_settings).
-- =============================================

alter table public.profiles add column if not exists credit_balance integer not null default 0;

create table if not exists public.credit_purchases (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  package_key text not null,
  credits_amount integer not null check (credits_amount > 0),
  price_amount numeric(12,2) not null,
  currency text not null default 'RSD',
  reference_code text not null unique,
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'user_confirmed', 'paid_confirmed', 'rejected')),
  admin_note text,
  created_at timestamptz default now(),
  user_confirmed_at timestamptz,
  confirmed_at timestamptz,
  confirmed_by uuid references public.profiles(id)
);

create index if not exists credit_purchases_status_idx on public.credit_purchases(status);
create index if not exists credit_purchases_user_idx on public.credit_purchases(user_id);

alter table public.credit_purchases enable row level security;

drop policy if exists "Users can view own credit purchases" on public.credit_purchases;
create policy "Users can view own credit purchases" on public.credit_purchases
  for select using (
    auth.uid() = user_id
    or exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

drop policy if exists "Users can create own credit purchases" on public.credit_purchases;
create policy "Users can create own credit purchases" on public.credit_purchases
  for insert with check (auth.uid() = user_id);

drop policy if exists "Owner can mark as paid, admin can manage" on public.credit_purchases;
create policy "Owner can mark as paid, admin can manage" on public.credit_purchases
  for update using (
    auth.uid() = user_id
    or exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Confirm/reject — same SECURITY DEFINER pattern as admin_confirm_promotion,
-- so a non-admin can never forge a credit grant by updating the row directly.
create or replace function public.admin_confirm_credit_purchase(p_purchase_id uuid, p_note text default null)
returns void as $$
declare
  v_is_admin boolean;
  v_purchase record;
begin
  select is_admin into v_is_admin from public.profiles where id = auth.uid();
  if not coalesce(v_is_admin, false) then
    raise exception 'Samo admin može da potvrdi uplatu.';
  end if;

  select * into v_purchase from public.credit_purchases where id = p_purchase_id for update;
  if v_purchase is null then
    raise exception 'Porudžbina ne postoji.';
  end if;
  if v_purchase.status = 'paid_confirmed' then
    return;
  end if;

  update public.credit_purchases
    set status = 'paid_confirmed', confirmed_at = now(), confirmed_by = auth.uid(),
        admin_note = coalesce(p_note, admin_note)
    where id = p_purchase_id;

  update public.profiles
    set credit_balance = credit_balance + v_purchase.credits_amount
    where id = v_purchase.user_id;
end;
$$ language plpgsql security definer set search_path = '';

create or replace function public.admin_reject_credit_purchase(p_purchase_id uuid, p_note text default null)
returns void as $$
declare
  v_is_admin boolean;
begin
  select is_admin into v_is_admin from public.profiles where id = auth.uid();
  if not coalesce(v_is_admin, false) then
    raise exception 'Samo admin može da odbije uplatu.';
  end if;

  update public.credit_purchases
    set status = 'rejected', admin_note = coalesce(p_note, admin_note)
    where id = p_purchase_id and status <> 'paid_confirmed';
end;
$$ language plpgsql security definer set search_path = '';

revoke all on function public.admin_confirm_credit_purchase(uuid, text) from public, anon, authenticated;
grant execute on function public.admin_confirm_credit_purchase(uuid, text) to authenticated;
revoke all on function public.admin_reject_credit_purchase(uuid, text) from public, anon, authenticated;
grant execute on function public.admin_reject_credit_purchase(uuid, text) to authenticated;

-- Consume 1 credit whenever a listing of type 'urgent' is inserted. Runs
-- BEFORE INSERT, SECURITY DEFINER (needs to write profiles.credit_balance
-- regardless of the inserting user's own UPDATE grants on profiles), and
-- blocks the insert entirely if the balance is insufficient — this is the
-- only place urgent-listing credit spend is enforced, since /oglasi/novi
-- inserts directly from the browser with the anon/authenticated key.
create or replace function public.enforce_urgent_credits()
returns trigger as $$
declare
  v_balance integer;
begin
  if new.type is distinct from 'urgent' then
    return new;
  end if;

  select credit_balance into v_balance from public.profiles where id = new.user_id for update;

  if coalesce(v_balance, 0) < 1 then
    raise exception 'Nemaš dovoljno kredita za hitan oglas. Kupi paket kredita na /krediti.';
  end if;

  update public.profiles set credit_balance = credit_balance - 1 where id = new.user_id;

  return new;
end;
$$ language plpgsql security definer set search_path = '';

drop trigger if exists trg_enforce_urgent_credits on public.listings;
create trigger trg_enforce_urgent_credits
before insert on public.listings
for each row execute function public.enforce_urgent_credits();

-- One-time welcome bonus when a profile's subscription_tier moves off
-- 'free' (i.e. "Puno članstvo" gets approved for a company/agency). The
-- WHEN clause means this never fires on an update that doesn't touch
-- subscription_tier, so the credit_balance update it performs can't
-- recursively re-trigger itself.
create or replace function public.grant_subscription_credit_bonus()
returns trigger as $$
begin
  if coalesce(old.subscription_tier, 'free') = 'free' and coalesce(new.subscription_tier, 'free') <> 'free' then
    update public.profiles set credit_balance = credit_balance + 10 where id = new.id;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = '';

drop trigger if exists trg_grant_subscription_credit_bonus on public.profiles;
create trigger trg_grant_subscription_credit_bonus
after update on public.profiles
for each row
when (old.subscription_tier is distinct from new.subscription_tier)
execute function public.grant_subscription_credit_bonus();
