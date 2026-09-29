# ExpertPro — zajednički status (Codex + Claude)

> Čitaj ovo pre rada i ažuriraj posle svake značajne izmene. Samo aktuelno stanje; istorija je u Git-u. Bez lozinki, ključeva i korisničkih podataka.

## Gde radimo

- Repo: `D:\Downloads\expertpro-code\expertpro`, grana `main`; produkcija: `https://www.expertpro.app`.
- Push na `main` automatski objavljuje sajt. Trenutni rad je poslat do commita `24303f5` (29.09.2026); javni FAQ je posle objave pokazao novo pravilo trajanja oglasa, a uklonjena cron ruta vraća 404.
- Bezbednosne SQL migracije pokretati samo uz izričit zahtev vlasnika i proveru projekta. Ne praviti lažne podatke na pravim nalozima, ne vršiti prave uplate za test.
- Sačuvati tuđe izmene: `AGENTS.md`, `CLAUDE.md`, stara `supabase/migration_candidate_selection_flow.sql`, `.env.local.example` i `push-*.ps1` već su bili lokalno izmenjeni/nepraćeni. Ne koristiti `git add -A`.

## Produkcija — potvrđeno / nije potvrđeno

- Primenjene migracije: admin listing RLS, avatar storage, OAuth backfill, izbor kandidata i svih deset SQL migracija ispod. **Pun browser E2E sa dva test naloga nije urađen**, ali je DB tok uspešno simuliran transakcionim testom koji se u celosti poništava.
- Admin odobravanje korisnika i upload avatara su ranije testirani. Admin RLS za pauziranje/vraćanje tuđeg oglasa sada prolazi transakcioni test; browser klik na pravom admin nalogu nije urađen. **Ne pokretati staru `migration_fix_listings_admin_pause.sql`** — vratila bi zastarelu politiku.
- Plaćanja, krediti, IPS QR u bankarskoj aplikaciji, Facebook OAuth, email/push notifikacije nisu kompletno E2E provereni. PWA instalacija postoji, stvarni push ne postoji.
- Dnevni zadatak je 29.09. prebačen u Supabase Cron: stara HTTP ruta je objavljeno uklonjena (javno vraća 404), a anonimni pozivi za isticanje/promocije su ukinuti. Dva Cron rasporeda su aktivna. Podsetnici za završetak idu 3. i 7. dana bez automatskog zatvaranja; berza upozorava posle 7 dana bez aktivnosti i pauzira nakon još 2 dana.
- FAQ je usklađen sa pravilom „poruka tek uz prijavu / razgovor tek posle prihvatanja“, završetkom i žalbama; prethodni tekst je pogrešno obećavao direktno pisanje svima i javni odgovor na ocene.

## Objavljeno — osnovni tok

1. **Prijava i razgovor:** jedna poruka uz prijavu; direktne/opšte poruke ukinute. Razgovor vezan za oglas moguć samo posle izbora vlasnika i potvrde kandidata. SQL/RLS štiti i direktni API pristup; status prijave se ne može falsifikovati klijentskim UPDATE-om.
2. **Završetak i ocene:** klik „Posao je završen“ od bilo koje strane odmah zaključava taj razgovor (istorija ostaje). Obe strane potvrđuju završetak; tek tada svako može oceniti drugog za konkretan oglas, po jednu ocenu po smeru. Vreme samo po sebi **ne dokazuje** završetak; posle 3 i 7 dana bez druge potvrde stiže podsetnik.
3. **Žalbe:** korisnik šalje tiket za ocenu/oglas/spor; admin vidi žalbe, menja status/odgovor i može skloniti ocenu. Ocena se čuva sa razlogom i adminom koji ju je sklonio; javno nestaje i prosek se preračunava. Nije nepovratno izbrisana.
4. **Berza i duži poslovi:** zaseban ulaz „Berza poslova“ uz Hitno, prikaz otvorenih zahteva; filteri jednokratno / više dana / određeno / stalno. Zahtevi ne ističu posle 30 dana; 7 dana bez aktivnosti donosi podsetnik, 2 dana kasnije automatsku pauzu, a vlasnik može da osveži/reaktivira. „Nudim uslugu“ i dalje ističe posle 30 dana. Poslodavac može označiti oglas otvorenim za strane radnike; radnik može sam uključiti oznaku na profilu i biti pronađen filterom. Ovo nije provera prava na rad.
5. **„Nudim uslugu“:** majstor može prihvatiti više različitih klijenata na istom oglasu; svaki prihvaćen upit dobija zaseban razgovor i zasebno potvrđivanje završetka. SQL i UI su objavljeni.

### SQL redosled — primenjeno 29.09.2026. u produkcionom ExpertPro projektu

