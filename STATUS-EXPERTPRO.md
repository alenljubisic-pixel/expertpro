# ExpertPro — zajednički status rada

> Ovaj fajl je obavezni kontekst za svakog agenta koji nastavlja rad (Codex, Claude ili drugi). Pre rada ga pročitaj, dopuni posle svake značajne izmene i ne upisuj tajne, API ključeve, lozinke ili korisničke podatke.

## Trenutno stanje

- Poslednje ažuriranje: 28.09.2026. (Claude, Cowork sesija)
- Produkcioni repo: `alenljubisic-pixel/expertpro`, grana `main`.
- Lokalni radni folder: `D:\Downloads\expertpro-code\expertpro`.
- Poslednji deploy commit: `c0cfdaf` — Vercel status **READY** (aliasovan na www.expertpro.app, expertpro.app).
- Produkcija: `https://www.expertpro.app`.
- Supabase projekat: ExpertPro (`fktbnoxokvbnkxfazqvu`).
- Search Console property: `sc-domain:expertpro.app` (DNS TXT verifikacija urađena i potvrđena u konzoli — **ne brisati** taj TXT zapis).

## Urađeno u ovoj sesiji (Claude, 28.09.2026)

**1) Fix naslova oglasa** (commit `74a33a7`) — uklonjen dupli "| ExpertPro" sufiks u title tag-u, potvrđeno live.

**2) Istaknut / Gold sistem promocije oglasa + ručno IPS/bankovno plaćanje** (commit `f35782e`) — kod live na Vercelu.

**3) Sistem kredita za Hitnu berzu** (commit `c0cfdaf`) — kod live na Vercelu.

