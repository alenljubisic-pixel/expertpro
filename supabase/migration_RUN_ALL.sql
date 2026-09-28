-- ==============================================================
-- ExpertPro — kombinovana SQL migracija (sve odjednom, u ispravnom
-- redosledu). Bezbedno za ponovno pokretanje čak i ako si neke od
-- ovih fajlova već pokrenuo/la ranije pojedinačno — svaka izmena
-- ovde je 'idempotentna' (IF NOT EXISTS / OR REPLACE / DROP...CREATE).
-- Nalepi ceo ovaj fajl u Supabase Dashboard → SQL Editor → Run.
-- ==============================================================

-- ############################################################
-- FAJL: migration_listing_promotions.sql
-- ############################################################
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
drop policy if exists "Payment settings readable by authenticated users" on public.payment_settings;
create policy "Payment settings readable by authenticated users" on public.payment_settings
  for select using (auth.role() = 'authenticated');
drop policy if exists "Only admins can update payment settings" on public.payment_settings;
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

drop policy if exists "Users can view own promotion orders" on public.listing_promotions;
create policy "Users can view own promotion orders" on public.listing_promotions
  for select using (
    auth.uid() = user_id
    or exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

drop policy if exists "Users can create promotion orders for own listings" on public.listing_promotions;
create policy "Users can create promotion orders for own listings" on public.listing_promotions
  for insert with check (
    auth.uid() = user_id
    and exists (select 1 from public.listings where id = listing_id and user_id = auth.uid())
  );

-- Only the owner marking "I sent the payment" (pending_payment -> user_confirmed),
-- or an admin doing anything (confirm/reject/note), may update a row.
-- Enforced in the app layer too, but this is the DB-level backstop.
drop policy if exists "Owner can mark as paid, admin can manage" on public.listing_promotions;
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

-- ############################################################
-- FAJL: migration_credits.sql
-- ############################################################
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

-- ############################################################
-- FAJL: migration_credits_signup_bonus.sql
-- ############################################################
-- =============================================
-- Welcome credits on signup — every new account (individual, company or
-- agency) gets a small free credit balance the moment they register, so
-- they can try posting one urgent listing before ever paying anything.
-- This is separate from the 10-credit bonus granted when a company/agency
-- is upgraded to a paid "Puno članstvo" tier (migration_credits.sql).
--
-- Safe to run more than once: a `signup_credit_granted` flag makes the
-- one-time backfill for already-registered users idempotent, and new
-- signups get the bonus baked into handle_new_user() itself.
--
-- Requires migration_credits.sql to already be applied (uses
-- profiles.credit_balance).
-- =============================================

alter table public.profiles add column if not exists signup_credit_granted boolean not null default false;

-- One-time backfill for accounts that already existed before this migration.
update public.profiles
  set credit_balance = credit_balance + 2, signup_credit_granted = true
  where not signup_credit_granted;

-- New signups: grant the same 2 free credits at profile-creation time.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, type, is_approved, credit_balance, signup_credit_granted)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'type', 'individual'),
    case
      when coalesce(new.raw_user_meta_data->>'type', 'individual') = 'individual' then true
      else false
    end,
    2,
    true
  );
  return new;
end;
$$ language plpgsql security definer;
-- Trigger on_auth_user_created already points at this function (schema.sql)
-- — replacing the function body above is enough, no trigger change needed.

-- ############################################################
-- FAJL: migration_listing_limits_v2.sql
-- ############################################################
-- =============================================
-- Replaces the free-plan listing limit from migration_listing_status_and_limits.sql.
--
-- Old rule: individual = 1 active listing PER CATEGORY, company/agency
-- free = 1 active listing total.
--
-- New rule (unified across individual/company/agency, free tier only):
--   - The 1st active listing (offer or request, any category) is free.
--   - Every additional active listing beyond the first — whether it's a
--     2nd listing in the same category or a listing in a different
--     category — costs 1 credit, charged automatically at the moment it
--     becomes active. Insufficient balance blocks the activation with a
--     clear message pointing to /krediti.
--   - 'urgent' listings are entirely out of scope here — they're already
--     gated 1-credit-per-post by enforce_urgent_credits() regardless of
--     how many other listings the user has, so they're excluded from both
--     the free-slot count and this charge to avoid double-charging.
--   - Any paid subscription_tier: still unlimited, unchanged.
--
-- Requires migration_credits.sql to already be applied (uses
-- profiles.credit_balance) — run this AFTER migration_credits.sql.
-- =============================================

