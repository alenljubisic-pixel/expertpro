-- A readable generated alias is independent of the immutable referral code.
alter table public.profiles add column username_changed_at timestamptz;
create unique index profiles_username_lower_key on public.profiles (lower(username));

create or replace function private.generate_natural_username(p_id uuid)
returns text language plpgsql volatile security definer set search_path = '' as $$
declare
  v_words text[] := array['Lucky', 'Iskra', 'Soko', 'Talas', 'Zmaj', 'Atlas',
                           'Vedri', 'Rubin', 'Vetar', 'Sunce', 'Ritam', 'Biser',
                           'Mango', 'Plavi', 'Orao', 'Javor'];
  v_hash bytea;
  v_number bigint;
  v_candidate text;
  v_attempt integer;
begin
  for v_attempt in 0..99 loop
    v_hash := decode(md5(p_id::text || ':' || v_attempt::text), 'hex');
    v_number := get_byte(v_hash, 1)::bigint * 16777216
              + get_byte(v_hash, 2)::bigint * 65536
              + get_byte(v_hash, 3)::bigint * 256
              + get_byte(v_hash, 4)::bigint;
    v_candidate := v_words[1 + get_byte(v_hash, 0) % array_length(v_words, 1)]
                   || (100000 + v_number % 900000)::text;
    if not exists (select 1 from public.profiles p where lower(p.username) = lower(v_candidate)) then
      return v_candidate;
    end if;
  end loop;
  raise exception 'Could not allocate a public username';
end;
$$;
revoke all on function private.generate_natural_username(uuid) from public, anon, authenticated;

create or replace function private.protect_profile_identity()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_legal_name text;
  v_requested text;
  v_previous_username text;
begin
  if tg_op = 'INSERT' then
    new.referral_code := 'ep-' || left(replace(new.id::text, '-', ''), 16);
    v_requested := lower(trim(coalesce((select u.raw_user_meta_data->>'username' from auth.users u where u.id = new.id), '')));
    if new.type = 'individual' and v_requested ~ '^[a-z][a-z0-9_]{2,23}$'
       and v_requested !~ '^(admin|administrator|support|podrska|expertpro|moderator|official|system|ep[-_]).*'
       and not exists (select 1 from public.profiles p where lower(p.username) = v_requested) then
      new.username := v_requested;
      new.username_changed_at := now();
    else
      new.username := private.generate_natural_username(new.id);
      new.username_changed_at := null;
    end if;
  else
    v_previous_username := old.username;
    new.referral_code := old.referral_code;
    new.username_changed_at := old.username_changed_at;
    if lower(trim(coalesce(new.username, ''))) = lower(old.username) then
      new.username := old.username;
    else
      if current_setting('app.username_backfill', true) is distinct from 'on' then
        if new.type <> 'individual' or (auth.uid() is distinct from old.id and auth.role() <> 'service_role') then
          raise exception 'Username may only be changed by its individual owner';
        end if;
        if old.username_changed_at is not null and old.username_changed_at > now() - interval '60 days' then
          raise exception 'Nadimak se može ponovo promeniti od %',
            to_char(old.username_changed_at + interval '60 days', 'DD.MM.YYYY.') using errcode = 'P0001';
        end if;
      end if;
      if current_setting('app.username_backfill', true) is distinct from 'on' then
        new.username := lower(trim(coalesce(new.username, '')));
        if new.username !~ '^[a-z][a-z0-9_]{2,23}$'
           or new.username ~ '^(admin|administrator|support|podrska|expertpro|moderator|official|system|ep[-_]).*' then
          raise exception 'Invalid username';
        end if;
        new.username_changed_at := now();
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

-- Existing system-generated aliases are replaced; user-chosen names are kept.
select set_config('app.username_backfill', 'on', true);
update public.profiles
set username = private.generate_natural_username(id)
where username = 'ep-' || left(replace(id::text, '-', ''), 10);
reset app.username_backfill;
