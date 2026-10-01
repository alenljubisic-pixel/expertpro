-- Fix: admin_get_user_stats() joined listings + credit_purchases +
-- listing_promotions directly on profiles.id without any grouping before
-- the join, so a user with N listings and a confirmed payment got that
-- payment's amount counted N times (cartesian fan-out) -- e.g. a user with
-- 11 listings and one 1000 RSD confirmed credit purchase showed up as
-- 11000 RSD on the /admin "Ukupno uplaceno" summary instead of 1000.
-- Rewritten with each relation pre-aggregated in its own CTE first (same
-- pattern already used in admin_get_user_stats_monthly), so every sum
-- reflects reality exactly once per row regardless of how many
-- listings/purchases a user has.
create or replace function public.admin_get_user_stats()
returns table (
  id uuid,
  active_listings bigint,
  total_listings bigint,
  credits_paid_total numeric,
  credits_pending_total numeric,
  promotions_paid_total numeric,
  promotions_pending_total numeric
) as $$
declare
  v_is_admin boolean;
begin
  select is_admin into v_is_admin from public.profiles where id = auth.uid();
  if not coalesce(v_is_admin, false) then
    raise exception 'Samo admin moze da vidi statistiku korisnika.';
  end if;

  return query
  with listing_stats as (
    select l.user_id,
      count(*) filter (where l.status = 'active') as active_count,
      count(*) as total_count
    from public.listings l
    group by l.user_id
  ), credit_stats as (
    select cp.user_id,
      coalesce(sum(cp.price_amount) filter (where cp.status = 'paid_confirmed'), 0) as paid,
      coalesce(sum(cp.price_amount) filter (where cp.status in ('pending_payment','user_confirmed')), 0) as pending
    from public.credit_purchases cp
    group by cp.user_id
  ), promo_stats as (
    select lp.user_id,
      coalesce(sum(lp.price_amount) filter (where lp.status = 'paid_confirmed'), 0) as paid,
      coalesce(sum(lp.price_amount) filter (where lp.status in ('pending_payment','user_confirmed')), 0) as pending
    from public.listing_promotions lp
    group by lp.user_id
  )
  select
    p.id,
    coalesce(ls.active_count, 0),
    coalesce(ls.total_count, 0),
    coalesce(cs.paid, 0),
    coalesce(cs.pending, 0),
    coalesce(ps.paid, 0),
    coalesce(ps.pending, 0)
  from public.profiles p
  left join listing_stats ls on ls.user_id = p.id
  left join credit_stats cs on cs.user_id = p.id
  left join promo_stats ps on ps.user_id = p.id;
end;
$$ language plpgsql security definer set search_path = '';

revoke all on function public.admin_get_user_stats() from public, anon, authenticated;
grant execute on function public.admin_get_user_stats() to authenticated;
