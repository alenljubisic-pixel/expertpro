-- NBS model 97 validates the two control digits against the numeric base,
-- not the remainder of the concatenated reference itself.
alter table public.credit_purchases
  drop constraint if exists credit_purchases_bank_reference_format;

alter table public.credit_purchases
  add constraint credit_purchases_bank_reference_format check (
    bank_reference is null or (
      bank_reference ~ '^[0-9]{12}$'
      and left(bank_reference, 2)::integer =
        98 - mod(right(bank_reference, 10)::numeric * 100, 97)::integer
    )
  );

alter table public.listing_promotions
  drop constraint if exists listing_promotions_bank_reference_format;

alter table public.listing_promotions
  add constraint listing_promotions_bank_reference_format check (
    bank_reference is null or (
      bank_reference ~ '^[0-9]{12}$'
      and left(bank_reference, 2)::integer =
        98 - mod(right(bank_reference, 10)::numeric * 100, 97)::integer
    )
  );
