create or replace function public.admin_confirm_credit_purchase(p_purchase_id uuid, p_note text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare v_purchase public.credit_purchases%rowtype;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_admin) then
    raise exception 'Samo admin može da potvrdi uplatu.';
  end if;
  select * into v_purchase from public.credit_purchases where id = p_purchase_id for update;
  if not found then raise exception 'Porudžbina ne postoji.'; end if;
  if v_purchase.status = 'paid_confirmed' then return; end if;
  if v_purchase.status not in ('pending_payment', 'user_confirmed') then
    raise exception 'Narudžbina nije na čekanju.';
  end if;
  update public.credit_purchases set status = 'paid_confirmed', confirmed_at = now(),
    confirmed_by = auth.uid(), admin_note = coalesce(p_note, admin_note)
    where id = p_purchase_id;
  update public.profiles set credit_balance = credit_balance + v_purchase.credits_amount
    where id = v_purchase.user_id;
end;
$$;

create or replace function public.admin_confirm_promotion(p_promotion_id uuid, p_note text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare v_promo public.listing_promotions%rowtype;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_admin) then
    raise exception 'Samo admin može da potvrdi uplatu.';
  end if;
  select * into v_promo from public.listing_promotions where id = p_promotion_id for update;
  if not found then raise exception 'Porudžbina ne postoji.'; end if;
  if v_promo.status = 'paid_confirmed' then return; end if;
  if v_promo.status not in ('pending_payment', 'user_confirmed') then
    raise exception 'Narudžbina nije na čekanju.';
  end if;
  update public.listing_promotions set status = 'paid_confirmed', confirmed_at = now(),
    confirmed_by = auth.uid(), admin_note = coalesce(p_note, admin_note)
    where id = p_promotion_id;
  if v_promo.tier = 'featured' then
    update public.listings set is_featured = true,
      featured_until = greatest(coalesce(featured_until, now()), now()) + (v_promo.duration_days || ' days')::interval
      where id = v_promo.listing_id;
  else
    update public.listings set is_gold = true,
      gold_until = greatest(coalesce(gold_until, now()), now()) + (v_promo.duration_days || ' days')::interval,
      secondary_category_id = coalesce(v_promo.secondary_category_id, secondary_category_id),
      secondary_category_slug = coalesce(v_promo.secondary_category_slug, secondary_category_slug)
      where id = v_promo.listing_id;
  end if;
end;
$$;
