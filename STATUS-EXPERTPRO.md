# ExpertPro — zajednički status rada

> Ovaj fajl je obavezni kontekst za svakog agenta koji nastavlja rad (Codex, Claude ili drugi). Pre rada ga pročitaj, dopuni posle svake značajne izmene i ne upisuj tajne, API ključeve, lozinke ili korisničke podatke.

## Trenutno stanje

- Poslednje ažuriranje: 28.09.2026, veče (Claude, Cowork sesija — treći krug istog dana).
- Produkcioni repo: `alenljubisic-pixel/expertpro`, grana `main`.
- Lokalni radni folder: `D:\Downloads\expertpro-code\expertpro`.
- Poslednji deploy commit: `c0dd0fdb` — Vercel status **READY**, aliasovan na www.expertpro.app, expertpro.app.
- Produkcija: `https://www.expertpro.app`.
- Supabase projekat: ExpertPro (`fktbnoxokvbnkxfazqvu`).
- Search Console property: `sc-domain:expertpro.app` (DNS TXT verifikacija urađena i potvrđena u konzoli — **ne brisati** taj TXT zapis).

## Urađeno u ovoj sesiji (Claude, 28.09.2026, treći krug)

**1) Pokrenute sve preostale SQL migracije u produkciji** — kombinovane u `supabase/migration_RUN_ALL.sql` (i pojedinačno `migration_listing_promotions.sql`/`migration_credits.sql` učinjene idempotentnim dodavanjem `drop policy if exists` pre svakog `create policy`), pokrenuto direktno u Supabase SQL Editoru, potvrđeno upitom da sve kolone/tabele/trigeri postoje (commit `373514c4`).

**2) Krediti sada vidljivi svuda** (commit `7e4d43e4`) — `CreditsWidget` (saldo + "Šta su krediti i zašto" objašnjenje sa marketinškim tekstom za sve tipove naloga, uključujući fizička lica) na `/dashboard` i `/dashboard/profil`; bedž sa brojem kredita u Navbar-u (desktop + mobilni + dropdown meni); prepravljen header na `/krediti` sa istim objašnjenjem. Provereno live.

**3) Bug: link "Admin panel" se nije prikazivao ni pravim adminima** (commit `c0dd0fdb`) — `Navbar.tsx` i `dashboard/page.tsx` su proveravali `is_verified && type==='individual'` umesto pravog `profile.is_admin` (koji `app/admin/page.tsx` ispravno koristi server-side). Ispravljeno na `profile?.is_admin`. Nađeno test-iranjem u pravom, ulogovanom Chrome nalogu korisnika.

**4) ⚠️ NALAZ — plaćanje je i dalje potpuno blokirano, iako je kod live:**
- `public.payment_settings` ima tačno 1 red, ali `bank_name`, `account_holder`, `account_number`, `payment_reference_note` su svi **NULL**. Niko ih nikad nije popunio.
- Testirano uživo: kupovina paketa kredita na `/krediti` ISPRAVNO kreira porudžbinu u `credit_purchases` i vodi na `/krediti/[orderId]`, ali stranica tamo ispravno prikazuje "Podaci za uplatu (broj računa) još nisu podešeni u admin panelu" — tj. UI se ponaša ispravno, problem je čisto nedostatak podataka.
- Isto važi za Istaknut/Gold (`listing_promotions`/`istakni` flow) — koristi istu `payment_settings` tabelu, znači isto blokirano.
- **Popravka zahteva unos pravog broja računa u `/admin/uplate`, što zahteva `is_admin=true`.**

**5) ⚠️ `is_admin` je i dalje `false` za alenljubisic@gmail.com** — provereno uživo (`select is_admin from public.profiles where id='82f063f3-897a-47d4-bab4-227704c7f891'` → `false`). Agent NE SME sam da ovo menja (auto-mode klasifikator eksplicitno blokira promenu `is_admin`/privilegija — probano i odbijeno u prethodnom krugu). Korisnik mora sam pokrenuti u Supabase SQL Editoru:
  ```sql
  update public.profiles set is_admin = true where email = 'alenljubisic@gmail.com';
  ```
  Dok se ovo ne uradi: nema pristupa `/admin`, ne može se uneti broj računa, ne može se testirati odobravanje uplata.

