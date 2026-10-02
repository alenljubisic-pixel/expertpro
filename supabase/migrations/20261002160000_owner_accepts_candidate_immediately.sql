-- A candidate's application already expresses consent. For request/urgent
-- listings, the owner's acceptance is the final assignment decision.
begin;

create or replace function public.select_application_candidate(p_application_id uuid)
returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_listing_id uuid;
  v_listing record;
  v_application record;
  v_rejected record;
begin
  select listing_id into v_listing_id
  from public.applications where id = p_application_id;
  if v_listing_id is null then
    raise exception 'Prijava ne postoji.';
  end if;

  -- Serialize competing owner clicks on the listing before locking an
  -- application; exactly one request candidate can win.
  select id, user_id, title, type, status into v_listing
  from public.listings where id = v_listing_id for update;
  if v_listing.user_id is distinct from auth.uid() or auth.uid() is null then
    raise exception 'Samo vlasnik oglasa može da prihvati kandidata.';
  end if;
  if v_listing.type not in ('request', 'urgent') then
    raise exception 'Ovaj tok važi samo za zahteve i hitne oglase.';
  end if;
  if v_listing.status <> 'active' then
    raise exception 'Oglas više nije aktivan.';
  end if;

  select id, applicant_id, status into v_application
  from public.applications
  where id = p_application_id and listing_id = v_listing_id
  for update;
  if v_application.id is null or v_application.status <> 'pending' then
    raise exception 'Ova prijava više nije na čekanju.';
  end if;

  update public.applications
  set status = 'accepted', selected_at = now()
  where id = p_application_id;
  update public.listings set status = 'filled' where id = v_listing_id;

  insert into public.notifications (user_id, type, title, message, link, body, data)
  values (
    v_application.applicant_id, 'application_accepted',
    'Prihvaćen/a si za oglas: ' || v_listing.title,
    'Vlasnik oglasa je prihvatio tvoju prijavu. Posao je dodeljen i razgovor je otvoren.',
    '/oglasi/' || v_listing_id,
    'Posao je dodeljen i razgovor je otvoren.',
    jsonb_build_object('listing_id', v_listing_id, 'application_id', p_application_id)
  );

  for v_rejected in
    update public.applications
    set status = 'rejected'
    where listing_id = v_listing_id
      and id <> p_application_id
      and status in ('pending', 'selected')
    returning applicant_id
  loop
    insert into public.notifications (user_id, type, title, message, link, body, data)
    values (
      v_rejected.applicant_id, 'application_rejected',
      'Izabran je drugi kandidat za oglas: ' || v_listing.title,
      'Nažalost, vlasnik oglasa je izabrao drugog kandidata.',
      '/oglasi/' || v_listing_id,
      null,
      jsonb_build_object('listing_id', v_listing_id)
    );
  end loop;
end;
$$;

revoke all on function public.select_application_candidate(uuid) from public, anon, authenticated;
grant execute on function public.select_application_candidate(uuid) to authenticated;

-- The old second-confirmation and pre-confirmation reversal endpoints are
-- intentionally no longer callable by users. Historical rows are preserved.
revoke all on function public.confirm_application(uuid) from public, anon, authenticated;
revoke all on function public.decline_application(uuid) from public, anon, authenticated;
revoke all on function public.unselect_application_candidate(uuid) from public, anon, authenticated;

commit;
