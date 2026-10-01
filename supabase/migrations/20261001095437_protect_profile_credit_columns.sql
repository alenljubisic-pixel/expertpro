-- Client profile editing is column-scoped. Credits, plan, ratings and job totals
-- are maintained only by trusted database functions / the service role.
revoke update on public.profiles from anon, authenticated;
grant update (
  type, name, email, phone, city, address, bio, avatar_url,
  skills, pib, is_verified, is_approved, is_active,
  available, experience_years, languages, is_foreign_worker, updated_at
) on public.profiles to authenticated;

-- An authenticated user must not reactivate a suspended account or change
-- account type to a company/agency while retaining individual approval.
create or replace function public.prevent_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_is_admin boolean;
begin
  if auth.role() = 'service_role' then
    return new;
  end if;

  select exists (
    select 1 from public.profiles where id = auth.uid() and is_admin = true
  ) into caller_is_admin;
  if caller_is_admin then
    return new;
  end if;

  new.is_admin := old.is_admin;
  new.is_active := old.is_active;
  if new.is_verified = true and old.is_verified is distinct from true then
    new.is_verified := old.is_verified;
  end if;
  if new.type is distinct from old.type and new.type in ('company', 'agency') then
    new.is_approved := false;
  elsif new.is_approved = true and old.is_approved is distinct from true then
    new.is_approved := old.is_approved;
  end if;
  return new;
end;
$$;
