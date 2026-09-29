-- =============================================
-- FIX: /admin/oglasi Pauziraj/Obriši i dalje bacaju grešku
-- "new row violates row-level security policy for table listings" (42501)
-- iako "Admins can update any listing" / "Admins can delete any listing"
-- politike postoje i pojedinačno tačno prepoznaju admina.
--
-- Šta smo utvrdili uživo u SQL Editoru (29.09.2026):
--   - auth.uid() i EXISTS(select ... profiles ... is_admin=true) se tačno
--     evaluiraju kao TRUE u istoj sesiji/transakciji gde se UPDATE izvršava
--     (potvrđeno preko privremenog debug triggera).
--   - Čak i kada je konfliktna politika "Users can update own listings"
--     privremeno obrisana (test, pa rollback), i čak i kada je admin
--     politici dodat EKSPLICITAN with check identičan using izrazu,
--     UPDATE i dalje baca istu 42501 grešku.
--   - Nema drugih triggera, nema particija, nema duplikata tabele.
--
-- Zaključak: EXISTS podupit koji unutar RLS politike na "listings" čita
-- "profiles" (koja i sama ima RLS) se ne ponaša pouzdano kad se evaluira
-- kao deo WITH CHECK provere za drugu tabelu. Ovo je poznat Supabase
-- "gotcha" — standardno rešenje je da se provera admina izdvoji u
-- SECURITY DEFINER funkciju (ista tehnika koja se već koristi u
-- migration_admin_security_v2.sql za "profiles" tabelu), koja zaobilazi
-- RLS na profiles i vraća čist boolean, umesto da se EXISTS podupit
-- direktno ugrađuje u politiku druge tabele.
--
-- Pokreni OVO RUČNO u Supabase Dashboard -> SQL Editor.
-- =============================================

begin;

-- 1) Pomoćna funkcija: da li je TRENUTNI korisnik (auth.uid()) admin.
--    Držimo je u neizloženoj "private" šemi, sa praznim search_path-om i
--    potpuno kvalifikovanim imenima. Funkcija zaobilazi RLS samo da pročita
--    admin flag trenutnog korisnika; ne prima user id od klijenta.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.is_current_user_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and is_admin = true
  );
$$;

revoke all on function private.is_current_user_admin() from public, anon, authenticated;
grant execute on function private.is_current_user_admin() to authenticated;

-- 2) Zameni politike na "listings" da koriste ovu funkciju umesto
--    inline EXISTS podupita, i dodaj EKSPLICITAN with check (ne oslanjaj
--    se na implicitni default).
drop policy if exists "Admins can update any listing" on public.listings;
create policy "Admins can update any listing"
  on public.listings
  for update
  to authenticated
  using ((select private.is_current_user_admin()))
  with check ((select private.is_current_user_admin()));

drop policy if exists "Admins can delete any listing" on public.listings;
create policy "Admins can delete any listing"
  on public.listings
  for delete
  to authenticated
  using ((select private.is_current_user_admin()));

-- 3) Isto uradi i za "profiles" admin update politiku, radi doslednosti
--    (koristi istu funkciju umesto duplikata EXISTS podupita).
drop policy if exists "Admins can update any profile" on public.profiles;
create policy "Admins can update any profile"
  on public.profiles
  for update
  to authenticated
  using ((select private.is_current_user_admin()))
  with check ((select private.is_current_user_admin()));

commit;

-- Provera posle pokretanja (očekuje se da se pojave update+delete politike
-- na listings i update na profiles, sve sa "is_current_user_admin" u qual):
-- select tablename, policyname, cmd, qual, with_check
-- from pg_policies where policyname like 'Admins can%';
