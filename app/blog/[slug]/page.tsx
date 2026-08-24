import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Calendar, Clock, ArrowLeft, ChevronRight } from 'lucide-react'

const POSTS: Record<string, {
  title: string
  date: string
  readTime: string
  category: string
  image: string
  content: string
}> = {
  'kako-naci-honorarni-posao-u-srbiji': {
    title: 'Kako naći honorarni posao u Srbiji — kompletan vodič za 2025.',
    date: '2025-06-10',
    readTime: '7 min',
    category: 'Vodič',
    image: '💼',
    content: `
## Šta je honorarni posao?

Honorarni posao (ili kratkotrajan angažman) podrazumeva rad koji nije vezan za standardni radni odnos od 8 sati dnevno. Radi se o povremenim, projektnim ili sezonskim angažmanima gde se isplata vrši po satu, danu, projektu ili dogovoru.

U Srbiji, honorarni rad je sve popularniji i iz više razloga:

- **Fleksibilnost** — sami birate kada i koliko radite
- **Dodatni prihod** — idealno pored redovnog posla ili tokom studija
- **Brzi početak** — bez dugih intervjua i probnih rokova
- **Raznovrsnost** — od fizičkih radova do IT poslova

## Gde tražiti honorarni posao?

### 1. Online platforme (poput ExpertPro)

Specijalizovane platforme za kratkotrajna zapošljavanja su najbrži način da nađete angažman. Na ExpertPro možete:

- Pregledati stotine aktuelnih oglasa
- Filtrirati po gradu, kategoriji i tipu posla
- Direktno kontaktirati poslodavca
- Prihvatiti hitne angažmane koji počinju odmah

### 2. Fizička berza rada

Opštinska berza rada organizuje povremene sajmove zapošljavanja gde firme traže radnike za kratke angažmane.

### 3. Preporuke

Prijatelji, komšije i poznanici često znaju za slobodna mesta pre nego što se oglase javno. Recite svom okruženju da ste dostupni za honorarni rad.

## Koje veštine su najtraženije?

Prema aktuelnim podacima ExpertPro platforme, ovo su najtraženiji profili:

1. **Fizički radnici** — pomoćni radnici na gradilištu, selidbe, magacineri
2. **Čišćenje i održavanje** — čišćenje poslovnih prostora, stanova, vikendica
3. **Transport i dostava** — vozači sa vozilom, kuriri, dostava hrane
4. **Ugostiteljstvo** — konobari, barmeni, kuhinjski pomoćnici za događaje
5. **Čuvanje i nega** — babysitting, čuvanje starih, pet-siting
6. **IT i administracija** — podrška, unos podataka, prevođenje

## Kako se predstaviti poslodavcu?

Čak i za kratke angažmane, profesionalna prezentacija čini veliku razliku:

**Profil na platformi:**
- Dodajte jasnu fotografiju
- Navedite konkretne veštine i iskustvo
- Stavite procene i recenzije prethodnih poslodavaca
- Označite dostupnost (kada ste slobodni)

**Komunikacija:**
- Odgovarajte brzo na upite
- Budite jasni u pogledu rasporeda i cene
- Potvrdite dogovor pisanim putem (i poruke važe)

## Koliko možete zaraditi?

Okvirne cene u Srbiji za honorarni rad (2025):

| Vrsta posla | Cena po satu |
|---|---|
| Fizički radovi | 700–1.200 RSD |
| Čišćenje | 500–900 RSD |
| Čuvanje dece | 600–1.000 RSD |
| Vozač/dostava | 800–1.400 RSD |
| IT podrška | 1.500–3.000 RSD |
| Prevođenje | 1.200–2.500 RSD |

## Zakon i porezi

Honorarni rad u Srbiji može biti organizovan kao:

- **Ugovor o delu** — za povremene stručne poslove
- **Autorski ugovor** — za kreativne i intelektualne usluge
- **Privremeni i povremeni poslovi** — za fizički rad (do 120 radnih dana godišnje)

Preporučujemo da svaki angažman bude pokriven pisanim ugovorom, bez obzira koliko kratko traje.

## Zaključak

Honorarni posao u Srbiji nije više taboo — to je normalan deo tržišta rada koji raste iz dana u dan. Platforme poput ExpertPro olakšavaju pronalazak i prihvatanje angažmana za nekoliko minuta.

Registrujte se besplatno, napravite profil i pronađite svoju prvu ili sledeću honorarnu poziciju danas.
    `,
  },
  'rad-od-kuce-opcije-srbija': {
    title: '10 najpopularnijih poslova od kuće u Srbiji — radite kada hoćete',
    date: '2025-06-18',
    readTime: '6 min',
    category: 'Rad od kuće',
    image: '🏠',
    content: `
## Rad od kuće — nije samo za IT sektore

Pandemija je ubrzala trend rada od kuće, ali mnogi poslovi koji se mogu raditi remotely postoje oduvek. Evo 10 najpopularnijih opcija u Srbiji koje ne zahtevaju odlazak na radno mesto.

### 1. Prevođenje i lektorisanje

Srbija ima odličan kadar prevodilaca, posebno za engleski, nemački i francuski jezik. Plaća se po stranici ili projektu, a rad je potpuno fleksibilan.

**Cena:** 500–1.500 RSD po stranici (450 reči)

### 2. Unos podataka i administracija

Firme redovno traže osobe za unos podataka, popunjavanje tabela, skeniranje i arhiviranje dokumenata. Ne zahteva posebne predznanje.

**Cena:** 600–1.000 RSD/h

### 3. Virtuelni asistent

Upravljanje email-ovima, zakazivanje, istraživanje, customer support — sve ovo mogu raditi virtuelni asistenti potpuno od kuće.

**Cena:** 800–1.500 RSD/h

### 4. Pisanje sadržaja (copywriting)

Blogovi, opisi proizvoda, postovi za društvene mreže — potražnja za srpskim piscima raste. Agencije i preduzetnici plaćaju dobro za kvalitetan sadržaj.

**Cena:** 3–8 RSD po reči

### 5. Dizajn i grafika

Logotipi, vizit karte, postovi za instagram, baneri — ako znate Canvu, Photoshop ili Illustrator, posla ima na pretek.

**Cena:** 2.000–15.000 RSD po projektu

### 6. Online tutoring i predavanja

Matematika, engleski, programiranje, muzika — instruktori traže polaznici, a čas možete da odate putem Zooma ili Skypea.

**Cena:** 1.000–3.000 RSD/h

### 7. IT podrška i programiranje

Senior programeri zarađuju i do 5.000+ RSD/h za freelance projekte. Čak i IT podrška i popravka računara može biti remote u velikom broju slučajeva.

**Cena:** 1.500–5.000+ RSD/h

### 8. Knjigovodstvo i finansije

Mala preduzeća traže povremene računovođe koji će voditi knjige, fakture i poreze. Idealno za osobe sa finansijskim iskustvom.

**Cena:** 5.000–20.000 RSD mesečno po firmi

### 9. Moderacija i customer support

Online prodavnice, servisi i aplikacije traže agente podrške koji odgovaraju na upite klijenata putem chata ili email-a.

**Cena:** 700–1.200 RSD/h

### 10. Snimanje videa i foto editing

YouTube kanali, influenseri i firme plaćaju za montažu videa, retouch fotografija i produkciju sadržaja. Možete raditi sa laptopom i kućnim računarom.

**Cena:** 2.000–8.000 RSD po projektu

## Kako početi?

1. Odaberite jednu ili dve oblasti u kojima ste dobri
2. Napravite portfolio (čak i sa imaginativnim projektima)
3. Registrujte se na ExpertPro i domaćim platformama
4. Postavljajte realnu cenu — ne precenjujte, ali ni ne potcenjujte
5. Tražite recenzije od prvih klijenata

Rad od kuće je realan — potrebna je samo disciplina i pravi alati.
    `,
  },
  'kako-zaraditi-dodatni-novac': {
    title: 'Kako zaraditi dodatni novac pored redovnog posla — 15 provjerenih načina',
    date: '2025-07-01',
    readTime: '8 min',
    category: 'Finansije',
    image: '💰',
    content: `
## Zašto tražiti dodatni prihod?

Inflacija, skupoća života i ambiciozni ciljevi (štednja, putovanja, kupovina stana) — razlozi za traženje dodatnog prihoda su brojni. Dobra vest: nikada nije bilo više opcija nego danas.

## 15 načina da zaradite više

### 1. Honorarni rad vikendom

Vikend je zlatno vreme za honorarce. Firme traže pomoć na događajima, radovi se završavaju, a vi imate slobodan dan.

### 2. Dostava hrane ili paketa

Glovo, dostavljači, kurirske službe — potrebni su im vozači i biciklisti. Fleksibilno, plate odmah ili nedeljno.

### 3. Iznajmljivanje sobe ili stana (Airbnb)

Ako imate slobodan prostor, turizam je odlična opcija. Beograd, Novi Sad i Niš su sve popularniji turistički destina.

### 4. Prodaja starih stvari

Kupujmo-Prodajmo, Halo oglasi, Facebook Marketplace — stare knjige, elektronika, nameštaj i odeća dobro se prodaju.

### 5. Čišćenje stanova i kuća

Mnoge porodice traže periodično čišćenje. Jedna spremačica može imati 4–6 stalnih klijenata i zarađivati i do 80.000 RSD mesečno.

### 6. Šetanje pasa

Vlasnici kućnih ljubimaca koji rade plaćaju za šetanje, i do 500 RSD po šetnji. Sa 5–6 pasa dnevno, to je solidna zarada.

### 7. Pomoć starim osobama

Odlasci u prodavnicu, pratioci na lekara, kuvanje — ovo je humano i dobro plaćeno. Možete raditi par dana nedeljno.

### 8. Fizički radovi

Selidbe, sitni popravci, vrtlarstvo, bojenje — ako ste fizički sposobni, posla ima za vikend ili popodne.

### 9. Onlajn ankete i testiranje aplikacija

Manje isplativo, ali bez napora. Kompanije plaćaju za povratne informacije o njihovim aplikacijama i sajtovima.

### 10. Prevođenje tekstova

Ako znate engleski, nemački, francuski ili drugi jezik, agencije i portali stalno traže prevodioce.

### 11. Instrukcije

Matematika, srpski, engleski, muzika — instruktori zarada 1.000–3.000 RSD po času, a polaznici se nalaze i online.

### 12. Fotografija i snimanje

Rodjendani, mature, venčanja, poslovni portrait — događaji se organizuju celog godine. Čak i poluamater može zaraditi.

### 13. Nega bašte i dvorišta

Košenje, zasađivanje, uređenje dvorišta — sezonski, ali dobro plaćen posao, posebno u kućnim naseljima.

### 14. Kreativni zanati i prodaja ručnih radova

Nakit, sveće, keramika, odeća — prodaja na pijaci, Instagram shopu ili Etsy-u.

### 15. Parking i garaža

Ako imate parking ili garažu u centru, iznajmljivanje po satu ili mesečno može biti pasivni prihod.

## Kako organizovati dvostruki prihod?

- Jasno definirajte koliko sati nedeljno ste dostupni
- Stavite jasnu granicu između posla i odmora
- Koristite platforme koje automatizuju komunikaciju i plaćanje
- Počnite polako — jedan–dva klijenta, pa proširite

Ključ je regularnost. Čak i 5–10 sati nedeljno honorarnog rada može doneti 20.000–50.000 RSD mesečno.
    `,
  },
  'jednodnevni-angazmani-srbija': {
    title: 'Jednodnevni angažmani — zašto su budućnost tržišta rada u Srbiji',
    date: '2025-07-15',
    readTime: '5 min',
    category: 'Trendovi',
    image: '⚡',
    content: `
## Gig ekonomija stiže u Srbiju

Gig ekonomija — ekonomija kratkih, projektnih angažmana — odavno je prisutna na Zapadu. U Srbiji se ubrzano razvija, posebno posle 2020. godine.

## Šta su jednodnevni angažmani?

To su poslovi koji traju jedan dan ili kraće — od nekoliko sati do celog radnog dana. Tipični primeri:

- Pomoćni radnik na gradilištu (jedan dan)
- Konobar na svadbi ili proslavi
- Vozač za preseljenje
- Spremačica tokom selidbe
- Čuvar na manifestaciji
- Promoter na sajmu

## Zašto firme sve više biraju ovaj model?

**Za firme:**
- Bez obaveza — nema prijave na Fond PIO, nema plaćanja doprinosa za kratke angažmane
- Brz odgovor na potrebe — kad zatreba, odmah imaju radnika
- Fleksibilnost prema sezoni i projektima

**Za radnike:**
- Plate brzo (često isti dan)
- Bez vezivanja — možete raditi za više poslodavaca
- Iskustvo u različitim oblastima
- Idealno za studente i nezaposlene

## Kako koristiti ExpertPro za hitne angažmane?

1. Kreirajte profil i označite dostupnost
2. Uključite notifikacije
3. Kad vidite oglas koji odgovara, odmah se javite
4. Komunicirajte jasno i profesionalno
5. Po završetku, tražite recenziju

Firme biraju radnike sa ocenama i recenzijama — svaki posao gradi vašu reputaciju.

## Trend koji će rasti

Prema procenama, do 2030. više od 30% radne snage u Srbiji će imati bar deo prihoda od kratkorojnih angažmana. To nije pretnja — to je prilika za one koji se prilagode.
    `,
  },
  'cuvanje-dece-i-ljubimaca-posao': {
    title: 'Čuvanje dece i kućnih ljubimaca — posao koji se uvek isplati',
    date: '2025-07-22',
    readTime: '5 min',
    category: 'Usluge',
    image: '🐾',
    content: `
## Čuvanje kao posao

Čuvanje dece (babysitting) i kućnih ljubimaca (pet-siting) su dva od najstabilnijih honorarnih poslova u Srbiji. Potražnja je stalna, plaća je dobra, a nije potrebno formalno obrazovanje — samo ljubav, odgovornost i komunikacija.

## Čuvanje dece

### Ko može raditi ovaj posao?
- Studenti i studentkinje (idealno za popodnevne i večernje sate)
- Mladi roditelji sa iskustvom
- Penzioneri koji vole rad sa decom
- Vaspitači i nastavnici koji žele dodatni prihod

### Koliko se zarađuje?
- 600–1.000 RSD po satu (zavisno od broja dece i grada)
- Čuvanje noću: 3.000–6.000 RSD
- Čuvanje tokom vikenda: 5.000–12.000 RSD (ceo dan)

### Šta poslodavci traže?
- Iskustvo sa decom (makar iz porodice)
- Reference od prethodnih klijenata
- Verifikovan profil na platformi
- Odgovornost i tačnost

## Čuvanje kućnih ljubimaca (pet-siting)

### Vrste usluga
- **Šetanje pasa** — 30–60 min, 300–500 RSD po šetnji
- **Pet-siting kod vlasnika** — dolazak kući, briga za ljubimca
- **Pet-siting kod vas** — ljubimac boravi kod vas (bolje plaćeno)
- **Briga tokom odmora** — kad vlasnici putuju (3.000–6.000 RSD/dan)

### Saveti za početnike
1. Napravite profil sa fotografijom
2. Navedite koje vrste ljubimaca primate
3. Jasno definišite usluge i cene
4. Počnite sa nižom cenom da dobijete prve recenzije
5. Tražite recenzije od svakog klijenta

## Kombinujte usluge

Mnogi pružaoci usluga kombinuju čuvanje dece i ljubimaca — to proširuje krug klijenata i čini vas atraktivnijim u pretrazi.

Na ExpertPro platformi, ovo su jedne od najtraženijih kategorija. Registrujte se i odmah počnite da primate upite.
    `,
  },
  'freelancing-u-srbiji-vodic': {
    title: 'Frilenserski rad u Srbiji — praktični vodič od nule do prvog klijenta',
    date: '2025-08-05',
    readTime: '10 min',
    category: 'Freelancing',
    image: '🖥️',
    content: `
## Šta je frilenserski rad?

Freelancing znači rad za više klijenata, po projektima ili ugovorima, bez stalnog radnog odnosa. Vi birate klijente, projekte, cene i raspored.

## Prednosti i izazovi

**Prednosti:**
- Sloboda i autonomija
- Potencijalno viša zarada od prosečne plate
- Rad od kuće ili bilo gde
- Raznovrsnost projekata

**Izazovi:**
- Nestabilni prihodi u početku
- Lično morate tražiti klijente
- Porez i administracija (paušal ili preduzetnik)
- Nema bolovanja ni godišnjeg odmora

## Korak 1 — Definišite nišu

Ne budite "sve za sve". Specijalizujte se:
- Web dizajn za lokalne firme
- SEO za restorane i hotele
- Prevođenje u medicinskom sektoru
- Programiranje u određenoj tehnologiji

## Korak 2 — Napravite portfolio

Čak i bez prethodnih klijenata:
- Uradite imaginativne projekte (osmislite fiktivnog klijenta)
- Ponudite uslugu besplatno ili po sniženoj ceni prvim klijentima
- Prijavite se na volonterske projekte

## Korak 3 — Odredite cenu

Istraživanje: šta naplaćuju drugi za iste usluge u Srbiji?
- Počnite nešto ispod tržišne cene da biste dobili prve klijente
- Postepeno podižite cene sa recenzijama i iskustvom

## Korak 4 — Pronađite klijente

- ExpertPro (za lokalne klijente)
- Upwork, Fiverr (za međunarodne klijente)
- LinkedIn (za B2B klijente)
- Lokalne Facebook grupe preduzetnika
- Direktan kontakt — pišite firmama koje bi mogle imati potrebu za vašim uslugama

## Korak 5 — Legalizujte rad

U Srbiji, freelancing se može legalizovati kao:
- **Paušalni porez** — ako ste preduzetnik paušalac
- **Autorski ugovor** — za kreativne usluge (plaćate porez sam/a)
- **Ugovor o delu** — za povremene stručne usluge

Konsultujte računovođu za konkretne savete.

## Budite profesionalac

- Odgovarajte na upite u roku od 24 sata
- Ispoštujte rokove (ili naglasite unapred ako ne možete)
- Koristite jednostavne ugovore čak i za male projekte
- Tražite 30–50% avansa pre početka rada

Freelancing nije za svakoga, ali onima koji su organizovani i samomotivisani donosi slobodu i dobre prihode.
    `,
  },
  'hitni-poslovi-srbija': {
    title: 'Hitni poslovi u Srbiji — kako reagovati brzo i zaraditi',
    date: '2025-08-12',
    readTime: '4 min',
    category: 'Saveti',
    image: '🚨',
    content: `
## Šta su hitni poslovi?

Hitni poslovi su angažmani koji se traže "odmah" — za isti dan, sutra ujutru ili za vikend koji je već tu. Firme i privatna lica koja ne mogu da čekaju spremnа su da plate više.

## Gde se pojavljuju hitni poslovi?

- Gradilišta gde je radnik otkazao u poslednji čas
- Restorani i kafić kojima je trebalo više osoblja
- Selidbe koje su zakazane
- Kvarovi koji zahtevaju hitnu intervenciju (voda, struja)
- Događaji (svadbe, proslave) kojima treba podrška

## Kako biti spreman?

### 1. Profil koji budi poverenje
Fotografija, bio, veštine, recenzije — sve mora biti popunjeno. U hitnim situacijama, nema vremena za dugačke razgovore. Poslodavac bira brzo.

### 2. Notifikacije uključene
Uključite push notifikacije na ExpertPro aplikaciji. Hitni oglas se popuni za 30–60 minuta.

### 3. Označite dostupnost
Svakodnevno ili nedeljno ažurirajte dostupnost u profilu.

### 4. Brz odgovor
Na hitne oglase odgovorite u prvih 5–10 minuta. Kratko, jasno: "Slobodan/na sam, mogu odmah."

## Hitni vs. redovni poslovi — cena

Hitni poslovi obično plaćaju 20–40% više. Ako redovni fizički radnik zarađuje 1.000 RSD/h, hitni može biti 1.200–1.400 RSD/h.

## Posebna kategorija: Hitna berza

Na ExpertPro, postoji posebna kategorija "Hitno!" gde se pojavljuju isključivo hitni angažmani. Filtrujte oglase po tipu i budite prvi koji će se javiti.
    `,
  },
  'fizicki-radnici-srbija': {
    title: 'Tražnja za fizičkim radnicima u Srbiji nikad nije bila veća — evo zašto',
    date: '2025-08-18',
    readTime: '5 min',
    category: 'Trendovi',
    image: '🏗️',
    content: `
## Deficitarna zanimanja u Srbiji

Fizički radnici — od zidara i ličilaca do magacinera i vozača — su jedno od najdeficitarnijih zanimanja u Srbiji. Paradoksalno, u zemlji sa visokom stopom nezaposlenosti, firme ne mogu da nađu dovoljno radnika za fizičke poslove.

## Zašto nedostaju fizički radnici?

- Odliv radne snage u EU (Nemačka, Austrija, Slovenija)
- Mladi preferiraju kancelarijska ili IT zanimanja
- Nedostatak stručnih škola i obučenih kadrova
- Sezonska priroda poslova — teško je planirati

## Koje su cene?

| Zanimanje | Dnevnica |
|---|---|
| Zidar | 3.500–6.000 RSD |
| Ličilac | 3.000–5.000 RSD |
| Fizički radnik (nekvalifikovani) | 2.500–4.000 RSD |
| Magacioner | 2.000–3.500 RSD |
| Vozač kamiona | 4.000–8.000 RSD |
| Elektricar | 4.500–8.000 RSD |

## Kako iskoristiti ovu tražnju?

Ako imate iskustva u fizičkim poslovima, trebalo bi da:

1. **Registrujete se na ExpertPro** i napravite profil sa iskustvom i veštinama
2. **Navedete specijalizaciju** — nemojte biti "sve mogu", budite specifični
3. **Postavite realnu dnevnicu** — nemojte da je bude ni previše niska ni previsoka
4. **Budite dostupni za hitne pozive** — firme često traže radnike na 24 sata do 48 sati unapred
5. **Sakupljajte reference** — svaki poslodavac koji je zadovoljan je potencijalna buduća preporuka

## Perspektiva

Dok se Srbija razvija i gradi (stanogradnja, putevi, industrijska postrojenja), potražnja za fizičkim radnicima nastaviće da raste. To je stabilno tržište za one koji odaberu ovu profesiju.
    `,
  },
}

