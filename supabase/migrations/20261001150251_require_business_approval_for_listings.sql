-- A pending business account must not publish or reactivate listings before
-- the master admin approves it. This check is database-side, not only UI.
create function private.require_approved_business_for_active_listing()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_type text;
  v_approved boolean;
  v_active boolean;
begin
  if new.status <> 'active' then return new; end if;

  select p.type, p.is_approved, p.is_active
    into v_type, v_approved, v_active
  from public.profiles p where p.id = new.user_id;

  if not found or v_active is not true then
    raise exception 'Neaktivan nalog ne može objaviti aktivan oglas.';
  end if;
  if v_type in ('company', 'agency') and v_approved is not true then
    raise exception 'Firma ili agencija može objaviti oglas tek posle odobrenja administratora.';
  end if;
  return new;
end;
$$;
revoke all on function private.require_approved_business_for_active_listing() from public, anon, authenticated;

create trigger require_approved_business_for_active_listing
before insert or update of status, user_id on public.listings
for each row execute function private.require_approved_business_for_active_listing();

-- Switching an account to an unapproved business (or disabling it) also
-- removes its already-active listings from public search until approval.
create function private.pause_listings_of_unapproved_business()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.is_active is not true
     or (new.type in ('company', 'agency') and new.is_approved is not true) then
    update public.listings
       set status = 'paused', paused = true
     where user_id = new.id and status = 'active';
  end if;
  return new;
end;
$$;
revoke all on function private.pause_listings_of_unapproved_business() from public, anon, authenticated;

create trigger pause_listings_of_unapproved_business
after update of type, is_approved, is_active on public.profiles
for each row
when (old.type is distinct from new.type
   or old.is_approved is distinct from new.is_approved
   or old.is_active is distinct from new.is_active)
execute function private.pause_listings_of_unapproved_business();
