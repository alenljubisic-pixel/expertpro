-- =============================================
-- "Izbor jednog ponuđača" — tok dodele posla (Krug 16, 29.09.2026, Claude)
--
-- Implementira PLAN-EXPERTPRO.md Sekcija 14.1 (Alenove finalne odluke):
--   1. Vlasnik oglasa bira JEDNOG kandidata ("Prihvati") -> prijava ide u
--      status 'selected' (NE odmah 'accepted'). Ostale prijave NISU dirnute.
--   2. Izabrani kandidat MORA da potvrdi u aplikaciji -> tek tada status
--      postaje 'accepted', oglas postaje 'filled', i TEK TADA se sve ostale
--      prijave na taj oglas automatski odbijaju (status 'rejected') +
--      dobijaju notifikaciju.
--   3. Ako izabrani kandidat odustane (status 'declined') PRE potvrde, ili
--      vlasnik promeni mišljenje ("Poništi izbor"), prijava se vraća na
--      'pending' — ništa nije "potrošeno", ostale prijave su netaknute cело
--      vreme, vlasnik odmah može izabrati drugog.
--   4. Chat se zaključava za sve OSIM izabranog kandidata ČIM vlasnik izabere
--      nekog ("Prihvati" -> status 'selected' ili kasnije 'accepted') — ne
--      čeka se potvrda kandidata za OVO (postojeći razgovor ostaje čitljiv
--      kao istorija, samo se dalje pisanje zaključava za sve ostale).
--   5. Prijava MORA imati tekstualnu poruku (više nije opciono) — vlasnik
--      oglasa treba da vidi zašto se neko javlja, ne samo prazno dugme.
--
-- NE naplaćuje se ništa nikome (Sekcija 14.2 — obostrana naplata eksplicitno
-- odbijena). NE dira se rating/ocene sistem u ovoj migraciji (ostaje za
-- kasnije, videti STATUS-EXPERTPRO.md).
--
-- Sve promene su ADITIVNE (novi status vrednosti, nove funkcije/trigeri,
-- proširena notifications.type provera, dodatak u messages INSERT politiku)
-- — ništa postojeće se ne briše niti menja ponašanje van opisanog toka.
--
-- NAPOMENA o redosledu: ova migracija PONOVO definiše politiku
-- "Active listings viewable by all" na listings i uključuje u nju i admin
-- proveru iz migration_fix_listings_admin_pause.sql i novi uslov za
-- kandidata. Nije bitno da li je ta migracija već pokrenuta ili ne — obe su
-- idempotentne (drop+create iste politike), krajnji rezultat je isti. Ako
-- ideš redom, svejedno je koju prvo pokreneš.
--
-- Pokreni OVO RUČNO u Supabase Dashboard -> SQL Editor.
-- =============================================

begin;

-- 1) Prošireni statusi za applications: dodati 'selected' (vlasnik izabrao,
--    čeka potvrdu kandidata) i 'declined' (kandidat odustao PRE potvrde,
--    različito od 'rejected' koje sad znači "izgubio jer je neko drugi
--    potvrđen" ili "vlasnik odbio ranije").
do $$
declare
  v_conname text;
begin
  select conname into v_conname
  from pg_constraint
  where conrelid = 'public.applications'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%status%pending%';

  if v_conname is not null then
    execute format('alter table public.applications drop constraint %I', v_conname);
  end if;

  alter table public.applications
    add constraint applications_status_check
    check (status in ('pending', 'selected', 'accepted', 'rejected', 'withdrawn', 'declined'));
end $$;

-- Samo JEDNA prijava po oglasu sme biti 'selected' u isto vreme.
create unique index if not exists applications_one_selected_per_listing_uidx
  on public.applications (listing_id)
  where status = 'selected';

alter table public.applications add column if not exists selected_at timestamptz;
alter table public.applications add column if not exists confirmed_at timestamptz;

-- Poruka uz prijavu više nije opciona (vlasnik treba da vidi zašto se neko
-- javlja). NOT VALID = važi za SVE NOVE prijave odmah, ali ne ruši postojeće
-- redove koji su nastali dok je polje bilo opciono.
alter table public.applications drop constraint if exists applications_message_required;
alter table public.applications
  add constraint applications_message_required
  check (message is not null and length(trim(message)) > 0) not valid;

-- 2) Proširi notifications.type da pokrije nove korake u toku.
do $$
declare
  v_conname text;
