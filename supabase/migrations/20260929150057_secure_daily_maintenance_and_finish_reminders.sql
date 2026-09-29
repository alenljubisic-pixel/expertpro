-- Run maintenance in Postgres, never through anonymous HTTP RPCs.
create extension if not exists pg_cron with schema pg_catalog;

revoke all on function public.expire_old_listings() from public, anon, authenticated;
revoke all on function public.demote_expired_promotions() from public, anon, authenticated;

alter table public.notifications drop constraint notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type in (
    'new_application', 'application_accepted', 'application_rejected',
    'application_selected', 'application_confirmed', 'application_declined',
    'new_message', 'new_review', 'listing_expired', 'account_approved',
    'urgent_nearby', 'job_finish_requested', 'job_completed',
    'job_finish_reminder'
  ));

create or replace function private.run_daily_maintenance()
returns void language plpgsql set search_path = '' as $$
begin
  update public.listings set status = 'expired'
  where status = 'active' and expires_at is not null and expires_at < now();

  update public.listings set is_featured = false
  where is_featured = true and featured_until is not null and featured_until < now();
  update public.listings
  set is_gold = false, secondary_category_id = null, secondary_category_slug = null
  where is_gold = true and gold_until is not null and gold_until < now();
  update public.listing_promotions set status = 'expired'
  where status = 'paid_confirmed'
    and listing_id in (
      select id from public.listings
      where (is_featured = false or featured_until < now())
        and (is_gold = false or gold_until < now())
    );

  -- One side has closed chat; remind only the other side to confirm or dispute.
  -- No job is automatically marked complete by elapsed time.
  insert into public.notifications (user_id, type, title, message, link, body, data)
  select case when a.owner_finished_at is not null then a.applicant_id else l.user_id end,
    'job_finish_reminder', 'Potvrdi ili prijavi problem: ' || l.title,
    case when stage.days_waiting = 3
      then 'Druga strana je označila posao kao završen. Potvrdi ako jeste ili prijavi problem podršci.'
      else 'Završetak posla još čeka tvoj odgovor. Potvrdi ili pošalji žalbu podršci.' end,
    '/oglasi/' || l.id,
    'Potvrdi završetak ili prijavi problem.',
    jsonb_build_object('listing_id', l.id, 'application_id', a.id,
                       'reminder_day', stage.days_waiting)
  from public.applications a
  join public.listings l on l.id = a.listing_id
  cross join (values (3), (7)) as stage(days_waiting)
  where a.status = 'accepted' and a.completed_at is null
    and ((a.owner_finished_at is not null and a.applicant_finished_at is null)
      or (a.applicant_finished_at is not null and a.owner_finished_at is null))
    and coalesce(a.owner_finished_at, a.applicant_finished_at)
      <= now() - make_interval(days => stage.days_waiting)
    and not exists (
      select 1 from public.notifications n
      where n.type = 'job_finish_reminder'
        and n.data->>'application_id' = a.id::text
        and n.data->>'reminder_day' = stage.days_waiting::text
    );
end;
$$;
revoke all on function private.run_daily_maintenance() from public, anon, authenticated;

-- Supabase Cron executes as the database role that schedules this job.
select cron.schedule(
  'expertpro-daily-maintenance', '0 3 * * *',
  'select private.run_daily_maintenance()'
);
