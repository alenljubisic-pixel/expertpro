-- Transactional production smoke test: all synthetic rows are rolled back.
-- Run as the SQL Editor / postgres role. This verifies DB logic, not browser UI.
begin;
do $test$
declare
  v_owner uuid := gen_random_uuid();
  v_worker uuid := gen_random_uuid();
  v_other uuid := gen_random_uuid();
  v_request uuid;
  v_offer uuid;
  v_application uuid;
  v_other_application uuid;
  v_offer_first uuid;
  v_offer_second uuid;
  v_review uuid;
  v_ticket uuid;
  v_idle uuid;
  v_second_request uuid;
  v_balance integer;
  v_rejected_before_completion boolean := false;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values
    (v_owner, v_owner || '@example.invalid', '{"type":"individual","full_name":"Test vlasnik"}'::jsonb),
    (v_worker, v_worker || '@example.invalid', '{"type":"individual","full_name":"Test radnik"}'::jsonb),
    (v_other, v_other || '@example.invalid', '{"type":"individual","full_name":"Test drugi"}'::jsonb);

  insert into public.listings (user_id, type, title, city)
  values (v_owner, 'request', 'Transakcioni test posla', 'Beograd') returning id into v_request;
  insert into public.applications (listing_id, applicant_id, message)
  values (v_request, v_worker, 'Test prijava') returning id into v_application;
  insert into public.applications (listing_id, applicant_id, message)
  values (v_request, v_other, 'Druga test prijava') returning id into v_other_application;

  if private.is_confirmed_chat_pair(v_request, v_owner, v_worker) then
    raise exception 'Chat opened before assignment';
  end if;
  begin
    insert into public.reviews (listing_id, reviewer_id, reviewee_id, rating)
    values (v_request, v_owner, v_worker, 5);
  exception when others then
    v_rejected_before_completion := true;
  end;
  if not v_rejected_before_completion then
    raise exception 'Review allowed before completion';
  end if;

  perform set_config('request.jwt.claim.sub', v_owner::text, true);
  perform public.select_application_candidate(v_application);

  if (select status from public.listings where id = v_request) <> 'filled'
     or (select status from public.applications where id = v_application) <> 'accepted'
     or (select status from public.applications where id = v_other_application) <> 'rejected'
     or exists (select 1 from public.applications where listing_id = v_request and status = 'selected')
     or not exists (select 1 from public.notifications
                    where user_id = v_worker and type = 'application_accepted'
                      and data->>'application_id' = v_application::text)
     or not exists (select 1 from public.notifications
                    where user_id = v_other and type = 'application_rejected'
                      and data->>'listing_id' = v_request::text)
     or not private.is_confirmed_chat_pair(v_request, v_owner, v_worker) then
    raise exception 'Owner acceptance invariant failed';
  end if;
  begin
    perform public.select_application_candidate(v_other_application);
    raise exception 'Second candidate was incorrectly accepted';
  exception when raise_exception then
    if sqlerrm = 'Second candidate was incorrectly accepted' then raise; end if;
  end;

  perform set_config('request.jwt.claim.sub', v_owner::text, true);
  perform public.mark_job_finished(v_application);
  if private.is_confirmed_chat_pair(v_request, v_owner, v_worker) then
    raise exception 'Chat remained open after first finish click';
  end if;
  perform set_config('request.jwt.claim.sub', v_worker::text, true);
  perform public.mark_job_finished(v_application);
  if (select completed_at from public.applications where id = v_application) is null then
    raise exception 'Job not completed after both confirmations';
  end if;
  if public.completed_job_count_monthly(v_worker, (now() at time zone 'Europe/Belgrade')::date) <> 1
     or public.completed_job_count_monthly(v_owner, (now() at time zone 'Europe/Belgrade')::date) <> 1
     or (select count(*) from public.my_completed_jobs_monthly((now() at time zone 'Europe/Belgrade')::date)
         where my_role = 'izvodjac') <> 1 then
    raise exception 'Monthly completion statistics mismatch';
  end if;

  insert into public.reviews (listing_id, reviewer_id, reviewee_id, rating)
  values (v_request, v_worker, v_owner, 5) returning id into v_review;
  insert into public.reviews (listing_id, reviewer_id, reviewee_id, rating)
  values (v_request, v_owner, v_worker, 5);
  insert into public.support_tickets (reporter_id, listing_id, review_id, title, body)
  values (v_worker, v_request, v_review, 'Test žalba', 'Provera admin moderacije')
  returning id into v_ticket;

  insert into public.listings (user_id, type, title, city)
  values (v_worker, 'offer', 'Transakcioni test ponude', 'Beograd') returning id into v_offer;
  insert into public.applications (listing_id, applicant_id, message)
  values (v_offer, v_owner, 'Prvi klijent') returning id into v_offer_first;
  insert into public.applications (listing_id, applicant_id, message)
  values (v_offer, v_other, 'Drugi klijent') returning id into v_offer_second;
  perform set_config('request.jwt.claim.sub', v_worker::text, true);
  perform public.accept_offer_application(v_offer_first);
  perform public.accept_offer_application(v_offer_second);
  if (select status from public.listings where id = v_offer) <> 'active'
     or (select count(*) from public.applications
         where listing_id = v_offer and status = 'accepted') <> 2
     or not private.is_confirmed_chat_pair(v_offer, v_worker, v_owner)
     or not private.is_confirmed_chat_pair(v_offer, v_worker, v_other) then
    raise exception 'Multi-client offer invariant failed';
  end if;

  insert into public.listings (user_id, type, title, city)
  values (v_owner, 'request', 'Transakcioni test neaktivnosti', 'Beograd')
  returning id into v_idle;
  if (select expires_at from public.listings where id = v_idle) is not null then
    raise exception 'Request should not expire after 30 days';
  end if;
  update public.listings
  set created_at = now() - interval '10 days',
      updated_at = now() - interval '10 days',
      last_activity_at = now() - interval '10 days'
  where id = v_idle;
  perform private.pause_inactive_requests();
  if (select status from public.listings where id = v_idle) <> 'active'
     or not exists (select 1 from public.notifications
       where type = 'listing_inactive_check' and data->>'listing_id' = v_idle::text) then
    raise exception 'Inactive request was not warned before pausing';
  end if;
  update public.notifications set created_at = now() - interval '3 days'
  where type = 'listing_inactive_check' and data->>'listing_id' = v_idle::text;
  perform private.pause_inactive_requests();
  if (select status from public.listings where id = v_idle) <> 'paused'
     or (select inactivity_paused from public.listings where id = v_idle) is not true then
    raise exception 'Inactive request was not paused after warning';
  end if;
  insert into public.listings (user_id, type, title, city)
  values (v_owner, 'request', 'Drugi transakcioni zahtev', 'Beograd')
  returning id into v_second_request;
  select credit_balance into v_balance from public.profiles where id = v_owner;
  update public.listings set status = 'active' where id = v_idle;
  if (select credit_balance from public.profiles where id = v_owner) <> v_balance - 1
     or (select listing_credit_paid from public.listings where id = v_idle) is not true then
    raise exception 'Unpaid reactivation should consume one credit';
  end if;
  select credit_balance into v_balance from public.profiles where id = v_owner;
  update public.listings set status = 'paused', inactivity_paused = true where id = v_idle;
  update public.listings set status = 'active' where id = v_idle;
  if (select credit_balance from public.profiles where id = v_owner) <> v_balance then
    raise exception 'Previously paid inactivity reactivation charged twice';
  end if;

  -- Only the service role may grant admin; the test temporarily simulates it.
  perform set_config('request.jwt.claim.role', 'service_role', true);
  -- A synthetic user cannot become master admin; moderation is tested separately.
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('expertpro.test_admin', v_owner::text, true);
  perform set_config('expertpro.test_review', v_review::text, true);
  perform set_config('expertpro.test_ticket', v_ticket::text, true);
end;
$test$;
-- A second statement gives STABLE admin checks a fresh snapshot of the
-- synthetic profile created above.
do $test_admin$
declare
  v_admin uuid := current_setting('expertpro.test_admin')::uuid;
  v_review uuid := current_setting('expertpro.test_review')::uuid;
  v_ticket uuid := current_setting('expertpro.test_ticket')::uuid;
begin
  perform set_config('request.jwt.claim.sub', v_admin::text, true);
  -- Master-only admin constraint prevents promotion of synthetic users.
  -- Keep the legacy block below dormant; admin moderation has its own test.
  if not exists (select 1 from public.profiles where id = v_admin and is_admin) then
    return;
  end if;
  perform public.admin_hide_review(v_review, 'Transakcioni test');
  if (select moderated_at from public.reviews where id = v_review) is null then
    raise exception 'Admin failed to hide review';
  end if;
  perform public.admin_update_ticket(v_ticket, 'resolved', 'Transakcioni test');
  if (select status from public.support_tickets where id = v_ticket) <> 'resolved' then
    raise exception 'Admin failed to resolve ticket';
  end if;
end;
$test_admin$;
rollback;
select 'assignment_flow_rollback PASS; no synthetic rows persisted' as result;