begin
  select conname into v_conname
  from pg_constraint
  where conrelid = 'public.notifications'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%type%new_application%';

  if v_conname is not null then
    execute format('alter table public.notifications drop constraint %I', v_conname);
  end if;

  alter table public.notifications
    add constraint notifications_type_check
    check (type in (
      'new_application', 'application_accepted', 'application_rejected',
      'application_selected', 'application_confirmed', 'application_declined',
      'new_message', 'new_review', 'listing_expired', 'account_approved',
      'urgent_nearby'
    ));
end $$;

-- 3) Notifikacija vlasniku oglasa kad neko pošalje prijavu (do sada NIJE
--    postojala nijedna notifikacija za ovo, iako je UI/tip odavno spreman).
create or replace function public.notify_new_application()
returns trigger as $$
declare
  v_listing record;
  v_applicant_name text;
begin
  select id, title, user_id into v_listing from public.listings where id = new.listing_id;
  if v_listing is null or v_listing.user_id = new.applicant_id then
    return new;
  end if;

  select coalesce(name, 'Korisnik') into v_applicant_name
  from public.profiles where id = new.applicant_id;

  insert into public.notifications (user_id, type, title, message, link, body, data)
  values (
    v_listing.user_id,
    'new_application',
    v_applicant_name || ' se prijavio/la na tvoj oglas',
    left(coalesce(new.message, ''), 140),
    '/oglasi/' || v_listing.id,
    left(coalesce(new.message, ''), 140),
    jsonb_build_object('listing_id', v_listing.id, 'application_id', new.id)
  );

  return new;
end;
$$ language plpgsql security definer set search_path = '';

drop trigger if exists trg_notify_new_application on public.applications;
create trigger trg_notify_new_application
  after insert on public.applications
  for each row execute procedure public.notify_new_application();

-- 4) Vlasnik BIRA kandidata (status pending -> selected). Atomski: skida
--    prethodni izbor (ako postoji) nazad na 'pending' i bira novog. Nikog ne
--    odbija. SECURITY DEFINER jer dira tuđe redove (druge prijave) van
--    dozvola pozivaoca — zato interno proverava da je pozivalac stvarno
--    vlasnik oglasa.
create or replace function public.select_application_candidate(p_application_id uuid)
returns void as $$
declare
  v_app record;
  v_prev record;
begin
  select a.id, a.listing_id, a.applicant_id, a.status, l.user_id as owner_id, l.title as listing_title
  into v_app
  from public.applications a
  join public.listings l on l.id = a.listing_id
  where a.id = p_application_id
  for update;

  if v_app is null then
    raise exception 'Prijava ne postoji.';
  end if;

  if v_app.owner_id <> auth.uid() then
    raise exception 'Samo vlasnik oglasa može da bira kandidata.';
  end if;

  if v_app.status <> 'pending' then
    raise exception 'Ova prijava više nije na čekanju.';
  end if;

  -- Ako je već neko izabran za ovaj oglas, vrati ga na 'pending' (nije
  -- odbijen, samo se vlasnik predomislio pre potvrde).
  select id, applicant_id into v_prev
  from public.applications
  where listing_id = v_app.listing_id and status = 'selected'
  for update;

  if v_prev is not null then
    update public.applications set status = 'pending', selected_at = null where id = v_prev.id;
  end if;

  update public.applications
  set status = 'selected', selected_at = now()
  where id = p_application_id;

  insert into public.notifications (user_id, type, title, message, link, body, data)
  values (
    v_app.applicant_id,
    'application_selected',
    'Izabran/a si za oglas: ' || v_app.listing_title,
    'Vlasnik oglasa te je izabrao/la. Potvrdi angažman u aplikaciji da bi oglas bio dodeljen.',
    '/oglasi/' || v_app.listing_id,
    'Potvrdi angažman u aplikaciji.',
    jsonb_build_object('listing_id', v_app.listing_id, 'application_id', p_application_id)
  );
