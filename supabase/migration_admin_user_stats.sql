-- Admin overview: per-user listing counts + money/credits totals, for the
-- "ko je koliko oglasa objavio, koliko je platio/potrošio" admin screen
-- (/admin/users). Implemented as a single SECURITY DEFINER function rather
-- than a view or client-side queries, for two reasons:
--   1) RLS on listings only lets a non-owner see ACTIVE listings of others
--      ("Active listings viewable by all" in schema.sql) — a plain client
--      query as admin would undercount paused/expired/closed listings.
--   2) Access must be gated on is_admin, same pattern as every other admin
--      action in this codebase (admin_confirm_promotion, etc.) — checked
--      INSIDE the function, never trusted from the calling page alone.
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
    raise exception 'Samo admin može da vidi statistiku korisnika.';
  end if;

  return query
  select
    p.id,
    count(distinct l.id) filter (where l.status = 'active') as active_listings,
    count(distinct l.id) as total_listings,
    coalesce(sum(cp.price_amount) filter (where cp.status = 'paid_confirmed'), 0) as credits_paid_total,
    coalesce(sum(cp.price_amount) filter (where cp.status in ('pending_payment', 'user_confirmed')), 0) as credits_pending_total,
    coalesce(sum(lp.price_amount) filter (where lp.status = 'paid_confirmed'), 0) as promotions_paid_total,
    coalesce(sum(lp.price_amount) filter (where lp.status in ('pending_payment', 'user_confirmed')), 0) as promotions_pending_total
  from public.profiles p
  left join public.listings l on l.user_id = p.id
  left join public.credit_purchases cp on cp.user_id = p.id
  left join public.listing_promotions lp on lp.user_id = p.id
  group by p.id;
end;
$$ language plpgsql security definer set search_path = '';

revoke all on function public.admin_get_user_stats() from public, anon, authenticated;
grant execute on function public.admin_get_user_stats() to authenticated;
