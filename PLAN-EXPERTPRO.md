# ExpertPro — plan funkcija, monetizacije i ispravki

> Nastalo 27.09.2026. u razgovoru sa vlasnikom (Alen), u drugom chatu od onog u kome je sajt pravljen.
> **Za Claude / programera koji nastavlja rad:** ovo je dogovoreni pravac. Pre izmena uporedi sa
> onim što je već urađeno na sajtu www.expertpro.app. Lokalna kopija koda u
> `D:\Downloads\expertpro-code\expertpro` je **starija** od sajta (na sajtu postoje blog, FAQ,
> cenovnik, "Moj Tim", kojih lokalno nema). Radi na najnovijoj verziji koda (GitHub/Vercel).
> Označi u ovom fajlu šta je urađeno (✅) kako napreduješ.
>
> **⚠️ Napomena (29.09.2026, Claude):** ovaj fajl je postojao samo lokalno na Alenovom računaru
> (nikad pušovan na GitHub) i skoro je ostao zaboravljen — pronađen i pušovan tek sada. Sekcija 13
> ispod je nova (29.09.2026), nastala iz razgovora o "berzi ponuda / model biranja jednog izvođača",
> i direktno nadovezuje na Sekciju 9 (Tok posla) koja je već skicirala vrlo sličan model.

---

## 0. Stanje sajta (provereno 27.09.2026.)

- Sajt radi: oglasi (Nudim / Tražim / Hitno), 12 kategorija, chat, dvostrane ocene, admin odobravanje firmi, blog, FAQ, cenovnik, "Moj Tim".
- **Stvarno:** 6 profila na `/radnici` (deo su test nalozi, npr. "TurboCooling GermanPro"), 0 pravih oglasa — `/oglasi` prikazuje "10 primera oglasa".
- Model je trenutno **oglasnik** (pretplata firmi "na upit"), što slabo zarađuje jer se ljudi dogovore mimo sajta.

## 1. HITNE ISPRAVKE (prvo ovo, 1–2 dana)

1. **Javne email adrese** — na `/radnici` se umesto imena prikazuje ceo email kad korisnik nema ime. Curenje ličnih podataka (ZZPL). Ispraviti: prikazati "Korisnik" + inicijal, **nikad email**. Proveriti i javni profil `/profil/[id]` i oglase.
2. **Lažne brojke na početnoj** — "5.000+ radnika, 1.200+ firmi, 15.000+ poslova, 4.8★" nisu tačne (obmanjujuće oglašavanje, gubi se poverenje). Ukloniti ili prikazivati prave brojke iz baze kad budu smislene. Primere oglasa na početnoj jasno označiti "Primer oglasa".
3. **Neusklađena ponuda firmama** — početna kaže "grejs period 6 meseci", cenovnik kaže "1 oglas besplatno bez ograničenja". Izabrati jedno (preporuka: novi kreditni model, tačka 4).
4. **Cenovnik obećava "Hitna berza besplatno zauvek"** — promeniti odmah (Hitno postaje plaćeno, tačka 4).

## 2. Tipovi korisnika

| Tip | Ko | Šta radi |
|---|---|---|
| Fizičko lice | radnik, student, penzioner, domaćinstvo | traži posao ili majstora |
| Majstor/frilenser | fizičko lice sa uključenim "Nudim uslugu" | javlja se na zahteve, može PRO |
| Firma | restoran, hotel, magacin | objavljuje oglase, bira radnike |
| **Agencija/zadruga** (novo) | omladinske zadruge, agencije za privremeno zapošljavanje | nudi tim radnika, javlja se na oglase firmi |

- Agencije/zadruge admin odobrava uz dokument (licenca Ministarstva za rad za agencije / upis u registar za zadruge). Oznaka "Zadruga ✓" / "Agencija ✓".
- **Tim agencije:** svaki radnik ima svoj nalog i sam potvrđuje (SMS) da pripada agenciji — agencija ne može izmisliti radnike ni sebi davati ocene. Ocena posla ide i radniku i agenciji.

## 3. Obaveštenja (NAJVAŽNIJE — bez ovoga ništa nema efekta)

- **PWA + Web Push** (service worker, manifest, ikonica, "instaliraj"). **[Delimično urađeno 29.09.2026 — PWA (manifest+ikonice+install banner) je gotov, web push obaveštenja još nisu, videti STATUS-EXPERTPRO.md Krug 8.]**
  - Android/Chrome: push stiže i kad je sajt zatvoren.
  - iPhone: samo ako je sajt dodat na početni ekran (iOS 16.4+) → ekran sa uputstvom "Share → Dodaj na početni ekran".
  - Računar: dok je browser pokrenut.
