-- =============================================
-- Wires up the notification system (bell + /obavestenja already exist in the
-- UI) so it actually receives events, and adds guardrails + realtime to the
-- review/rating system so a review can only be left after real communication.
--
-- Safe to re-run.
-- =============================================

-- 0) The existing notifications table only has body/data(jsonb) columns, but
--    the already-built UI (Navbar bell + /obavestenja) reads `message` and
--    `link` directly off each row. Add those so the UI that's already
--    deployed actually has something to show.
alter table public.notifications add column if not exists message text;
alter table public.notifications add column if not exists link text;

-- 1) Make sure realtime is actually broadcasting these tables. (The chat
--    window already works live because `messages` was enabled earlier; this
--    just makes sure notifications/conversations are too, so the bell badge
--    and conversation list update without a page reload.)
do $$
begin
  begin
    alter publication supabase_realtime add table public.notifications;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.conversations;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.messages;
  exception when duplicate_object then null;
  end;
end $$;

-- 2) New message -> notify the OTHER participant (not the sender).
create or replace function public.notify_new_message()
returns trigger as $$
declare
  v_conv record;
  v_recipient uuid;
  v_sender_name text;
begin
  select participant_1_id, participant_2_id, listing_id into v_conv
  from public.conversations where id = new.conversation_id;

  if v_conv is null then
    return new;
  end if;

  v_recipient := case when v_conv.participant_1_id = new.sender_id
    then v_conv.participant_2_id else v_conv.participant_1_id end;

  select coalesce(name, 'Korisnik') into v_sender_name
  from public.profiles where id = new.sender_id;

  insert into public.notifications (user_id, type, title, message, link, body, data)
  values (
    v_recipient,
    'new_message',
    v_sender_name || ' ti je poslao/la poruku',
    left(new.content, 140),
    '/poruke?conv=' || new.conversation_id,
    left(new.content, 140),
    jsonb_build_object('conversation_id', new.conversation_id)
  );

  return new;
end;
$$ language plpgsql security definer set search_path = '';

drop trigger if exists trg_notify_new_message on public.messages;
create trigger trg_notify_new_message
  after insert on public.messages
  for each row execute procedure public.notify_new_message();

-- 3) A review may only be left about someone you've actually messaged with
--    (i.e. there's a conversation between reviewer and reviewee). This is
--    what "review after communication" means in practice here.
create or replace function public.enforce_review_requires_contact()
returns trigger as $$
declare
  v_exists boolean;
begin
  if new.reviewer_id = new.reviewee_id then
    raise exception 'Ne možeš oceniti sam/a sebe.';
  end if;

  select exists (
    select 1 from public.conversations
    where (participant_1_id = new.reviewer_id and participant_2_id = new.reviewee_id)
       or (participant_1_id = new.reviewee_id and participant_2_id = new.reviewer_id)
  ) into v_exists;

  if not v_exists then
    raise exception 'Možeš oceniti samo korisnika sa kojim si već razmenio/la poruke.';
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = '';

drop trigger if exists trg_enforce_review_requires_contact on public.reviews;
create trigger trg_enforce_review_requires_contact
  before insert on public.reviews
  for each row execute procedure public.enforce_review_requires_contact();

-- 4) New review -> notify the reviewee.
create or replace function public.notify_new_review()
returns trigger as $$
declare
  v_reviewer_name text;
begin
  select coalesce(name, 'Korisnik') into v_reviewer_name
  from public.profiles where id = new.reviewer_id;

  insert into public.notifications (user_id, type, title, message, link, body, data)
  values (
    new.reviewee_id,
    'new_review',
    v_reviewer_name || ' te je ocenio/la sa ' || new.rating || '/5',
    new.comment,
    '/profil/' || new.reviewee_id,
    new.comment,
    jsonb_build_object('reviewer_id', new.reviewer_id)
  );

  return new;
end;
$$ language plpgsql security definer set search_path = '';

drop trigger if exists trg_notify_new_review on public.reviews;
create trigger trg_notify_new_review
  after insert on public.reviews
  for each row execute procedure public.notify_new_review();

-- 5) Prevent spamming multiple reviews for the same person when no specific
--    listing is attached (the UI never sets listing_id today).
create unique index if not exists reviews_reviewer_reviewee_no_listing_uidx
  on public.reviews (reviewer_id, reviewee_id)
  where listing_id is null;
