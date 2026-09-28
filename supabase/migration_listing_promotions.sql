-- =============================================
-- Listing promotions (Istaknut / Gold) + manual bank-transfer (IPS) payments.
--
-- Model:
--   - "Istaknut" (featured): listing sorts above regular listings within
--     its own filtered results (category/city/type), small blue badge.
--   - "Gold": listing sorts above everything, including "Istaknut" ones,
--     on the whole /oglasi list regardless of filters, gold badge + border.
--   - Payment is manual IPS/bank transfer: the user picks a tier+duration,
--     gets a unique reference code + the site's bank details (entered by
--     the admin in payment_settings, see below — no bank details are
--     hardcoded here), sends the transfer from their own banking app, and
--     an admin manually confirms the payment in /admin/uplate. Confirming
--     activates the promotion for the chosen number of days.
--   - A daily job (extends the existing expire-listings cron) demotes any
--     promotion whose period has ended.
-- =============================================

-- 1) Listing columns for the two promotion tiers.
alter table public.listings add column if not exists is_gold boolean default false;
alter table public.listings add column if not exists featured_until timestamptz;
alter table public.listings add column if not exists gold_until timestamptz;
-- is_featured already exists (schema.sql); featured_until is its expiry.

create index if not exists listings_gold_idx on public.listings(is_gold) where is_gold = true;
create index if not exists listings_featured_idx on public.listings(is_featured) where is_featured = true;

-- 2) Site payment settings — a single row the admin fills in from the
--    admin panel (/admin/uplate). Never hardcode real bank details in SQL
--    or app code; this table is the one source of truth and starts empty.
create table if not exists public.payment_settings (
  id smallint primary key default 1 check (id = 1), -- singleton row
  bank_name text,
  account_holder text,
  account_number text,
  payment_reference_note text, -- e.g. "Poziv na broj: koristi kod porudžbine"
  updated_at timestamptz default now(),
  updated_by uuid references public.profiles(id)
);
insert into public.payment_settings (id) values (1) on conflict (id) do nothing;

alter table public.payment_settings enable row level security;
-- Anyone signed in can read the bank details (needed to pay) — no secrets here.
create policy "Payment settings readable by authenticated users" on public.payment_settings
  for select using (auth.role() = 'authenticated');
create policy "Only admins can update payment settings" on public.payment_settings
  for update using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

-- 3) Promotion orders.
create table if not exists public.listing_promotions (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  tier text not null check (tier in ('featured', 'gold')),
  duration_days integer not null check (duration_days in (7, 15, 30)),
  price_amount numeric(12,2) not null,
  currency text not null default 'RSD',
  reference_code text not null unique,
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'user_confirmed', 'paid_confirmed', 'rejected', 'expired')),
  admin_note text,
  created_at timestamptz default now(),
  user_confirmed_at timestamptz,
  confirmed_at timestamptz,
  confirmed_by uuid references public.profiles(id)
);

create index if not exists listing_promotions_status_idx on public.listing_promotions(status);
create index if not exists listing_promotions_listing_idx on public.listing_promotions(listing_id);
create index if not exists listing_promotions_user_idx on public.listing_promotions(user_id);

alter table public.listing_promotions enable row level security;

create policy "Users can view own promotion orders" on public.listing_promotions
  for select using (
    auth.uid() = user_id
    or exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

create policy "Users can create promotion orders for own listings" on public.listing_promotions
  for insert with check (
    auth.uid() = user_id
    and exists (select 1 from public.listings where id = listing_id and user_id = auth.uid())
  );

-- Only the owner marking "I sent the payment" (pending_payment -> user_confirmed),
-- or an admin doing anything (confirm/reject/note), may update a row.
-- Enforced in the app layer too, but this is the DB-level backstop.
create policy "Owner can mark as paid, admin can manage" on public.listing_promotions
  for update using (
    auth.uid() = user_id
    or exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- 4) Confirm/reject/expire are done through SECURITY DEFINER functions so
--    the actual promotion activation (writing is_featured/is_gold onto the
--    listing) can never be forged by a non-admin updating listing_promotions
--    directly — RLS above only lets a non-admin touch their own row's
--    status in the app layer, and the functions below are the only path
--    that ever flips a listing's promotion flags.

create or replace function public.admin_confirm_promotion(p_promotion_id uuid, p_note text default null)
returns void as $$
declare
  v_is_admin boolean;
  v_promo record;
begin
  select is_admin into v_is_admin from public.profiles where id = auth.uid();
  if not coalesce(v_is_admin, false) then
    raise exception 'Samo admin može da potvrdi uplatu.';
  end if;

  select * into v_promo from public.listing_promotions where id = p_promotion_id for update;
  if v_promo is null then
    raise exception 'Porudžbina ne postoji.';
  end if;
  if v_promo.status = 'paid_confirmed' then
    return; -- already confirmed, no-op
  end if;

  update public.listing_promotions
    set status = 'paid_confirmed', confirmed_at = now(), confirmed_by = auth.uid(),
        admin_note = coalesce(p_note, admin_note)
    where id = p_promotion_id;

  if v_promo.tier = 'featured' then
    update public.listings
      set is_featured = true,
          featured_until = greatest(coalesce(featured_until, now()), now()) + (v_promo.duration_days || ' days')::interval
      where id = v_promo.listing_id;
  else
    update public.listings
      set is_gold = true,
          gold_until = greatest(coalesce(gold_until, now()), now()) + (v_promo.duration_days || ' days')::interval
      where id = v_promo.listing_id;
  end if;
end;
$$ language plpgsql security definer set search_path = '';

create or replace function public.admin_reject_promotion(p_promotion_id uuid, p_note text default null)
returns void as $$
declare
  v_is_admin boolean;
begin
  select is_admin into v_is_admin from public.profiles where id = auth.uid();
  if not coalesce(v_is_admin, false) then
    raise exception 'Samo admin može da odbije uplatu.';
  end if;

  update public.listing_promotions
    set status = 'rejected', admin_note = coalesce(p_note, admin_note)
    where id = p_promotion_id and status <> 'paid_confirmed';
end;
$$ language plpgsql security definer set search_path = '';

-- Called daily (see /api/cron/expire-listings) to turn off promotions whose
-- period has ended. SECURITY DEFINER, no direct grants to anon/authenticated
-- — only reachable via the service-role cron route, same pattern as
-- expire_old_listings().
create or replace function public.demote_expired_promotions()
returns void as $$
begin
  update public.listings set is_featured = false
    where is_featured = true and featured_until is not null and featured_until < now();
  update public.listings set is_gold = false
    where is_gold = true and gold_until is not null and gold_until < now();
  update public.listing_promotions set status = 'expired'
    where status = 'paid_confirmed'
      and listing_id in (
        select id from public.listings
        where (is_featured = false or featured_until < now())
          and (is_gold = false or gold_until < now())
      );
end;
$$ language plpgsql security definer set search_path = '';

revoke all on function public.admin_confirm_promotion(uuid, text) from public, anon, authenticated;
grant execute on function public.admin_confirm_promotion(uuid, text) to authenticated;
revoke all on function public.admin_reject_promotion(uuid, text) from public, anon, authenticated;
grant execute on function public.admin_reject_promotion(uuid, text) to authenticated;
-- demote_expired_promotions: called by the daily cron route the same way
-- expire_old_listings() already is (anon-key client + CRON_SECRET header
-- check in the route itself), so it needs the same anon grant. It only
-- flips boolean/timestamp columns and never returns or accepts user data.
revoke all on function public.demote_expired_promotions() from public;
grant execute on function public.demote_expired_promotions() to anon, authenticated;