- Posle registracije ekran "Uključi obaveštenja da ti ne promakne posao" (dozvolu tražiti tek na klik korisnika).
- Stalna traka "⚠️ Obaveštenja su ti isključena — propuštaš poslove" dok ih ne uključi.
- **Rezervni kanali:** email svima (Resend); **SMS samo za Hitno** (trošak pokriva cena Hitno oglasa); Viber kasnije (naplaćuje se).
- **Kasnije (1–2 meseca):** Google Play preko TWA (Trusted Web Activity), App Store preko Capacitor-a.
- **Protiv spama:** korisnik bira kategorije, grad, udaljenost; tihi sati 22–07h (osim Hitno ako dozvoli); max ~10 push dnevno; šalje se samo onima koji su "Slobodni" i odgovaraju kategoriji.
- Opcija za monetizaciju: PRO članovi dobijaju obaveštenje 5 min pre ostalih.

## 4. Monetizacija — krediti

**Pravilo: plaća onaj ko od kontakta zarađuje.**

**1 kredit ≈ 50 din.**

| Paket | Cena | Po kreditu |
|---|---|---|
| 20 kredita | 900 din | 45 din |
| 50 kredita | 2.000 din | 40 din |
| 150 kredita | 5.000 din | 33 din |

- 10 kredita poklon pri registraciji — **tek posle SMS verifikacije telefona**.
- Preporuka: po 5 kredita obojici — **tek kad preporučeni obavi prvi posao/kupovinu**.
- Krediti za ponašanje: verifikovan telefon +2, ostavljena ocena +1.
- Krediti važe 12 meseci.

| Ko | Šta | Cena |
|---|---|---|
| Firma | Oglas "Tražim radnika" 7 dana | 3 kredita |
| Firma | Direktan poziv radniku iz pretrage ("Pozovi na posao") | 1 kredit |
| Svi | 🚨 Hitno (obaveštenje svim radnicima u gradu + SMS) | 5 kredita (prvi besplatan) |
| Majstor/frilenser | Javljanje na zahtev klijenta | 1–3 kredita po veličini posla |
| Majstor/frilenser | PRO: 15 kredita + "Verifikovan" + statistika | ~990 din/mes |
| Radnik koji traži posao kod firme | Prijava na oglas | **Besplatno uvek** (i zakonski — ne naplaćuje se onome ko traži posao; proveriti sa pravnikom) |
| Domaćinstvo | Objava zahteva za majstora | Besplatno (osim Hitno); 3 besplatna direktna poziva mesečno |

> **Napomena 29.09.2026 (vidi Sekciju 13):** ovo se dopunjuje novim naplativim događajem —
> **uspešno dodeljivanje posla** (kad poslodavac izabere jednog ponuđača) — naplaćuje se OBEMA
> stranama, ne samo firmi. Detalji u Sekciji 13, tačka 4.

- **Max 5 javljanja po zahtevu domaćinstva**; od tih 5 najviše 2 mogu biti agencije.
- **Ako klijent ne odgovori za 48h — kredit se vraća.** Ako klijent obriše zahtev — vraća se svima.

**Paketi za agencije/zadruge:**

| | Agencija Start | Agencija Pro |
|---|---|---|
| Cena | ~4.990 din/mes | ~11.990 din/mes |
| Krediti uključeni | 120 | 350 |
| Aktivni oglasi "Nudimo radnike" | do 20 | do 60 |
| Radnika u timu | do 30 | do 150 |
| Gold mesto | – | 1 nedeljno |

**Plaćanje:** IPS QR (NBS instant, glavni način — mala provizija), kartice preko domaćeg procesora. Firmama faktura preko SEF-a, fizičkim licima fiskalni račun — dogovoriti sa knjigovođom.

**Kada naplaćivati:** prva 3–6 meseci sistem kredita radi i cene se vide, ali svi dobijaju besplatne kredite (npr. 30). Prvo naplata firmama; majstorima tek kad u gradu/kategoriji ima 30+ zahteva mesečno.

## 5. Rangiranje (ko plati — gore, ali uz zaštite)

```
🥇 GOLD        (max 3 po strani, rotiraju se)
⭐ ISTAKNUTO   (max 5 po strani)
   Besplatni oglasi
```

| Opcija | Cena |
|---|---|
| Istaknut 7 dana | 5 kredita |
| Gold 7 dana | 15 kredita |
| "Podigni na vrh" jednom | 1 kredit |

