-- Run after job_completion_and_mutual_reviews.sql.
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete set null,
  review_id uuid references public.reviews(id) on delete set null,
  title text not null check (length(trim(title)) between 5 and 120),
  body text not null check (length(trim(body)) between 15 and 5000),
  status text not null default 'open' check (status in ('open','in_review','resolved','rejected')),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists support_tickets_reporter_created_idx
  on public.support_tickets (reporter_id, created_at desc);
create index if not exists support_tickets_open_created_idx
  on public.support_tickets (created_at desc) where status in ('open','in_review');
alter table public.support_tickets enable row level security;
revoke all on public.support_tickets from anon, authenticated;
grant select, insert on public.support_tickets to authenticated;
create policy "Ticket owner or admin reads" on public.support_tickets for select to authenticated
using ((select auth.uid()) = reporter_id or (select private.is_current_user_admin()));
create policy "User creates own ticket" on public.support_tickets for insert to authenticated
with check (
  (select auth.uid()) = reporter_id and status = 'open' and admin_note is null
  and length(trim(title)) between 5 and 120 and length(trim(body)) between 15 and 5000
);

alter table public.reviews
  add column if not exists moderated_at timestamptz,
  add column if not exists moderated_by uuid references public.profiles(id) on delete set null,
  add column if not exists moderation_reason text;
drop policy if exists "Reviews are public" on public.reviews;
create policy "Reviews are public" on public.reviews for select to anon, authenticated
using (moderated_at is null);
create policy "Admin can see moderated reviews" on public.reviews for select to authenticated
using ((select private.is_current_user_admin()));
drop policy if exists "Create own reviews" on public.reviews;
create policy "Create own reviews" on public.reviews for insert to authenticated
with check (
  (select auth.uid()) = reviewer_id and moderated_at is null
  and moderated_by is null and moderation_reason is null
  and private.can_review_completed_job(listing_id, reviewer_id, reviewee_id)
);

-- New reviews must not put previously hidden ratings back into the average.
create or replace function public.update_profile_rating()
returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.profiles set
    rating_avg = coalesce((select round(avg(rating)::numeric, 2) from public.reviews
      where reviewee_id = new.reviewee_id and moderated_at is null), 0),
    rating_count = (select count(*) from public.reviews
      where reviewee_id = new.reviewee_id and moderated_at is null)
  where id = new.reviewee_id;
  return new;
end;
$$;

create or replace function public.admin_hide_review(p_review_id uuid, p_reason text)
returns void
language plpgsql security definer set search_path = '' as $$
declare v_reviewee uuid;
begin
  if auth.uid() is null or not private.is_current_user_admin() then
    raise exception 'Samo admin može ukloniti ocenu.';
  end if;
  if length(trim(coalesce(p_reason, ''))) < 10 then
    raise exception 'Navedite razlog uklanjanja ocene.';
  end if;
  select reviewee_id into v_reviewee from public.reviews
    where id = p_review_id and moderated_at is null for update;
  if v_reviewee is null then raise exception 'Ocena ne postoji ili je već sklonjena.'; end if;
  update public.reviews
    set moderated_at = now(), moderated_by = auth.uid(), moderation_reason = trim(p_reason)
    where id = p_review_id;
  update public.profiles
    set rating_avg = coalesce((select round(avg(rating)::numeric, 2) from public.reviews
      where reviewee_id = v_reviewee and moderated_at is null), 0),
        rating_count = (select count(*) from public.reviews
      where reviewee_id = v_reviewee and moderated_at is null)
    where id = v_reviewee;
end;
$$;
revoke all on function public.admin_hide_review(uuid,text) from public, anon;
grant execute on function public.admin_hide_review(uuid,text) to authenticated;

create or replace function public.admin_update_ticket(
  p_ticket_id uuid, p_status text, p_note text
) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or not private.is_current_user_admin() then
    raise exception 'Samo admin može obraditi žalbu.';
  end if;
  if p_status not in ('open','in_review','resolved','rejected') then
    raise exception 'Nepoznat status žalbe.';
  end if;
  update public.support_tickets
    set status = p_status, admin_note = nullif(trim(p_note), ''), updated_at = now()
    where id = p_ticket_id;
  if not found then raise exception 'Žalba ne postoji.'; end if;
end;
$$;
revoke all on function public.admin_update_ticket(uuid,text,text) from public, anon;
grant execute on function public.admin_update_ticket(uuid,text,text) to authenticated;