**6) Testiranje uživo (nastavak, "prvo redom sve") — status:**
  - ✅ Početna strana, `/oglasi`, `/cenovnik` — bez grešaka u konzoli.
  - ✅ Navbar kredit-bedž — radi, pokazuje pravi broj.
  - ✅ `/krediti` — stranica i objašnjenje rade, kupovina paketa kreira porudžbinu ispravno.
  - ❌ Uplata kredita/Istaknut/Gold — blokirano nedostatkom bankovnog broja računa (vidi #4).
  - ⏸ `/admin/uplate` — blokirano dok `is_admin` nije `true` (vidi #5).
  - ⏸ Objava oglasa (Istakni/Gold flow od kreiranja oglasa) — nije testirano, nalog nema nijedan oglas trenutno; kreiranje pravog oglasa na produkciji je javna akcija pa nije rađeno bez odobrenja korisnika.
  - ⏸ Chat/poruke i ocenjivanje između dva naloga — nije testirano u ovom krugu.

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

## Urađeno u ovoj sesiji, drugi krug (Claude, 28.09.2026 popodne)

Korisnik je tražio: (a) limit oglasa da bude 1 UKUPNO (ne po rubrici) za sve, dodatni oglasi da koštaju kredit; (b) bolji marketing/promo tekst za Istaknut/Gold; (c) Gold da sme i u jednu dodatnu srodnu rubriku; (d) da se proveri i popravi chat (rad između dvoje ljudi, čuvanje u bazi, notifikacije/popup); (e) da se proveri i popravi sistem ocenjivanja (rivju) posle komunikacije. Sve navedeno je urađeno, testirano (TypeScript + `next build` prolaze) i pušovano.

**4) Jedinstven limit oglasa + Gold u dodatnoj rubrici + promo tekst** (commit `0995866`):
- `supabase/migration_listing_limits_v2.sql` — zamenjuje stari trigger (po rubrici) novim `enforce_listing_limits()`: svako (fizičko lice i firma/agencija na `free` planu) ima **1 besplatan aktivan oglas ukupno**, bilo koje rubrike; svaki sledeći aktivan oglas (ista ili druga rubrika) troši **1 kredit** iz `profiles.credit_balance`. Firme/agencije na plaćenom `subscription_tier` i dalje bez limita. Hitni oglasi (`type='urgent'`) i dalje idu kroz svoj poseban trigger iz `migration_credits.sql` (1 kredit po hitnom oglasu) — ova migracija na njih ne utiče.
- `supabase/migration_gold_secondary_category.sql` — Gold oglas (uz uplatu) sme da se prikaže i u jednoj dodatnoj ("srodnoj") rubrici po izboru vlasnika; dodaje `secondary_category_id/slug` na `listings` i `listing_promotions`, proširuje `admin_confirm_promotion` da to postavi pri potvrdi uplate, i `demote_expired_promotions` da to skloni kad Gold istekne.
- `lib/constants.ts` — dodat `CATEGORIES_WITH_ID` (izvor za birač dodatne rubrike).
- `/oglasi/[id]/istakni` — potpuno predizajniran: promo baner (crveno-žuti gradijent, "Prilika da budeš viđen"), jasne prednosti po nivou (Gold: prvo mesto na celoj listi, zlatna značka, dodatna rubrika, prioritet u pretrazi; Istaknut: vrh svoje kategorije/grada, plava značka, više pregleda), birač dodatne rubrike samo za Gold — bez izmišljenih brojki (x5/x10 namerno izostavljeno).
- `/oglasi` — filter po rubrici sad pogađa i `secondary_category_slug`, ne samo primarnu.
- `/oglasi/novi` — upozorenje/provera za dodatni oglas (van hitnog) sada prati novi model "1 besplatan ukupno + kredit za svaki sledeći", ne stari "po rubrici".
- `/cenovnik` — ažurirani opisi planova i FAQ za novi model limita.
- Odgovoreno korisniku (bez izmene koda): postavljanje oglasa je obostrano — i fizička lica/radnici i firme mogu da objave i "Nudim uslugu" i "Tražim radnika" (i hitno), limit i kredit sistem su nezavisni od tipa oglasa.

**5) Notifikacije i ocenjivanje — pronađen i popravljen ozbiljan propust** (commit `cb803f1`):