⚠️ **NIJEDNA od dve SQL migracije (za #2 i #3) još nije pokrenuta u produkcionoj Supabase bazi, niti je admin uneo broj računa.** Korisnik je rekao "uradiću posle malo" — dok se to ne uradi, `/oglasi/[id]/istakni`, `/krediti` i `/admin/uplate` bacaju greške (tabele ne postoje), a hitni oglasi se ne mogu objaviti (trigger za kredite ne postoji pa insert ide bez provere/naplate — **ovo je bitno: dok se migracija ne pokrene, hitni oglasi se trenutno objavljuju BESPLATNO i bez provere kredita**, jer stari trigger ne postoji). Fajlovi su na disku u `D:\Downloads\expertpro-code\expertpro\supabase\` i već su poslati korisniku u chatu ranije u sesiji.

**Redosled pokretanja u Supabase SQL Editoru (obavezan, jer #3 koristi tabelu iz #2):**
1. `supabase/migration_listing_promotions.sql`
2. `supabase/migration_credits.sql`

Šta je izgrađeno za Istaknut/Gold (#2):
- `supabase/migration_listing_promotions.sql` — `listings.is_gold`, `listings.featured_until`, `listings.gold_until`; tabela `payment_settings` (singleton, bankovni podaci — čita svako ulogovano, menja samo admin); tabela `listing_promotions`; funkcije `admin_confirm_promotion`, `admin_reject_promotion`, `demote_expired_promotions` (pozvana iz `/api/cron/expire-listings`).
- `lib/promotions.ts` — cene: Istaknut 490/890/1490 RSD (7/15/30 dana), Gold 990/1790/2990 RSD — lako promenljivo, jedini izvor cena.
- `/oglasi/[id]/istakni` + `/oglasi/[id]/istakni/[orderId]` — izbor i uplata za vlasnika oglasa.
- `/admin/uplate` — bankovni podaci + lista porudžbina (Potvrdi/Odbij).
- `/oglasi`, `/oglasi/[id]`, `/dashboard/oglasi` — značke i sortiranje Gold/Istaknut.
- `/cenovnik` — sekcija sa cenama.

Šta je izgrađeno za kredite (#3):
- `supabase/migration_credits.sql` — `profiles.credit_balance`; tabela `credit_purchases`; funkcije `admin_confirm_credit_purchase`, `admin_reject_credit_purchase`; trigger `enforce_urgent_credits` (BEFORE INSERT na `listings` — blokira insert ako `type='urgent'` i `credit_balance < 1`, inače oduzima 1 kredit — jedino mesto gde se ovo proverava, pošto `/oglasi/novi` insertuje direktno iz browsera anon ključem); trigger `grant_subscription_credit_bonus` (AFTER UPDATE na `profiles`, `WHEN (old.subscription_tier IS DISTINCT FROM new.subscription_tier)` — dodeljuje 10 gratis kredita kad `subscription_tier` pređe sa `'free'` na bilo koji plaćeni nivo, npr. kad se odobri "Puno članstvo").
- `lib/credits.ts` — 1 kredit = 1 hitan oglas. Paketi (lako promenljivo, jedini izvor cena):
  - Fizička lica: 5 kredita/1000 RSD, 15/2500 RSD, 35/5000 RSD
  - Firma/Agencija: 5 kredita/2000 RSD, 15/5000 RSD, 40/12000 RSD
  - Gratis bonus: 10 kredita jednokratno pri prelasku na plaćeni nalog (broj je hardkodovan i u SQL trigeru i u `lib/credits.ts` kao dokumentacija — ako se menja, menjati na oba mesta).
- `/krediti` + `/krediti/[orderId]` — kupovina paketa (cene zavise od `profiles.type`: individual vs company/agency) i uplata, isti UI obrazac kao Istaknut/Gold.
- `/admin/uplate` — proširen sa drugom sekcijom "Kupovina kredita" (Potvrdi/Odbij), koristi iste bankovne podatke iz `payment_settings`.
- `/oglasi/novi` — kad je izabrano "Hitno", prikazuje trenutni saldo kredita i link ka `/krediti` ako je 0; klijentska provera je samo UX, stvarna naplata/blokada je u DB trigeru.
- `/cenovnik` — ažurirana sekcija "Hitna berza" sa stvarnim paketima i cenama (uklonjen tekst "sistem kredita je u pripremi").
- Live provereno: `/cenovnik` prikazuje pakete kredita ispravno.

## Preostalo — sledeći agent (redosled po prioritetu)

1. **HITNO — pokrenuti obe SQL migracije** u tačno ovom redosledu (Supabase Dashboard → SQL Editor): `migration_listing_promotions.sql` pa `migration_credits.sql`. Dok se ne pokrenu: Istaknut/Gold i krediti ne rade (greške), a hitni oglasi se trenutno objavljuju bez ikakve provere/naplate kredita.
2. **HITNO — uneti broj računa** na `/admin/uplate` (koristi se i za Istaknut/Gold i za kredite, ista tabela `payment_settings`).
3. Nakon 1+2, uraditi bar jedan ručni test svakog toka:
   - Istaknut/Gold: kreirati porudžbinu → `/istakni/[orderId]` → "Poslao/la sam uplatu" → admin Potvrdi na `/admin/uplate` → proveriti značku i `featured_until`/`gold_until`.
   - Krediti: kupiti paket na `/krediti` → uplata → admin Potvrdi → proveriti da `profiles.credit_balance` poraste → objaviti hitan oglas i proveriti da se 1 kredit oduzme → proveriti da insert baca grešku kad je `credit_balance = 0`.
   - Gratis bonus: ručno promeniti `subscription_tier` neke firme sa 'free' na npr. 'pro' u SQL editoru i proveriti da `credit_balance` poraste za 10.
4. **GSC fetch status** — ponovo proveriti da li sitemap ima "discovered pages" > 0. Ne dirati DNS TXT zapis.
5. **Cron `expire_old_listings()` security** — i dalje SECURITY DEFINER sa javnim EXECUTE. Plan: server-only `SUPABASE_SERVICE_ROLE_KEY` u Vercelu ili bezbedan server/Edge job, zatim `search_path = ''` + revoke za `anon`/`authenticated`.
6. **Autentifikovani E2E test** ostatka platforme (prijava, novi oglas, izmena/pauza/obnova/brisanje, prijava na oglas, poruke, admin accept/reject) — nije rađeno sa pravim nalogom.
7. **Lint upozorenja** — preostala (uglavnom `any`, neiskorišćeni importi), rešavati postepeno.
8. **Sledeće veće funkcionalnosti** (dogovoreno, još nije rađeno):
   - Facebook OAuth fix — pogrešan Google Client ID u Facebook provider slotu u Supabase dashboardu; zahteva ručnu akciju korisnika.
   - Email notifikacije — ne postoji nikakva integracija.
   - Apple login — odluka korisnika (preporuka: nije neophodan za launch).

## Komande za proveru

```text
npm ci
npm run lint
npm run build
npm audit --audit-level=high
```

Za build lokalno su potrebni `NEXT_PUBLIC_SUPABASE_URL` i `NEXT_PUBLIC_SUPABASE_ANON_KEY`; vrednosti se nikad ne upisuju u ovaj fajl.

## Pravila kontinuiteta

- Pre izmena pročitati ovaj fajl, `AGENTS.md`, `CLAUDE.md` i `PLAN-EXPERTPRO.md`.
- Raditi u originalnom folderu iznad; privremene klonove koristiti samo za poređenje.
- Čuvati postojeće korisničke izmene i ne otkrivati tajne.
- Posle izmene dopuniti ovaj fajl datumom, commitom, testovima i jasnim preostalim koracima.
