-- A free listing does not become a free *second* listing by being paused.
-- Only listings that previously consumed a credit may reactivate after the
-- system's inactivity pause without paying the same credit twice.
alter table public.listings
  add column if not exists listing_credit_paid boolean not null default false;

create or replace function private.prepare_listing_lifecycle()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    if current_user not in ('postgres', 'service_role') then
      new.inactivity_paused := false;
      new.listing_credit_paid := false;
    end if;
  else
    if current_user not in ('postgres', 'service_role') then
      new.inactivity_paused := old.inactivity_paused;
      new.listing_credit_paid := old.listing_credit_paid;
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
  if new.type in ('request', 'urgent') then new.expires_at := null; end if;
  return new;
end;
$$;

-- Prepare client input before the billing trigger evaluates it.
drop trigger trg_prepare_listing_lifecycle on public.listings;
create trigger a_prepare_listing_lifecycle
  before insert or update on public.listings
  for each row execute function private.prepare_listing_lifecycle();

create or replace function public.enforce_listing_limits()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  owner_tier text;
  active_count integer;
  v_balance integer;
begin
  if new.status is distinct from 'active' then return new; end if;
  if tg_op = 'UPDATE' and old.status = 'active' then return new; end if;
  if tg_op = 'UPDATE' and old.status = 'paused'
     and old.inactivity_paused and old.listing_credit_paid then
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
  new.listing_credit_paid := true;
  return new;
end;
$$;
