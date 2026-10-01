-- Availability belongs to an offer, not the whole account: one account may
-- coordinate several workers with different schedules in different cities.
alter table public.listings
  add column availability_time text not null default 'flexible'
    constraint listings_availability_time_check
      check (availability_time in ('flexible', 'morning', 'afternoon', 'all_day', 'around_clock')),
  add column availability_days text not null default 'flexible'
    constraint listings_availability_days_check
      check (availability_days in ('flexible', 'weekdays', 'weekends', 'both'));

comment on column public.listings.availability_time is
  'Offer schedule: flexible/unspecified, morning, afternoon, all day, or 24h on-call.';
comment on column public.listings.availability_days is
  'Offer days: flexible/unspecified, weekdays, weekends, or both.';

-- The existing worker search matches profile.city, which cannot represent
-- multiple cities from one account. Match active offers instead.
create function public.search_workers_available(
  p_city text default null,
  p_skill text default null,
  p_query text default null,
  p_foreign boolean default false,
  p_time text default null,
  p_days text default null,
  p_limit integer default 24,
  p_offset integer default 0
)
returns table (
  id uuid, username text, city text, bio text, skills text[],
  avatar_url text, is_verified boolean, rating_avg numeric,
  available boolean, is_foreign_worker boolean, total_count bigint
)
language sql stable
set search_path = ''
as $$
  select p.id, p.username,
         coalesce((
           select string_agg(distinct l.city, ', ' order by l.city)
           from public.listings l
           where l.user_id = p.id and l.type = 'offer'
             and l.status = 'active' and l.paused is not true
         ), p.city),
         p.bio, p.skills, p.avatar_url, p.is_verified, p.rating_avg,
         p.available, p.is_foreign_worker, count(*) over() as total_count
  from public.profiles p
  where p.type = 'individual' and p.is_active = true
    and (not p_foreign or p.is_foreign_worker = true)
    and (p_query is null or p.username ilike '%' || p_query || '%'
         or p.bio ilike '%' || p_query || '%'
         or exists (select 1 from unnest(p.skills) s where s ilike '%' || p_query || '%')
         or exists (
           select 1 from public.listings q
           where q.user_id = p.id and q.type = 'offer'
             and q.status = 'active' and q.paused is not true
             and (q.title ilike '%' || p_query || '%' or q.description ilike '%' || p_query || '%')
         ))
    and exists (
      select 1 from public.listings l
      left join public.categories c on c.id = l.category_id
      where l.user_id = p.id and l.type = 'offer'
        and l.status = 'active' and l.paused is not true
        and (p_city is null or l.city = p_city)
        and (p_skill is null or p.skills @> array[p_skill] or c.name_sr = p_skill)
        and (p_time is null or case p_time
          when 'morning' then l.availability_time in ('morning', 'all_day', 'around_clock')
          when 'afternoon' then l.availability_time in ('afternoon', 'all_day', 'around_clock')
          when 'all_day' then l.availability_time in ('all_day', 'around_clock')
          when 'around_clock' then l.availability_time = 'around_clock'
          else false end)
        and (p_days is null or case p_days
          when 'weekdays' then l.availability_days in ('weekdays', 'both')
          when 'weekends' then l.availability_days in ('weekends', 'both')
          else false end)
    )
  order by p.is_verified desc nulls last, p.rating_avg desc nulls last,
           p.created_at desc
  limit least(greatest(p_limit, 1), 100)
  offset greatest(p_offset, 0)
$$;

revoke all on function public.search_workers_available(text,text,text,boolean,text,text,integer,integer) from public;
grant execute on function public.search_workers_available(text,text,text,boolean,text,text,integer,integer)
  to anon, authenticated, service_role;