- Unutar svakog nivoa sort: ocena → dolaznost → brzina odgovora → datum.
- Ocena ispod 3,5 → ne može kupiti Gold.
- Jedan nalog max 1 Gold mesto po strani.
- Više Gold oglasa od mesta → rotacija pri svakom učitavanju.
- Popunjen/obrisan plaćeni oglas → automatski skinut, neiskorišćeni dani vraćeni kao krediti.
- Plaćeni oglasi vidno označeni.

**[Delimično urađeno — Istaknut/Gold sistem sa kupovinom, admin potvrdom i značkama je izgrađen (drugačiji raspon cena, videti `lib/promotions.ts`), rotacija/auto-skidanje pri popunjavanju iz Sekcije 13 još nije povezano sa novim "filled" statusom.]**

## 6. Protiv dominacije jednog korisnika

- Max 3 aktivna oglasa po kategoriji + gradu po nalogu.
- Duplikat teksta u više oglasa → odbija se.
- Agencija se na jedan oglas javlja jednom (može ponuditi više ljudi u toj ponudi).
- Jedan telefon / jedan PIB = jedan nalog.

## 7. Pretraga radnika

Oba puta:
1. **Oglas potražnje** (glavni): objava → obaveštenja → javljanja → izbor.
2. **Pretraga radnika + "Pozovi na posao"** (firma 1 kredit, domaćinstvo 3 besplatno mesečno).

Radnik ima prekidač "Vidljiv u pretrazi". Hitno ide samo preko oglasa.

## 8. Dostupnost — status, bez kalendara

| Status | Kako | Efekat |
|---|---|---|
| 🟢 Slobodan danas | jedan klik, gasi se sam u ponoć | prvi dobija obaveštenja |
| 🔴 Zauzet do HH:MM | automatski kad ga firma izabere i on potvrdi | ne dobija obaveštenja za taj termin |
| ⚪ Nedostupan | ručno | ne dobija ništa |

- Javljanje na oglas NE čini radnika zauzetim (može se javiti na više oglasa).
- Posle izbora radnik mora "Potvrditi dolazak" za 2h (Hitno: 15 min), inače mesto ide sledećem.
- Ako je već zauzet u tom terminu → druga firma dobija upozorenje.
- Posle završetka → automatski nazad "Slobodan" + poziv na ocenu.

## 9. Tok posla (oglas = smena)

1. Oglas ima: **datum, vreme od–do, broj ljudi, satnica, lokacija**.
2. Obaveštenja odgovarajućim radnicima.
3. Javljanja — limit ~ broj ljudi × 5.
4. Firma bira → radnik potvrđuje.
5. Kad su sva mesta popunjena → oglas se sam zatvara, ostali dobijaju "Mesto popunjeno", majstorima se vraćaju krediti.
6. Podsetnik dan ranije i 2h pre.
7. "Završeno" → ocene u oba smera, **samo za potvrđene angažmane**.
8. Oglas ističe sam kad prođe vreme početka.
9. Telefon se otkriva tek posle izbora (pre toga samo chat).
10. Kasnije: QR prijava dolaska na lokaciji; isplata preko platforme uz partnersku zadrugu + provizija 15–25% (dugoročni pravac — posrednik, ne oglasnik).

> **Ovo je suštinski ISTI model** koji je Alen ponovo opisao 29.09.2026 (Sekcija 13), samo bez
> koraka "radnik potvrđuje dolazak" — u novom opisu je Alenov izbor odmah konačan. **Treba
> odlučiti da li ostaje korak potvrde od strane izabranog izvođača ili ne — videti Sekciju 13,
> otvoreno pitanje #1.**

## 10. Predviđeni problemi i rešenja

| Problem | Rešenje |
|---|---|
| Radnik ne dođe | % dolaznosti na profilu; 3 nedolaska = pauza 30 dana |
| Firma lažno prijavi nedolazak | radnik osporava, odlučuje admin; firmi se prikazuje % otkazivanja |
| Firma otkaže u zadnji čas | ocena + otkazivanja vidljiva na profilu firme |
| Više naloga radi poklon kredita | poklon tek posle SMS verifikacije, 1 broj = 1 nalog |
| Varanje sa preporukama | kredit tek posle prvog posla/kupovine preporučenog |
| 6. javljanje u istoj sekundi kad i 5. | brojanje + naplata u jednoj DB transakciji (atomski), krediti se skidaju tek kad je mesto zauzeto |
| Stanje kredita u minus | isto — provera i skidanje u jednom koraku (npr. Postgres funkcija sa `FOR UPDATE`) |
| Uplata stigla, krediti nisu | webhook od banke + tabela transakcija + admin ručno dodavanje |
| Lažni oglasi ("plati obuku") | zabrana traženja novca od radnika, dugme "Prijavi", filter sumnjivih reči |
| Maloletnici | obavezan datum rođenja, samo 18+; čuvanje dece dodatna provera |
| Bezbednost (stranac u kući) | verifikovani profili, istorija ocena, prijava problema |
| iPhone bez obaveštenja | email/SMS rezerva + traka upozorenja |
| Gold ostane gore posle popunjavanja | auto skidanje + povrat kredita |
| Brisanje naloga sa kreditima | pravilo u uslovima korišćenja |

