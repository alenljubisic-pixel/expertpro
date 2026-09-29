-- Direct messages only after the candidate confirms a specific request/urgent job.
-- Old conversations/messages stay readable, but cannot be used to bypass this rule.
create or replace function private.is_confirmed_chat_pair(
  p_listing_id uuid, p_first uuid, p_second uuid
) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.listings l
    join public.applications a on a.listing_id = l.id
    where l.id = p_listing_id
      and l.type in ('request', 'urgent')
      and a.status = 'accepted'
      and ((l.user_id = p_first and a.applicant_id = p_second)
        or (l.user_id = p_second and a.applicant_id = p_first))
  );
$$;
revoke all on function private.is_confirmed_chat_pair(uuid,uuid,uuid) from public, anon;
grant execute on function private.is_confirmed_chat_pair(uuid,uuid,uuid) to authenticated;

create or replace function private.can_send_in_conversation(p_conversation_id uuid, p_sender_id uuid)
returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.conversations c
    where c.id = p_conversation_id
      and p_sender_id in (c.participant_1_id, c.participant_2_id)
      and private.is_confirmed_chat_pair(c.listing_id, c.participant_1_id, c.participant_2_id)
  );
$$;
revoke all on function private.can_send_in_conversation(uuid,uuid) from public, anon;
grant execute on function private.can_send_in_conversation(uuid,uuid) to authenticated;

drop policy if exists "Create conversations" on public.conversations;
create policy "Create conversations" on public.conversations for insert to authenticated
with check (
  (select auth.uid()) in (participant_1_id, participant_2_id)
  and participant_1_id <> participant_2_id
  and private.is_confirmed_chat_pair(listing_id, participant_1_id, participant_2_id)
);

drop policy if exists "Send messages in own conversations" on public.messages;
create policy "Send messages in own conversations" on public.messages for insert to authenticated
with check (
  (select auth.uid()) = sender_id
  and private.can_send_in_conversation(conversation_id, sender_id)
);

-- A participant may only maintain the preview, never swap the peer or listing.
revoke update on public.conversations from authenticated;
grant update (last_message_at, last_message_preview) on public.conversations to authenticated;
drop policy if exists "Update own conversations" on public.conversations;
create policy "Update own conversations" on public.conversations for update to authenticated
using (
  (select auth.uid()) in (participant_1_id, participant_2_id)
  and private.is_confirmed_chat_pair(listing_id, participant_1_id, participant_2_id)
)
with check (
  (select auth.uid()) in (participant_1_id, participant_2_id)
  and private.is_confirmed_chat_pair(listing_id, participant_1_id, participant_2_id)
);

-- Clients cannot forge selected/accepted/rejected application states. The
-- existing SECURITY DEFINER selection/confirmation RPCs keep working.
revoke update on public.applications from authenticated;

create or replace function public.reject_application(p_application_id uuid)
returns void
language plpgsql security definer set search_path = '' as $$
declare v_owner uuid;
begin
  select l.user_id into v_owner
  from public.applications a join public.listings l on l.id = a.listing_id
  where a.id = p_application_id and a.status = 'pending'
  for update of a;
  if v_owner is null or v_owner <> auth.uid() then
    raise exception 'Samo vlasnik može odbiti prijavu na čekanju.';
  end if;
  update public.applications set status = 'rejected' where id = p_application_id;
end;
$$;
revoke all on function public.reject_application(uuid) from public, anon;
grant execute on function public.reject_application(uuid) to authenticated;

-- A client may create only a fresh pending application with a real message.
drop policy if exists "Create applications" on public.applications;
create policy "Create applications" on public.applications for insert to authenticated
with check (
  (select auth.uid()) = applicant_id and status = 'pending'
  and length(trim(message)) > 0
  and exists (select 1 from public.listings l
    where l.id = listing_id and l.status = 'active' and l.user_id <> (select auth.uid()))
);
