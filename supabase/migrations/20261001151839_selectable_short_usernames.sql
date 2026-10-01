-- Public aliases can change. Referral codes remain immutable so existing links survive.
alter table public.profiles add column referral_code text;
update public.profiles set referral_code = username where referral_code is null;
create unique index profiles_referral_code_key on public.profiles (referral_code);

create or replace function private.protect_profile_identity()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_legal_name text;
  v_requested text;
  v_candidate text;
  v_length integer;
  v_previous_username text;
begin
  if tg_op = 'INSERT' then
    new.referral_code := 'ep-' || left(replace(new.id::text, '-', ''), 16);
    v_requested := lower(trim(coalesce((select u.raw_user_meta_data->>'username' from auth.users u where u.id = new.id), '')));
    if new.type = 'individual' and v_requested ~ '^[a-z][a-z0-9_]{2,23}$'
       and v_requested !~ '^(admin|administrator|support|podrska|expertpro|moderator|official|system|ep[-_]).*'
       and not exists (select 1 from public.profiles p where p.username = v_requested) then
      new.username := v_requested;
    else
      foreach v_length in array array[10, 12, 16, 32] loop
        v_candidate := 'ep-' || left(replace(new.id::text, '-', ''), v_length);
        exit when not exists (select 1 from public.profiles p where p.username = v_candidate);
      end loop;
      new.username := v_candidate;
    end if;
  else
    v_previous_username := old.username;
    new.referral_code := old.referral_code;
    if new.username is distinct from old.username then
      if current_setting('app.username_backfill', true) is distinct from 'on'
         and (new.type <> 'individual' or (auth.uid() is distinct from old.id and auth.role() <> 'service_role')) then
        raise exception 'Username may only be changed by its individual owner';
      end if;
      new.username := lower(trim(coalesce(new.username, '')));
      if current_setting('app.username_backfill', true) is distinct from 'on' and
         (new.username !~ '^[a-z][a-z0-9_]{2,23}$'
         or new.username ~ '^(admin|administrator|support|podrska|expertpro|moderator|official|system|ep[-_]).*') then
        raise exception 'Invalid username';
      end if;
    end if;
  end if;

  if new.type = 'individual' and new.name is not null
     and new.name <> new.username and new.name <> coalesce(v_previous_username, '')
     and new.name not like '%@%' then
    v_legal_name := nullif(left(trim(new.name), 150), '');
  end if;

  insert into private.profile_contact (user_id, legal_name, phone, address)
  values (new.id, v_legal_name, new.phone, new.address)
  on conflict (user_id) do update
  set legal_name = coalesce(excluded.legal_name, private.profile_contact.legal_name),
      phone = coalesce(excluded.phone, private.profile_contact.phone),
      address = coalesce(excluded.address, private.profile_contact.address),
      updated_at = now();

  if new.type = 'individual' then new.name := new.username; end if;
  new.email := null;
  new.phone := null;
  new.address := null;
  return new;
end;
$$;
revoke all on function private.protect_profile_identity() from public, anon, authenticated;

-- Shorten only generated aliases; never overwrite an actual user-chosen alias.
select set_config('app.username_backfill', 'on', true);
update public.profiles p
set username = 'ep-' || left(replace(p.id::text, '-', ''), 10)
where p.username = 'ep-' || left(replace(p.id::text, '-', ''), 16)
  and not exists (
    select 1 from public.profiles other
    where other.id <> p.id
      and other.username = 'ep-' || left(replace(p.id::text, '-', ''), 10)
  );
reset app.username_backfill;

alter table public.profiles alter column referral_code set not null;
grant update (username) on public.profiles to authenticated;

create or replace function private.capture_referral_on_profile_insert()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_code text;
begin
  select lower(trim(u.raw_user_meta_data->>'referral_code')) into v_code
  from auth.users u where u.id = new.id;
  if v_code ~ '^ep-[0-9a-f]{16}$' then
    insert into public.referrals (invited_user_id, referrer_user_id)
    select new.id, p.id from public.profiles p
    where p.referral_code = v_code and p.id <> new.id and p.is_active = true
    on conflict (invited_user_id) do nothing;
  end if;
  return new;
end;
$$;
revoke all on function private.capture_referral_on_profile_insert() from public, anon, authenticated;

create or replace function public.claim_referral(p_code text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  v_user_id uuid := auth.uid();
  v_code text := lower(trim(coalesce(p_code, '')));
  v_referrer_id uuid;
begin
  if v_user_id is null or v_code !~ '^ep-[0-9a-f]{16}$' then return false; end if;
  if not exists (
    select 1 from auth.users u
    where u.id = v_user_id and u.created_at >= now() - interval '7 days'
  ) or not exists (
    select 1 from public.profiles p where p.id = v_user_id
  ) then return false; end if;
  if exists (select 1 from public.referrals r where r.invited_user_id = v_user_id)
     or exists (select 1 from public.listings l where l.user_id = v_user_id) then return false; end if;
  select p.id into v_referrer_id from public.profiles p
  where p.referral_code = v_code and p.id <> v_user_id and p.is_active = true;
  if v_referrer_id is null then return false; end if;
  insert into public.referrals (invited_user_id, referrer_user_id)
  values (v_user_id, v_referrer_id)
  on conflict (invited_user_id) do nothing;
  return found;
end;
$$;
revoke all on function public.claim_referral(text) from public, anon, authenticated;
grant execute on function public.claim_referral(text) to authenticated;
