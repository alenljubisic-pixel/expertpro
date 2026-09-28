-- Harden privileged functions that are reachable through the Data API by default.
-- SECURITY DEFINER is required for these trigger/maintenance operations, so every
-- referenced object is schema-qualified and the search path is empty.

create or replace function public.enforce_listing_limits()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_type text;
  owner_tier text;
  active_count integer;
begin
  if new.status is distinct from 'active' then
    return new;
  end if;
  if TG_OP = 'UPDATE' and old.status = 'active' then
    return new;
  end if;

  select type, coalesce(subscription_tier, 'free')
    into owner_type, owner_tier
  from public.profiles
  where id = new.user_id;

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
$$;

revoke execute on function public.enforce_listing_limits() from public, anon, authenticated;

create or replace function public.prevent_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_is_admin boolean;
begin
  if (select auth.role()) = 'service_role' then
    return new;
  end if;

  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and is_admin = true
  ) into caller_is_admin;

  if caller_is_admin then
    return new;
  end if;

  if new.is_admin is distinct from old.is_admin then
    new.is_admin := old.is_admin;
  end if;
  if new.is_verified is distinct from old.is_verified and new.is_verified = true then
    new.is_verified := old.is_verified;
  end if;
  if new.is_approved is distinct from old.is_approved and new.is_approved = true then
    new.is_approved := old.is_approved;
  end if;

  return new;
end;
$$;

revoke execute on function public.prevent_privilege_escalation() from public, anon, authenticated;