function renderContent(content: string) {
  const lines = content.trim().split('\n')
  const elements: React.ReactNode[] = []
  let key = 0

  for (const line of lines) {
    if (line.startsWith('## ')) {
      elements.push(<h2 key={key++} className="text-2xl font-bold text-gray-900 mt-8 mb-4">{line.slice(3)}</h2>)
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={key++} className="text-lg font-semibold text-gray-800 mt-6 mb-3">{line.slice(4)}</h3>)
    } else if (line.startsWith('- ')) {
      elements.push(<li key={key++} className="ml-5 mb-1 text-gray-700 list-disc">{line.slice(2)}</li>)
    } else if (line.startsWith('| ')) {
      // Table row
      const cells = line.split('|').filter(c => c.trim())
      if (cells[0].trim().startsWith('---')) {
        // Skip separator row
      } else {
        elements.push(
          <tr key={key++} className="border-b border-gray-100">
            {cells.map((c, i) => (
              <td key={i} className="py-2 px-4 text-sm text-gray-700">{c.trim()}</td>
            ))}
          </tr>
        )
      }
    } else if (line.startsWith('1. ') || line.match(/^\d+\. /)) {
      elements.push(<li key={key++} className="ml-5 mb-1 text-gray-700 list-decimal">{line.replace(/^\d+\. /, '')}</li>)
    } else if (line.trim() === '') {
      elements.push(<div key={key++} className="my-2" />)
    } else if (line.startsWith('**') && line.includes(':**')) {
      const [boldPart, rest] = line.split(':**')
      elements.push(
        <p key={key++} className="mb-2 text-gray-700">
          <strong className="font-semibold text-gray-900">{boldPart.replace('**', '')}:</strong>{rest}
        </p>
      )
    } else {
      elements.push(<p key={key++} className="mb-3 text-gray-700 leading-relaxed">{line}</p>)
    }
  }

  return elements
}

