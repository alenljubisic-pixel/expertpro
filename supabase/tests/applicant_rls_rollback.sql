-- Authenticated applicant can apply, but cannot unlock chat or forge acceptance.
begin;
do $setup$
declare
  v_owner uuid := gen_random_uuid();
  v_worker uuid := gen_random_uuid();
  v_listing uuid;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values
    (v_owner, v_owner || '@example.invalid', '{"type":"individual","full_name":"Test vlasnik"}'::jsonb),
    (v_worker, v_worker || '@example.invalid', '{"type":"individual","full_name":"Test radnik"}'::jsonb);
  insert into public.listings (user_id, type, title, city)
  values (v_owner, 'request', 'Transakcioni RLS test', 'Beograd')
  returning id into v_listing;
  update public.listings set last_activity_at = now() - interval '1 day' where id = v_listing;
  perform set_config('expertpro.test_owner', v_owner::text, true);
  perform set_config('expertpro.test_worker', v_worker::text, true);
  perform set_config('expertpro.test_listing', v_listing::text, true);
end;
$setup$;

set local role authenticated;
do $test$
declare
  v_owner uuid := current_setting('expertpro.test_owner')::uuid;
  v_worker uuid := current_setting('expertpro.test_worker')::uuid;
  v_listing uuid := current_setting('expertpro.test_listing')::uuid;
  v_application uuid;
  v_blocked boolean := false;
begin
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_worker::text, true);
  insert into public.applications (listing_id, applicant_id, message)
  values (v_listing, v_worker, 'Prijava bez direktnog kontakta')
  returning id into v_application;
  if (select last_activity_at from public.listings where id = v_listing)
     <= now() - interval '1 hour' then
    raise exception 'Application did not refresh listing activity';
  end if;

  begin
    update public.applications set status = 'accepted' where id = v_application;
  exception when insufficient_privilege then
    v_blocked := true;
  end;
  if not v_blocked then raise exception 'Applicant forged accepted status'; end if;

  v_blocked := false;
  begin
    insert into public.conversations (listing_id, participant_1_id, participant_2_id)
    values (v_listing, v_owner, v_worker);
  exception when insufficient_privilege then
    v_blocked := true;
  end;
  if not v_blocked then raise exception 'Applicant opened chat before assignment'; end if;
  perform set_config('expertpro.test_application', v_application::text, true);
end;
$test$;

do $select_candidate$
begin
  perform set_config('request.jwt.claim.sub', current_setting('expertpro.test_owner'), true);
  perform public.select_application_candidate(current_setting('expertpro.test_application')::uuid);
end;
$select_candidate$;

do $confirm_and_chat$
declare
  v_owner uuid := current_setting('expertpro.test_owner')::uuid;
  v_worker uuid := current_setting('expertpro.test_worker')::uuid;
  v_listing uuid := current_setting('expertpro.test_listing')::uuid;
  v_conversation uuid;
begin
  perform set_config('request.jwt.claim.sub', v_worker::text, true);
  perform public.confirm_application(current_setting('expertpro.test_application')::uuid);
  -- A new statement below will observe the accepted application in STABLE RLS helpers.
end;
$confirm_and_chat$;

do $chat$
declare
  v_owner uuid := current_setting('expertpro.test_owner')::uuid;
  v_worker uuid := current_setting('expertpro.test_worker')::uuid;
  v_listing uuid := current_setting('expertpro.test_listing')::uuid;
  v_conversation uuid;
begin
  perform set_config('request.jwt.claim.sub', v_worker::text, true);
  insert into public.conversations (listing_id, participant_1_id, participant_2_id)
  values (v_listing, v_owner, v_worker) returning id into v_conversation;
  insert into public.messages (conversation_id, sender_id, content)
  values (v_conversation, v_worker, 'Dozvoljena poruka posle potvrde');
  perform set_config('expertpro.test_conversation', v_conversation::text, true);
end;
$chat$;

do $close_chat$
begin
  perform set_config('request.jwt.claim.sub', current_setting('expertpro.test_owner'), true);
  perform public.mark_job_finished(current_setting('expertpro.test_application')::uuid);
end;
$close_chat$;

do $test_chat_locked$
declare
  v_blocked boolean := false;
begin
  perform set_config('request.jwt.claim.sub', current_setting('expertpro.test_worker'), true);
  begin
    insert into public.messages (conversation_id, sender_id, content)
    values (current_setting('expertpro.test_conversation')::uuid,
            current_setting('expertpro.test_worker')::uuid, 'Nedozvoljena poruka');
  exception when insufficient_privilege then
    v_blocked := true;
  end;
  if not v_blocked then raise exception 'Chat remained writable after finish'; end if;
end;
$test_chat_locked$;
reset role;
rollback;
select 'applicant_rls_rollback PASS; no synthetic rows persisted' as result;
