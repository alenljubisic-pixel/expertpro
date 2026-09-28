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
