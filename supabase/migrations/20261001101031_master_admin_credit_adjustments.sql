-- ExpertPro has one designated master admin. Existing admin RLS/functions
-- continue to use is_admin, while this constraint prevents a second account
-- ever acquiring that flag without an explicit migration.
alter table public.profiles
  add constraint profiles_master_admin_only
  check (is_admin is distinct from true or id = '82f063f3-897a-47d4-bab4-227704c7f891'::uuid);

create or replace function private.is_current_user_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and id = '82f063f3-897a-47d4-bab4-227704c7f891'::uuid
      and is_admin is true and is_active is true
  );
$$;

-- TRUNCATE bypasses RLS, so these privileges must not be available to API
-- roles even on otherwise RLS-protected tables.
revoke truncate, references, trigger on all tables in schema public
  from anon, authenticated;

-- The audit table has RLS but previously inherited broad table privileges.
revoke all on public.admin_logs from anon, authenticated;
grant select on public.admin_logs to authenticated;
create policy "Master admin can read audit logs"
  on public.admin_logs for select to authenticated
  using ((select private.is_current_user_admin()));

create unique index admin_logs_credit_request_once
  on public.admin_logs ((details->>'request_id'))
  where action = 'manual_credit_adjustment';

create function public.master_adjust_user_credits(
  p_user_id uuid,
  p_mode text,
  p_amount integer,
  p_reason text,
  p_request_id uuid
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_old integer;
  v_new integer;
  v_calculated bigint;
  v_reason text := trim(coalesce(p_reason, ''));
  v_previous public.admin_logs%rowtype;
begin
  if (select auth.uid()) is distinct from '82f063f3-897a-47d4-bab4-227704c7f891'::uuid
     or not (select private.is_current_user_admin()) then
    raise exception 'Samo master admin može da menja kredite.' using errcode = '42501';
  end if;
  if p_user_id is null or p_request_id is null then
    raise exception 'Korisnik i ID zahteva su obavezni.';
  end if;
  if p_mode not in ('add', 'remove', 'set') or p_mode is null then
    raise exception 'Nepoznata radnja.';
  end if;
  if p_amount is null or p_amount < 0 or p_amount > 100000
     or (p_mode <> 'set' and p_amount = 0) then
    raise exception 'Neispravan iznos kredita.';
  end if;
  if length(v_reason) < 5 or length(v_reason) > 300 then
    raise exception 'Razlog mora imati od 5 do 300 znakova.';
  end if;

  select coalesce(credit_balance, 0) into v_old
  from public.profiles where id = p_user_id for update;
  if not found then
    raise exception 'Korisnik ne postoji.';
  end if;

  select * into v_previous from public.admin_logs
  where action = 'manual_credit_adjustment'
    and details->>'request_id' = p_request_id::text;
  if found then
    if v_previous.target_id is distinct from p_user_id::text
       or v_previous.details->>'mode' is distinct from p_mode
       or (v_previous.details->>'amount')::integer is distinct from p_amount then
      raise exception 'ID zahteva je već iskorišćen za drugu izmenu.';
    end if;
    return v_old;
  end if;

  v_calculated := case p_mode
    when 'add' then v_old::bigint + p_amount
    when 'remove' then v_old::bigint - p_amount
    else p_amount::bigint
  end;
  if v_calculated < 0 then
    raise exception 'Nema dovoljno kredita za oduzimanje.';
  end if;
  if v_calculated > 1000000 then
    raise exception 'Saldo ne može preći 1.000.000 kredita.';
  end if;
  v_new := v_calculated::integer;
  if v_new = v_old then
    raise exception 'Saldo je već na tom iznosu.';
  end if;

  update public.profiles
  set credit_balance = v_new, updated_at = now()
  where id = p_user_id;

  insert into public.admin_logs (admin_id, action, target_type, target_id, details)
  values (
    (select auth.uid()), 'manual_credit_adjustment', 'profile', p_user_id::text,
    jsonb_build_object(
      'request_id', p_request_id::text, 'mode', p_mode, 'amount', p_amount,
      'delta', v_new - v_old, 'balance_before', v_old,
      'balance_after', v_new, 'reason', v_reason
    )
  );
  return v_new;
end;
$$;

revoke all on function public.master_adjust_user_credits(uuid,text,integer,text,uuid)
  from public, anon, authenticated;
grant execute on function public.master_adjust_user_credits(uuid,text,integer,text,uuid)
  to authenticated;
