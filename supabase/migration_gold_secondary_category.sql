-- =============================================
-- Gold perk: a Gold-promoted listing can also appear under one additional
-- ("srodna" / related) category, on top of its primary one, so it reaches
-- browsers filtering by either category.
--
-- Requires migration_listing_promotions.sql to already be applied.
-- =============================================

alter table public.listings add column if not exists secondary_category_id integer references public.categories(id);
alter table public.listings add column if not exists secondary_category_slug text;

alter table public.listing_promotions add column if not exists secondary_category_id integer references public.categories(id);
alter table public.listing_promotions add column if not exists secondary_category_slug text;

-- Extend admin_confirm_promotion(): when confirming a 'gold' order that
-- recorded a chosen secondary category, apply it to the listing at the same
-- time the gold flag/expiry are set. Featured-tier orders are unaffected
-- (secondary_category_id stays null for them).
create or replace function public.admin_confirm_promotion(p_promotion_id uuid, p_note text default null)
returns void as $$
declare
  v_is_admin boolean;
  v_promo record;
begin
  select is_admin into v_is_admin from public.profiles where id = auth.uid();
  if not coalesce(v_is_admin, false) then
    raise exception 'Samo admin može da potvrdi uplatu.';
  end if;

  select * into v_promo from public.listing_promotions where id = p_promotion_id for update;
  if v_promo is null then
    raise exception 'Porudžbina ne postoji.';
  end if;
  if v_promo.status = 'paid_confirmed' then
    return;
  end if;

  update public.listing_promotions
    set status = 'paid_confirmed', confirmed_at = now(), confirmed_by = auth.uid(),
        admin_note = coalesce(p_note, admin_note)
    where id = p_promotion_id;

  if v_promo.tier = 'featured' then
    update public.listings
      set is_featured = true,
          featured_until = greatest(coalesce(featured_until, now()), now()) + (v_promo.duration_days || ' days')::interval
      where id = v_promo.listing_id;
  else
    update public.listings
      set is_gold = true,
          gold_until = greatest(coalesce(gold_until, now()), now()) + (v_promo.duration_days || ' days')::interval,
          secondary_category_id = coalesce(v_promo.secondary_category_id, secondary_category_id),
          secondary_category_slug = coalesce(v_promo.secondary_category_slug, secondary_category_slug)
      where id = v_promo.listing_id;
  end if;
end;
$$ language plpgsql security definer set search_path = '';

-- Also clear the secondary category once Gold expires — it's a Gold-only perk.
create or replace function public.demote_expired_promotions()
returns void as $$
begin
  update public.listings set is_featured = false
    where is_featured = true and featured_until is not null and featured_until < now();
  update public.listings set is_gold = false, secondary_category_id = null, secondary_category_slug = null
    where is_gold = true and gold_until is not null and gold_until < now();
  update public.listing_promotions set status = 'expired'
    where status = 'paid_confirmed'
      and listing_id in (
        select id from public.listings
        where (is_featured = false or featured_until < now())
          and (is_gold = false or gold_until < now())
      );
end;
$$ language plpgsql security definer set search_path = '';
