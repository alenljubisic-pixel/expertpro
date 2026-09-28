-- =============================================
-- 1) Allow 'paused' as a valid listing status.
--    The admin moderation page and the user's own "Moji oglasi"
--    dashboard both pause/activate listings by setting status='paused',
--    but the original check constraint only allowed
--    ('active','filled','expired','cancelled','pending_review') —
--    every pause attempt was failing with a check-constraint violation.
-- =============================================
alter table public.listings drop constraint if exists listings_status_check;
alter table public.listings add constraint listings_status_check
  check (status in ('active', 'paused', 'filled', 'expired', 'cancelled', 'pending_review'));

-- =============================================
-- 2) Enforce the free-plan listing limits described on /cenovnik,
--    which were never actually enforced anywhere (DB or app code):
--      - Individual (fizičko lice): 1 active listing per category
--      - Company/agency on the free plan: 1 active listing total
--      - Any paid subscription_tier (anything other than 'free'): unlimited
--    Runs on INSERT and on any UPDATE that (re)activates a listing
--    (pause->active, expired/cancelled->active via renewal), so the
--    limit can't be bypassed by pausing-and-reactivating or renewing.
--    An update that keeps status='active' (e.g. editing the title) is
--    left alone.
-- =============================================
create or replace function public.enforce_listing_limits()
returns trigger as $$
declare
  owner_type text;
  owner_tier text;
  active_count integer;
begin
  -- Only check when this row is becoming active.
  if new.status is distinct from 'active' then
    return new;
  end if;
  if TG_OP = 'UPDATE' and old.status = 'active' then
    -- Was already active (e.g. just editing details) — not a new activation.
    return new;
  end if;

  select type, coalesce(subscription_tier, 'free') into owner_type, owner_tier
  from public.profiles where id = new.user_id;

  -- Any paid tier: no limit.
  if owner_tier is distinct from 'free' then
    return new;
  end if;

  if owner_type = 'individual' then
    select count(*) into active_count
    from public.listings
    where user_id = new.user_id
      and status = 'active'
      and category_id is not distinct from new.category_id
      and id is distinct from new.id;
    if active_count >= 1 then
      raise exception 'Već imaš aktivan oglas u ovoj kategoriji. Kao fizičko lice možeš imati 1 aktivan oglas po kategoriji — ugasi postojeći ili sačekaj da istekne.';
    end if;
  elsif owner_type in ('company', 'agency') then
    select count(*) into active_count
    from public.listings
    where user_id = new.user_id
      and status = 'active'
      and id is distinct from new.id;
    if active_count >= 1 then
      raise exception 'Dostigao si limit od 1 aktivnog oglasa na besplatnom planu. Kontaktiraj nas za puno članstvo i neograničen broj oglasa.';
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_enforce_listing_limits on public.listings;
create trigger trg_enforce_listing_limits
before insert or update on public.listings
for each row execute function public.enforce_listing_limits();
