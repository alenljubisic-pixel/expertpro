# ExpertPro — zajednički status rada

> Ovaj fajl je obavezni kontekst za svakog agenta koji nastavlja rad (Codex, Claude ili drugi). Pre rada ga pročitaj, dopuni posle svake značajne izmene i ne upisuj tajne, API ključeve, lozinke ili korisničke podatke.

## Trenutno stanje

- Poslednje ažuriranje: 28.09.2026. (Claude, Cowork sesija)
- Produkcioni repo: `alenljubisic-pixel/expertpro`, grana `main`.
- Lokalni radni folder: `D:\Downloads\expertpro-code\expertpro`.
- Poslednji deploy commit: `74a33a7` — Vercel status **READY** (aliasovan na www.expertpro.app, expertpro.app).
- Produkcija: `https://www.expertpro.app`.
- Supabase projekat: ExpertPro (`fktbnoxokvbnkxfazqvu`).
- Search Console property: `sc-domain:expertpro.app` (DNS TXT verifikacija urađena i potvrđena u konzoli — **ne brisati** taj TXT zapis).

## Urađeno u ovoj sesiji (Claude, 28.09.2026, posle commita dbad2a1)

- **Fix**: naslov (title tag) svake pojedinačne stranice oglasa je bio dupliran — `"... — Beograd | ExpertPro | ExpertPro"` — jer je `generateMetadata` u `app/oglasi/[id]/page.tsx` ručno dodavao `| ExpertPro`, a root layout (`app/layout.tsx`) preko `title.template: "%s | ExpertPro"` ga je dodavao još jednom. Uklonjen ručni sufiks. Provereno live: sada je `"ko radi ne boji se gladi! — Beograd | ExpertPro"` — ispravno. Commit `74a33a7`, pushovan i deployovan (READY).
- **Live provera SEO infrastrukture** (izgrađene u prethodnoj sesiji), sve potvrđeno na produkciji:
  - `sitemap.xml` — validan, sadrži sve statične stranice, 8 blog postova i 3 prava (live) oglasa sa ispravnim URL-ovima i `lastmod`.
  - `robots.txt` — ispravan, dozvoljava `/`, blokira `/dashboard`, `/admin`, `/api/`, `/poruke`, `/oglasi/novi`, `/oglasi/*/uredi`, upućuje na sitemap.
  - `/oglasi` stranica — prikazuje samo prave oglase, nema pomena "demo" nigde (ranije uklonjeno).
  - JSON-LD `Organization` schema — prisutan na homepage (`<script type="application/ld+json">`), potvrđeno u raw HTML-u.
  - `google-site-verification` meta tag — **NIJE prisutan** u HTML-u. Ovo je očekivano i OK: korisnik je verifikovao Search Console preko **Domain property / DNS TXT metode**, koja ne zahteva meta tag. Meta-tag kod u `layout.tsx` (`verification.google`) ostaje neaktivan (vraća `undefined` jer `GOOGLE_SITE_VERIFICATION` env var nije postavljen) — nije potrebno ništa menjati, ali ni brisati taj kod, bezopasan je.
- Sinhronizovan cloud sandbox radni repo sa `origin/main` (uključujući prethodni `dbad2a1` commit koji je napravljen odvojeno, van ove cloud sesije, na lokalnoj Windows mašini — Next.js 16.3.6 upgrade, `proxy.ts` migracija, security hardening funkcija, lint fixevi). Nema konflikata, sve čisto rebase-ovano/sinhronizovano.

## Preostalo — sledeći agent

1. **GSC fetch status** — ponovo proveriti da li sitemap sada ima "discovered pages" > 0 (ranije je pisalo "Couldn't fetch / 0 discovered pages" uprkos tome što javni URL vraća 200 `application/xml`). Sačekati propagaciju (može trajati 24-48h od slanja) pa proveriti GSC "Sitemaps" panel. Ne dirati DNS TXT zapis.
2. **Cron `expire_old_listings()` security** — i dalje je SECURITY DEFINER sa javnim EXECUTE iz ranije migracije. Plan: obezbediti server-only `SUPABASE_SERVICE_ROLE_KEY` u Vercelu ili prebaciti expiry logiku u bezbedan server/Edge job, zatim `search_path = ''` + revoke EXECUTE za `anon`/`authenticated`, pa testirati da cron i dalje radi (`/api/cron/expire-listings`).
3. **Autentifikovani E2E test** — prijava, dashboard, novi oglas, izmena/pauza/obnova/brisanje oglasa, prijava na oglas (apply), poruke, admin tok (accept/reject prijava vlasnika oglasa) — nije rađeno sa pravim ulogovanim nalogom u ovoj sesiji. Ne kreirati test naloge bez potrebe, ne slati privatne podatke.
4. **Lint upozorenja** — preostala (uglavnom `any` tipovi, neiskorišćeni importi) rešavati postepeno bez menjanja ponašanja.
5. **Sledeće veće funkcionalnosti (dogovoreno sa korisnikom, još nije rađeno)**:
   - IPS (ručni bankovni transfer) + Gold/istaknuti oglasi kao kombinovani ručni sistem plaćanja (brže od čekanja pune Stripe integracije).
   - Facebook OAuth fix — pogrešan Google Client ID je ubačen u Facebook provider slot u Supabase dashboardu; zahteva ručnu akciju korisnika u Supabase konzoli.
   - Email notifikacije — trenutno ne postoji nikakva integracija.
   - Apple login — odluka korisnika da li je uopšte potreban za lansiranje (preporuka: nije neophodan za launch).

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
