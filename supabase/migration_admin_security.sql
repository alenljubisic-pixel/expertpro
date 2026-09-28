-- =============================================
-- SECURITY FIX: proper admin flag + block self-elevation
-- Run this ONCE in Supabase Dashboard -> SQL Editor
-- =============================================

-- 1) Add a real admin flag. Never derive admin rights from
--    user-editable fields like type/is_verified again.
alter table public.profiles add column if not exists is_admin boolean default false;

-- 2) Block users from granting themselves admin/verified/approved
--    status through the normal "update own profile" policy.
--    Without this, any user can call supabase.from('profiles').update({is_verified:true})
--    on their own row and pass the old isAdmin() check used across /admin/*.
create or replace function public.prevent_privilege_escalation()
returns trigger as $$
begin
  if (new.is_admin is distinct from old.is_admin
      or new.is_verified is distinct from old.is_verified
      or new.is_approved is distinct from old.is_approved)
  then
    -- Server-side calls (service role key) may always change these.
    if auth.role() = 'service_role' then
      return new;
    end if;
    -- An existing admin may change these on anyone (e.g. approving a company).
    if exists (select 1 from public.profiles where id = auth.uid() and is_admin = true) then
      return new;
    end if;
    -- Anyone else: silently keep the old values, ignore the attempted change.
    new.is_admin := old.is_admin;
    new.is_verified := old.is_verified;
    new.is_approved := old.is_approved;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_prevent_privilege_escalation on public.profiles;
create trigger trg_prevent_privilege_escalation
before update on public.profiles
for each row execute function public.prevent_privilege_escalation();

-- 3) Make yourself the first admin (change the email below to yours).
update public.profiles set is_admin = true where email = 'alenljubisic@gmail.com';
