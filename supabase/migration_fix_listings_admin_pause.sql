-- =============================================
-- Nastavak Kruga 9/14 (29.09.2026, Claude) — Pauziraj dugme na /admin/oglasi i
-- dalje baca 503 za TUĐE aktivne oglase, iako je migration_fix_listings_admin_rls.sql
-- vec pokrenut i SQL-proveren (funkcija i politike postoje, admin_fn_ok=true itd).
--
-- STVARNI uzrok (potvrđeno uživo u SQL Editoru, simulacijom admin sesije sa
-- begin/rollback, bez ikakve trajne izmene):
--   - Admin MOŽE da izmeni tuđi AKTIVAN oglas dok god ostaje aktivan (testirano:
--     update na description prolazi).
--   - Admin MOŽE da OBRIŠE (Obriši/DELETE) tuđi aktivan oglas (testirano: delete
--     prolazi) — DELETE dugme je zapravo VEĆ ISPRAVNO i ne treba mu ova migracija.
--   - Admin NE MOŽE da promeni status TUĐEG oglasa sa 'active' na bilo šta drugo
--     (npr. 'paused') — baš to radi dugme "Pauziraj". Greška je ista poruka kao
--     ranije: "new row violates row-level security policy for table listings".
--
-- Zašto: politika "Active listings viewable by all" (SELECT) glasi
--   (status = 'active' OR auth.uid() = user_id)
-- i NE zna za admina. Kad admin pauzira TUĐ oglas, redak posle izmene više nije
-- ni "active" ni u vlasništvu admina, pa taj redak ispadne nevidljiv za admina
-- po SELECT politici — a Postgres to tretira kao da je UPDATE proizveo redak
-- koji autor izmene sam ne bi smeo da vidi, i odbija celu izmenu (isto pravilo
-- kao WITH CHECK, iako je "Active listings viewable by all" samo SELECT
-- politika bez eksplicitnog WITH CHECK). Rešenje: dodati admina u OVU SELECT
-- politiku, isto kao što je već dodat u UPDATE/DELETE politike.
--
-- Pokreni OVO RUČNO u Supabase Dashboard -> SQL Editor (kao i sve ostalo —
-- agent ne sme sam da menja RLS na produkciji).
-- =============================================

begin;

drop policy if exists "Active listings viewable by all" on public.listings;
create policy "Active listings viewable by all"
  on public.listings
  for select
  using (
    status = 'active'
    or (select auth.uid()) = user_id
    or (select private.is_current_user_admin())
  );

commit;

-- Provera posle pokretanja (očekivano: qual sadrži "is_current_user_admin"):
-- select policyname, cmd, qual from pg_policies
-- where schemaname='public' and tablename='listings' and policyname ilike '%viewable%';
--
-- Provera da Pauziraj sada radi (simulacija admin sesije, bezbedno — sve u
-- transakciji koja se odmah vraća nazad, ne menja ništa trajno):
-- begin;
-- set local role authenticated;
-- set local "request.jwt.claims" = '{"sub": "82f063f3-897a-47d4-bab4-227704c7f891", "role": "authenticated"}';
-- update public.listings set status='paused' where title='ko radi ne boji se gladi!' returning id, status;
-- rollback;
-- (očekivano: 1 red vraćen, status='paused', BEZ greške)
