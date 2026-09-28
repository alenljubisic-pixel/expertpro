-- =============================================
-- FIX for migration_admin_security.sql's trigger: it correctly blocks a
-- user from granting themselves is_verified/is_approved/is_admin, but it
-- ALSO blocked users from setting is_approved back to false on themselves
-- when switching account type to company/agency (dashboard/profil relies
-- on this to force re-approval). This replaces the function so:
--   - is_admin can only ever be changed by an existing admin / service_role
--   - is_verified / is_approved CAN be lowered (set to false) by the row's
--     own owner, but can only be RAISED (set to true) by an existing
--     admin / service_role
-- Run this ONCE in Supabase Dashboard -> SQL Editor (after
-- migration_admin_security.sql).
-- =============================================

create or replace function public.prevent_privilege_escalation()
returns trigger as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;

  declare
    caller_is_admin boolean := exists (
      select 1 from public.profiles where id = auth.uid() and is_admin = true
    );
  begin
    if caller_is_admin then
      return new;
    end if;

    -- is_admin: never changeable by a non-admin, in either direction.
    if new.is_admin is distinct from old.is_admin then
      new.is_admin := old.is_admin;
    end if;

    -- is_verified / is_approved: a non-admin may lower these on their own
    -- row (e.g. switching to company/agency resets is_approved to false)
    -- but may not raise them (that would be self-approval).
    if new.is_verified is distinct from old.is_verified and new.is_verified = true then
      new.is_verified := old.is_verified;
    end if;
    if new.is_approved is distinct from old.is_approved and new.is_approved = true then
      new.is_approved := old.is_approved;
    end if;
  end;

  return new;
end;
$$ language plpgsql security definer;

-- Trigger already exists from migration_admin_security.sql; replacing the
-- function body above is enough, but re-create it defensively in case it
-- wasn't created yet.
drop trigger if exists trg_prevent_privilege_escalation on public.profiles;
create trigger trg_prevent_privilege_escalation
before update on public.profiles
for each row execute function public.prevent_privilege_escalation();
