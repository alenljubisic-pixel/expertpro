import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata = {
  title: 'Uslovi korišćenja',
  description: 'Uslovi korišćenja ExpertPro platforme.',
  alternates: { canonical: 'https://www.expertpro.app/uslovi' },
}

export default function UsloviPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Uslovi korišćenja</h1>
          <p className="text-gray-500 text-sm mb-10">Poslednje ažuriranje: 1. oktobar 2026.</p>
          <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-8 text-sm leading-relaxed text-gray-700">
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">1. Šta ExpertPro radi</h2>
              <p>ExpertPro omogućava objavljivanje oglasa, prijave, dogovor kroz funkcije platforme, evidenciju dodeljenog posla i međusobne ocene. Svaki korisnik može da traži pomoć ili ponudi svoj rad. Prikaz oglasa, prijave ili profila sam po sebi ne znači da je ExpertPro poslodavac, agencija za zapošljavanje, izvođač usluge ili strana u dogovoru između korisnika. Ako je operater platforme izričito naveden kao ponuđač u pojedinačnom oglasu, odgovornost za tu ponudu procenjuje se posebno.</p>
            </section>
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">2. Nalog i status firme/agencije</h2>
              <p>Podaci o nalogu moraju biti tačni i ažurni. Fizičko lice se javno prikazuje pod korisničkim imenom; podaci potrebni za nalog i eventualnu proveru čuvaju se odvojeno. Prelazak naloga na firmu ili agenciju zahteva unos poslovnih podataka i odobrenje administratora pre objavljivanja ili obnove aktivnih oglasa. Odobrenje naloga nije potvrda stručne licence, radne dozvole, osiguranja niti garancija kvaliteta rada.</p>
            </section>
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">3. Oglasi i informacije korisnika</h2>
              <p>Korisnik koji objavi oglas odgovara za tačnost njegovog sadržaja, cenu koju navodi, potrebne dozvole i zakonitost ponude. Zabranjeni su lažni, obmanjujući, diskriminatorni i nezakoniti oglasi, spam i sadržaj kojim se povređuju prava drugih. ExpertPro ne proverava unapred svaku tvrdnju korisnika. Možemo pregledati prijavu, ukloniti nedopušten sadržaj i ograničiti nalog u skladu sa zakonom i ovim uslovima. Sporan oglas ili ponašanje možete prijaviti kroz <Link href="/podrska" className="text-blue-700 underline">podršku</Link>.</p>
            </section>
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">4. Dogovor i bezbednost</h2>
              <p>Obim posla, termin, cena, plaćanje za sam rad i odgovornost za izvršenje dogovaraju se između korisnika koji sarađuju. Pre angažovanja proverite identitet, reference, kvalifikacije, dozvole za regulisane poslove, pravo na rad i uslove bezbednosti kada su relevantni. Posebna pažnja potrebna je za rad sa decom, starijim osobama, električnim instalacijama i drugim poslovima s povećanim rizikom. Ocene i oznake na profilu su pomoć pri izboru, ali nisu garancija ni zamena za ličnu proveru.</p>
            </section>
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">5. Odgovornost platforme</h2>
              <p>ExpertPro ne garantuje da će korisnik dobiti posao, prihod ili konkretnog kandidata, niti garantuje tačnost tuđih oglasa, dolazak, kvalitet rada ili ispunjenje dogovora druge strane. U meri dozvoljenoj zakonom, platforma ne preuzima odgovornost za postupke samostalnih korisnika, njihove međusobne sporove, izgubljenu zaradu ili štetu koju jedan korisnik prouzrokuje drugom van same usluge platforme. Ove odredbe ne isključuju niti ograničavaju odgovornost ExpertPro za sopstvene radnje, zakonske obaveze ili prava koja potrošaču pripadaju po prinudnim propisima. Korišćenje usluga drugih korisnika podrazumeva uobičajen rizik izbora izvođača.</p>
            </section>
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">6. Krediti, oglasi i ocene</h2>
              <p>Krediti služe za funkcije platforme prema važećem <Link href="/cenovnik" className="text-blue-700 underline">cenovniku</Link>; nisu cena rada koju plaćate drugom korisniku. Uslovi trajanja zavise od vrste oglasa: zahtevi za rad mogu ostati otvoreni do dodele uz pauziranje neaktivnih, dok ponude usluga imaju rok trajanja prikazan pri objavi. Ocene se ostavljaju u okviru potvrđene saradnje. Zakonska prava u vezi s naplatom i reklamacijama ne mogu se isključiti ovim uslovima.</p>
            </section>
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">7. Prijave, ograničenje naloga i sporovi</h2>
              <p>Možemo pauzirati oglas ili ograničiti nalog zbog kršenja pravila, uz razmatranje prijave i zakonskih obaveza. Ako je nastao spor između korisnika, sačuvajte prepisku i dogovor, prijavite problem podršci i obratite se nadležnim organima kada je potrebno. Na uslugu platforme primenjuje se pravo Republike Srbije, bez uskraćivanja zakonom garantovanih prava i pravila o nadležnosti suda.</p>
            </section>
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">8. Kontakt i privatnost</h2>
              <p>Za pitanja o platformi, nalogu ili prijavu spornog sadržaja pišite na <a href="mailto:podrska@expertpro.app" className="text-blue-700 underline">podrska@expertpro.app</a>. Obrada ličnih podataka opisana je u <Link href="/privatnost" className="text-blue-700 underline">Politici privatnosti</Link>.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
