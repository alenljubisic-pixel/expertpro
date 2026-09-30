-- Notification channels are independent. Missing preference rows retain defaults.
create table if not exists public.notification_preferences (
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('applications', 'messages', 'jobs', 'listings', 'opportunities')),
  in_app boolean not null default true,
  email boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (user_id, category)
);

alter table public.notification_preferences enable row level security;

create policy "Users read own notification preferences"
  on public.notification_preferences for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Users insert own notification preferences"
  on public.notification_preferences for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Users update own notification preferences"
  on public.notification_preferences for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update on public.notification_preferences to authenticated;

alter table public.notifications
  add column if not exists suppressed boolean not null default false;

create or replace function public.notification_category(p_type text)
returns text
language sql immutable set search_path = ''
as $$
  select case
    when p_type in ('new_application', 'application_accepted', 'application_rejected',
                    'application_selected', 'application_confirmed', 'application_declined') then 'applications'
    when p_type = 'new_message' then 'messages'
    when p_type in ('new_review', 'job_finish_requested', 'job_completed', 'job_finish_reminder') then 'jobs'
    when p_type in ('listing_expired', 'listing_inactive_check', 'listing_auto_paused') then 'listings'
    when p_type = 'urgent_nearby' then 'opportunities'
    else null -- account/security notifications are always delivered
  end
$$;

create or replace function public.set_notification_suppressed()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_category text;
begin
  v_category := public.notification_category(new.type);
  if v_category is not null then
    select not p.in_app into new.suppressed
      from public.notification_preferences p
      where p.user_id = new.user_id and p.category = v_category;
    new.suppressed := coalesce(new.suppressed, false);
  else
    new.suppressed := false;
  end if;
  return new;
end;
$$;

create trigger notification_suppression_before_insert
  before insert on public.notifications
  for each row execute function public.set_notification_suppressed();

-- Existing hidden rows are preserved for audit; preferences take effect prospectively.
