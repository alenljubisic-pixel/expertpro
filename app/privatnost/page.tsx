import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata = {
  title: 'Politika privatnosti',
  description: 'Politika privatnosti ExpertPro platforme — kako prikupljamo i koristimo vaše podatke.',
  alternates: { canonical: 'https://www.expertpro.app/privatnost' },
}

export default function PrivatnostPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Politika privatnosti</h1>
          <p className="text-gray-500 text-sm mb-10">Poslednje ažuriranje: 1. oktobar 2026.</p>

          <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-8">
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">1. Ko smo mi</h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                ExpertPro je internet platforma za objavu oglasa i povezivanje korisnika koji traže ili nude rad.
                Za podatke potrebne za naloge, oglase i funkcionisanje platforme operater ExpertPro nastupa kao
                rukovalac podacima o ličnosti u skladu sa Zakonom o zaštiti podataka o ličnosti. Ova politika
                opisuje osnovne kategorije i svrhe obrade; identitet registrovanog operatera i sedište moraju
                biti dopunjeni pre potpunog pravnog usaglašavanja.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">2. Podaci koje prikupljamo</h2>
              <p className="text-gray-600 leading-relaxed text-sm mb-3">Prikupljamo sledeće kategorije podataka:</p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex gap-2"><span className="font-medium text-gray-800 w-36 flex-shrink-0">Registracioni podaci:</span><span>Ime, email adresa, šifrovani zapis lozinke ili podaci OAuth prijave, tip naloga i javno korisničko ime</span></div>
                <div className="flex gap-2"><span className="font-medium text-gray-800 w-36 flex-shrink-0">Podaci profila:</span><span>Fotografija, grad, telefon, veštine, bio (opciono)</span></div>
                <div className="flex gap-2"><span className="font-medium text-gray-800 w-36 flex-shrink-0">Podaci oglasa:</span><span>Naslovi, opisi, cene, kategorije, prijave, ocene i prijave problema</span></div>
                <div className="flex gap-2"><span className="font-medium text-gray-800 w-36 flex-shrink-0">Podaci o upotrebi:</span><span>IP adresa, pretraživač, stranice koje ste posetili</span></div>
                <div className="flex gap-2"><span className="font-medium text-gray-800 w-36 flex-shrink-0">Poruke:</span><span>Sadržaj poruka između korisnika</span></div>
                <div className="flex gap-2"><span className="font-medium text-gray-800 w-36 flex-shrink-0">Krediti:</span><span>Evidencija narudžbina, potvrda uplata, stanja kredita i preporuka</span></div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">3. Kako koristimo podatke</h2>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1.5">
                <li>Pružanje i poboljšanje usluge platforme</li>
                <li>Potvrda emaila, administrativna provera poslovnih naloga i sprečavanje zloupotrebe</li>
                <li>Obaveštenja o radnjama na platformi prema dostupnim podešavanjima</li>
                <li>Analiza korišćenja radi unapređenja funkcionalnosti</li>
                <li>Ispunjavanje zakonskih obaveza</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">4. Deljenje podataka</h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                Vaše lične podatke ne prodajemo trećim stranama. Podaci se dele jedino:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1.5 mt-2">
                <li>Javno se prikazuju korisničko ime ili naziv firme, oglas, dobrovoljno uneti podaci profila i ocene; privatni podaci o kontaktu dostupni su samo u okviru dozvoljenog toka saradnje i administraciji.</li>
                <li>Sa pružaocima tehničkih usluga (Supabase za bazu podataka, Vercel za hosting)</li>
                <li>Na zahtev nadležnih organa u skladu sa zakonom</li>
              </ul>
              <p className="text-gray-600 text-sm mt-3">
                Ne objavljujte u oglasima ili polju „O meni“ podatke koje ne želite da drugi vide. Privatni kontakt podaci naloga nisu deo javne liste profila.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">5. Facebook i društvene mreže</h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                Ako koristite omogućenu prijavu preko Google-a ili drugog pružaoca prijave, možemo preuzeti
                podatke potrebne za nalog, uključujući email, ime i profilnu fotografiju koju taj pružalac
                prosledi. Facebook prijava trenutno nije javno dostupna. Profilnu fotografiju možete
                zameniti u podešavanjima profila.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">6. Kolačići (cookies)</h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                Koristimo neophodne mehanizme sesije za prijavu i rad naloga. Sajt koristi i osnovnu
                analitiku poseta radi merenja rada platforme. Ovim tekstom ne tvrdimo da svako merenje
                zahteva ili ne zahteva saglasnost; podešavanja analitike i obaveštenja o kolačićima
                treba posebno proveriti pre šireg javnog lansiranja.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">7. Vaša prava</h2>
              <p className="text-gray-600 leading-relaxed text-sm mb-2">U skladu sa primenljivim propisima možete tražiti:</p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1.5">
                <li>Pristup vašim podacima</li>
                <li>Ispravku netačnih podataka</li>
                <li>Brisanje podataka (&quot;pravo na zaborav&quot;)</li>
                <li>Prenosivost podataka</li>
                <li>Prigovor na obradu podataka</li>
                <li>Informacije o svrsi, osnovu i roku čuvanja podataka, kao i obraćanje Povereniku ako smatrate da su vaša prava povređena</li>
              </ul>
              <p className="text-sm text-gray-600 mt-3">
                Zahteve možete poslati na{' '}
                <a href="mailto:podrska@expertpro.app" className="text-blue-600 hover:underline">
                  podrska@expertpro.app
                </a>
                . Zahteve razmatramo u zakonskim rokovima, uz proveru identiteta kada je potrebna.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">8. Čuvanje podataka</h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                Podaci se čuvaju koliko je potrebno za nalog i pružanje usluge, rešavanje sporova i
                ispunjavanje zakonskih obaveza. Zahtev za brisanje razmatramo uz proveru da li postoje
                obaveze ili opravdani razlozi za dalje čuvanje pojedinih zapisa. Tačni rokovi po vrstama
                podataka moraju biti definisani u završnoj pravnoj i operativnoj politici.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">9. Bezbednost</h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                Koristimo HTTPS vezu, kontrolu pristupa nalogu i zaštitu lozinki kod pružaoca prijave.
                Nijedan sistem nije potpuno bez rizika —
                obavestite nas odmah ako primetite neovlašćen pristup vašem nalogu.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">10. Kontakt</h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                Za sva pitanja o zaštiti podataka:{' '}
                <a href="mailto:podrska@expertpro.app" className="text-blue-600 hover:underline">
                  podrska@expertpro.app
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
