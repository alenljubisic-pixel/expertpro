-- Complaints are exceptional: alert admins in-app, not for every platform event.
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check check (
  type in (
    'new_application', 'application_accepted', 'application_rejected',
    'application_selected', 'application_confirmed', 'application_declined',
    'new_message', 'new_review', 'listing_expired', 'account_approved',
    'urgent_nearby', 'job_finish_requested', 'job_completed',
    'job_finish_reminder', 'listing_inactive_check', 'listing_auto_paused',
    'support_ticket'
  )
);

create or replace function private.notify_admins_of_support_ticket()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.notifications(user_id, type, title, message, link, data)
  select p.id, 'support_ticket', 'Nova žalba korisnika',
         'Otvori admin panel i pregledaj novu žalbu.', '/admin/zalbe',
         jsonb_build_object('ticket_id', new.id)
  from public.profiles p
  where p.is_admin = true;
  return new;
end;
$$;
revoke all on function private.notify_admins_of_support_ticket() from public, anon, authenticated;

drop trigger if exists notify_admins_of_support_ticket on public.support_tickets;
create trigger notify_admins_of_support_ticket
after insert on public.support_tickets
for each row execute function private.notify_admins_of_support_ticket();
