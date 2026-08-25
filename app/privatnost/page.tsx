import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata = {
  title: 'Politika privatnosti | ExpertPro',
  description: 'Politika privatnosti ExpertPro platforme — kako prikupljamo i koristimo vaše podatke.',
}

export default function PrivatnostPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Politika privatnosti</h1>
          <p className="text-gray-400 text-sm mb-10">Poslednje ažuriranje: januar 2025.</p>

          <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-8">
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">1. Ko smo mi</h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                ExpertPro je srpska platforma za posredovanje između radnika i poslodavaca. Ova politika
                privatnosti objašnjava kako prikupljamo, koristimo i štitimo vaše lične podatke u skladu
                sa Zakonom o zaštiti podataka o ličnosti (ZZPL) i GDPR regulativom.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">2. Podaci koje prikupljamo</h2>
              <p className="text-gray-600 leading-relaxed text-sm mb-3">Prikupljamo sledeće kategorije podataka:</p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex gap-2"><span className="font-medium text-gray-800 w-36 flex-shrink-0">Registracioni podaci:</span><span>Ime, email adresa, lozinka (heš)</span></div>
                <div className="flex gap-2"><span className="font-medium text-gray-800 w-36 flex-shrink-0">Podaci profila:</span><span>Fotografija, grad, telefon, veštine, bio (opciono)</span></div>
                <div className="flex gap-2"><span className="font-medium text-gray-800 w-36 flex-shrink-0">Podaci oglasa:</span><span>Naslovi, opisi, cene, kategorije</span></div>
                <div className="flex gap-2"><span className="font-medium text-gray-800 w-36 flex-shrink-0">Podaci o upotrebi:</span><span>IP adresa, pretraživač, stranice koje ste posetili</span></div>
                <div className="flex gap-2"><span className="font-medium text-gray-800 w-36 flex-shrink-0">Poruke:</span><span>Sadržaj poruka između korisnika</span></div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">3. Kako koristimo podatke</h2>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1.5">
                <li>Pružanje i poboljšanje usluge platforme</li>
                <li>Verifikacija identiteta i sprečavanje prevara</li>
                <li>Slanje obaveštenja o novim oglasima i porukama</li>
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
                <li>Sa korisnicima sa kojima ste stupili u kontakt putem platforme (ime, grad, ocena)</li>
                <li>Sa pružaocima tehničkih usluga (Supabase za bazu podataka, Vercel za hosting)</li>
                <li>Na zahtev nadležnih organa u skladu sa zakonom</li>
              </ul>
              <p className="text-gray-600 text-sm mt-3">
                Telefon i email adresa nikada se ne prikazuju javno bez vaše eksplicitne dozvole.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">5. Facebook i društvene mreže</h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                Ako se registrujete ili prijavite putem Facebook naloga, preuzimamo vaše javne podatke
                (ime, email, profilna fotografija) isključivo u svrhu kreiranja profila. Ne postavljamo
                ništa na vaš Facebook profil niti pristupamo vašim Facebook kontaktima. Profilnu
                fotografiju sa Facebooka možete zameniti sopstvenom u bilo kom trenutku.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">6. Kolačići (cookies)</h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                Koristimo esencijalne kolačiće neophodne za funkcionisanje platforme (sesija, autentikacija).
                Ne koristimo kolačiće za praćenje u reklamne svrhe bez vaše saglasnosti.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">7. Vaša prava</h2>
              <p className="text-gray-600 leading-relaxed text-sm mb-2">U skladu sa ZZPL i GDPR imate pravo na:</p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1.5">
                <li>Pristup vašim podacima</li>
                <li>Ispravku netačnih podataka</li>
                <li>Brisanje podataka ("pravo na zaborav")</li>
                <li>Prenosivost podataka</li>
                <li>Prigovor na obradu podataka</li>
              </ul>
              <p className="text-sm text-gray-600 mt-3">
                Zahteve možete poslati na{' '}
                <a href="mailto:podrska@expertpro.rs" className="text-blue-600 hover:underline">
                  podrska@expertpro.rs
                </a>
                . Odgovaramo u roku od 30 dana.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">8. Čuvanje podataka</h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                Podatke čuvamo dok je vaš nalog aktivan. Kada zatražite brisanje naloga, vaši podaci
                se trajno brišu u roku od 30 dana, osim podataka koje smo zakonski obavezni da čuvamo.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">9. Bezbednost</h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                Koristimo industrijske standarde zaštite podataka: HTTPS enkripcija, hešovane lozinke,
                redovne bezbednosne provere. Uprkos tome, nijedan sistem nije 100% siguran —
                obavestite nas odmah ako primetite neovlašćen pristup vašem nalogu.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">10. Kontakt</h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                Za sva pitanja o zaštiti podataka:{' '}
                <a href="mailto:podrska@expertpro.rs" className="text-blue-600 hover:underline">
                  podrska@expertpro.rs
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