Nalaz pre popravke: zvonce za obaveštenja, `/obavestenja` stranica i realtime broj nepročitanih su već postojali i radili ispravno u UI-ju — **ali ništa u bazi nikad nije upisivalo red u `notifications`**. Ni nova poruka ni nova ocena nisu generisale obaveštenje — zvonce je uvek bilo prazno. Dodatno, tabela `notifications` u šemi ima kolone `body`/`data` (jsonb), dok UI (Navbar + `/obavestenja`) čita `message`/`link` — te kolone nisu ni postojale. Sistem ocenjivanja je bio još nepotpuniji: `reviews` tabela + prikaz na profilu su postojali, ali **nigde u aplikaciji nije postojala forma za ostavljanje ocene** — korisnik fizički nije mogao da nekog oceni.

Popravljeno u `supabase/migration_notifications_and_reviews.sql`:
- Dodate kolone `notifications.message`, `notifications.link` (ono što UI stvarno čita).
- Uključen realtime za `notifications`, `conversations`, `messages` (idempotentno, `alter publication supabase_realtime add table ...` u `do $$ ... exception when duplicate_object`).
- Trigger `notify_new_message` (AFTER INSERT na `messages`) — upisuje obaveštenje drugom učesniku razgovora (ne pošiljaocu), sa linkom na `/poruke?conv=...`.
- Trigger `enforce_review_requires_contact` (BEFORE INSERT na `reviews`) — ocena je moguća SAMO ako postoji razgovor (`conversations`) između ocenjivača i ocenjenog; sprečava i samo-ocenjivanje.
- Trigger `notify_new_review` (AFTER INSERT na `reviews`) — upisuje obaveštenje ocenjenom, sa linkom na njegov `/profil/[id]`.
- Unique indeks koji sprečava više ocena iste osobe bez vezanog oglasa (`listing_id is null`).

Novo u kodu (isti commit):
- `components/reviews/ReviewForm.tsx` — nova forma (zvezdice 1-5 + opcioni komentar), ugrađena u `app/profil/[id]/page.tsx`; prikazuje se samo posetiocu koji NIJE vlasnik profila, koji je već razmenio poruke sa tom osobom i koji je još nije ocenio (provera i na serveru pre renderovanja i u samoj DB putem trigera — dupla zaštita).
- `components/chat/ChatWindow.tsx` — dodat link "Profil / oceni" u zaglavlju razgovora ka `/profil/[id]` druge strane.
- `components/chat/ConversationsRealtimeRefresher.tsx` — nova komponenta, montirana u `/poruke`; lista razgovora se sada osvežava uživo (realtime) kad stigne nova poruka/razgovor, ne samo pri ručnom osvežavanju stranice.
- Chat sam po sebi (slanje/prijem poruka unutar otvorenog razgovora, čuvanje u bazi) je proveren kodom i **radio je ispravno i pre ove izmene** — problem je bio isključivo u notifikacijama van otvorenog razgovora i u nepostojanju forme za ocenjivanje.

⚠️ Ni jedna od migracija iz ovog kruga (`migration_listing_limits_v2.sql`, `migration_gold_secondary_category.sql`, `migration_notifications_and_reviews.sql`) još nije pokrenuta u produkcionoj Supabase bazi.

