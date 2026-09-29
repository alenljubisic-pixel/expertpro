# ExpertPro — zajednički status (Codex + Claude)

> Čitaj ovo pre rada i ažuriraj posle svake značajne izmene. Samo aktuelno stanje; istorija je u Git-u. Bez lozinki, ključeva i korisničkih podataka.

## Gde radimo

- Repo: `D:\Downloads\expertpro-code\expertpro`, grana `main`; produkcija: `https://www.expertpro.app`.
- Push na `main` automatski objavljuje sajt. Jezgro opisano ispod objavljeno je 29.09.2026. na commitu `6e0568f`; Vercel je pokazao produkciju `Ready`. Naknadne izmene proveravati pre novog push-a.
- Bezbednosne SQL migracije pokretati samo uz izričit zahtev vlasnika i proveru projekta. Ne praviti lažne podatke na pravim nalozima, ne vršiti prave uplate za test.
- Sačuvati tuđe izmene: `AGENTS.md`, `CLAUDE.md`, stara `supabase/migration_candidate_selection_flow.sql`, `.env.local.example` i `push-*.ps1` već su bili lokalno izmenjeni/nepraćeni. Ne koristiti `git add -A`.

## Produkcija — potvrđeno / nije potvrđeno

- Primenjene migracije: admin listing RLS, avatar storage, OAuth backfill, izbor kandidata i pet novih SQL migracija ispod. Naknadni anon test oglasa i javni `/oglasi` su ranije prošli; **pun E2E sa dva test naloga nije urađen**.
- Admin odobravanje korisnika i upload avatara su ranije testirani. Admin „Pauziraj“ tuđi oglas treba ponovo stvarno proveriti posle izbora kandidata. **Ne pokretati staru `migration_fix_listings_admin_pause.sql`** — vratila bi zastarelu politiku.
- Plaćanja, krediti, IPS QR u bankarskoj aplikaciji, Facebook OAuth, email/push notifikacije nisu kompletno E2E provereni. PWA instalacija postoji, stvarni push ne postoji.
- FAQ je usklađen sa pravilom „poruka tek uz prijavu / razgovor tek posle prihvatanja“, završetkom i žalbama; prethodni tekst je pogrešno obećavao direktno pisanje svima i javni odgovor na ocene.

## Objavljeno — osnovni tok

1. **Prijava i razgovor:** jedna poruka uz prijavu; direktne/opšte poruke ukinute. Razgovor vezan za oglas moguć samo posle izbora vlasnika i potvrde kandidata. SQL/RLS štiti i direktni API pristup; status prijave se ne može falsifikovati klijentskim UPDATE-om.
2. **Završetak i ocene:** klik „Posao je završen“ od bilo koje strane odmah zaključava taj razgovor (istorija ostaje). Obe strane potvrđuju završetak; tek tada svako može oceniti drugog za konkretan oglas, po jednu ocenu po smeru. Vreme samo po sebi **ne dokazuje** završetak i trenutno nema automatskog završavanja ni podsetnika.
3. **Žalbe:** korisnik šalje tiket za ocenu/oglas/spor; admin vidi žalbe, menja status/odgovor i može skloniti ocenu. Ocena se čuva sa razlogom i adminom koji ju je sklonio; javno nestaje i prosek se preračunava. Nije nepovratno izbrisana.
4. **Berza i duži poslovi:** zaseban ulaz „Berza poslova“ uz Hitno, prikaz otvorenih zahteva; filteri jednokratno / više dana / određeno / stalno. Poslodavac može označiti oglas otvorenim za strane radnike; radnik može sam uključiti oznaku na profilu i biti pronađen filterom. Ovo nije provera prava na rad.
5. **„Nudim uslugu“:** majstor može prihvatiti više različitih klijenata na istom oglasu; svaki prihvaćen upit dobija zaseban razgovor i zasebno potvrđivanje završetka. SQL i UI su objavljeni.

### SQL redosled — primenjeno 29.09.2026. u produkcionom ExpertPro projektu

1. `supabase/migrations/20260929131309_lock_chat_until_assignment.sql`
2. `supabase/migrations/20260929131832_job_completion_and_mutual_reviews.sql`
3. `supabase/migrations/20260929132505_support_tickets_and_review_moderation.sql`
4. `supabase/migrations/20260929132906_listing_engagement_filters.sql`
5. `supabase/migrations/20260929144442_offer_multi_client_assignment.sql`

