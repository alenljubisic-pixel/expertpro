-- One event per successful credit purchase, regardless of whether the admin
-- confirms it in the dashboard or via Telegram. No event on "I paid" clicks.
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check check (
  type in (
    'new_application', 'application_accepted', 'application_rejected',
    'application_selected', 'application_confirmed', 'application_declined',
    'new_message', 'new_review', 'listing_expired', 'account_approved',
    'urgent_nearby', 'job_finish_requested', 'job_completed',
    'job_finish_reminder', 'listing_inactive_check', 'listing_auto_paused',
    'support_ticket', 'credit_purchase_confirmed'
  )
);

create table public.credit_confirmation_emails (
  purchase_id uuid primary key references public.credit_purchases(id) on delete cascade,
  created_at timestamptz not null default now(),
  claimed_at timestamptz,
  sent_at timestamptz,
  attempts integer not null default 0,
  last_error text
);
alter table public.credit_confirmation_emails enable row level security;
revoke all on public.credit_confirmation_emails from public, anon, authenticated;
grant select, insert, update on public.credit_confirmation_emails to service_role;

create function private.notify_credit_purchase_confirmed()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if old.status is distinct from 'paid_confirmed' and new.status = 'paid_confirmed' then
    insert into public.notifications(user_id, type, title, message, link, data)
    values (new.user_id, 'credit_purchase_confirmed', 'Krediti su dodati',
      format('Uplata je potvrđena. %s kredita je uspešno dodato na tvoj nalog.', new.credits_amount),
      '/krediti/' || new.id::text,
      jsonb_build_object('purchase_id', new.id, 'credits', new.credits_amount));

    insert into public.credit_confirmation_emails(purchase_id) values (new.id)
      on conflict (purchase_id) do nothing;
  end if;
  return new;
end;
$$;
revoke all on function private.notify_credit_purchase_confirmed() from public, anon, authenticated;

create trigger notify_credit_purchase_confirmed
after update of status on public.credit_purchases
for each row execute function private.notify_credit_purchase_confirmed();

-- Atomic claim protects against duplicate emails when two confirmation
-- handlers race. A stale claim may be retried after five minutes.
create function public.claim_credit_confirmation_email(p_purchase_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_claimed boolean;
begin
  update public.credit_confirmation_emails e
    set claimed_at = now(), attempts = attempts + 1, last_error = null
    from public.credit_purchases p
    where e.purchase_id = p.id and e.purchase_id = p_purchase_id
      and p.status = 'paid_confirmed' and e.sent_at is null
      and (e.claimed_at is null or e.claimed_at < now() - interval '5 minutes');
  v_claimed := found;
  return v_claimed;
end;
$$;
revoke all on function public.claim_credit_confirmation_email(uuid) from public, anon, authenticated;
grant execute on function public.claim_credit_confirmation_email(uuid) to service_role;