## 11. Redosled rada

1. ☐ Hitne ispravke (tačka 1)
2. ☑ PWA (delimično — manifest/ikonice/install banner gotovi 29.09.2026; web push obaveštenja i email rezerva preko Resend-a NISU još)
3. ☐ Statusi dostupnosti + tok posla sa izborom/potvrdom/zatvaranjem/ocenama (tačke 8–9, sad razrađeno u Sekciji 13)
4. ☑ Krediti (delimično — `credit_balance`/`credit_purchases` postoje, koriste se za dodatne oglase i Hitno; naplata za USPEŠNO DODELJIVANJE iz Sekcije 13 još ne postoji)
5. ☐ Agencije/zadruge — timovi i paketi (tačka 2, 4) — paketi po tipu naloga postoje (`lib/credits.ts`), tim/potvrda radnika ne postoji
6. ☑ Gold/Istaknuto + stvarna naplata (IPS QR, kartice) — izgrađeno, IPS QR čeka test sa pravom bankom
7. ☐ Google Play (TWA), kasnije App Store

## 12. Poslovni kontekst

- Prvi korisnici: hotelski klijenti vlasnikovog kiosk posla (GermanPro) — sobarice, recepcija, konobari za događaje. Početi u jednom gradu i jednoj grani (ugostiteljstvo/hoteli).
- Poruka prema radnicima: **"Imaš slobodna 2 sata? Zaradi."**
- Uzori: Instawork (SAD), Coople (Švajcarska), Indeed Flex (UK); za kredite Upwork Connects / Bark.
- Domen expertpro.net je 27.09.2026. bio na prodaji (Sedo, 4.800); sajt radi na expertpro.app.

---

## 13. Model "izbor jednog ponuđača" — razrada (29.09.2026)

Alen je opisao (nezavisno od Sekcije 9, ali suštinski isti pravac): kandidati se prijavljuju na
oglas, dopisuju se sa vlasnikom oglasa (problem/rešenje/cena), vlasnik bira JEDNOG, samo taj
nastavlja komunikaciju i može da bude ocenjen, oglas se briše iz svih aktivnih listi jer je posao
dodeljen. Isti model za Hitno i za obične aktivne oglase. Radnici koji nude jednostavne usluge
(spremačica, čuvanje dece, šetanje pasa) treba da mogu unapred da upišu svoju cenu u profil da bi
imali veće šanse ("Fiverr model"). Agencije — obrnut model i skuplje po kreditu.

### 13.1 Dobra vest — 90% infrastrukture već postoji

Proverio sam šemu baze i postojeći kod pre nego što sam ovo napisao, da predložim samo ono što
STVARNO nedostaje:

- **`applications` tabela već postoji** — prijava, poruka, ponuđena cena, status
  (pending/accepted/rejected/withdrawn), po (oglas, kandidat).
- **`conversations` tabela već ima `listing_id` kolonu** — chat je već pripremljen da bude vezan
  za konkretan oglas, ne samo za dvoje ljudi uopšteno. Ovo je ključno i već postoji.
- **`listings.status` već ima vrednost `'filled'`** u šemi (od ranije, nikad iskorišćena) — tačno
  ono što treba za "oglas je dodeljen, sklanja se sa liste". Sve javne liste (`/oglasi`,
  `/radnici`, početna, kategorije) već filtriraju `status = 'active'`, što znači: **čim oglas
  pređe na `filled`, automatski nestaje odsvuda, bez ijedne dodatne izmene te logike.**
  To važi identično za Hitno — Hitno je samo `type = 'urgent'` u ISTOJ `listings` tabeli, znači
  ništa posebno se ne mora graditi da bi ovaj model radio i za Hitno.
- **UI za vlasnika oglasa već postoji** — na `/oglasi/[id]` vlasnik već vidi listu prijavljenih sa
  dugmićima Prihvati/Odbij i linkom za poruku po kandidatu (`app/oglasi/[id]/page.tsx`).
- **Notifikacije za nove poruke/ocene već postoje i rade** (Krug 5) — lako se dodaje još jedna
  vrsta ("Tvoja prijava je odbijena/prihvaćena za oglas X").