create or replace function public.enforce_listing_limits()
returns trigger as $$
declare
  owner_tier text;
  active_count integer;
  v_balance integer;
begin
  -- Only check when this row is becoming active.
  if new.status is distinct from 'active' then
    return new;
  end if;
  if TG_OP = 'UPDATE' and old.status = 'active' then
    -- Was already active (e.g. just editing details) — not a new activation.
    return new;
  end if;
  -- Urgent listings are governed entirely by enforce_urgent_credits(); they
  -- neither count toward nor draw from this free-listing quota.
  if new.type = 'urgent' then
    return new;
  end if;

  select coalesce(subscription_tier, 'free') into owner_tier
  from public.profiles where id = new.user_id;

  -- Any paid tier: no limit.
  if owner_tier is distinct from 'free' then
    return new;
  end if;

  select count(*) into active_count
  from public.listings
  where user_id = new.user_id
    and status = 'active'
    and type <> 'urgent'
    and id is distinct from new.id;

  if active_count = 0 then
    return new; -- first free listing, no charge
  end if;

  select credit_balance into v_balance from public.profiles where id = new.user_id for update;
  if coalesce(v_balance, 0) < 1 then
    raise exception 'Već imaš 1 besplatan aktivan oglas. Za dodatni oglas (u istoj ili drugoj rubrici) potreban je 1 kredit — kupi na /krediti.';
  end if;

  update public.profiles set credit_balance = credit_balance - 1 where id = new.user_id;

  return new;
end;
$$ language plpgsql security definer set search_path = '';

-- Trigger already exists from migration_listing_status_and_limits.sql;
-- replacing the function body above is enough, but re-create it
-- defensively in case it wasn't created yet.
drop trigger if exists trg_enforce_listing_limits on public.listings;
create trigger trg_enforce_listing_limits
before insert or update on public.listings
for each row execute function public.enforce_listing_limits();

-- ############################################################
-- FAJL: migration_gold_secondary_category.sql
-- ############################################################
-- =============================================
-- Gold perk: a Gold-promoted listing can also appear under one additional
-- ("srodna" / related) category, on top of its primary one, so it reaches
-- browsers filtering by either category.
--
-- Requires migration_listing_promotions.sql to already be applied.
-- =============================================

alter table public.listings add column if not exists secondary_category_id integer references public.categories(id);
alter table public.listings add column if not exists secondary_category_slug text;

alter table public.listing_promotions add column if not exists secondary_category_id integer references public.categories(id);
alter table public.listing_promotions add column if not exists secondary_category_slug text;

-- Extend admin_confirm_promotion(): when confirming a 'gold' order that
-- recorded a chosen secondary category, apply it to the listing at the same
-- time the gold flag/expiry are set. Featured-tier orders are unaffected
-- (secondary_category_id stays null for them).
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
    return;
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
          gold_until = greatest(coalesce(gold_until, now()), now()) + (v_promo.duration_days || ' days')::interval,
          secondary_category_id = coalesce(v_promo.secondary_category_id, secondary_category_id),
          secondary_category_slug = coalesce(v_promo.secondary_category_slug, secondary_category_slug)
      where id = v_promo.listing_id;
  end if;
end;
$$ language plpgsql security definer set search_path = '';

-- Also clear the secondary category once Gold expires — it's a Gold-only perk.
create or replace function public.demote_expired_promotions()
returns void as $$
begin
  update public.listings set is_featured = false
    where is_featured = true and featured_until is not null and featured_until < now();
  update public.listings set is_gold = false, secondary_category_id = null, secondary_category_slug = null
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

-- ############################################################
-- FAJL: migration_notifications_and_reviews.sql
-- ############################################################
-- =============================================
-- Wires up the notification system (bell + /obavestenja already exist in the
-- UI) so it actually receives events, and adds guardrails + realtime to the
-- review/rating system so a review can only be left after real communication.
--
-- Safe to re-run.
-- =============================================

