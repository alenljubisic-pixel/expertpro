-- Public individual identities are aliases; contact details remain private.
-- Run before deploying the UI that reads username/search_workers.
create schema if not exists private;

create table if not exists private.profile_contact (
  user_id uuid primary key references auth.users(id) on delete cascade,
  legal_name text,
  phone text,
  address text,
  updated_at timestamptz not null default now()
);
alter table private.profile_contact enable row level security;
revoke all on private.profile_contact from public, anon, authenticated;

alter table public.profiles add column if not exists username text;

update public.profiles
set username = 'ep-' || left(replace(id::text, '-', ''), 16)
where username is null;

create unique index if not exists profiles_username_key on public.profiles (username);

insert into private.profile_contact (user_id, legal_name, phone, address)
select p.id,
       case when p.type = 'individual'
         then coalesce(
           nullif(case when p.name like '%@%' then '' else trim(p.name) end, ''),
           nullif(trim(u.raw_user_meta_data->>'full_name'), ''),
           nullif(trim(u.raw_user_meta_data->>'name'), '')
         )
         else null end,
       p.phone,
       p.address
from public.profiles p
join auth.users u on u.id = p.id
on conflict (user_id) do nothing;

-- Existing contact fields must not remain readable through the public Data API.
update public.profiles
set name = case when type = 'individual' then username else name end,
    email = null,
    phone = null,
    address = null;

create or replace function private.protect_profile_identity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_legal_name text;
begin
  if tg_op = 'INSERT' then
    new.username := 'ep-' || left(replace(new.id::text, '-', ''), 16);
  else
    new.username := old.username;
  end if;

  if new.type = 'individual' and new.name is not null
     and new.name <> new.username and new.name not like '%@%' then
    v_legal_name := nullif(left(trim(new.name), 150), '');
  end if;

  insert into private.profile_contact (user_id, legal_name, phone, address)
  values (new.id, v_legal_name, new.phone, new.address)
  on conflict (user_id) do update
  set legal_name = coalesce(excluded.legal_name, private.profile_contact.legal_name),
      phone = coalesce(excluded.phone, private.profile_contact.phone),
      address = coalesce(excluded.address, private.profile_contact.address),
      updated_at = now();

  if new.type = 'individual' then
    new.name := new.username;
  end if;
  new.email := null;
  new.phone := null;
  new.address := null;
  return new;
end;
$$;

drop trigger if exists trg_protect_profile_identity on public.profiles;
create trigger trg_protect_profile_identity
before insert or update on public.profiles
for each row execute function private.protect_profile_identity();

revoke all on function private.protect_profile_identity() from public, anon, authenticated;

-- Supabase Auth's signup trigger must read the actual registration name, not
-- fall back to the email when the form sends metadata.name.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, name, type, is_approved, credit_balance, signup_credit_granted)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''),
             nullif(new.raw_user_meta_data->>'name', ''), new.email),
    coalesce(new.raw_user_meta_data->>'type', 'individual'),
    coalesce(new.raw_user_meta_data->>'type', 'individual') = 'individual',
    2,
    true
  );
  return new;
end;
$$;

create or replace function public.get_my_profile_contact()
returns table (legal_name text, phone text, address text)
language sql
stable
security definer
set search_path = ''
as $$
  select c.legal_name, c.phone, c.address
  from private.profile_contact c
  where c.user_id = (select auth.uid())
$$;
revoke all on function public.get_my_profile_contact() from public, anon;
grant execute on function public.get_my_profile_contact() to authenticated;

create or replace function public.set_my_profile_contact(p_legal_name text, p_phone text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;
  if length(coalesce(p_legal_name, '')) > 150 or length(coalesce(p_phone, '')) > 40 then
    raise exception 'Contact data is too long';
  end if;
  insert into private.profile_contact (user_id, legal_name, phone)
  values (v_user_id, nullif(trim(p_legal_name), ''), nullif(trim(p_phone), ''))
  on conflict (user_id) do update
  set legal_name = excluded.legal_name,
      phone = excluded.phone,
      updated_at = now();
end;
$$;
revoke all on function public.set_my_profile_contact(text,text) from public, anon;
grant execute on function public.set_my_profile_contact(text,text) to authenticated;

create or replace function public.admin_profile_contacts(p_user_ids uuid[])
returns table (id uuid, legal_name text, email text, phone text)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not private.is_current_user_admin() then
    raise exception 'Admin access required';
  end if;
  return query
  select u.id, c.legal_name, u.email::text, c.phone
  from auth.users u
  left join private.profile_contact c on c.user_id = u.id
  where u.id = any(p_user_ids);
end;
$$;
revoke all on function public.admin_profile_contacts(uuid[]) from public, anon;
grant execute on function public.admin_profile_contacts(uuid[]) to authenticated;

-- Directory shows only people actively offering services, not all accounts.
create index if not exists listings_active_offers_user_idx
  on public.listings (user_id)
  where type = 'offer' and status = 'active' and paused is not true;

create or replace function public.search_workers(
  p_city text default null,
  p_skill text default null,
  p_query text default null,
  p_foreign boolean default false,
  p_limit integer default 24,
  p_offset integer default 0
)
returns table (
  id uuid, username text, city text, bio text, skills text[],
  avatar_url text, is_verified boolean, rating_avg numeric,
  available boolean, is_foreign_worker boolean, total_count bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  select p.id, p.username, p.city, p.bio, p.skills,
         p.avatar_url, p.is_verified, p.rating_avg, p.available,
         p.is_foreign_worker, count(*) over() as total_count
  from public.profiles p
  where p.type = 'individual'
    and p.is_active = true
    and exists (
      select 1 from public.listings l
      where l.user_id = p.id and l.type = 'offer'
        and l.status = 'active' and l.paused is not true
    )
    and (p_city is null or p.city = p_city)
    and (p_skill is null or p.skills @> array[p_skill])
    and (not p_foreign or p.is_foreign_worker = true)
    and (p_query is null or p.username ilike '%' || p_query || '%'
         or p.bio ilike '%' || p_query || '%'
         or exists (select 1 from unnest(p.skills) s where s ilike '%' || p_query || '%'))
  order by p.is_verified desc nulls last, p.rating_avg desc nulls last, p.created_at desc
  limit least(greatest(p_limit, 1), 100)
  offset greatest(p_offset, 0)
$$;
revoke all on function public.search_workers(text,text,text,boolean,integer,integer) from public;
grant execute on function public.search_workers(text,text,text,boolean,integer,integer) to anon, authenticated;