## Preostalo — sledeći agent (redosled po prioritetu)

1. **HITNO — pokrenuti SQL migracije u Supabase SQL Editoru, tačno ovim redosledom** (svaka zavisi od prethodne):
   1. `supabase/migration_listing_promotions.sql`
   2. `supabase/migration_credits.sql`
   3. `supabase/migration_credits_signup_bonus.sql`
   4. `supabase/migration_listing_limits_v2.sql`
   5. `supabase/migration_gold_secondary_category.sql`
   6. `supabase/migration_notifications_and_reviews.sql`

   Dok se ne pokrenu: Istaknut/Gold i krediti ne rade (greške), hitni oglasi se objavljuju bez provere/naplate kredita, limit oglasa je i dalje stari (po rubrici), Gold nema dodatnu rubriku, a notifikacije/ocenjivanje ne rade uopšte (zvonce prazno, nema forme za ocenu dok se ne doda `message`/`link` kolona).
2. **HITNO — uneti broj računa** na `/admin/uplate` (koristi se i za Istaknut/Gold i za kredite, ista tabela `payment_settings`).
3. Nakon 1+2, uraditi bar jedan ručni test svakog toka:
   - Istaknut/Gold: kreirati porudžbinu → `/istakni/[orderId]` → "Poslao/la sam uplatu" → admin Potvrdi na `/admin/uplate` → proveriti značku, `featured_until`/`gold_until` i dodatnu rubriku (ako je Gold).
   - Krediti: kupiti paket na `/krediti` → uplata → admin Potvrdi → proveriti da `profiles.credit_balance` poraste → objaviti hitan oglas i dodatan (drugi) običan oglas i proveriti da se u oba slučaja oduzme 1 kredit → proveriti da insert baca grešku kad je `credit_balance = 0`.
   - Gratis bonus: ručno promeniti `subscription_tier` neke firme sa 'free' na npr. 'pro' u SQL editoru i proveriti da `credit_balance` poraste za 10; proveriti da nova registracija dobije 2 gratis kredita.
   - Notifikacije: sa dva test naloga — poslati poruku i proveriti da se zvonce kod primaoca upali (realtime, bez refresh-a) i da se stavka pojavi na `/obavestenja` sa linkom ka razgovoru.
   - Ocenjivanje: sa dva test naloga koja su već razmenila poruke — otvoriti `/profil/[id]` jednog od njih (kao drugi) i proveriti da se pojavi forma za ocenu, poslati ocenu, proveriti da se pojavi na profilu, da `rating_avg`/`rating_count` porastu i da primalac dobije notifikaciju. Zatim proveriti da se BEZ prethodne poruke ocena odbija (greška iz trigera).
4. **GSC fetch status** — ponovo proveriti da li sitemap ima "discovered pages" > 0. Ne dirati DNS TXT zapis.
5. **Cron `expire_old_listings()` security** — i dalje SECURITY DEFINER sa javnim EXECUTE. Plan: server-only `SUPABASE_SERVICE_ROLE_KEY` u Vercelu ili bezbedan server/Edge job, zatim `search_path = ''` + revoke za `anon`/`authenticated`.
6. **Autentifikovani E2E test** ostatka platforme (prijava, novi oglas, izmena/pauza/obnova/brisanje, prijava na oglas, poruke, admin accept/reject) — nije rađeno sa pravim nalogom.
7. **Lint upozorenja** — preostala (uglavnom `any`, neiskorišćeni importi), rešavati postepeno.
8. **Sledeće veće funkcionalnosti** (dogovoreno, još nije rađeno):
   - Facebook OAuth fix — pogrešan Google Client ID u Facebook provider slotu u Supabase dashboardu; zahteva ručnu akciju korisnika.
   - Email notifikacije — ne postoji nikakva integracija (samo in-app notifikacije, sada bar te rade).
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
