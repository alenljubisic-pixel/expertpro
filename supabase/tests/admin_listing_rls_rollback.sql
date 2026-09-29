-- Verify admin pause/restore RLS without keeping synthetic accounts/listings.
begin;
do $setup$
declare
  v_admin uuid := gen_random_uuid();
  v_owner uuid := gen_random_uuid();
  v_stranger uuid := gen_random_uuid();
  v_listing uuid;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values
    (v_admin, v_admin || '@example.invalid', '{"type":"individual","full_name":"Test admin"}'::jsonb),
    (v_owner, v_owner || '@example.invalid', '{"type":"individual","full_name":"Test vlasnik"}'::jsonb),
    (v_stranger, v_stranger || '@example.invalid', '{"type":"individual","full_name":"Test drugi"}'::jsonb);
  insert into public.listings (user_id, type, title, city)
  values (v_owner, 'request', 'Transakcioni test admin oglasa', 'Beograd')
  returning id into v_listing;
  perform set_config('request.jwt.claim.role', 'service_role', true);
  update public.profiles set is_admin = true where id = v_admin;
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('expertpro.test_admin', v_admin::text, true);
  perform set_config('expertpro.test_owner', v_owner::text, true);
  perform set_config('expertpro.test_stranger', v_stranger::text, true);
  perform set_config('expertpro.test_listing', v_listing::text, true);
end;
$setup$;

set local role authenticated;
do $test$
declare
  v_admin uuid := current_setting('expertpro.test_admin')::uuid;
  v_owner uuid := current_setting('expertpro.test_owner')::uuid;
  v_stranger uuid := current_setting('expertpro.test_stranger')::uuid;
  v_listing uuid := current_setting('expertpro.test_listing')::uuid;
  v_rows integer;
begin
  perform set_config('request.jwt.claim.sub', v_owner::text, true);
  update public.listings set updated_at = now() where id = v_listing;
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then raise exception 'Owner cannot update own listing'; end if;

  perform set_config('request.jwt.claim.sub', v_stranger::text, true);
  update public.listings set status = 'paused' where id = v_listing;
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then raise exception 'Unrelated user could pause listing'; end if;

  perform set_config('request.jwt.claim.sub', v_admin::text, true);
  update public.listings set status = 'paused' where id = v_listing;
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then raise exception 'Admin cannot pause another user listing'; end if;
  update public.listings set status = 'active' where id = v_listing;
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then raise exception 'Admin cannot restore another user listing'; end if;
end;
$test$;
reset role;
rollback;
select 'admin_listing_rls_rollback PASS; no synthetic rows persisted' as result;
