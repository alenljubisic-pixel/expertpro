import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata = {
  title: 'Uslovi korišćenja | ExpertPro',
  description: 'Uslovi korišćenja ExpertPro platforme.',
}

export default function UsloviPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Uslovi korišćenja</h1>
          <p className="text-gray-400 text-sm mb-10">Poslednje ažuriranje: januar 2025.</p>

          <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-8 prose prose-gray max-w-none">
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">1. Prihvatanje uslova</h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                Korišćenjem ExpertPro platforme prihvatate ove uslove korišćenja u celosti. Ukoliko se
                ne slažete sa uslovima, molimo vas da ne koristite platformu. Zadržavamo pravo da
                izmenimo ove uslove u bilo kom trenutku, uz obaveštenje korisnicima.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">2. Registracija i nalog</h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                Registracijom na platformi garantujete da ste punoljetni i da ste uneli tačne podatke.
                Odgovorni ste za bezbednost svog naloga i lozinke. Svaki nalog može biti korišćen
                samo od strane jedne osobe ili pravnog lica.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">3. Oglasi i sadržaj</h2>
              <p className="text-gray-600 leading-relaxed text-sm mb-3">
                Korisnici su isključivo odgovorni za sadržaj koji objavljuju. Zabranjeno je objavljivanje:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1.5">
                <li>Lažnih ili obmanjujućih oglasa</li>
                <li>Sadržaja koji krši prava trećih lica</li>
                <li>Oglasa za ilegalne aktivnosti ili usluge</li>
                <li>Diskriminatornog ili uvredljivog sadržaja</li>
                <li>Spam sadržaja ili dupliciranih oglasa</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">4. Trajanje oglasa</h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                Standardni oglasi ostaju aktivni 15 dana od dana objavljivanja. Dugoročni oglasi
                ostaju aktivni 30 dana. Nakon isteka, oglas se automatski deaktivira i možete ga
                obnoviti putem kontrolne table.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">5. Ograničenja korišćenja</h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                Fizička lica mogu imati 1 aktivan oglas po tipu posla. Firme i agencije na besplatnom
                planu mogu imati ukupno 1 aktivan oglas. Za veći broj oglasa potrebna je pretplata na
                jedan od plaćenih planova, koja mora biti odobrena od strane administratora.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">6. Plaćanje i pretplate</h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                Plaćeni planovi se obračunavaju mesečno. Pretplatu možete otkazati u bilo kom trenutku.
                Povrat novca nije moguć za već fakturisane periode. Cene mogu biti promenjene uz
                prethodno obaveštenje od 30 dana.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">7. Odgovornost</h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                ExpertPro je platforma koja spaja korisnike i nije odgovorna za kvalitet obavljenih
                usluga, tačnost informacija u oglasima, niti za sporove između korisnika. Preporučujemo
                korisnicima da sami provere identitet i reference radnika pre angažovanja.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">8. Gašenje naloga</h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                Zadržavamo pravo da ugasimo nalog koji krši ove uslove korišćenja, bez prethodnog
                upozorenja. Korisnici mogu zatražiti brisanje naloga slanjem zahteva na
                podrska@expertpro.rs.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">9. Merodavno pravo</h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                Na ove uslove primenjuje se pravo Republike Srbije. Za sve sporove mesno je nadležan
                sud u Beogradu.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">10. Kontakt</h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                Za sva pitanja u vezi sa uslovima korišćenja, kontaktirajte nas na{' '}
                <a href="mailto:podrska@expertpro.rs" className="text-blue-600 hover:underline">
                  podrska@expertpro.rs
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
