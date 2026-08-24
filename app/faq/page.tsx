'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ChevronDown, ChevronUp } from 'lucide-react'

const FAQ_SECTIONS = [
  {
    title: 'O platformi',
    items: [
      {
        q: 'Šta je ExpertPro?',
        a: 'ExpertPro je srpska platforma koja povezuje poslodavce i radnike za kratkotrajna, honorarna i projektna zapošljavanja. Bilo da tražite spremačicu za jedan dan, vozača, programera ili konobara za vikend — ExpertPro je pravo mesto.',
      },
      {
        q: 'Za koga je namenjen ExpertPro?',
        a: 'Za sve — radnike koji žele da nađu posao (stalno ili honorarno), firme i agencije koje traže radnike, i privatna lica koja trebaju uslugu. Platforma je otvorena za fizička lica, firme i agencije za privremeno zapošljavanje.',
      },
      {
        q: 'Da li je ExpertPro besplatan?',
        a: 'Osnovna registracija i pretraživanje oglasa su besplatni. Za objavu jednog aktivnog oglasa, koristite besplatni plan. Plaćeni planovi nude više aktivnih oglasa, prioritetni prikaz i napredne funkcije za firme i agencije.',
      },
      {
        q: 'Koja je razlika između ExpertPro i klasičnih sajtova za posao?',
        a: 'Klasični sajtovi za posao (Infostud, LinkedIn) fokusirani su na stalno zapošljavanje. ExpertPro je specijalizovan za kratkotrajna i honorarna zapošljavanja — od jednog sata do nekoliko meseci. Naš model je brži, fleksibilniji i prilagođen potrebama moderne ekonomije.',
      },
    ],
  },
  {
    title: 'Registracija i nalog',
    items: [
      {
        q: 'Kako se registrujem?',
        a: 'Kliknite na "Registruj se" i odaberite tip naloga (fizičko lice, firma ili agencija). Možete se registrovati email-om i lozinkom, ili brzo putem Google ili Facebook naloga.',
      },
      {
        q: 'Koji su tipovi naloga?',
        a: 'Postoje tri tipa: (1) Fizičko lice — za radnike i poslodavce koji oglašavaju lično; (2) Firma — preduzeća koja traže radnike, uz verifikaciju PIB-a; (3) Agencija — licencirane agencije za privremeno zapošljavanje.',
      },
      {
        q: 'Zašto mi nalog čeka odobrenje?',
        a: 'Nalozi firmi i agencija prolaze kroz ručno odobrenje kako bismo osigurali legitimnost i zaštitili korisnike. Fizička lica dobijaju automatski pristup. Odobravanje obično traje do 24 sata.',
      },
      {
        q: 'Mogu li promeniti tip naloga?',
        a: 'Da. U podešavanjima profila možete podneti zahtev za promenu tipa naloga. Promjena iz fizičkog lica u firmu ili agenciju zahteva verifikaciju.',
      },
    ],
  },
  {
    title: 'Oglasi i zapošljavanje',
    items: [
      {
        q: 'Kako objavim oglas?',
        a: 'Nakon prijave, kliknite na "Novi oglas" u navigaciji ili na dugme u vašem dashboardu. Popunite naziv, opis, lokaciju, cenu i kategoriju, i kliknite "Objavi".',
      },
      {
        q: 'Koje kategorije poslova postoje?',
        a: 'Platforma pokriva: Građevina, Čišćenje, Transport, Ugostiteljstvo, Čuvanje dece i ljubimaca, IT i računari, Fizički radnici, Obezbeđenje, Popravke i majstorske usluge, Frizeri i kozmetičari, Vrtlarstvo, Administracija, Događaji i promocija, Poljoprivreda i još mnogo toga.',
      },
      {
        q: 'Šta je "Hitno!" oglas?',
        a: '"Hitno!" je posebna kategorija za poslove koji počinju odmah ili isti dan. Ovi oglasi su istaknuti na vrhu pretrage i dobijaju prioritetni prikaz. Radnici koji imaju uključene notifikacije odgovaraju u roku od minuta.',
      },
      {
        q: 'Koliko dugo traje oglas?',
        a: 'Standardni oglas traje 30 dana, nakon čega automatski ističe. Možete ga produžiti ili ukloniti ranije ako ste pronašli radnika. Hitni oglasi su posebno označeni i istaknuti.',
      },
      {
        q: 'Kako kontaktiram radnika ili poslodavca?',
        a: 'Kada pronađete oglas ili profil koji vas zanima, kliknite "Pošalji poruku" i koristite ugrađeni sistem poruka. Sve komunikacije se odvijaju unutar platforme radi sigurnosti.',
      },
    ],
  },
  {
    title: 'Sigurnost i verifikacija',
    items: [
      {
        q: 'Kako je zaštićena moja bezbednost?',
        a: 'Sve komunikacije se odvijaju unutar platforme. Lični kontakt podaci (telefon, email) nisu javno dostupni pre uspostavljanja dogovora. Korisnici koji dele kontakte pre dogovora mogu biti prijavljeni i suspendirani.',
      },
      {
        q: 'Šta je verifikovan profil?',
        a: 'Verifikovani korisnici imaju oznaku ✓ pored profila. Verifikacija se dobija verifikacijom email-a, dostavljanjem dokumenata (za firme) i skupljanjem pozitivnih recenzija. Verifikovani profili dobijaju prioritet u pretrazi.',
      },
      {
        q: 'Šta da radim ako imam problem sa korisnikom?',
        a: 'Koristite dugme "Prijavi korisnika" na svakom profilu ili oglasu. Naš tim pregleda sve prijave u roku od 24 sata i preduzima odgovarajuće mere.',
      },
    ],
  },
  {
    title: 'Plaćanje i cene',
    items: [
      {
        q: 'Da li ExpertPro naplaćuje proviziju?',
        a: 'Ne. ExpertPro ne uzima proviziju od transakcija između radnika i poslodavaca. Plaćate planom pretplate za napredne funkcije, ali sama isplata za posao ide direktno između korisnika.',
      },
      {
        q: 'Kako se dogovoriti o ceni?',
        a: 'Cenu možete navesti u oglasu (po satu, danu, projektu, ili "dogovor"). Finalna cena se dogovara direktno između radnika i poslodavca putem poruka. Preporučujemo da sve dogovorite pre početka posla.',
      },
      {
        q: 'Da li postoji zaštita od prevare?',
        a: 'Preporučujemo da uvek dogovorite detalje pre početka rada, koristite ugrađene poruke (ne prelazite na WhatsApp pre verifikacije), i da izbegavate avanse pre upoznavanja. U slučaju sumnje, kontaktirajte nas.',
      },
      {
        q: 'Koliko košta objava oglasa?',
        a: 'Besplatni plan dozvoljava 1 aktivan oglas. Plaćeni planovi kreću od 990 RSD mesečno za 3 oglasa, pa do enterprise planova za agencije. Svi planovi uključuju neograničenu komunikaciju i pretraživanje.',
      },
    ],
  },
  {
    title: 'Ocenjivanje i recenzije',
    items: [
      {
        q: 'Kako funkcioniše ocenjivanje?',
        a: 'Po završetku posla, obe strane mogu ostaviti ocenu (1–5 zvezdica) i komentar. Prosečna ocena je vidljiva na profilu i utiče na rangiranje u pretrazi.',
      },
      {
        q: 'Mogu li obrisati lošu recenziju?',
        a: 'Ne možete brisati recenzije, ali možete javno odgovoriti na njih. Naš tim uklanja recenzije koje su lažne, uvredljive ili krše naša pravila.',
      },
      {
        q: 'Kako da poboljšam ocenu?',
        a: 'Radite kvalitetno, komunicirajte jasno, poštujte rokove i tražite recenzije od zadovoljnih klijenata. Sa svakim poslom vaš rejting raste.',
      },
    ],
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left py-4 flex items-center justify-between gap-4 hover:text-blue-600 transition-colors"
      >
        <span className="font-medium text-gray-900 text-sm sm:text-base">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-blue-500 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="pb-4 text-sm text-gray-600 leading-relaxed">
          {a}
        </div>
      )}
    </div>
  )
}

export default function FAQPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Česta pitanja</h1>
          <p className="text-gray-500">
            Sve što treba da znate o ExpertPro platformi, registraciji, oglasima i bezbednosti.
            Nije pronašli odgovor?{' '}
            <Link href="/poruke" className="text-blue-600 hover:underline">Kontaktirajte nas</Link>.
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="space-y-8">
          {FAQ_SECTIONS.map(section => (
            <div key={section.title} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">{section.title}</h2>
              </div>
              <div className="px-6">
                {section.items.map(item => (
                  <FAQItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions */}
        <div className="mt-10 bg-blue-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-xl font-bold mb-2">Još uvek imate pitanje?</h3>
          <p className="text-blue-100 mb-4 text-sm">Naš tim je dostupan radnim danima od 9–17h.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors text-sm">
              Kreiraj nalog besplatno
            </Link>
            <a href="mailto:podrska@expertpro.app" className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-400 transition-colors text-sm border border-blue-400">
              Pošalji email
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
