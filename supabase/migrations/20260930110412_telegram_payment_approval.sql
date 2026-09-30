-- Only the server-side Telegram webhook, authenticated with a Supabase
-- service-role key, may call this function. A Telegram callback is never
-- treated as proof of bank settlement: the operator must check their bank.
create function public.telegram_confirm_payment(
  p_kind text,
  p_order_id uuid,
  p_reference text,
  p_amount numeric,
  p_admin_id uuid
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_credit public.credit_purchases%rowtype;
  v_promo public.listing_promotions%rowtype;
begin
  if not exists (select 1 from public.profiles where id = p_admin_id and is_admin) then
    raise exception 'Administrator nije aktivan.';
  end if;
  if p_kind = 'credit' then
    select * into v_credit from public.credit_purchases where id = p_order_id for update;
    if not found then raise exception 'Porudžbina ne postoji.'; end if;
    if coalesce(v_credit.bank_reference, v_credit.reference_code) is distinct from p_reference
       or v_credit.price_amount is distinct from p_amount then
      raise exception 'Poziv na broj ili iznos se ne poklapa.';
    end if;
    if v_credit.status = 'paid_confirmed' then return 'already_confirmed'; end if;
    if v_credit.status <> 'user_confirmed' then
      raise exception 'Korisnik nije prijavio uplatu ili narudžbina više nije na čekanju.';
    end if;
    update public.credit_purchases set status = 'paid_confirmed', confirmed_at = now(),
      confirmed_by = p_admin_id,
      admin_note = 'Telegram: administrator ručno proverio priliv u banci.'
      where id = p_order_id;
    update public.profiles set credit_balance = credit_balance + v_credit.credits_amount
      where id = v_credit.user_id;
    if not found then raise exception 'Nalog korisnika nije pronađen.'; end if;
    return 'confirmed';
  elsif p_kind = 'promotion' then
    select * into v_promo from public.listing_promotions where id = p_order_id for update;
    if not found then raise exception 'Porudžbina ne postoji.'; end if;
    if coalesce(v_promo.bank_reference, v_promo.reference_code) is distinct from p_reference
       or v_promo.price_amount is distinct from p_amount then
      raise exception 'Poziv na broj ili iznos se ne poklapa.';
    end if;
    if v_promo.status = 'paid_confirmed' then return 'already_confirmed'; end if;
    if v_promo.status <> 'user_confirmed' then
      raise exception 'Korisnik nije prijavio uplatu ili narudžbina više nije na čekanju.';
    end if;
    update public.listing_promotions set status = 'paid_confirmed', confirmed_at = now(),
      confirmed_by = p_admin_id,
      admin_note = 'Telegram: administrator ručno proverio priliv u banci.'
      where id = p_order_id;
    if v_promo.tier = 'featured' then
      update public.listings set is_featured = true,
        featured_until = greatest(coalesce(featured_until, now()), now()) +
          (v_promo.duration_days || ' days')::interval
        where id = v_promo.listing_id;
    else
      update public.listings set is_gold = true,
        gold_until = greatest(coalesce(gold_until, now()), now()) +
          (v_promo.duration_days || ' days')::interval,
        secondary_category_id = coalesce(v_promo.secondary_category_id, secondary_category_id),
        secondary_category_slug = coalesce(v_promo.secondary_category_slug, secondary_category_slug)
        where id = v_promo.listing_id;
    end if;
    if not found then raise exception 'Oglas nije pronađen.'; end if;
    return 'confirmed';
  end if;
  raise exception 'Nepoznata vrsta uplate.';
end;
$$;

revoke all on function public.telegram_confirm_payment(text, uuid, text, numeric, uuid)
  from public, anon, authenticated;
grant execute on function public.telegram_confirm_payment(text, uuid, text, numeric, uuid)
  to service_role;
