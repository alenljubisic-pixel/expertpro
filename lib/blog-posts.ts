export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  category: string
  icon: string
  city?: string
  audience: 'client' | 'worker'
  searchHref: string
  content: string
}

// Every article was substantially written or revised on this date. Do not
// fabricate historical publication dates or change this merely to look fresh.
export const BLOG_UPDATED_AT = '2026-10-01'

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'kako-naci-honorarni-posao-u-srbiji',
    title: 'Kako naći honorarni posao u Srbiji u 2026: praktičan početak',
    excerpt: 'Kako opisati veštine, dostupnost i cenu, pa se prijaviti za konkretan kratkoročan posao bez nejasnih obećanja.',
    category: 'Vodič', icon: '💼', audience: 'worker', searchHref: '/oglasi?type=request',
    content: `## Počnite od posla koji zaista možete da uradite

Honorarni angažman može trajati nekoliko sati, vikend ili više dana. Nije isto nositi kutije, montirati policu i raditi električne instalacije. U profilu navedite samo poslove za koje imate znanje, alat i realnu dostupnost. Kratka, jasna ponuda uliva više poverenja nego dugačak spisak svega što biste možda mogli.

## Kako da se predstavite

- Napišite grad i deo grada iz kog krećete, kao i koliko daleko možete da putujete.
- Obeležite kada ste slobodni: pre podne, posle podne, radnim danima ili vikendom.
- Navedite da li donosite alat, vozilo ili radite u paru.
- Ako imate iskustvo, opišite jedan konkretan posao koji ste završili, bez tuđih ličnih podataka.

## Prijava koja pomaže klijentu da odluči

Pročitajte ceo oglas pre prijave. U poruci odgovorite na tri pitanja: možete li doći u traženom terminu, šta je uključeno u vašu ponudu i šta morate videti pre konačne cene. Ako posao zavisi od materijala ili stanja na licu mesta, recite to odmah. Dogovor i ocena vezani su za konkretan posao, a ne za opšte dopisivanje među korisnicima.

## Proverite uslove pre prihvatanja

Za duži angažman razjasnite ko obezbeđuje opremu, prevoz, pauze i način isplate. Ako je potreban ugovor ili posebna dozvola za rad, proverite odgovarajuće obaveze pre početka. Na ExpertPro možete pregledati aktivne zahteve i prijaviti se tamo gde vaša veština zaista odgovara.`,
  },
  {
    slug: 'rad-od-kuce-opcije-srbija',
    title: 'Rad od kuće u Srbiji 2026: koje usluge možete ponuditi',
    excerpt: 'Administracija, dizajn, instrukcije i IT podrška: kako odrediti opseg udaljenog posla i dogovoriti rezultat.',
    category: 'Rad od kuće', icon: '🏠', audience: 'worker', searchHref: '/oglasi?type=request',
    content: `## Nije svaki posao „od kuće“ isti

Neki zadaci se isporučuju kao datoteka, drugi traže zakazani razgovor ili svakodnevnu dostupnost. Pre objave ponude odredite šta tačno predajete: preveden dokument, dizajn, sređenu tabelu, čas ili rešenu tehničku smetnju. Klijentu je rezultat važniji od naziva zanimanja.

## Usluge koje možete jasno opisati

- Administrativna pomoć: unos i sređivanje podataka, uz rok i format isporuke.
- Online časovi: predmet, uzrast polaznika, trajanje i način održavanja.
- Grafički dizajn: broj predloga, izmene i konačni formati.
- IT podrška: šta može na daljinu, a za šta je potreban dolazak.

## Dogovorite granice pre početka

Kada neko traži „pomoć oko sajta“, to može značiti jedno podešavanje ili više nedelja rada. Tražite primer problema i definišite šta je uračunato u cenu. Za pristup tuđim nalozima koristite najmanje potrebne dozvole i nikada ne tražite da vam neko javno pošalje lozinku. Dogovor o roku i načinu provere rezultata napišite uz prijavu.

## Kako do prvog klijenta

Objavite jednu konkretnu uslugu umesto opšte poruke „radim sve online“. Dodajte primer rada koji smete da pokažete, označite dostupnost i odgovorite samo na oglase koje možete pouzdano završiti.`,
  },
  {
    slug: 'kako-zaraditi-dodatni-novac',
    title: 'Dodatni posao pored redovnog: kako planirati vreme u 2026.',
    excerpt: 'Praktične ideje za popodnevni i vikend rad, uz realnu procenu putovanja, opreme i obaveza.',
    category: 'Vodič', icon: '💰', audience: 'worker', searchHref: '/oglasi?type=request',
    content: `## Izaberite raspored pre vrste posla

Dodatni posao nije dobra zarada ako zbog puta, nabavke materijala i odmora pojede više vremena nego što ste planirali. Zapišite koliko sati nedeljno zaista imate i da li možete da radite samo radnim danima, vikendom ili u određenom delu dana. Onda birajte zadatke koji u taj okvir staju.

## Šta se može raditi povremeno

Pomoć pri selidbi, montaža nameštaja, sređivanje dvorišta, čišćenje, šetanje pasa, instrukcije i administrativna pomoć razlikuju se po potrebnoj opremi i odgovornosti. Birajte oblast u kojoj već imate iskustvo. Ako čuvate dete ili pomažete starijoj osobi, dogovor o bezbednosti i odgovornostima važniji je od brzog početka.

## Računajte ceo angažman

U cenu uračunajte put, materijal koji sami kupujete i vreme potrebno za pripremu. Kod nejasnog zahteva prvo tražite fotografije ili kratak opis, pa navedite da konačna cena zavisi od obima. Ne obećavajte zaradu ili broj klijenata koje ne možete proveriti.

## Prvi korak

Napravite profil sa jednim ili dva jasna tipa usluge i označite stvarnu dostupnost. Pratite aktivne zahteve u svom gradu, pošaljite konkretnu prijavu i pre prihvatanja potvrdite termin i način isplate.`,
  },
  {
    slug: 'jednodnevni-angazmani-srbija',
    title: 'Jednodnevni angažman u Srbiji: šta dogovoriti pre početka',
    excerpt: 'Lista pitanja za kratke poslove: broj ljudi, oprema, trajanje, lokacija i način isplate.',
    category: 'Kratki poslovi', icon: '⚡', audience: 'client', searchHref: '/oglasi?type=request',
    content: `## Kratak posao traži precizan oglas

„Treba mi pomoć sutra“ ne govori kandidatu dovoljno. Napišite šta treba uraditi, gde se radi, kada se počinje i koliko okvirno traje. Za istovar navedite sprat, lift, težinu tereta i da li je dostavno vozilo već zakazano. Za događaj opišite smenu, fizičke zahteve i potrebnu odeću ili opremu.

## Pre izbora kandidata razjasnite

- Koliko je ljudi potrebno i da li moraju doći zajedno.
- Ko obezbeđuje alat, zaštitnu opremu i materijal.
- Da li postoji fiksan završetak ili posao zavisi od količine robe.
- Kako će se potvrditi završetak i kada sledi isplata.

## Bezbednost i odgovornost

Ne zamenjujte kvalifikovanog električara, rukovaoca mašinom ili zdravstvenog radnika nekvalifikovanom ispomoći. Za poslove sa posebnim rizikom proverite obuku i odgovarajuće uslove rada. Ako angažman nije samo jednokratan, unapred razmotrite odgovarajući ugovor ili drugi zakonit osnov.

## Objavite potrebu, ne opštu želju

Na ExpertPro zahtev mogu videti zainteresovani radnici i poslati prijavu sa porukom i opcionom cenom. Uporedite odgovore i izaberite kandidata tek kada su obim i termin jasni.`,
  },
  {
    slug: 'cuvanje-dece-i-ljubimaca-posao',
    title: 'Čuvanje dece i ljubimaca: kako napisati bezbedan oglas u 2026.',
    excerpt: 'Deca i životinje traže različite veštine; saznajte koje informacije treba navesti i šta proveriti pre dogovora.',
    category: 'Porodica i ljubimci', icon: '🐾', audience: 'client', searchHref: '/oglasi?type=offer',
    content: `## Ne spajajte dve različite odgovornosti u jedan oglas

Čuvanje deteta i briga o psu mogu biti povremeni poslovi, ali zahtevaju potpuno različite informacije. Napravite zaseban zahtev za svaku potrebu. Tako se javljaju ljudi sa odgovarajućim iskustvom i lakše se dogovaraju termin, obaveze i cena.

## Za čuvanje dece navedite

Uzrast i broj dece, tačan termin, da li se očekuje priprema obroka, preuzimanje iz vrtića ili samo prisustvo kod kuće. Pre odluke razgovarajte o iskustvu, referencama, kontaktu za hitne situacije i pravilima doma. Nemojte javno objavljivati ime deteta, adresu stana ili druge osetljive podatke.

## Za ljubimce navedite

Vrstu i veličinu životinje, navike, trajanje šetnje ili boravka, kontakt veterinara i eventualne posebne potrebe. Proverite gde će životinja biti smeštena i ko je prisutan tokom čuvanja. Probni susret, kada je moguć, korisniji je od nejasnog obećanja da neko „voli životinje“.

## Završite dogovor jasno

Zapišite vreme dolaska, obim posla i cenu pre izbora osobe. Ocena na platformi ima smisla tek nakon stvarno završenog dodeljenog posla.`,
  },
  {
    slug: 'freelancing-u-srbiji-vodic',
    title: 'Frilenserska usluga u Srbiji 2026: od ponude do prvog dogovora',
    excerpt: 'Kako definisati obim, rok i rezultat projekta bez izmišljenog portfolija ili nejasne cene.',
    category: 'Vodič', icon: '🖥️', audience: 'worker', searchHref: '/oglasi?type=request',
    content: `## Počnite od merljivog rezultata

„Radim marketing“ je teško uporediti sa drugim ponudama. „Pripremam pet opisa proizvoda do petka“ klijentu odmah govori šta dobija. Slično važi za dizajn, prevođenje, obradu fotografija, unos podataka i tehničku podršku. U ponudi definišite rezultat, broj izmena i način predaje.

## Portfolio koji ne obmanjuje

Ako tek počinjete, napravite demonstracioni rad i jasno ga označite kao vežbu. Ne prikazujte tuđi projekat kao svoj niti izmišljajte preporuke. Kratka priča o procesu i primer vašeg rada vredniji su od generičke tvrdnje da imate mnogo zadovoljnih klijenata.

## Dogovor o ceni i roku

Tražite materijale i očekivanja pre konačne ponude. Za poslove sa neizvesnim obimom predložite faze: prvo mali, jasno definisan zadatak, zatim odluka o nastavku. Sačuvajte pisani dogovor o rokovima, izmenama i načinu plaćanja. Za poreske i ugovorne obaveze konsultujte stručnjaka za konkretan oblik rada.

## Na platformi

U profilu opišite specijalizaciju, a na aktivan zahtev odgovorite porukom koja rešava baš taj problem. Ne šaljite istu generičku prijavu svima.`,
  },
  {
    slug: 'hitni-poslovi-srbija',
    title: 'Hitni poslovi u Srbiji 2026: kako objaviti jasan zahtev',
    excerpt: 'Kada je posao stvarno hitan, precizna lokacija, vreme i opis problema važniji su od velikih obećanja.',
    category: 'Hitno', icon: '🚨', audience: 'client', searchHref: '/oglasi?type=request',
    content: `## Hitno ne znači nejasno

Kod kvara ili iznenadne potrebe za radnicima lako je napisati samo „potrebno odmah“. Kandidatu su ipak potrebni grad, okvirna lokacija, termin, opis zadatka i fotografija kada je bezbedno napraviti je. Što je oglas precizniji, manje vremena odlazi na dodatna pitanja.

## Šta navesti u prvoj rečenici

Napišite šta ne radi ili šta mora biti završeno, do kada, i da li je potreban poseban alat ili vozilo. Za električni kvar ili curenje vode ne pokušavajte popravku bez stručnog znanja; prvo preduzmite bezbedne korake i pozovite nadležnu hitnu službu ako postoji neposredna opasnost.

## Uporedite dostupnost, ne samo cenu

Najniža ponuda nije korisna ako osoba ne može doći na vreme ili ne radi traženu vrstu posla. Pitajte šta je uključeno u cenu, da li se naplaćuje dolazak i kada izvođač može realno da stigne. Ne pretpostavljajte da oznaka „hitno“ sama garantuje odgovor.

## Posle izbora

Dogovorite obim i cenu uz konkretan oglas. Kada posao bude završen, zatvorite ga i ostavite ocenu na osnovu stvarnog iskustva.`,
  },
  {
    slug: 'fizicki-radnici-srbija',
    title: 'Kako angažovati fizičke radnike za dan ili više dana u 2026.',
    excerpt: 'Razlika između istovara, selidbe, magacinske ispomoći i višednevnog angažmana — uz kontrolnu listu za oglas.',
    category: 'Radnici', icon: '🏗️', audience: 'client', searchHref: '/oglasi?type=request',
    content: `## Koliko ljudi, koliko sati, kakav teret

„Trebaju fizički radnici“ privlači prijave koje se teško porede. Precizirajte da li je u pitanju istovar, prenos nameštaja, pakovanje, rad u magacinu ili pomoć na gradilištu. Navedite broj radnika, očekivano trajanje, sprat, lift, pristup vozilu i najveće komade tereta.

## Oprema i bezbednost

Razjasnite ko obezbeđuje rukavice, obuću, kolica i drugu opremu. Rad na visini, rukovanje mašinama i električne instalacije nisu posao za neobučenu ispomoć. Ako zadatak traži kvalifikaciju ili posebne uslove, to navedite u oglasu i proverite pre izbora.

## Kratko ili duže

Za jedan vikend najvažniji su termin i tačan obim. Za pet dana ili tri meseca dodajte radno vreme, mesto rada, nadzor, način isplate i odgovarajući pravni osnov angažovanja. Ako nudite grupu radnika, objasnite ko je njihov poslodavac i ko preuzima obaveze; ne predstavljajte to samo kao „rentiranje ljudi“.

## Uporedive prijave

Od kandidata tražite da potvrde broj dostupnih ljudi, iskustvo sa sličnim teretom i šta je uključeno u cenu. Tako se odluka zasniva na stvarnom zadatku, a ne na nagađanju.`,
  },
  {
    slug: 'popravka-bojlera-beograd',
    title: 'Popravka bojlera u Beogradu: kako opisati kvar majstoru',
    excerpt: 'Bojler ne greje, kaplje ili izbacuje osigurač? Sastavite bezbedan i precizan zahtev pre izbora majstora.',
    category: 'Majstori', icon: '🚿', city: 'Beograd', audience: 'client', searchHref: '/oglasi?type=offer&city=Beograd',
    content: `## Prvo bezbednost, zatim dijagnoza

Ako bojler curi u blizini električnih delova, oseća se miris paljevine ili zaštita stalno isključuje struju, nemojte ga otvarati niti ponovo uključivati. Sa bezbednog mesta isključite napajanje ako znate kako, a za dalji pregled angažujte kvalifikovanog majstora. Ovaj tekst nije uputstvo za popravku.

## Šta upisati u oglas

Navedite tip i približnu starost bojlera, da li ne greje, sporo greje, curi ili izbacuje osigurač, kao i kada se problem prvi put pojavio. Fotografija spoljašnjeg stanja i oznake modela može pomoći, ali ne fotografišite otvorene električne delove. Napišite opštinu u Beogradu i kada neko može da bude u stanu; tačna adresa nije potrebna javno.

## Kako uporediti odgovore

Pitajte da li kandidat radi električni i vodovodni deo, da li naplaćuje izlazak i pregled, i kako se obračunavaju delovi. Konačan trošak često zavisi od pregleda, pa unapred dogovorite šta se plaća ako popravka nije moguća. Tražite da majstor objasni nalaz i, kada je primenljivo, izda račun ili potvrdu za ugrađeni deo.

## Kada je potreban novi bojler

Ne odlučujte samo na osnovu jedne poruke. Uporedite procenu popravke, stanje uređaja i uslove garancije. Na ExpertPro možete pregledati ponude u Beogradu ili objaviti konkretan zahtev i uporediti prijave.`,
  },
  {
    slug: 'vodoinstalater-novi-sad-curenje-vode',
    title: 'Curenje vode u Novom Sadu: šta napisati vodoinstalateru',
    excerpt: 'Razlikujte kapanje, puknutu cev i odvod; pripremite opis i fotografije koje skraćuju dogovor.',
    category: 'Majstori', icon: '💧', city: 'Novi Sad', audience: 'client', searchHref: '/oglasi?type=offer&city=Novi%20Sad',
    content: `## Gde voda izlazi i koliko brzo

Nije isto kada kaplje slavina, voda ide ispod lavaboa ili se pojavljuje na zidu. U Novom Sadu, kao i drugde, dobar prvi opis treba da kaže u kojoj prostoriji je problem, da li je dovod ili odvod i da li curenje traje stalno. Ako voda ugrožava instalacije ili susede, zatvorite ventil ako to možete bezbedno i pozovite odgovarajuću hitnu službu ili upravnika zgrade.

## Podaci koji štede vreme

- Fotografija mesta curenja i širi kadar koji pokazuje pristup.
- Informacija da li postoji glavni ili lokalni ventil.
- Da li je problem u stanu, kući ili zajedničkoj vertikali.
- Deo grada i termin kada možete primiti majstora.

## Cena bez iznenađenja

Tražite odvojenu informaciju o dolasku, dijagnostici, radu i materijalu. Ako nije poznato šta je iza zida, okvirna cena nije isto što i konačna ponuda. Pitajte ko nabavlja deo i šta se radi ako popravka zahteva otvaranje obloge ili dodatnog radnika.

## Posle intervencije

Proverite sa majstorom da li se curenje zaustavilo pod normalnim pritiskom i sačuvajte podatke o urađenom poslu. Ako je problem na zajedničkoj instalaciji, odgovornost može biti drugačija nego u privatnom delu stana; proverite to sa upravnikom.`,
  },
  {
    slug: 'elektricar-beograd-iskace-osigurac',
    title: 'Iskače osigurač u Beogradu: kako pronaći električara',
    excerpt: 'Kako bezbedno opisati električni kvar i koje informacije majstoru znače pre dolaska.',
    category: 'Majstori', icon: '⚡', city: 'Beograd', audience: 'client', searchHref: '/oglasi?type=offer&city=Beograd',
    content: `## Ne tretirajte ponavljanje kvara kao sitnicu

Ako osigurač više puta isključuje, utičnica se greje ili se oseća miris paljevine, nemojte improvizovati sa instalacijom. Isključite uređaj samo ako je to bezbedno, a pregled prepustite kvalifikovanom električaru. Za neposrednu opasnost od požara pozovite nadležne službe.

## Oglas koji pomaže dijagnostici

Navedite da li problem nastaje kada uključite određeni uređaj, samo u jednoj prostoriji ili u celom stanu. Dodajte tip objekta, okvirnu starost instalacije ako je znate i da li imate pristup razvodnoj tabli. Fotografija table spolja može pomoći; nemojte skidati poklopce radi oglasa. Za termin je korisna beogradska opština, ne javna adresa.

## Šta pitati pre dolaska

Da li majstor radi dijagnostiku, zamenu utičnice, popravku table ili samo određenu vrstu radova? Pitajte kako naplaćuje izlazak, materijal i eventualnu dodatnu posetu. Ako je objekat poslovni, navedite kada struja sme da bude isključena i ko odobrava radove.

## Po završetku

Tražite objašnjenje uzroka, opis zamenjenih delova i informaciju da li je potrebna dodatna provera instalacije. Ne ocenjujte samo brzinu dolaska; važni su bezbedan rad i jasan dogovor.`,
  },
  {
    slug: 'servis-klime-nis',
    title: 'Servis klime u Nišu: čišćenje, slab učinak i dogovor o terminu',
    excerpt: 'Kada je potreban pregled klime i šta navesti da bi serviser dao korisnu ponudu.',
    category: 'Majstori', icon: '❄️', city: 'Niš', audience: 'client', searchHref: '/oglasi?type=offer&city=Ni%C5%A1',
    content: `## Opišite simptom, ne pretpostavljeni kvar

Klima koja slabo hladi, curi u sobu ili neprijatno miriše ne mora imati isti uzrok. U oglasu navedite marku i model ako su dostupni, približnu starost uređaja, kada je poslednji put servisiran i tačno šta primećujete. Ne otvarajte električni deo niti samostalno dopunjavajte rashladni medijum.

## Pristup je važan

Serviseru recite da li je spoljašnja jedinica na balkonu, fasadi ili teško dostupnom mestu. Navedite sprat i postoji li bezbedan pristup; rad na visini zahteva odgovarajuću opremu. U Nišu navedite deo grada i vreme kada možete obezbediti pristup unutrašnjoj i spoljašnjoj jedinici.

## Šta znači „servis“

Pitajte da li ponuda obuhvata pregled, čišćenje, dezinfekciju, proveru odvoda kondenzata i merenja. Ako se tek posle pregleda utvrdi potreba za delom, dogovorite da vas majstor obavesti pre dodatnog troška. Samo „punjenje klime“ bez utvrđivanja razloga slabog rada može biti pogrešno očekivanje.

## Uporedite prijave

U prijavi tražite prvi slobodan termin, opis šta je uključeno i način obračuna ako je kvar složeniji. Tako možete izabrati servisera za stvarni problem, a ne samo najkraću reklamu.`,
  },
  {
    slug: 'generalno-ciscenje-stana-novi-sad',
    title: 'Generalno čišćenje stana u Novom Sadu: precizan opis posla',
    excerpt: 'Kvadratura nije dovoljna: šta navesti za čišćenje posle selidbe, renoviranja ili redovno održavanje.',
    category: 'Dom', icon: '🧹', city: 'Novi Sad', audience: 'client', searchHref: '/oglasi?type=offer&city=Novi%20Sad',
    content: `## Tri različita posla

Redovno održavanje, generalno čišćenje i čišćenje posle građevinskih radova zahtevaju različito vreme i sredstva. Ako je stan posle krečenja, navedite da li ima šuta, tragova boje ili samo prašine. Ako je stan namešten, napišite koliko soba, kupatila i prozora treba očistiti.

## Šta posebno dogovoriti

- Da li se čiste unutrašnjost rerne, frižidera, ormara i prozori.
- Ko obezbeđuje sredstva, usisivač i merdevine.
- Da li je potreban jedan radnik ili tim i koliko sati je stan dostupan.
- Postoje li osetljive površine ili alergije na određena sredstva.

## Fotografije i privatnost

Širi kadrovi prostora pomažu proceni obima, ali sklonite lične dokumente i vrednosti iz kadra. Javnom oglasu je dovoljan deo Novog Sada; punu adresu dogovorite tek sa izabranom osobom. Ako je potreban ulazak u prazan stan, unapred dogovorite predaju ključa i proveru urađenog.

## Uporedite cenu po obimu

Pitajte šta ulazi u ponuđeni iznos i šta se posebno naplaćuje. Kratka kontrolna lista na kraju sprečava spor oko toga da li su, na primer, prozori ili terasa bili uključeni.`,
  },
  {
    slug: 'selidba-beograd-pomoc-radnici',
    title: 'Selidba u Beogradu: kako angažovati pomoćne radnike',
    excerpt: 'Pripremite oglas sa spratovima, liftom, teretom i terminom da ponude za selidbu budu uporedive.',
    category: 'Selidbe', icon: '📦', city: 'Beograd', audience: 'client', searchHref: '/oglasi?type=offer&city=Beograd',
    content: `## Broj kutija nije cela priča

Za selidbu su važni najveći komadi nameštaja, pristup zgradi i rastojanje od vozila do ulaza. Navedite polaznu i odredišnu beogradsku opštinu, spratove, lift i da li je potreban kombi ili samo radna snaga. Tačne adrese ne stavljajte u javni tekst.

## Razdvojite usluge

Jedni radnici samo nose, drugi mogu pakovati, rastavljati nameštaj ili obezbediti prevoz. U oglasu jasno napišite šta očekujete. Posebno označite teške predmete, lomljive stvari i eventualna ograničenja za parkiranje, bez tvrdnje da je dozvola obezbeđena ako nije.

## Koliko ljudi treba

Za više teških komada jedan radnik možda nije bezbedna opcija. Pitajte kandidate da li dolaze u paru, imaju kolica, trake i zaštitu za podove. Dogovorite da li se cena računa po satu, smeni ili celom poslu, kao i šta se dešava ako se utovar produži.

## Dan selidbe

Pre početka fotografišite stanje osetljivih predmeta i proverite prolaz kroz vrata i stepenište. Na kraju prođite kroz listu stvari i potvrdite da je posao završen. Tako i kratkoročan angažman ima jasan završetak.`,
  },
  {
    slug: 'dva-fizicka-radnika-vikend-novi-sad',
    title: 'Dva fizička radnika za vikend u Novom Sadu: oglas za istovar',
    excerpt: 'Primer strukture zahteva za dva radnika: roba, pristup, vreme dolaska, oprema i način naplate.',
    category: 'Radnici', icon: '💪', city: 'Novi Sad', audience: 'client', searchHref: '/oglasi?type=request&city=Novi%20Sad',
    content: `## „Dva radnika za vikend“ nije dovoljno

Kandidati moraju znati da li istovaraju nameštaj, kutije ili građevinski materijal. Navedite okvirnu ukupnu količinu, najteži pojedinačni predmet, sprat, lift i udaljenost vozila od mesta istovara. Ako vozilo dolazi u određeno vreme, upišite vremenski prozor i da li se termin može pomeriti.

## Jedan oglas, jasna podela posla

U tekstu napišite da su potrebne dve osobe i da li kandidat treba da dovede drugog radnika ili ćete izabrati dve odvojene prijave. Na platformi izbor kandidata za običan zahtev može biti vezan za jednog izvođača, pa je važno da organizator para to jasno preuzme ili da otvorite odvojene potrebe. Ne obećavajte grupni izbor ako tok oglasa to ne podržava.

## Pre prihvatanja

Pitajte da li radnici imaju iskustva sa vrstom tereta i sopstvenu zaštitnu opremu. Dogovorite cenu za celu smenu ili po satu, minimalni broj sati i uslov za produžetak. Za rad na visini ili rukovanje mašinom potrebna je posebna stručnost — to nije običan istovar.

## Završetak

Na kraju zajedno proverite broj komada i stanje prostora. Potvrdite završen posao i obostrano ocenite stvaran angažman, ne samu prijavu.`,
  },
  {
    slug: 'kucni-majstor-kragujevac',
    title: 'Kućni majstor u Kragujevcu: sitne popravke bez nejasnog spiska',
    excerpt: 'Kako objediniti montažu polica, kvake i manje popravke, a ne sakriti zadatak koji traži stručnjaka.',
    category: 'Dom', icon: '🛠️', city: 'Kragujevac', audience: 'client', searchHref: '/oglasi?type=offer&city=Kragujevac',
    content: `## Napravite listu po prostorijama

„Sitne popravke po kući“ može značiti jedan sat ili ceo dan. Navedite svaku stavku: montaža dve police, zamena kvake, podešavanje šarki ili pričvršćivanje elementa. Dodajte fotografije mesta rada i dimenzije kada su bitne. To pomaže majstoru da ponese odgovarajući alat.

## Odvojite specijalistički posao

Rad na električnoj instalaciji, gasu, vodovodnom sistemu ili konstrukciji nije automatski posao za univerzalnog kućnog majstora. Ako takav problem postoji, napravite poseban oglas za kvalifikovanog stručnjaka. Tako se smanjuje rizik da jedan termin bude pogrešno planiran.

## Materijal i pristup

Napišite šta već imate: šrafove, police, novu kvaku ili samo ideju šta želite. Pitajte ko kupuje nedostajući materijal i da li je dolazak radi merenja uključen u cenu. U Kragujevcu je javno dovoljno navesti deo grada i okvirno vreme kada ste kod kuće.

## Dogovor pre početka

Pošaljite listu zadataka uz prijavu i dogovorite redosled. Ako se tokom rada otkrije dodatni kvar, prvo tražite novu procenu pre proširenja posla.`,
  },
  {
    slug: 'cuvanje-pasa-beograd',
    title: 'Čuvanje psa u Beogradu: pitanja pre izbora osobe',
    excerpt: 'Šetnje, boravak preko noći, ishrana i navike psa — informacije koje čuvar mora dobiti unapred.',
    category: 'Ljubimci', icon: '🐕', city: 'Beograd', audience: 'client', searchHref: '/oglasi?type=offer&city=Beograd',
    content: `## Odredite vrstu čuvanja

Šetnja od pola sata, dnevni dolazak u stan i višednevni boravak kod čuvara nisu ista usluga. U oglasu navedite tačne dane, broj izlazaka i da li pas ostaje kod vas ili kod druge osobe. Beogradski saobraćaj utiče na logistiku, zato je korisno navesti opštinu i realan vremenski prozor.

## Profil psa je važniji od slike

Napišite veličinu, starost, odnos prema drugim psima, da li vuče povodac ili ima posebnu rutinu. Ako postoji terapija ili zdravstveni problem, dogovorite postupanje sa veterinarom; ne očekujte medicinsku intervenciju od osobe koja za to nije obučena. Kontakt veterinara i broj za hitne situacije podelite sa izabranim čuvarom, ne javno.

## Pre početka saradnje

Pitajte gde se pas šeta, da li čuvar radi sa više pasa istovremeno i kako javlja da je poseta obavljena. Za prvi angažman, kratak susret sa psom može otkriti više od dopisivanja. Potvrdite cenu, trajanje i šta se dešava ako kasnite po psa.

## Po završetku

Proverite da su ključevi i stvari vraćeni i ostavite ocenu za konkretan završen posao.`,
  },
  {
    slug: 'cuvanje-ljubimaca-novi-sad-putovanje',
    title: 'Čuvanje ljubimaca u Novom Sadu dok ste na putu',
    excerpt: 'Kako organizovati dolaske, hranjenje i predaju ključa bez javnog otkrivanja adrese i termina odsustva.',
    category: 'Ljubimci', icon: '🐈', city: 'Novi Sad', audience: 'client', searchHref: '/oglasi?type=offer&city=Novi%20Sad',
    content: `## Oglas bez osetljivih detalja

Javno napišite vrstu ljubimca, broj dana i deo Novog Sada, ali ne i punu adresu ili podatak da je stan potpuno prazan. Precizne upute i kontakt osobu dajte tek izabranom čuvaru. To je naročito važno kada nekome poveravate ključ.

## Napravite dnevnu rutinu

Zapišite količinu hrane, vreme obroka, šetnje, čišćenje posipa i ponašanje koje je normalno za vašeg ljubimca. Za mačku je često dovoljan dolazak, dok psu obično treba više izlazaka i društva; ne pretpostavljajte da čuvar sam zna vašu rutinu. Ako je životinji potrebna stručna terapija, proverite ko sme da je sprovodi.

## Šta proveriti kod kandidata

Pitajte koliko vremena ostaje tokom posete, da li može poslati kratku potvrdu i šta radi ako ne može doći u dogovoreni termin. Dogovorite rezervni kontakt i veterinarsku ambulantu. Reference imaju smisla, ali nemojte tražiti tuđe privatne podatke u javnoj prijavi.

## Povratak kući

Proverite stanje ljubimca i stana, vratite ključ i potvrdite da je angažman završen. Tek tada ocenite iskustvo.`,
  },
  {
    slug: 'pomoc-starijima-beograd',
    title: 'Pomoć starijoj osobi u Beogradu: kućna podrška bez medicinskih obećanja',
    excerpt: 'Kako opisati nabavku, pratnju, obroke i društvo, uz jasnu granicu između pomoći u kući i zdravstvene nege.',
    category: 'Nega i pomoć', icon: '🤝', city: 'Beograd', audience: 'client', searchHref: '/oglasi?type=offer&city=Beograd',
    content: `## Šta osobi zaista treba svakog dana

Nekome su potrebni kupovina namirnica i društvo, drugome pratnja do ustanove ili pomoć oko lakših kućnih poslova. U zahtevu navedite konkretne radnje, učestalost i okvirno trajanje posete. Za Beograd je važno i da li osoba može samostalno da izađe i da li je potrebna pratnja kroz gradski prevoz.

## Granica ne-medicinske pomoći

Pomoć u kući nije isto što i zdravstvena nega. Davanje terapije, medicinske procedure i procena zdravstvenog stanja zahtevaju odgovarajuće stručnjake i dogovor sa lekarom. Ako tražite medicinsku sestru ili negovatelja sa kvalifikacijom, to izričito navedite i proverite iskustvo i ovlašćenja. Za hitno zdravstveno stanje pozovite nadležnu službu.

## Poverenje i plan posete

Dogovorite ko otvara vrata, kome se javlja po završetku, kako se evidentiraju kupovine i šta raditi ako osoba ne odgovara. Ne objavljujte javno dijagnoze, punu adresu ili finansijske podatke. Najpre obavite razgovor sa kandidatom i članom porodice ili starateljem kada je prikladno.

## Probni period

Za ponavljane dolaske počnite sa jasno dogovorenim prvim angažmanom. Zatim procenite da li su raspored, komunikacija i obim pomoći održivi za obe strane.`,
  },
  {
    slug: 'pomoc-u-kuci-stariji-novi-sad',
    title: 'Pomoć u kući za starije u Novom Sadu: raspored i kontrolna lista',
    excerpt: 'Od povremene kupovine do više poseta nedeljno: kako napisati oglas koji poštuje privatnost starije osobe.',
    category: 'Nega i pomoć', icon: '🏡', city: 'Novi Sad', audience: 'client', searchHref: '/oglasi?type=offer&city=Novi%20Sad',
    content: `## Odvojite redovne i povremene zadatke

Napišite šta treba pri svakoj poseti — na primer kupovina, priprema jednostavnog obroka ili šetnja — a šta samo povremeno, kao pratnja do lekara. Tako kandidat može da proceni vreme i da li odgovara traženom ritmu. U Novom Sadu navedite kvart ili deo grada, bez javne pune adrese.

## Termini koji se mogu održati

Ako je potreban dolazak tri puta nedeljno, navedite dane i vremenski raspon. Za duži dogovor pitajte kandidata šta radi kada je bolestan ili na odmoru i kako se organizuje zamena. Ne označavajte „24h“ ako vam zapravo treba sat ili dva pomoći dnevno.

## Poštovanje privatnosti

Član porodice može sastaviti oglas, ali razgovarajte i sa osobom kojoj se pomaže kad god je moguće. Medicinske detalje, informacije o novcu i ključevima delite tek nakon izbora, uz jasan razlog. Ako je potreban medicinski postupak, potražite kvalifikovanog zdravstvenog radnika; ne-medicinska pomoć to ne zamenjuje.

## Provera kvaliteta

Posle prvih poseta proverite da li se zadaci zaista izvršavaju i da li se starija osoba oseća prijatno. Zabeležite dogovor o kupovinama i troškovima da ne nastane nesporazum.`,
  },
  {
    slug: 'dadilja-beograd-povremeno-cuvanje',
    title: 'Povremeno čuvanje deteta u Beogradu: kako izabrati dadilju',
    excerpt: 'Termin, uzrast, rutina, reference i hitni kontakti — šta dogovoriti pre prvog čuvanja.',
    category: 'Porodica', icon: '🧸', city: 'Beograd', audience: 'client', searchHref: '/oglasi?type=offer&city=Beograd',
    content: `## Precizan zahtev štiti i porodicu i kandidata

Navedite uzrast i broj dece, da li je potrebno preuzimanje iz vrtića, priprema obroka, pomoć sa domaćim zadatkom ili samo prisustvo dok ste odsutni. U Beogradu je vreme putovanja važno: javno navedite opštinu i raspon sati, ali ne i tačnu adresu deteta.

## Razgovor pre prve smene

Pitajte za prethodno iskustvo, dostupnost i reference koje kandidat želi da podeli. Objasnite kućna pravila, alergije i kome treba telefonirati u hitnoj situaciji. Dogovorite da li se očekuje bilo kakav dodatni kućni posao; nemojte ga podrazumevati pod „čuvanje“.

## Prvi susret i predaja

Kad je moguće, organizujte kratak susret u prisustvu roditelja. Pokažite osnovnu rutinu i ostavite kontakt broj, ali ne objavljujte privatne podatke u oglasu. Za veoma malu decu ili posebne potrebe, tražite iskustvo koje odgovara konkretnoj situaciji.

## Cena i završetak

Dogovorite trajanje, mogućnost produženja i šta se dešava ako zakasnite. Posle završene smene potvrdite šta je urađeno i tek tada ostavite ocenu. Bezbednost i pouzdanost važniji su od najniže ponude.`,
  },
  {
    slug: 'moler-nis-krecenje-stana',
    title: 'Krečenje stana u Nišu: kako uporediti ponude molera',
    excerpt: 'Zidovi, plafon, zaštita nameštaja i materijal — šta mora biti u opisu pre procene cene.',
    category: 'Renoviranje', icon: '🎨', city: 'Niš', audience: 'client', searchHref: '/oglasi?type=offer&city=Ni%C5%A1',
    content: `## Kvadratura stana nije kvadratura zidova

Za ponudu nije dovoljno reći „stan od 60 kvadrata“. Navedite broj soba, visinu plafona, da li se kreče i plafoni, stanje podloge i postoje li fleke, pukotine ili stara boja koja se ljušti. Fotografije iz uglova sobe pomažu, ali za preciznu cenu često je potreban obilazak.

## Razjasnite pripremu

Da li moler pomera i štiti nameštaj, krpi rupe, gletuje, šmirgla i čisti po završetku? To su različiti poslovi. Navedite da li je stan prazan i kada je dostupan. U Nišu je za javni oglas dovoljan deo grada; tačnu adresu dogovorite sa izabranim majstorom.

## Materijal i rok

Pitajte koja boja i koliko ruku su predviđeni, ko kupuje materijal i kako se rešavaju dodatni radovi otkriveni posle pripreme zidova. Dogovorite početak, očekivano trajanje i vreme sušenja pre vraćanja nameštaja.

## Provera posla

Pre plaćanja zajedno pogledajte uglove, prelaze, zaštitu poda i čišćenje. Ako imate posebnu nijansu, sačuvajte oznaku boje. Uporedite ponude prema uključenom obimu, a ne samo jednoj brojci.`,
  },
  {
    slug: 'keramicar-beograd-renoviranje-kupatila',
    title: 'Keramičar za kupatilo u Beogradu: šta pripremiti za ponudu',
    excerpt: 'Podloga, hidroizolacija, površina i materijal utiču na obim posla više od same kvadrature.',
    category: 'Renoviranje', icon: '🧱', city: 'Beograd', audience: 'client', searchHref: '/oglasi?type=offer&city=Beograd',
    content: `## Početno stanje određuje posao

Da li se pločice lepe preko postojeće podloge ili se kupatilo potpuno renovira? Navedite dimenzije poda i zidova, stanje starih pločica, odvode i planirani raspored sanitarija. Fotografije pomažu za prvu procenu, ali skrivena oštećenja i podloga često se vide tek na licu mesta.

## Radovi koje treba razdvojiti

Demontaža, odvoz šuta, priprema podloge, hidroizolacija, lepljenje, fugovanje i silikoniranje nisu isto. Pitajte keramičara šta od toga radi on, a za šta je potreban vodoinstalater ili drugi stručnjak. Posebno dogovorite ko nabavlja pločice, lepak i ostali materijal.

## Termin u stanu ili zgradi

U Beogradu navedite opštinu, sprat i mogućnost unošenja materijala. Ako zgrada ima pravila o buci i odlaganju šuta, proverite ih pre zakazivanja. Planirajte da kupatilo možda neće biti upotrebljivo tokom radova i potrebnog sušenja.

## Uporedite ponude po fazama

Tražite pisani opis obima, redosled radova i način obračuna dodatnih popravki. Nerealno niska cena bez pripreme podloge može kasnije postati skuplji problem.`,
  },
  {
    slug: 'montaza-namestaja-novi-sad',
    title: 'Montaža nameštaja u Novom Sadu: pripremite posao za majstora',
    excerpt: 'Šta navesti za ormar, kuhinjske elemente ili police: dimenzije, zid, uputstvo i broj paketa.',
    category: 'Dom', icon: '🪑', city: 'Novi Sad', audience: 'client', searchHref: '/oglasi?type=offer&city=Novi%20Sad',
    content: `## Naziv komada nije dovoljan

„Montaža ormara“ može biti jednostavna komoda ili veliki plakar sa kliznim vratima. Navedite marku i model ako postoje, dimenzije, broj paketa i da li je uputstvo sačuvano. Fotografija kutija i mesta montaže pomoći će majstoru da proceni alat i vreme.

## Zid i instalacije

Za viseće police ili kuhinjske elemente napišite kakav je zid ako znate i da li imate predviđene tiplove. Ne bušite naslepo u blizini instalacija. Ako je potrebno priključenje struje, vode ili gasa, to odvojite od montaže i angažujte kvalifikovanog izvođača za taj deo.

## Priprema prostora

Obezbedite pristup, slobodan pod i mesto za odlaganje ambalaže. U Novom Sadu navedite deo grada, sprat i lift ako je nameštaj glomazan. Pitajte da li je unošenje paketa iz vozila uključeno i ko odnosi ambalažu.

## Provera završetka

Pre odlaska majstora otvorite vrata i fioke, proverite stabilnost i eventualna oštećenja. Ako nedostaje fabrički deo, zabeležite to odvojeno od kvaliteta montaže.`,
  },
  {
    slug: 'uredjenje-dvorista-kragujevac',
    title: 'Uređenje dvorišta u Kragujevcu: košenje, orezivanje i odvoz',
    excerpt: 'Kako razdvojiti redovno održavanje od zapuštenog dvorišta i dogovoriti uklanjanje zelenog otpada.',
    category: 'Dvorište', icon: '🌿', city: 'Kragujevac', audience: 'client', searchHref: '/oglasi?type=offer&city=Kragujevac',
    content: `## Opišite stanje terena

Površina je korisna, ali nisu svi kvadrati jednaki. Navedite visinu trave, nagib, prepreke, žbunje i da li je pristup moguć kosilicom. Ako je dvorište dugo bez održavanja, fotografije iz nekoliko uglova daju bolju sliku od reči „malo zaraslo“.

## Koji radovi su uključeni

Košenje, trimovanje uz ogradu, orezivanje i sakupljanje granja dogovaraju se posebno. Za velika stabla ili rad na visini potražite stručnjaka sa odgovarajućom opremom. Ne pretpostavljajte da radnik koji kosi travu može bezbedno seći visoko drvo.

## Otpad i voda

Pitajte ko obezbeđuje vreće, gde se odlaže zeleni otpad i da li je odvoz uključen. Ako je potrebno zalivanje ili sadnja, napišite ima li pristupa vodi i ko kupuje biljke. U Kragujevcu javno navedite naselje ili deo grada, a detaljnu adresu tek nakon izbora.

## Jednokratno ili redovno

Za redovno održavanje dogovorite učestalost i način javljanja pre dolaska. Za jednokratno sređivanje napravite listu prioriteta, pa na kraju zajedno proverite šta je urađeno.`,
  },
  {
    slug: 'istovar-robe-subotica',
    title: 'Istovar robe u Subotici: oglas za kratkoročnu ispomoć',
    excerpt: 'Broj paleta, težina, rampa i termin dolaska kamiona — podaci koji sprečavaju pogrešne prijave.',
    category: 'Radnici', icon: '🚚', city: 'Subotica', audience: 'client', searchHref: '/oglasi?type=request&city=Subotica',
    content: `## Količina robe određuje ekipu

Za istovar navedite broj paleta ili kutija, okvirnu masu najtežeg komada i da li roba ide u prizemni magacin ili na sprat. Recite postoji li rampa, paletar ili samo ručni prenos. Kandidat može realnije da proceni broj ljudi i trajanje kada zna uslove na licu mesta.

## Vreme kamiona nije isto što i početak rada

Ako transport kasni ili termin nije potvrđen, napišite vremenski prozor umesto obećanja tačnog sata. Dogovorite koliko dugo radnici treba da budu u pripravnosti i da li se čekanje plaća. Za Suboticu navedite deo grada ili industrijsku zonu, bez javnih pristupnih kodova objekta.

## Oprema i bezbednost

Odredite ko daje rukavice, obuću i kolica. Rukovanje viljuškarom ili drugom mehanizacijom prepustite osobi sa odgovarajućom obukom. Ako se radi u prostoru sa posebnim pravilima, pošaljite ih izabranom radniku pre dolaska.

## Kada je posao gotov

Dogovorite da li završetak znači samo istovar iz vozila ili i slaganje robe u magacin. Ta razlika utiče na vreme i cenu. Proverite broj komada i stanje robe pre potvrde završetka.`,
  },
  {
    slug: 'magacinski-radnici-beograd-vise-dana',
    title: 'Magacinska ispomoć u Beogradu na više dana: šta navesti',
    excerpt: 'Smena, zadaci, oprema i odgovornost za robu važni su za višednevni angažman.',
    category: 'Dugoročni rad', icon: '🏬', city: 'Beograd', audience: 'client', searchHref: '/oglasi?type=request&city=Beograd&mode=multi_day',
    content: `## „Rad u magacinu“ pokriva mnogo poslova

Navedite da li osoba prima robu, sortira, pakuje, lepi deklaracije ili priprema isporuke. Opišite tip robe, težinu paketa i da li postoji skener ili druga oprema. Za rad sa viljuškarom ili u regulisanom prostoru proverite potrebnu obuku; nemojte ga podrazumevati pod običnom ispomoći.

## Raspored po danima

Za angažman od pet dana upišite početni datum, sate svake smene, pauzu i da li se radi vikendom. U Beogradu navedite opštinu ili industrijsku zonu i kako se dolazi javnim prevozom ako je lokacija teže dostupna. Radniku znači i informacija gde se javlja prvog dana.

## Uslovi i obračun

Dogovorite ko obezbeđuje zaštitnu opremu, ko daje uputstva i kako se evidentira radno vreme. Napišite da li je ponuda po satu, danu ili za ceo period. Za višednevni rad proverite odgovarajući pravni osnov i obaveze sa stručnim licem; platforma nije zamena za ugovor.

## Uporedivi kandidati

Tražite potvrdu dostupnosti za sve dane, iskustvo sa vrstom robe i broj ljudi ako vam treba tim. Pre prihvatanja razjasnite mogućnost zamene ili otkazivanja smene.`,
  },
  {
    slug: 'visak-radnika-beograd-ponuda-tima',
    title: 'Imate slobodan tim radnika u Beogradu? Kako objaviti ponudu',
    excerpt: 'Za firmu ili organizatora tima: veštine, broj ljudi, dostupni datumi i odgovornost bez nejasnog „rentiranja“.',
    category: 'Dugoročni rad', icon: '👷', city: 'Beograd', audience: 'worker', searchHref: '/oglasi?type=request&city=Beograd&mode=multi_day',
    content: `## Ponudite kapacitet, ne samo broj ljudi

„Imam tri slobodna radnika“ ne govori klijentu mogu li raditi pakovanje, montažu, selidbu ili pomoćne građevinske poslove. Navedite konkretne veštine svakog člana tima, alat ili vozilo koje donosite, broj raspoloživih dana i deo Beograda iz kog krećete. Ne navodite kvalifikacije koje ne možete potvrditi.

## Početak i trajanje

Upišite od kog datuma je tim slobodan, da li su dostupni radnim danima, vikendom ili u smenama, i da li mogu raditi jedan dan ili više nedelja. Ako se raspoloživost promeni, ažurirajte oglas. Klijent ne treba da planira radove na osnovu zastarele ponude.

## Ko je odgovoran za tim

Objasnite ko organizuje rad, ko daje uputstva, ko obezbeđuje zaštitnu opremu i kako se rešava odsustvo jednog radnika. Kod ustupanja zaposlenih ili dužeg angažmana proverite koji je zakonit poslovni model i ugovor potreban; ne predstavljajte ljude kao robu za „iznajmljivanje“.

## Kako se dogovara cena

Razdvojite cenu rada, prevoza, opreme i eventualnog materijala. Klijentu ponudite pisani okvir tek kada znate lokaciju, trajanje i opseg. Na platformi pratite aktivne zahteve i prijavite tim na one za koje je stvarno dostupan.`,
  },
  {
    slug: 'tri-radnika-novi-sad-pet-dana',
    title: 'Tri radnika u Novom Sadu na pet dana: kako definisati angažman',
    excerpt: 'Praktičan vodič za projekat od više dana: raspored, vođa tima, zadaci i obračun.',
    category: 'Dugoročni rad', icon: '👥', city: 'Novi Sad', audience: 'client', searchHref: '/oglasi?type=request&city=Novi%20Sad&mode=multi_day',
    content: `## Razložite pet dana na zadatke

Napišite šta treba prvog dana, šta se ponavlja svakog dana i šta označava završen projekat. Na primer, istovar i slaganje robe mogu zahtevati drugačiji broj ljudi od kasnijeg pakovanja. Ako vam je potreban tim od tri osobe sve vreme, navedite to jasno.

## Jedna kontakt osoba

Dogovorite ko vodi tim i ko u vaše ime potvrđuje dnevni plan. Ako platforma za jedan zahtev bira jednog kandidata, organizator tima treba da preuzme odgovornost za ostale članove ili posao treba podeliti u zasebne zahteve. Nemojte pretpostaviti da jedan klik automatski dodeljuje tri nezavisna naloga.

## Uslovi rada

Navedite lokaciju u Novom Sadu, sate, pauze, opremu, rad na otvorenom ili u zatvorenom i eventualno nošenje tereta. Za mašine i rad na visini tražite odgovarajuću stručnost. Pre početka proverite ugovorni i poreski okvir za konkretnu saradnju.

## Kako uporediti ponude

Tražite potvrdu da su sve tri osobe slobodne svih pet dana, šta je uključeno u cenu i kako se obračunava dodatni sat. Kratak pisani dnevni izveštaj olakšava završnu proveru.`,
  },
  {
    slug: 'radnik-na-odredjeno-nis',
    title: 'Radnik u Nišu na određeno vreme: oglas koji jasno opisuje posao',
    excerpt: 'Za angažman od više nedelja ili meseci navedite smene, potrebne veštine, uslove i zakonit osnov saradnje.',
    category: 'Dugoročni rad', icon: '📋', city: 'Niš', audience: 'client', searchHref: '/oglasi?type=request&city=Ni%C5%A1&mode=fixed_term',
    content: `## Duži posao nije samo produžena dnevna smena

Ako vam osoba treba mesec ili tri, kandidat mora znati posao koji će raditi svakodnevno, mesto rada, smene i kome odgovara. Naziv „pomoćni radnik“ sam po sebi nije dovoljan. Navedite osnovne zadatke, potrebnu opremu, fizičke zahteve i iskustvo koje je stvarno neophodno.

## Trajanje i početak

Upišite planirani datum početka, okvirno trajanje, broj radnih dana nedeljno i da li postoji mogućnost produženja. Za Niš navedite opštinu ili deo grada, a preciznu adresu podelite u fazi dogovora. Ako raspored nije fiksan, objasnite koliko unapred radnik dobija smenu.

## Formalni uslovi

Pre objave proverite odgovarajući oblik angažovanja, prijavu i obaveze poslodavca ili naručioca sa pravnim ili računovodstvenim stručnjakom. Platforma pomaže da se ljudi povežu, ali sama objava ne uređuje radni odnos. Za strane radnike dodatno proverite pravo na rad i potrebnu dokumentaciju.

## Pitanja u prijavi

Tražite relevantno iskustvo, datum od kog osoba može da počne i potvrdu dostupnosti za ceo period. Odluku donesite prema zahtevima posla, bez nepotrebnih ličnih podataka.`,
  },
  {
    slug: 'sezonski-radnici-kragujevac',
    title: 'Sezonski radnici oko Kragujevca: priprema oglasa za više nedelja',
    excerpt: 'Lokacija, prevoz, trajanje, radni uslovi i bezbednost su osnova za sezonski angažman.',
    category: 'Dugoročni rad', icon: '🌾', city: 'Kragujevac', audience: 'client', searchHref: '/oglasi?type=request&city=Kragujevac&mode=fixed_term',
    content: `## Opišite sezonu, ne samo zanimanje

Navedite tačan tip rada: sortiranje plodova, pakovanje, održavanje dvorišta ili pomoć u proizvodnji. Svaki traži drugačiju opremu i iskustvo. Kandidatu recite gde se radi, kada sezona približno počinje i od čega zavisi njen završetak.

## Prevoz i dnevna organizacija

Ako je radno mesto van centra Kragujevca, navedite približnu lokaciju i da li obezbeđujete prevoz. Upišite vreme početka, pauze, rad na otvorenom i plan u slučaju lošeg vremena. Za fizički zahtevne poslove objasnite očekivano opterećenje i zaštitnu opremu.

## Cena i pravni osnov

Razdvojite naknadu po satu, danu ili učinku i objasnite kako se učinak meri. Pre početka proverite odgovarajući pravni osnov angažovanja i obaveze za konkretnu delatnost. Ne pretpostavljajte da „sezonski“ znači rad bez formalnosti.

## Održavajte oglas tačnim

Ako se broj potrebnih ljudi ili datum promeni, ažurirajte oglas. Kandidati koji planiraju nekoliko nedelja rada moraju moći da računaju na tačne informacije.`,
  },
  {
    slug: 'pomocni-radnik-sremska-mitrovica',
    title: 'Pomoćni radnik u Sremskoj Mitrovici: jednodnevni ili višednevni posao',
    excerpt: 'Kako definisati rad u dvorištu, radionici ili magacinu i izabrati odgovarajući tip oglasa.',
    category: 'Radnici', icon: '🔧', city: 'Sremska Mitrovica', audience: 'client', searchHref: '/oglasi?type=request&city=Sremska%20Mitrovica',
    content: `## Prvo odredite trajanje

Ako vam treba pomoć za jedan istovar, objavite kratak posao. Ako neko dolazi svaki dan dve nedelje, napišite raspored i duži period. Razlika utiče na to ko će se prijaviti i šta treba dogovoriti pre početka. Sremsku Mitrovicu i okolno mesto navedite dovoljno jasno da kandidat može proceniti put.

## Opišite stvarne zadatke

„Pomoćni radnik“ može značiti nošenje, pakovanje, čišćenje radionice ili pripremu materijala. Navedite tri do pet konkretnih radnji, okvirnu težinu tereta i da li postoji rad na otvorenom. Ako su potrebni alat ili vozilo, recite ko ih obezbeđuje.

## Bezbedan raspored

Objasnite ko uvodi radnika u posao i koja zaštitna oprema je obavezna. Rukovanje mašinama ili električnim instalacijama ne treba da bude usputni zadatak nekvalifikovane ispomoći. Za višednevni angažman proverite ugovor i druge obaveze sa stručnjakom.

## Završna provera

Dogovorite cenu, termin i kriterijum kada je posao završen. Ako se obim promeni, prvo se ponovo dogovorite, pa tek onda nastavite.`,
  },
]

export const BLOG_POST_BY_SLUG = Object.fromEntries(BLOG_POSTS.map(post => [post.slug, post])) as Record<string, BlogPost>