-- 0) The existing notifications table only has body/data(jsonb) columns, but
--    the already-built UI (Navbar bell + /obavestenja) reads `message` and
--    `link` directly off each row. Add those so the UI that's already
--    deployed actually has something to show.
alter table public.notifications add column if not exists message text;
alter table public.notifications add column if not exists link text;

-- 1) Make sure realtime is actually broadcasting these tables. (The chat
--    window already works live because `messages` was enabled earlier; this
--    just makes sure notifications/conversations are too, so the bell badge
--    and conversation list update without a page reload.)
do $$
begin
  begin
    alter publication supabase_realtime add table public.notifications;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.conversations;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.messages;
  exception when duplicate_object then null;
  end;
end $$;

-- 2) New message -> notify the OTHER participant (not the sender).
create or replace function public.notify_new_message()
returns trigger as $$
declare
  v_conv record;
  v_recipient uuid;
  v_sender_name text;
begin
  select participant_1_id, participant_2_id, listing_id into v_conv
  from public.conversations where id = new.conversation_id;

  if v_conv is null then
    return new;
  end if;

  v_recipient := case when v_conv.participant_1_id = new.sender_id
    then v_conv.participant_2_id else v_conv.participant_1_id end;

  select coalesce(name, 'Korisnik') into v_sender_name
  from public.profiles where id = new.sender_id;

  insert into public.notifications (user_id, type, title, message, link, body, data)
  values (
    v_recipient,
    'new_message',
    v_sender_name || ' ti je poslao/la poruku',
    left(new.content, 140),
    '/poruke?conv=' || new.conversation_id,
    left(new.content, 140),
    jsonb_build_object('conversation_id', new.conversation_id)
  );

  return new;
end;
$$ language plpgsql security definer set search_path = '';

drop trigger if exists trg_notify_new_message on public.messages;
create trigger trg_notify_new_message
  after insert on public.messages
  for each row execute procedure public.notify_new_message();

-- 3) A review may only be left about someone you've actually messaged with
--    (i.e. there's a conversation between reviewer and reviewee). This is
--    what "review after communication" means in practice here.
create or replace function public.enforce_review_requires_contact()
returns trigger as $$
declare
  v_exists boolean;
begin
  if new.reviewer_id = new.reviewee_id then
    raise exception 'Ne možeš oceniti sam/a sebe.';
  end if;

  select exists (
    select 1 from public.conversations
    where (participant_1_id = new.reviewer_id and participant_2_id = new.reviewee_id)
       or (participant_1_id = new.reviewee_id and participant_2_id = new.reviewer_id)
  ) into v_exists;

  if not v_exists then
    raise exception 'Možeš oceniti samo korisnika sa kojim si već razmenio/la poruke.';
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = '';

drop trigger if exists trg_enforce_review_requires_contact on public.reviews;
create trigger trg_enforce_review_requires_contact
  before insert on public.reviews
  for each row execute procedure public.enforce_review_requires_contact();

-- 4) New review -> notify the reviewee.
create or replace function public.notify_new_review()
returns trigger as $$
declare
  v_reviewer_name text;
begin
  select coalesce(name, 'Korisnik') into v_reviewer_name
  from public.profiles where id = new.reviewer_id;

  insert into public.notifications (user_id, type, title, message, link, body, data)
  values (
    new.reviewee_id,
    'new_review',
    v_reviewer_name || ' te je ocenio/la sa ' || new.rating || '/5',
    new.comment,
    '/profil/' || new.reviewee_id,
    new.comment,
    jsonb_build_object('reviewer_id', new.reviewer_id)
  );

  return new;
end;
$$ language plpgsql security definer set search_path = '';

drop trigger if exists trg_notify_new_review on public.reviews;
create trigger trg_notify_new_review
  after insert on public.reviews
  for each row execute procedure public.notify_new_review();

-- 5) Prevent spamming multiple reviews for the same person when no specific
--    listing is attached (the UI never sets listing_id today).
create unique index if not exists reviews_reviewer_reviewee_no_listing_uidx
  on public.reviews (reviewer_id, reviewee_id)
  where listing_id is null;

