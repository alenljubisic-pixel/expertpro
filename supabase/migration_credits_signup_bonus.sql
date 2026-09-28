-- =============================================
-- Welcome credits on signup — every new account (individual, company or
-- agency) gets a small free credit balance the moment they register, so
-- they can try posting one urgent listing before ever paying anything.
-- This is separate from the 10-credit bonus granted when a company/agency
-- is upgraded to a paid "Puno članstvo" tier (migration_credits.sql).
--
-- Safe to run more than once: a `signup_credit_granted` flag makes the
-- one-time backfill for already-registered users idempotent, and new
-- signups get the bonus baked into handle_new_user() itself.
--
-- Requires migration_credits.sql to already be applied (uses
-- profiles.credit_balance).
-- =============================================

alter table public.profiles add column if not exists signup_credit_granted boolean not null default false;

-- One-time backfill for accounts that already existed before this migration.
update public.profiles
  set credit_balance = credit_balance + 2, signup_credit_granted = true
  where not signup_credit_granted;

-- New signups: grant the same 2 free credits at profile-creation time.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, type, is_approved, credit_balance, signup_credit_granted)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'type', 'individual'),
    case
      when coalesce(new.raw_user_meta_data->>'type', 'individual') = 'individual' then true
      else false
    end,
    2,
    true
  );
  return new;
end;
$$ language plpgsql security definer;
-- Trigger on_auth_user_created already points at this function (schema.sql)
-- — replacing the function body above is enough, no trigger change needed.