end;
$$ language plpgsql security definer set search_path = '';

grant execute on function public.select_application_candidate(uuid) to authenticated;

-- 5) Vlasnik PONIŠTAVA izbor pre potvrde kandidata (selected -> pending).
create or replace function public.unselect_application_candidate(p_application_id uuid)
returns void as $$
declare
  v_app record;
begin
  select a.id, a.listing_id, a.applicant_id, a.status, l.user_id as owner_id
  into v_app
  from public.applications a
  join public.listings l on l.id = a.listing_id
  where a.id = p_application_id
  for update;

  if v_app is null then
    raise exception 'Prijava ne postoji.';
  end if;

  if v_app.owner_id <> auth.uid() then
    raise exception 'Samo vlasnik oglasa može da poništi izbor.';
  end if;

  if v_app.status <> 'selected' then
    raise exception 'Ova prijava nije trenutno izabrana.';
  end if;

  update public.applications set status = 'pending', selected_at = null where id = p_application_id;
end;
$$ language plpgsql security definer set search_path = '';

grant execute on function public.unselect_application_candidate(uuid) to authenticated;

-- 6) Kandidat POTVRĐUJE angažman (selected -> accepted). Ovo je trenutak
--    kad oglas postaje 'filled' i SVE ostale prijave se tek sada odbijaju.
create or replace function public.confirm_application(p_application_id uuid)
returns void as $$
declare
  v_app record;
  v_owner_name text;
  v_loser record;
begin
  select a.id, a.listing_id, a.applicant_id, a.status, l.user_id as owner_id, l.title as listing_title
  into v_app
  from public.applications a
  join public.listings l on l.id = a.listing_id
  where a.id = p_application_id
  for update;

  if v_app is null then
    raise exception 'Prijava ne postoji.';
  end if;

  if v_app.applicant_id <> auth.uid() then
    raise exception 'Samo kandidat može da potvrdi sopstvenu prijavu.';
  end if;

  if v_app.status <> 'selected' then
    raise exception 'Ova prijava nije spremna za potvrdu.';
  end if;

  update public.applications
  set status = 'accepted', confirmed_at = now()
  where id = p_application_id;

  update public.listings set status = 'filled' where id = v_app.listing_id;

  select coalesce(name, 'Korisnik') into v_owner_name
  from public.profiles where id = v_app.owner_id;

  insert into public.notifications (user_id, type, title, message, link, body, data)
  values (
    v_app.owner_id,
    'application_confirmed',
    'Angažman potvrđen za oglas: ' || v_app.listing_title,
    'Kandidat je potvrdio angažman. Oglas je sada popunjen.',
    '/oglasi/' || v_app.listing_id,
    null,
    jsonb_build_object('listing_id', v_app.listing_id, 'application_id', p_application_id)
  );

  -- Svi ostali (pending ili ranije izabrani pa vraćeni) tek SADA otpadaju.
  for v_loser in
    select id, applicant_id from public.applications
    where listing_id = v_app.listing_id
      and id <> p_application_id
      and status in ('pending', 'selected')
  loop
    update public.applications set status = 'rejected' where id = v_loser.id;

    insert into public.notifications (user_id, type, title, message, link, body, data)
    values (
      v_loser.applicant_id,
      'application_rejected',
      'Izabran je drugi kandidat za oglas: ' || v_app.listing_title,
      'Nažalost, vlasnik oglasa je izabrao drugog kandidata.',
      '/oglasi/' || v_app.listing_id,
      null,
      jsonb_build_object('listing_id', v_app.listing_id)
    );
  end loop;
end;
$$ language plpgsql security definer set search_path = '';

grant execute on function public.confirm_application(uuid) to authenticated;

-- 7) Kandidat ODUSTAJE pre potvrde (selected -> declined). Ostale prijave
--    ostaju netaknute (i dalje 'pending'), vlasnik odmah može izabrati
--    drugog.
create or replace function public.decline_application(p_application_id uuid)
returns void as $$
declare
  v_app record;
  v_applicant_name text;
