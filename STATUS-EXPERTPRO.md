# ExpertPro — zajednički status rada

> Ovaj fajl je obavezni kontekst za svakog agenta koji nastavlja rad (Codex, Claude ili drugi). Pre rada ga pročitaj, dopuni posle svake značajne izmene i ne upisuj tajne, API ključeve, lozinke ili korisničke podatke.

## Trenutno stanje

- Poslednje ažuriranje: 28.09.2026. (Claude, Cowork sesija)
- Produkcioni repo: `alenljubisic-pixel/expertpro`, grana `main`.
- Lokalni radni folder: `D:\Downloads\expertpro-code\expertpro`.
- Poslednji deploy commit: `f35782e` — Vercel status **READY** (aliasovan na www.expertpro.app, expertpro.app).
- Produkcija: `https://www.expertpro.app`.
- Supabase projekat: ExpertPro (`fktbnoxokvbnkxfazqvu`).
- Search Console property: `sc-domain:expertpro.app` (DNS TXT verifikacija urađena i potvrđena u konzoli — **ne brisati** taj TXT zapis).

## Urađeno u ovoj sesiji (Claude, 28.09.2026)

**1) Fix naslova oglasa** (commit `74a33a7`) — uklonjen dupli "| ExpertPro" sufiks u title tag-u, potvrđeno live.

**2) Istaknut / Gold sistem promocije oglasa + ručno IPS/bankovno plaćanje** (commit `f35782e`) — kompletno nov feature, kod je live na Vercelu, ali **SQL migracija JOŠ NIJE pokrenuta u produkcionoj Supabase bazi** i **admin još nije uneo broj računa** — sistem ne radi za korisnike dok se ta dva koraka ne završe (videti "Preostalo" ispod, tačka 1 i 2 — hitno).

Šta je izgrađeno:
- `supabase/migration_listing_promotions.sql` — dodaje `listings.is_gold`, `listings.featured_until`, `listings.gold_until`; novu tabelu `payment_settings` (singleton red sa bankovnim podacima, čita svako ulogovano, menja samo admin); novu tabelu `listing_promotions` (porudžbine); SECURITY DEFINER funkcije `admin_confirm_promotion`, `admin_reject_promotion`, `demote_expired_promotions` (poslednja pozvana iz `/api/cron/expire-listings` — dodato u taj route).
- `lib/promotions.ts` — cenovnik (Istaknut: 490/890/1490 RSD za 7/15/30 dana; Gold: 990/1790/2990 RSD za 7/15/30 dana — **moje podrazumevane cene, lako promenljive u ovom fajlu**, nema ih nigde drugde hardkodovano) + generator referentnog koda za uplatu.
- `/oglasi/[id]/istakni` — korisnik (vlasnik oglasa) bira Istaknut ili Gold + trajanje.
- `/oglasi/[id]/istakni/[orderId]` — stranica sa instrukcijama za uplatu (broj računa iz `payment_settings`, iznos, poziv na broj), dugme "Poslao/la sam uplatu".
- `/admin/uplate` — admin panel: gornji deo za unos/izmenu bankovnih podataka (bank_name, account_holder, account_number, napomena); donji deo lista porudžbina sa filterima (Na čekanju / Potvrđene / Odbijene / Sve) i dugmićima Potvrdi/Odbij. Dodat tab "Uplate" u glavni `/admin` meni + brojač na čekanju na overview stranici.
- `/oglasi` — sortiranje: Gold prvo, pa Istaknut, pa po datumu; zlatna/plava značka na karticama.
- `/oglasi/[id]` — značka Gold/Istaknut pored naslova; dugme "🏆 Istakni oglas" za vlasnika.
- `/dashboard/oglasi` — značka sa datumom isteka promocije + ikonica krune za brz pristup `/istakni`.
- `/cenovnik` — nova sekcija "Istakni oglas" sa cenama iz `lib/promotions.ts` (jedan izvor istine); ažurirane stavke u tabeli planova da odražavaju da je promocija dostupna svima kao jednokratna uplata.
- Live provereno: `/cenovnik` prikazuje sekciju i cene ispravno.

## Preostalo — sledeći agent (redosled po prioritetu)

1. **HITNO — pokrenuti SQL migraciju**: `supabase/migration_listing_promotions.sql` mora se pokrenuti u Supabase SQL Editoru (Dashboard → SQL Editor). Bez ovoga, `/oglasi/[id]/istakni` i `/admin/uplate` će bacati greške (tabele ne postoje).
2. **HITNO — uneti broj računa**: nakon SQL migracije, admin (Alen) treba da ode na `/admin/uplate` i unese naziv primaoca, banku i broj tekućeg računa. Dok to ne uradi, korisnici vide poruku "podaci za uplatu još nisu podešeni".
3. Nakon 1+2, uraditi bar jedan ručni test celog toka: kreirati porudžbinu kao test-vlasnik oglasa → otvoriti `/istakni/[orderId]` → kliknuti "Poslao/la sam uplatu" → kao admin otići na `/admin/uplate` → Potvrdi → proveriti da se na oglasu pojavi značka i da `featured_until`/`gold_until` ima ispravan datum.
4. **GSC fetch status** — ponovo proveriti da li sitemap sada ima "discovered pages" > 0 (ranije "Couldn't fetch / 0 discovered pages"). Ne dirati DNS TXT zapis.
5. **Cron `expire_old_listings()` security** — i dalje SECURITY DEFINER sa javnim EXECUTE. Plan: server-only `SUPABASE_SERVICE_ROLE_KEY` u Vercelu ili bezbedan server/Edge job, zatim `search_path = ''` + revoke za `anon`/`authenticated`, pa testirati cron.
6. **Autentifikovani E2E test** ostatka platforme (prijava, novi oglas, izmena/pauza/obnova/brisanje, prijava na oglas, poruke, admin accept/reject) — nije rađeno sa pravim nalogom. Ne kreirati test naloge bez potrebe.
7. **Lint upozorenja** — preostala (uglavnom `any`, neiskorišćeni importi), rešavati postepeno.
8. **Sledeće veće funkcionalnosti** (dogovoreno, još nije rađeno):
   - Facebook OAuth fix — pogrešan Google Client ID u Facebook provider slotu u Supabase dashboardu; zahteva ručnu akciju korisnika.
   - Email notifikacije — ne postoji nikakva integracija.
   - Apple login — odluka korisnika da li je uopšte potreban za lansiranje (preporuka: nije neophodan).

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