1. `supabase/migrations/20260929131309_lock_chat_until_assignment.sql`
2. `supabase/migrations/20260929131832_job_completion_and_mutual_reviews.sql`
3. `supabase/migrations/20260929132505_support_tickets_and_review_moderation.sql`
4. `supabase/migrations/20260929132906_listing_engagement_filters.sql`
5. `supabase/migrations/20260929144442_offer_multi_client_assignment.sql`
6. `supabase/migrations/20260929150157_secure_daily_maintenance_and_finish_reminders.sql` — Supabase Cron i podsetnici za završetak.
7. `supabase/migrations/20260929150440_restrict_legacy_definer_rpc_grants.sql` — zabranjeni anonimni direktni pozivi starih RPC/trigger funkcija, osim javnog brojača pregleda.
8. `supabase/migrations/20260929151349_keep_requests_open_with_inactivity_pause.sql` — zahtevi bez 30-dnevnog isteka; podsetnik i pauza zbog neaktivnosti.
9. `supabase/migrations/20260929151507_charge_only_unpaid_reactivated_requests.sql` — zaštita od ponovne naplate već plaćenog oglasa bez otvaranja rupe za drugi besplatni oglas.
10. `supabase/migrations/20260929152409_pin_legacy_function_search_paths.sql` — fiksiran `search_path` na četiri stare funkcije; bezbednosni savetnik više ne prijavljuje tu grupu upozorenja.

Prva četiri SQL-a su pokrenuta u Chrome SQL Editoru, peti preko Supabase alata, a poslednjih pet kao zabeležene migracije. Deset lokalnih imena/verzija poklapa se sa produkcionom migracionom istorijom; prvih pet je naknadno označeno kao već primenjeno i puna SQL sadržina je upisana u istoriju, bez ponovnog izvršavanja. DB test `supabase/tests/assignment_flow_rollback.sql` je prošao: izbor → potvrda → odbijanje ostalih → zaključavanje četa → dve potvrde → dve ocene → žalba → admin moderacija, višeklijentska ponuda, neaktivnost i kredit pri ponovnoj aktivaciji. Prošao je ponovo posle migracije 10. `supabase/tests/admin_listing_rls_rollback.sql` je prošao: vlasnik i admin mogu da menjaju/pauziraju, nepovezan korisnik ne može. `ROLLBACK` je ostavio **0 testnih korisnika i 0 testnih oglasa**. Ovo nije zamena za browser E2E sa dva naloga. Produkciono su ranije provereni `/oglasi?type=request&mode=long`, `/podrska`, `/admin/zalbe`; najnoviji FAQ tekst provereno je vidljiv uživo. Dugme „Osveži“ čeka proveru na nalogu sa aktivnim zahtevom.

## Otvoreno, po prioritetu

1. Browser E2E sa dva namenska test naloga i browser klik admina na tuđem oglasu. Dva SQL transakciona testa prolaze. `npx tsc --noEmit`, globalni ESLint (0 grešaka, 56 upozorenja) i `npm run build` (41 statička/dinamička ruta bez cron rute) prolaze sa privremenim placeholder vrednostima za dve javne Supabase env promenljive; to potvrđuje build, **ne** pun browser tok. PWA tekst više ne obećava push koji ne postoji.
2. Podsetnici za nedovršen posao postoje posle 3 i 7 dana, ali spor nakon toga i odluka admina nisu automatizovani. **Ne proglašavati nedatiran ili dugoročan posao automatski završenim posle X dana**. Potrebna je politika spora i planirani datum završetka pre automatizovanog razrešenja.
3. „Nudim uslugu“ sada podržava više različitih klijenata i zaseban razgovor/završetak po prihvaćenoj prijavi. Još ne podržava ponovljeni angažman istog klijenta na istom oglasu (jedinstvena prijava i ocena po paru/oglasu). Proveriti E2E pre širenja.
4. Berza je zaštićena podsetnikom i pauzom nakon neaktivnosti, bez 30-dnevnog isteka za `request`/`urgent`. Proveriti stvarnu isporuku in-app podsetnika posle 7/9 dana (SQL test je prošao). Dugoročni filteri su samo oglasi/pretraga, ne ugovori o radu.
5. Ustupanje („rentiranje“) radnika od agencije **nije implementirano**. Pre javne objave treba pravna/proceduralna provera dozvole agencije, prava na rad stranaca, ugovornih odnosa i admin-verifikacija; ne nuditi ovu funkciju bilo kom nalogu bez toga.
6. Posle jezgra: test bankarskog IPS QR-a, kompletni testovi uplata/kredita, Facebook OAuth podešavanje, email/push notifikacije, referral program i ostali rastni detalji.
7. Preostala bezbednost: javni brojač pregleda `increment_view_count` dozvoljava anonimni poziv i naduvavanje statistike; ostali anonimni SECURITY DEFINER pozivi su ograničeni. Security Advisor još prijavljuje `pg_trgm` u public šemi i isključenu zaštitu od kompromitovanih lozinki. Pregledati ponaosob pre izmene. [Uputstvo](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable).

## Poslovna pravila koja važe

- Prijava na radnički posao i dodela su besplatni za radnika; nema naplate obema stranama pri dodeli i nema negativnog salda. Hitni/dodatni oglasi i promocije koriste postojeće kredite.
- `request`/`urgent`: jedan izabrani kandidat potvrđuje, oglas postaje `filled`, ostali se odbijaju; `offer` je višeklijentski i ostaje otvoren.
- Nijedan korisnik ne može pisati drugom bez konkretno potvrđenog aktivnog angažmana. Po označavanju završetka razgovor se zaključava za taj oglas. Ocena tek po završetku, obostrano, uz mogućnost žalbe.