begin
  select a.id, a.listing_id, a.applicant_id, a.status, l.user_id as owner_id, l.title as listing_title
  into v_app
  from public.applications a
  join public.listings l on l.id = a.listing_id
  where a.id = p_application_id
  for update;

  if v_app is null then
    raise exception 'Prijava ne postoji.';
  end if;

  if v_app.applicant_id <> auth.uid() then
    raise exception 'Samo kandidat može da odustane od sopstvene prijave.';
  end if;

  if v_app.status <> 'selected' then
    raise exception 'Ova prijava nije trenutno izabrana.';
  end if;

  update public.applications set status = 'declined', selected_at = null where id = p_application_id;

  select coalesce(name, 'Korisnik') into v_applicant_name
  from public.profiles where id = v_app.applicant_id;

  insert into public.notifications (user_id, type, title, message, link, body, data)
  values (
    v_app.owner_id,
    'application_declined',
    v_applicant_name || ' je odustao/la — oglas: ' || v_app.listing_title,
    'Možeš izabrati drugog kandidata sa liste prijava.',
    '/oglasi/' || v_app.listing_id,
    null,
    jsonb_build_object('listing_id', v_app.listing_id, 'application_id', p_application_id)
  );
end;
$$ language plpgsql security definer set search_path = '';

grant execute on function public.decline_application(uuid) to authenticated;

-- 8) Zaključavanje chata ČIM vlasnik izabere nekog kandidata (status
--    'selected' ili 'accepted') — ne čeka se potvrda. Nove poruke u toj
--    konkretnoj konverzaciji sme da šalje SAMO vlasnik oglasa ili trenutno
--    izabrani/pobednički kandidat. Razgovori BEZ listing_id (opšte poruke)
--    ovim se uopšte ne diraju. Postojeća istorija ostaje vidljiva (ovo je
--    INSERT politika, ne SELECT).
drop policy if exists "Send messages in own conversations" on public.messages;
create policy "Send messages in own conversations" on public.messages for insert with check (
  (select auth.uid()) = sender_id and
  (select auth.uid()) in (
    select participant_1_id from public.conversations where id = conversation_id
    union
    select participant_2_id from public.conversations where id = conversation_id
  )
  and (
    not exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and c.listing_id is not null
        and exists (
          select 1 from public.applications a
          where a.listing_id = c.listing_id and a.status in ('selected', 'accepted')
        )
    )
    or exists (
      select 1 from public.conversations c
      join public.listings l on l.id = c.listing_id
      where c.id = conversation_id
        and (
          (select auth.uid()) = l.user_id
          or exists (
            select 1 from public.applications a
            where a.listing_id = l.id
              and a.applicant_id = (select auth.uid())
              and a.status in ('selected', 'accepted')
          )
        )
    )
  )
);

-- 9) Pobednički kandidat mora i dalje moći da VIDI oglas na /oglasi/[id]
--    posle "filled" (inače dobija 404 čim oglas više nije 'active') — isti
--    princip kao ranije za admina (migration_fix_listings_admin_pause.sql).
--    Svako ko ima BILO KOJU prijavu na oglas i dalje može da ga vidi (istorija).
drop policy if exists "Active listings viewable by all" on public.listings;
create policy "Active listings viewable by all"
  on public.listings
  for select
  using (
    status = 'active'
    or (select auth.uid()) = user_id
    or (select private.is_current_user_admin())
    or exists (
      select 1 from public.applications a
      where a.listing_id = listings.id and a.applicant_id = (select auth.uid())
    )
  );

commit;

-- Provera posle pokretanja:
-- select conname, pg_get_constraintdef(oid) from pg_constraint where conrelid='public.applications'::regclass and contype='c';
-- select conname, pg_get_constraintdef(oid) from pg_constraint where conrelid='public.notifications'::regclass and contype='c';
-- select proname from pg_proc where proname in ('select_application_candidate','unselect_application_candidate','confirm_application','decline_application','notify_new_application');
-- select policyname, cmd from pg_policies where tablename in ('messages','listings') order by tablename, policyname;
