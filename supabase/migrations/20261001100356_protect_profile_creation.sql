-- A client-created profile may only provide registration/OAuth fields.
-- The auth.users trigger (SECURITY DEFINER) still grants the initial 2 credits.
revoke insert on public.profiles from anon, authenticated;
grant insert (id, name, email, type, pib, is_approved, avatar_url, is_verified)
  on public.profiles to authenticated;

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
  for insert to authenticated
  with check (
    auth.uid() = id
    and (type = 'individual' or is_approved = false)
  );
