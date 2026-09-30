-- A client can reach the REST API directly. Prices and credit amounts must not
-- be trusted merely because the normal server action fills them in correctly.
create or replace function public.validate_credit_purchase_insert()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_type text;
  v_credits integer;
  v_price numeric;
begin
  if new.user_id is distinct from auth.uid()
     or new.status <> 'pending_payment' or new.currency <> 'RSD'
     or new.reference_code !~ '^EPK-[A-HJ-NP-Z2-9]{6}$'
     or new.user_confirmed_at is not null or new.confirmed_at is not null
     or new.confirmed_by is not null or new.admin_note is not null then
    raise exception 'Neispravna porudžbina kredita.';
  end if;

  select type into v_type from public.profiles where id = new.user_id;
  case new.package_key
    when 'ind_starter' then v_credits := 5; v_price := 1000;
    when 'ind_standard' then v_credits := 15; v_price := 2500;
    when 'ind_pro' then v_credits := 35; v_price := 5000;
    when 'biz_starter' then v_credits := 5; v_price := 2000;
    when 'biz_standard' then v_credits := 15; v_price := 5000;
    when 'biz_pro' then v_credits := 40; v_price := 12000;
    when 'agency_starter' then v_credits := 60; v_price := 6000;
    when 'agency_growth' then v_credits := 160; v_price := 14000;
    when 'agency_pro' then v_credits := 450; v_price := 33000;
    else raise exception 'Nepoznat paket kredita.';
  end case;
  if (new.package_key like 'ind_%' and v_type <> 'individual')
     or (new.package_key like 'biz_%' and v_type <> 'company')
     or (new.package_key like 'agency_%' and v_type <> 'agency')
     or new.credits_amount <> v_credits or new.price_amount <> v_price then
    raise exception 'Cena i paket se ne poklapaju.';
  end if;
  return new;
end;
$$;

create or replace function public.validate_promotion_insert()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_price numeric;
begin
  if new.user_id is distinct from auth.uid()
     or not exists (select 1 from public.listings where id = new.listing_id and user_id = new.user_id)
     or new.status <> 'pending_payment' or new.currency <> 'RSD'
     or new.reference_code !~ '^EP-[A-HJ-NP-Z2-9]{6}$'
     or new.user_confirmed_at is not null or new.confirmed_at is not null
     or new.confirmed_by is not null or new.admin_note is not null then
    raise exception 'Neispravna porudžbina promocije.';
  end if;
  v_price := case
    when new.tier = 'featured' and new.duration_days = 7 then 490
    when new.tier = 'featured' and new.duration_days = 15 then 890
    when new.tier = 'featured' and new.duration_days = 30 then 1490
    when new.tier = 'gold' and new.duration_days = 7 then 990
    when new.tier = 'gold' and new.duration_days = 15 then 1790
    when new.tier = 'gold' and new.duration_days = 30 then 2990
    else null end;
  if v_price is null or new.price_amount <> v_price then
    raise exception 'Cena promocije se ne poklapa.';
  end if;
  return new;
end;
$$;

drop trigger if exists validate_credit_purchase_insert on public.credit_purchases;
create trigger validate_credit_purchase_insert before insert on public.credit_purchases
for each row execute function public.validate_credit_purchase_insert();
drop trigger if exists validate_promotion_insert on public.listing_promotions;
create trigger validate_promotion_insert before insert on public.listing_promotions
for each row execute function public.validate_promotion_insert();

-- No direct user/admin update of payment rows through PostgREST. The only
-- legitimate transitions are the checked SECURITY DEFINER functions below.
revoke update on public.credit_purchases from authenticated;
revoke update on public.listing_promotions from authenticated;

create or replace function public.mark_my_credit_purchase_sent(p_purchase_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.credit_purchases
    set status = 'user_confirmed', user_confirmed_at = now()
    where id = p_purchase_id and user_id = auth.uid() and status = 'pending_payment';
end;
$$;

create or replace function public.mark_my_promotion_sent(p_promotion_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.listing_promotions
    set status = 'user_confirmed', user_confirmed_at = now()
    where id = p_promotion_id and user_id = auth.uid() and status = 'pending_payment';
end;
$$;

revoke all on function public.validate_credit_purchase_insert() from public, anon, authenticated;
revoke all on function public.validate_promotion_insert() from public, anon, authenticated;
revoke all on function public.mark_my_credit_purchase_sent(uuid) from public, anon, authenticated;
revoke all on function public.mark_my_promotion_sent(uuid) from public, anon, authenticated;
grant execute on function public.mark_my_credit_purchase_sent(uuid) to authenticated;
grant execute on function public.mark_my_promotion_sent(uuid) to authenticated;