export async function generateStaticParams() {
  return Object.keys(POSTS).map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = POSTS[params.slug]
  if (!post) return {}
  return {
    title: `${post.title} — ExpertPro Blog`,
    description: post.content.slice(0, 160),
  }
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = POSTS[params.slug]
  if (!post) notFound()

  const relatedSlugs = Object.keys(POSTS).filter(s => s !== params.slug).slice(0, 3)

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <Link href="/blog" className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 mb-6">
              <ArrowLeft className="w-4 h-4" /> Svi tekstovi
            </Link>
            <div className="text-5xl mb-4">{post.image}</div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">{post.category}</span>
              <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{post.date}</span>
              <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{post.title}</h1>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 prose prose-gray max-w-none">
            {renderContent(post.content)}
          </div>

          {/* CTA */}
          <div className="mt-8 bg-blue-600 rounded-2xl p-8 text-white text-center">
            <h3 className="text-xl font-bold mb-2">Spreman/na za honorarni posao?</h3>
            <p className="text-blue-100 mb-4 text-sm">Registruj se besplatno i pronađi prve klijente danas.</p>
            <Link href="/register" className="inline-block bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
              Kreiraj profil besplatno
            </Link>
          </div>

          {/* Related */}
          <div className="mt-10">
            <h3 className="font-bold text-gray-900 mb-4">Pročitaj još</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedSlugs.map(slug => {
                const related = POSTS[slug]
                return (
                  <Link key={slug} href={`/blog/${slug}`} className="block bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all">
                    <div className="text-3xl mb-2">{related.image}</div>
                    <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">{related.title}</p>
                    <span className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                      Čitaj <ChevronRight className="w-3 h-3" />
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
