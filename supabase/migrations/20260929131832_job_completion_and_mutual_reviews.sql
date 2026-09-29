-- Run after 20260929131309_lock_chat_until_assignment.sql.
-- A job is completed only when BOTH participants confirm it. Never infer
-- completion from elapsed time.
alter table public.applications
  add column if not exists owner_finished_at timestamptz,
  add column if not exists applicant_finished_at timestamptz,
  add column if not exists completed_at timestamptz;

alter table public.applications
  add constraint applications_completion_requires_both
  check (completed_at is null or
    (owner_finished_at is not null and applicant_finished_at is not null));

-- Closing a job is also the end of its chat. One participant's "finished"
-- click locks new messages immediately; history remains readable.
create or replace function private.is_confirmed_chat_pair(
  p_listing_id uuid, p_first uuid, p_second uuid
) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.listings l
    join public.applications a on a.listing_id = l.id
    where l.id = p_listing_id and l.type in ('request', 'urgent')
      and a.status = 'accepted'
      and a.owner_finished_at is null and a.applicant_finished_at is null
      and ((l.user_id = p_first and a.applicant_id = p_second)
        or (l.user_id = p_second and a.applicant_id = p_first))
  );
$$;

-- Keep the existing notification types and extend the constraint in place.
do $$
declare v_constraint text;
begin
  select conname into v_constraint from pg_constraint
  where conrelid = 'public.notifications'::regclass and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%new_application%'
  limit 1;
  if v_constraint is not null then
    execute format('alter table public.notifications drop constraint %I', v_constraint);
  end if;
  alter table public.notifications add constraint notifications_type_check
  check (type in (
    'new_application', 'application_accepted', 'application_rejected',
    'application_selected', 'application_confirmed', 'application_declined',
    'new_message', 'new_review', 'listing_expired', 'account_approved',
    'urgent_nearby', 'job_finish_requested', 'job_completed'
  ));
end $$;

create or replace function public.mark_job_finished(p_application_id uuid)
returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_job record;
  v_recipient uuid;
begin
  select a.id, a.listing_id, a.applicant_id, a.status,
         a.owner_finished_at, a.applicant_finished_at, a.completed_at,
         l.user_id as owner_id, l.title
  into v_job
  from public.applications a join public.listings l on l.id = a.listing_id
  where a.id = p_application_id
  for update of a;

  if v_job is null or v_job.status <> 'accepted' or v_job.completed_at is not null
     or auth.uid() not in (v_job.owner_id, v_job.applicant_id) then
    raise exception 'Nema aktivnog dodeljenog posla za potvrdu.';
  end if;

  if auth.uid() = v_job.owner_id then
    if v_job.owner_finished_at is not null then return; end if;
    update public.applications set owner_finished_at = now() where id = v_job.id;
    v_recipient := v_job.applicant_id;
  else
    if v_job.applicant_finished_at is not null then return; end if;
    update public.applications set applicant_finished_at = now() where id = v_job.id;
    v_recipient := v_job.owner_id;
  end if;

  if (v_job.owner_finished_at is not null and auth.uid() = v_job.applicant_id)
     or (v_job.applicant_finished_at is not null and auth.uid() = v_job.owner_id) then
    update public.applications set completed_at = now() where id = v_job.id;
    insert into public.notifications (user_id, type, title, message, link, body, data)
    select person_id, 'job_completed', 'Posao je završen: ' || v_job.title,
           'Obe strane su potvrdile završetak. Sada možete oceniti saradnju.',
           '/oglasi/' || v_job.listing_id, 'Sada možeš oceniti saradnju.',
           jsonb_build_object('listing_id', v_job.listing_id)
    from (values (v_job.owner_id), (v_job.applicant_id)) as people(person_id);
  else
    insert into public.notifications (user_id, type, title, message, link, body, data)
    values (v_recipient, 'job_finish_requested', 'Potvrdi završetak: ' || v_job.title,
            'Druga strana je označila posao kao završen. Ako je posao zaista gotov, potvrdi i ti.',
            '/oglasi/' || v_job.listing_id, 'Potvrdi završetak posla.',
            jsonb_build_object('listing_id', v_job.listing_id));
  end if;
end;
$$;
revoke all on function public.mark_job_finished(uuid) from public, anon;
grant execute on function public.mark_job_finished(uuid) to authenticated;

create or replace function private.can_review_completed_job(
  p_listing_id uuid, p_reviewer_id uuid, p_reviewee_id uuid
) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.applications a
    join public.listings l on l.id = a.listing_id
    where a.listing_id = p_listing_id and a.status = 'accepted'
      and a.completed_at is not null
      and ((l.user_id = p_reviewer_id and a.applicant_id = p_reviewee_id)
        or (a.applicant_id = p_reviewer_id and l.user_id = p_reviewee_id))
  );
$$;
revoke all on function private.can_review_completed_job(uuid,uuid,uuid) from public, anon;
grant execute on function private.can_review_completed_job(uuid,uuid,uuid) to authenticated;

-- Existing historical reviews stay visible, but new reviews must carry a
-- listing id and refer to the one completed job shared by this pair.
create or replace function public.enforce_review_requires_contact()
returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.listing_id is null or new.reviewer_id = new.reviewee_id
     or not private.can_review_completed_job(new.listing_id, new.reviewer_id, new.reviewee_id) then
    raise exception 'Ocena je moguća tek nakon obostrano potvrđenog završetka zajedničkog posla.';
  end if;
  return new;
end;
$$;
revoke all on function public.enforce_review_requires_contact() from public, anon, authenticated;

drop policy if exists "Create own reviews" on public.reviews;
create policy "Create own reviews" on public.reviews for insert to authenticated
with check (
  (select auth.uid()) = reviewer_id
  and private.can_review_completed_job(listing_id, reviewer_id, reviewee_id)
);
