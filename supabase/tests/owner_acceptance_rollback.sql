-- Production-safe smoke test. Synthetic users, listings, and notifications
-- exist only inside this transaction and are always rolled back.
begin;
do $test$
declare
  v_owner uuid := gen_random_uuid();
  v_winner uuid := gen_random_uuid();
  v_other uuid := gen_random_uuid();
  v_listing uuid;
  v_winning_application uuid;
  v_other_application uuid;
  v_denied boolean := false;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values
    (v_owner, v_owner || '@example.invalid', '{"type":"individual","full_name":"Test vlasnik"}'::jsonb),
    (v_winner, v_winner || '@example.invalid', '{"type":"individual","full_name":"Test kandidat"}'::jsonb),
    (v_other, v_other || '@example.invalid', '{"type":"individual","full_name":"Test drugi"}'::jsonb);

  insert into public.listings (user_id, type, title, city)
  values (v_owner, 'request', 'Transakcioni test dodele', 'Beograd')
  returning id into v_listing;
  insert into public.applications (listing_id, applicant_id, message)
  values (v_listing, v_winner, 'Prva test prijava')
  returning id into v_winning_application;
  insert into public.applications (listing_id, applicant_id, message)
  values (v_listing, v_other, 'Druga test prijava')
  returning id into v_other_application;

  perform set_config('request.jwt.claim.sub', v_other::text, true);
  begin
    perform public.select_application_candidate(v_winning_application);
  exception when others then
    v_denied := true;
  end;
  if not v_denied then
    raise exception 'Non-owner could accept a candidate';
  end if;

  perform set_config('request.jwt.claim.sub', v_owner::text, true);
  perform public.select_application_candidate(v_winning_application);
  if (select status from public.listings where id = v_listing) <> 'filled'
     or (select status from public.applications where id = v_winning_application) <> 'accepted'
     or (select status from public.applications where id = v_other_application) <> 'rejected'
     or exists (select 1 from public.applications where listing_id = v_listing and status = 'selected')
     or not private.is_confirmed_chat_pair(v_listing, v_owner, v_winner)
     or private.is_confirmed_chat_pair(v_listing, v_owner, v_other)
     or not exists (select 1 from public.notifications
                    where user_id = v_winner and type = 'application_accepted'
                      and data->>'application_id' = v_winning_application::text)
     or not exists (select 1 from public.notifications
                    where user_id = v_other and type = 'application_rejected'
                      and data->>'listing_id' = v_listing::text) then
    raise exception 'Owner acceptance invariant failed';
  end if;

  v_denied := false;
  begin
    perform public.select_application_candidate(v_other_application);
  exception when others then
    v_denied := true;
  end;
  if not v_denied then
    raise exception 'Second candidate could be accepted';
  end if;
end;
$test$;
rollback;
select 'owner_acceptance_rollback PASS; no synthetic rows persisted' as result;
