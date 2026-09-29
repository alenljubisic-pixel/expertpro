-- A service offer can accept multiple different clients. The client's
-- application is the first consent; the service provider accepts it.
-- Unlike request/urgent selection this does not fill the listing or reject
-- other applications.
begin;

create or replace function public.accept_offer_application(p_application_id uuid)
returns void
language plpgsql security definer set search_path = '' as $$
declare v_app record;
begin
  select a.id, a.applicant_id, a.status, a.listing_id,
         l.user_id as owner_id, l.type, l.status as listing_status, l.title
  into v_app
  from public.applications a
  join public.listings l on l.id = a.listing_id
  where a.id = p_application_id
  for update of a;

  if v_app is null or auth.uid() is null or v_app.owner_id <> auth.uid() then
    raise exception 'Samo vlasnik oglasa može prihvatiti prijavu.';
  end if;
  if v_app.type <> 'offer' or v_app.listing_status <> 'active'
     or v_app.status <> 'pending' then
    raise exception 'Ova prijava nije dostupna za prihvatanje.';
  end if;

  update public.applications
    set status = 'accepted', confirmed_at = now()
    where id = v_app.id;
  insert into public.notifications (user_id, type, title, message, link, body, data)
  values (
    v_app.applicant_id, 'application_accepted',
    'Prihvaćen je tvoj upit: ' || v_app.title,
    'Majstor je prihvatio tvoj upit. Razgovor je sada otvoren za ovaj angažman.',
    '/oglasi/' || v_app.listing_id,
    'Razgovor je otvoren za ovaj angažman.',
    jsonb_build_object('listing_id', v_app.listing_id, 'application_id', v_app.id)
  );
end;
$$;
revoke all on function public.accept_offer_application(uuid) from public, anon;
grant execute on function public.accept_offer_application(uuid) to authenticated;

-- One accepted application per pair and listing is enough to open its
-- conversation. For offers, several such pairs can coexist independently.
create or replace function private.is_confirmed_chat_pair(
  p_listing_id uuid, p_first uuid, p_second uuid
) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.listings l
    join public.applications a on a.listing_id = l.id
    where l.id = p_listing_id
      and l.type in ('request', 'urgent', 'offer')
      and a.status = 'accepted'
      and a.owner_finished_at is null and a.applicant_finished_at is null
      and ((l.user_id = p_first and a.applicant_id = p_second)
        or (l.user_id = p_second and a.applicant_id = p_first))
  );
$$;
revoke all on function private.is_confirmed_chat_pair(uuid,uuid,uuid) from public, anon;
grant execute on function private.is_confirmed_chat_pair(uuid,uuid,uuid) to authenticated;

-- A hidden review stays invisible to the public, but its author must still
-- be able to see that they already reviewed this job (and cannot resubmit).
create policy "Reviewer sees own moderated reviews"
  on public.reviews for select to authenticated
  using ((select auth.uid()) = reviewer_id);

commit;