Prva četiri SQL-a su pokrenuta redom u Chrome Supabase SQL Editoru; svaki je vratio `Success. No rows returned`. Peti je primenjen preko povezanog Supabase alata. Naknadni read-only SQL potvrdio je nove kolone, funkcije, tabelu, ključne RLS politike/privilegije i peti offer RPC. Postojeći stari razgovor je proverom baze zaključan za dalje pisanje (1 istorijski razgovor, 0 sa dozvolom slanja). **E2E sa dva test naloga nije urađen.** Produkciono su otvoreni i potvrđeni `/oglasi?type=request&mode=long`, `/podrska`, `/admin/zalbe` i ažurirani FAQ; nema trenutnih žalbi ni dugoročnih oglasa. Pre pune potvrde proveriti ceo tok (prijava → izbor → potvrda → razgovor → završetak → obostrane ocene → žalba → admin skloni ocenu) i offer tok sa dva klijenta, bez lažnih podataka na pravim nalozima.
SQL je primenjen ručno, pa pre budućeg `supabase db push` treba uskladiti CLI migracionu istoriju; ne pokretati svih pet ponovo naslepo.

## Otvoreno, po prioritetu

1. E2E provera sa dva namenska test naloga; pet SQL-ova i kod su objavljeni. `npx tsc --noEmit` i ESLint na izmenjenim TSX fajlovima prolaze. `npm run build` prolazi svih 42 ruta sa privremenim neprodukcionim placeholder vrednostima za dve javne Supabase env promenljive; to potvrđuje build, **ne** rad sa pravom bazom. Globalni lint ima jednu staru grešku u `components/layout/InstallPrompt.tsx:55` (setState u effect-u), nevezanu za ovaj rad. Bez env vrednosti build staje na prerenderu `/login`/`/cenovnik`.
2. Definisati završetak bez odgovora druge strane: predlog podsetnik posle 3 i 7 dana, zatim žalba/admin odluka; **ne proglašavati nedatiran ili dugoročan posao automatski završenim posle X dana**. Dodati automatsku rutinu tek kad postoji planirani datum završetka i pravilo za sporove.
3. „Nudim uslugu“ sada podržava više različitih klijenata i zaseban razgovor/završetak po prihvaćenoj prijavi. Još ne podržava ponovljeni angažman istog klijenta na istom oglasu (jedinstvena prijava i ocena po paru/oglasu). Proveriti E2E pre širenja.
4. Berza zahteva zaštitu od zastarelih oglasa (podsetnik i pauza nakon neaktivnosti). Sada se prikazuju samo `active` oglasi; staro 30-dnevno isticanje i dalje važi. Dugoročni filteri su samo oglasi/pretraga, ne ugovori o radu.
5. Ustupanje („rentiranje“) radnika od agencije **nije implementirano**. Pre javne objave treba pravna/proceduralna provera dozvole agencije, prava na rad stranaca, ugovornih odnosa i admin-verifikacija; ne nuditi ovu funkciju bilo kom nalogu bez toga.
6. Posle jezgra: test bankarskog IPS QR-a, kompletni testovi uplata/kredita, Facebook OAuth podešavanje, email/push notifikacije, referral program i ostali rastni detalji.
7. Supabase bezbednosni savetnik prijavljuje postojeće javno pozive nekih `SECURITY DEFINER` funkcija, naročito cron RPC-ova; pre većeg rasta proveriti i ograničiti privilegije bez prekidanja dnevnog cron-a. [Uputstvo](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable).

## Poslovna pravila koja važe

- Prijava na radnički posao i dodela su besplatni za radnika; nema naplate obema stranama pri dodeli i nema negativnog salda. Hitni/dodatni oglasi i promocije koriste postojeće kredite.
- `request`/`urgent`: jedan izabrani kandidat potvrđuje, oglas postaje `filled`, ostali se odbijaju; `offer` je višeklijentski i ostaje otvoren.
- Nijedan korisnik ne može pisati drugom bez konkretno potvrđenog aktivnog angažmana. Po označavanju završetka razgovor se zaključava za taj oglas. Ocena tek po završetku, obostrano, uz mogućnost žalbe.