- **Fiverr-model cene za jednostavne usluge VEĆ POSTOJI, samo nije istaknut** — oglas tipa
  `'offer'` ("Nudim uslugu") već ima `price_type` (satnica/dnevnica/fiksno/po dogovoru) i
  `price_amount`. Radnik koji želi da kaže "spremačica, 500 din/sat" to VEĆ MOŽE da uradi kroz
  "Nudim uslugu" oglas — polje cene je opciono i nije posebno naglašeno. Ovo znači da nije
  potrebna nova funkcija, nego bolji UX: ohrabriti/istaći unos cene (npr. "Oglasi sa cenom dobijaju
  više odgovora") za kategorije tipa čišćenje/čuvanje dece/šetanje pasa, možda ga učiniti
  podrazumevano popunjenim/obaveznim baš za te kategorije.

### 13.2 Šta STVARNO nedostaje (ono što treba graditi)

1. **"Prihvati" dugme trenutno radi samo pola posla** — menja status TE prijave na `accepted`, ali:
   - ne odbija automatski ostale prijave na isti oglas,
   - ne menja `listings.status` na `filled`,
   - ne obaveštava odbijene kandidate,
   - ne naplaćuje nikakav kredit.
   Ovo je tačno praznina koju smo već zabeležili u Krugu 6 ("životni ciklus oglasa") — sad je
   Alen dao dovoljno detalja da se konačno razradi i izgradi.

2. **Zaključavanje razgovora posle izbora** — Alen traži da SAMO izabrani kandidat može da
   nastavi razgovor i da oceni, ostali ne. Trenutno chat nema nikakvo ograničenje vezano za status
   oglasa — bilo koja dva korisnika mogu slobodno da se dopisuju zauvek. Treba dodati pravilo: ako
   je `conversation.listing_id` postavljen I taj oglas ima status `filled` I trenutni korisnik NIJE
   (vlasnik oglasa ILI izabrani kandidat za taj oglas) → nove poruke u toj konkretnoj konverzaciji
   se blokiraju (postojeći razgovor ostaje vidljiv/čitljiv kao istorija, samo se zaključava za dalje
   pisanje). Razgovori BEZ `listing_id` (opšte poruke, van konteksta oglasa) ovim se uopšte ne
   diraju.

3. **Ocena samo za pobednički par** — trenutno pravilo za ocenjivanje je "mora postojati bilo kakav
   razgovor". Treba pooštriti: ocena vezana za konkretan oglas dozvoljena je samo ako je
   `applications.status = 'accepted'` baš za taj par (vlasnik oglasa ↔ taj kandidat, za taj oglas).

4. **Naplata kredita objema stranama pri uspešnom dodeljivanju** — ovo je nova naplativa
   tačka, različita od postojećih (koje su: kredit za dodatni oglas preko limita, kredit za
   objavu Hitno oglasa). Predlog mehanizma (za odluku, ne još izgrađeno):
   - Naplata se dešava TEK kad vlasnik klikne "Prihvati" (dakle kad je posao stvarno dodeljen,
     ne pri običnoj prijavi) — ovo prirodno sprečava naplatu za prijave koje propadnu.
   - I vlasnik oglasa I izabrani kandidat plaćaju po nekoliko kredita (npr. vlasnik više, jer on
     "kupuje pristup" radniku; kandidat manje, jer je "dobio posao"), ali TAČAN broj kredita za
     svaku stranu treba tvoja odluka (videti otvorena pitanja ispod).
   - Mora biti atomska DB operacija (provera stanja + skidanje kredita u jednom koraku), isto kao
     što je već urađeno za Hitno kredite — ovo sprečava da neko "prihvati" dva puta ili ostane u
     minusu greškom.

5. **Agencije — "obrnut model"** — treba mi tvoje pojašnjenje tačno šta znači "obrnuto" u ovom
   kontekstu (videti otvoreno pitanje #4 ispod); moja pretpostavka je najbliža onome što već piše
   u Sekciji 6 ("agencija se na jedan oglas javlja jednom, ali može ponuditi VIŠE ljudi u toj
   prijavi") — dakle agencija ne šalje 5 pojedinačnih prijava za 5 svojih radnika, nego JEDNU
   prijavu sa spiskom ponuđenih radnika, a vlasnik oglasa bira jednog (ili više, ako oglas traži
   više ljudi) sa te liste. Agencija bi pri uspešnom dodeljivanju plaćala VIŠE kredita po
   dodeljivanju nego fizičko lice (već postoji presedan za ovo — agencije već imaju veće/skuplje
   pakete kredita, `lib/credits.ts`).

### 13.3 Da li se ovo kosi sa nečim postojećim? (provereno)

**Ne, nema stvarnog sukoba.** Konkretno sam proverio:

- Sve javne liste oglasa već filtriraju `status = 'active'`, pa `filled` oglas automatski nestaje
  svuda (početna, `/oglasi`, `/radnici` gde se prikazuju oglasi, kategorije) — nula dodatnog rada
  za "brisanje iz aktivnih rubrika".
- Hitno koristi ISTU `listings`/`applications` infrastrukturu — model se ne mora posebno graditi
  za Hitno, primenjuje se automatski čim se izgradi za obične oglase.
- Postojeći sistem ocenjivanja i notifikacija se samo PROŠIRUJE (dodatno pravilo), ne ruši se
  ništa što već radi.
- Jedina stvarna promena ponašanja koja MOŽE iznenaditi korisnike: chat trenutno nema nikakva
  ograničenja, posle ovoga će odbijeni kandidati izgubiti mogućnost daljeg dopisivanja za taj
  KONKRETNI oglas (ali ne i uopšte — mogu da se dopisuju dalje ako imaju opštu konverzaciju bez
  vezanog oglasa, ili da apliciraju na drugi oglas). Ovo je tačno ono što je Alen tražio, samo
  napominjem da je to jedina vidljiva promena ponašanja za postojeće korisnike.
- Naplata kredita pri dodeljivanju je NOVI trošak za korisnike koji ga do sada nisu imali —
  preporuka: najaviti ovo jasno u UI-ju pre nego što se uključi (npr. "od DATUMA, uspešno
  dodeljivanje posla košta X kredita"), i dati svima prelazni period besplatnih kredita (isti
  pristup koji je već planiran u Sekciji 4 za ostatak kreditnog sistema).

### 13.4 Otvorena pitanja — treba tvoja odluka pre nego što se počne graditi

1. **Da li izabrani kandidat mora da POTVRDI izbor** (npr. u roku od 2h/24h, kao što Sekcija 9 već
   predviđa), ili je klik vlasnika na "Prihvati" odmah konačan i oglas se odmah gasi? Ako nema
   potvrde: šta se dešava ako izabrani kandidat u međuvremenu više nije zainteresovan/dostupan —
   da li vlasnik može da "poništi" izbor i vrati oglas u aktivne, pa izabere drugog?
2. **Tačan broj kredita** za vlasnika oglasa i za izabranog kandidata pri uspešnom dodeljivanju
   (predlog kao polazna tačka: 2-3 kredita vlasnik, 1 kredit kandidat — ali ovo direktno utiče na
   prihod pa je tvoja odluka).
3. **Šta ako izabrani kandidat nema dovoljno kredita u trenutku izbora** — blokirati dodeljivanje
   dok ne dopuni, pustiti da mu stanje ode u minus (pa mu se zabrani sledeća akcija dok ne dopuni),
   ili naplatiti kandidatu tek KASNIJE (npr. kad sledeći put kupuje kredite, kao dug)?
4. **Tačno značenje "obrnutog modela" za agencije** — da li je to (a) agencija šalje jednu prijavu
   sa više ponuđenih radnika (moja pretpostavka, već ima presedan u Sekciji 6), (b) agencija
   umesto da se prijavljuje NA oglase, prima direktne ponude firmi (obrnut tok — firma bira iz
   spiska agencijinih radnika bez oglasa), ili nešto treće?
5. **Da li ovo pravilo (naplata pri dodeljivanju) važi i za oglase tipa "Nudim uslugu"** gde se
   ULOGE obrnu (radnik je vlasnik oglasa, firma/fizičko lice se "prijavljuje" da unajmi radnika) —
   ili se naplata odnosi samo na "Tražim radnika" oglase? Ovo utiče na to ko konkretno plaća šta u
   svakom od dva smera.

### 13.5 Predloženi redosled građenja (kad se otvorena pitanja reše)

1. Dovršiti "Prihvati" akciju: auto-odbijanje ostalih prijava + notifikacija + `listings.status = 'filled'`.
2. Zaključavanje razgovora za oglase u statusu `filled` (samo za gubitničke kandidate).
3. Pooštravanje pravila za ocenjivanje (samo pobednički par, po oglasu).
4. Naplata kredita objema stranama pri dodeljivanju (atomska DB funkcija, po tvojoj odluci iz 13.4 tačke 2-3).
5. Isticanje/ohrabrivanje unosa cene za jednostavne usluge (Fiverr-model) — UX izmena, bez nove šeme.
6. Agencijska varijanta (kad razjasnimo tačno šta "obrnuto" znači) + veća cena po kreditu za agencije.

> **⚠️ NAPOMENA (29.09.2026, Claude) — 13.2 tačka 4 i 13.4 tačke 2-3 i 13.5 tačka 4 su PREVAZIĐENE.**
> Alen je pročitao ceo ovaj plan i dao FINALNU odluku — obostrana naplata kredita pri dodeljivanju
> se NE GRADI (usporila bi rast baš kad sajt treba da privuče obe strane). Umesto toga važi model
> iz Sekcije 14 ispod. Ostatak Sekcije 13 (13.1, 13.3, delovi 13.2 osim naplate, tačke 1-3 i 5-6 iz
> redosleda iznad) i dalje važi bez izmena — samo mehanizam naplate iz tačke 4 otpada.

---

## 14. FINALNE odluke Alena o modelu "izbor jednog ponuđača" i monetizaciji (29.09.2026)

Alen je pročitao `STATUS-EXPERTPRO.md` i ovaj plan (Sekcija 13) i doneo odluke ispod. Ovo je
**dogovoreni pravac za građenje** — sledeći korak (kad Alen da "kreni") je da se ovo pretoči u
konkretan build plan (šema, server akcije, UI), ne još sama izgradnja.

### 14.1 Tok izbora kandidata — potvrđeno

- Prijava i dopisivanje ostaju besplatni za obe strane.
- Vlasnik oglasa bira JEDNOG kandidata ("Prihvati") → **izabrani kandidat mora da potvrdi**
  angažman u aplikaciji (ovim se rešava otvoreno pitanje 13.4 #1 — potvrda OSTAJE, isto kao što
  Sekcija 9 već predviđa).
- **Ključna izmena u odnosu na moj originalni predlog:** ostali (neizabrani) kandidati se NE
  odbijaju odmah kad vlasnik klikne "Prihvati" — čekaju u statusu "na čekanju" sve dok izabrani
  kandidat ne potvrdi. Tek posle potvrde izabranog, ostali se automatski odbijaju i obaveštavaju.
  Ako izabrani kandidat odustane/ne potvrdi na vreme, vlasnik može odmah izabrati drugog iz
  liste koja je i dalje netaknuta (ništa nije "potrošeno" u međuvremenu).
- Ocena je moguća tek kad je "posao završen" (ne odmah po potvrdi izbora) — usklađeno sa
  Sekcijom 9 tačka 7.
- Chat-zaključavanje (13.2 tačka 2) i pooštravanje ocenjivanja (13.2 tačka 3) i dalje važe, samo
  se okidač za "ostali otpadaju" pomera sa trenutka izbora na trenutak potvrde izabranog.

### 14.2 Monetizacija — NEMA naplate obema stranama, bar ne sada

Razlog: naplata na oba kraja bi usporila rast baš kad sajtu trebaju i tražioci pomoći i ponuđači
rada. Model po tipu angažmana:

- **Radnički/smenski oglasi (firma traži radnike za smenu/posao)** — kandidat (radnik) se NE
  naplaćuje NIKAD za samo dobijanje posla preko platforme, ni sad ni kasnije. Razlog: Nacionalna
  služba za zapošljavanje (NSZ) zabranjuje naplatu posredovanja licu koje traži zaposlenje.
  **Napomena za sledećeg agenta/programera: Alen traži da se ovo pravno proveri sa advokatom pre
  nego što se generalizuje na sve vrste angažmana** — nije još 100% potvrđeno da li se ista
  zabrana odnosi i na majstorske/frilenser usluge (videti tačku ispod) ili samo na klasično
  radno angažovanje.
- **Majstorske/frilenser usluge (npr. Sekcija 13 "Fiverr model" — spremačica, majstor, šetanje
  pasa i sl.)** — I dodeljivanje I potvrda ostaju besplatni ZA SADA. Kasnije (posle testiranja,
  kad tržište "oživi") planirana je MALA naplata SAMO poslovnoj/profesionalnoj strani
  (majstoru/frilenseru), sa besplatnim mesečnim limitom pre nego što naplata počne — NE procenat
  od vrednosti posla (eksplicitno odbijeno — Upwork Connects i TaskRabbit modeli su pomenuti kao
  referenca ali NISU direktno prenosivi na ExpertPro, ne kopirati ih 1:1).
- **Nikad negativno stanje kredita** — eksplicitno odbijeno kao koncept (dug/spor/knjigovodstvo
  je previše komplikovano). Kad god se uvede bilo kakva naplata, mora biti atomska provera+naplata
  u jednom koraku (provera stanja I skidanje kredita u istoj DB transakciji) — ako nema dovoljno
  kredita, akcija se jednostavno ne dešava, nema duga.
- Ovim se 13.4 pitanje #2 (tačan broj kredita) i #3 (šta ako nema kredita) više NE POSTAVLJAJU u
  ovoj fazi — nema naplate, pa nema ni tih problema. Vratiti se na njih tek kad/ako Alen odluči
  da uključi plaćene nivoe za majstorsku/frilenser stranu.
- 13.4 pitanja #4 (obrnut model za agencije) i #5 (da li naplata važi i za "Nudim uslugu" oglase)
  Alen NIJE eksplicitno adresirao u ovoj poruci — i dalje su otvorena, ali njegova opšta filozofija
  ("besplatno dok tržište ne oživi, naplata poslovnoj strani kasnije") sugeriše da će se agencije
  (već postoji presedan skupljih paketa u `lib/credits.ts`) naplaćivati više tek kad se uopšte
  uvedu plaćeni nivoi — ne pre toga.

### 14.3 "Berza aktivnih poslova" — prihvaćeno

Odvojeno od Hitno: za NEhitne, obične zahteve (traži se električar/majstor i sl.) oglas ostaje
otvoren i vidljiv dok neko ne bude prihvaćen i potvrđen (nema isteka po vremenu kao kod smenskih
oglasa iz Sekcije 9). Sigurnosna mreža protiv "zombi" oglasa: posle 7 dana neaktivnosti (niko se
nije javio / vlasnik nije reagovao) sistem šalje podsetnik i AUTOMATSKI PAUZIRA oglas (ne briše ga)
— vlasnik ga lako vraća u aktivne kad hoće. Ovo se nadovezuje na već postojeći `listings.status`
enum (dodaje se npr. `'paused'` ako već ne postoji ekvivalent, proveriti pre građenja).

### 14.4 Program preporuke (poz drugara) — smanjeno sa 5+5 na 1+1

Moj originalni predlog (5+5 kredita) je bio previše darežljiv u odnosu na cenu najmanjeg
pojedinačnog kreditnog paketa. Finalna odluka:

- **1 kredit i pozivaocu i novom korisniku** (ne 5+5).
- Nagrada se dodeljuje TEK kad su ISPUNJENA OBA uslova: (a) novi korisnik potvrdi broj telefona
  (SMS verifikacija, već postoji presedan u Sekciji 10 "poklon tek posle SMS verifikacije"), I
  (b) novi korisnik ima PRVU STVARNU aktivnost na sajtu (npr. objavljen oglas, poslata prijava —
  tačna definicija "stvarne aktivnosti" ostaje da se precizira pre građenja). Sama verifikacija
  telefona NIJE dovoljna — mora postojati i dokaz stvarne namere korišćenja.
- Mora postojati GORNJA GRANICA ukupnog broja nagrada po nalogu (tačan broj nije naveden od
  Alena — pitati pre građenja, ili predložiti razuman default npr. 20 preporuka/nalog i tražiti
  potvrdu).
- Cilj: sprečiti prevaru tipa "upisao je samo email" — nagrada je vezana za PROVERLJIVU stvarnu
  registraciju + aktivnost, ne za puki unos podatka.

### 14.5 Status SQL migracija (za istoriju — videti STATUS-EXPERTPRO.md za najnovije)

Tri migracije (`migration_fix_listings_admin_rls.sql`, `migration_avatar_storage.sql`,
`migration_verify_oauth_backfill.sql`) su pokrenute i SQL-proverene (potvrđeno u
STATUS-EXPERTPRO.md, dodatno ojačane i verifikovane od strane Codex agenta 29.09.2026 — pogledati
commit `cc7d4b87`). Preostaju STVARNI test-klikovi u UI-ju: admin Pauziraj/Obriši, upload slike
email/lozinka nalogom, prikaz OAuth bedža — videti STATUS-EXPERTPRO.md tačke 1-3 u "Predloženom
redosledu sledećih koraka".

### 14.6 Sledeći korak

Ovo je i dalje SAMO plan/odluka, ništa od Sekcije 14 još nije građeno (Alen je eksplicitno tražio
promišljen odgovor pre građenja: "Nisam sada menjao cene, kod ni produkciju"). Pre početka
građenja treba: (1) potvrditi live-klik testove iz 14.5, (2) precizirati "stvarnu aktivnost" iz
14.4 i gornju granicu nagrada, (3) po mogućstvu dobiti pravni odgovor o NSZ pravilu iz 14.2 pre
nego što se odluka o besplatnoj radničkoj strani generalizuje na majstorske usluge, (4) tek onda
tražiti od Alena eksplicitno "kreni" da se počne sa redosledom iz 13.5 (bez tačke 4/naplate,
zamenjeno modelom iz 14.2).
