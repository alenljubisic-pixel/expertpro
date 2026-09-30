-- New orders receive a bank-native, globally unique model-97 reference.
-- Existing orders remain NULL so their already-issued payment instructions
-- do not silently change while a customer may be transferring money.
create sequence private.payment_bank_reference_seq as bigint start with 1;

create or replace function private.next_payment_bank_reference()
returns text language plpgsql security definer set search_path = '' as $$
declare
  v_sequence bigint;
  v_base text;
  v_check integer;
begin
  v_sequence := nextval('private.payment_bank_reference_seq'::regclass);
  if v_sequence > 9999999999 then
    raise exception 'Payment reference space exhausted';
  end if;
  v_base := lpad(v_sequence::text, 10, '0');
  v_check := 98 - mod(v_base::numeric * 100, 97)::integer;
  return lpad(v_check::text, 2, '0') || v_base;
end;
$$;
revoke all on function private.next_payment_bank_reference() from public, anon, authenticated;
revoke all on sequence private.payment_bank_reference_seq from public, anon, authenticated;

alter table public.credit_purchases add column bank_reference text;
alter table public.listing_promotions add column bank_reference text;
alter table public.credit_purchases add constraint credit_purchases_bank_reference_format
  check (bank_reference is null or (bank_reference ~ '^[0-9]{12}$' and mod(bank_reference::numeric, 97) = 1));
alter table public.listing_promotions add constraint listing_promotions_bank_reference_format
  check (bank_reference is null or (bank_reference ~ '^[0-9]{12}$' and mod(bank_reference::numeric, 97) = 1));
create unique index credit_purchases_bank_reference_idx on public.credit_purchases(bank_reference) where bank_reference is not null;
create unique index listing_promotions_bank_reference_idx on public.listing_promotions(bank_reference) where bank_reference is not null;

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
  new.bank_reference := private.next_payment_bank_reference();
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
  new.bank_reference := private.next_payment_bank_reference();
  return new;
end;
$$;
