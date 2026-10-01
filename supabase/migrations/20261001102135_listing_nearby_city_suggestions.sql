-- Return only cities with publicly visible, active listings matching the
-- current non-location filters. The caller's RLS applies (SECURITY INVOKER).
create function public.search_listing_cities(
  p_type text default null,
  p_mode text default null,
  p_foreign boolean default false,
  p_times text[] default null,
  p_days text[] default null,
  p_price_min numeric default null,
  p_price_max numeric default null,
  p_category_slug text default null,
  p_query text default null
)
returns table (city text, listing_count bigint)
language sql stable security invoker
set search_path = ''
as $$
  select l.city, count(*)::bigint
  from public.listings l
  where l.status = 'active'
    and (p_type is null or l.type = p_type)
    and (p_mode is null or case
      when p_mode = 'long' then l.engagement_mode in ('multi_day', 'fixed_term', 'permanent')
      else l.engagement_mode = p_mode end)
    and (not coalesce(p_foreign, false) or l.foreign_workers_welcome is true)
    and (p_times is null or (l.type = 'offer' and l.availability_time = any(p_times)))
    and (p_days is null or (l.type = 'offer' and l.availability_days = any(p_days)))
    and (p_price_min is null or l.price_amount >= p_price_min)
    and (p_price_max is null or l.price_amount <= p_price_max)
    and (p_category_slug is null or l.category_slug = p_category_slug
         or l.secondary_category_slug = p_category_slug)
    and (p_query is null or l.title ilike '%' || p_query || '%')
    and l.city is not null
  group by l.city
$$;

revoke all on function public.search_listing_cities(text,text,boolean,text[],text[],numeric,numeric,text,text)
  from public, anon, authenticated;
grant execute on function public.search_listing_cities(text,text,boolean,text[],text[],numeric,numeric,text,text)
  to anon, authenticated;
