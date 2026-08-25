import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { Check, X, Zap } from 'lucide-react'

export const metadata = {
  title: 'Cenovnik | ExpertPro',
  description: 'Pregled planova i cena na ExpertPro platformi. Fizička lica besplatno zauvek.',
}

const PLANS = [
  {
    name: 'Fizičko lice',
    icon: '👤',
    price: 'Besplatno',
    priceNote: 'zauvek',
    color: 'border-gray-200',
    badge: null,
    description: 'Za radnike i privatne osobe koje traže ili nude usluge.',
    features: [
      { text: '1 aktivan oglas po tipu posla', ok: true },
      { text: 'Profil sa ocenama i referencama', ok: true },
      { text: 'Poruke i kontakt', ok: true },
      { text: 'Hitna berza — besplatno', ok: true },
      { text: 'Oglas aktivan 15 dana (standardni)', ok: true },
      { text: 'Oglas aktivan 30 dana (dugoročni)', ok: true },
      { text: 'Više od 1 oglasa po tipu posla', ok: false },
    ],
    cta: 'Registruj se besplatno',
    ctaHref: '/register',
    ctaStyle: 'bg-gray-900 text-white hover:bg-gray-800',
  },
  {
    name: 'Firma / Agencija',
    icon: '🏢',
    price: 'Besplatno',
    priceNote: 'basic plan',
    color: 'border-gray-200',
    badge: null,
    description: 'Za firme i agencije koje tek počinju ili povremeno traže radnike.',
    features: [
      { text: '1 aktivan oglas ukupno', ok: true },
      { text: 'Firmski profil (PIB, naziv)', ok: true },
      { text: 'Poruke i kontakt', ok: true },
      { text: 'Oglas aktivan 15 dana (standardni)', ok: true },
      { text: 'Oglas aktivan 30 dana (dugoročni)', ok: true },
      { text: 'Neograničen broj oglasa', ok: false },
      { text: 'Istaknuti oglasi', ok: false },
    ],
    cta: 'Registruj firmu',
    ctaHref: '/register',
    ctaStyle: 'bg-gray-900 text-white hover:bg-gray-800',
  },
  {
    name: 'Puno članstvo',
    icon: '🏛️',
    price: 'Na upit',
    priceNote: 'mesečna pretplata',
    color: 'border-blue-500 ring-2 ring-blue-500',
    badge: 'Preporučeno za firme',
    description: 'Za aktivne firme i agencije koje redovno zapošljavaju radnike.',
    features: [
      { text: 'Neograničen broj aktivnih oglasa', ok: true },
      { text: 'Istaknuti oglasi u pretrazi', ok: true },
      { text: 'Firmski profil (PIB, naziv)', ok: true },
      { text: 'Prioritetna podrška', ok: true },
      { text: 'Oglas aktivan 15 dana (standardni)', ok: true },
      { text: 'Oglas aktivan 30 dana (dugoročni)', ok: true },
      { text: 'Verifikovana oznaka agencije', ok: true },
    ],
    cta: 'Kontaktirajte nas',
    ctaHref: '/kontakt',
    ctaStyle: 'bg-blue-600 text-white hover:bg-blue-700',
  },
]

export default function CenovnikPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Cenovnik</h1>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Fizička lica uvek besplatno. Firme i agencije plaćaju mesečnu pretplatu tek kad im treba više oglasa.
            </p>
          </div>

          {/* Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-2xl border p-7 flex flex-col ${plan.color} relative`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-4 py-1 rounded-full whitespace-nowrap">
                    {plan.badge}
                  </div>
                )}
                <div className="text-3xl mb-3">{plan.icon}</div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h2>
                <p className="text-sm text-gray-400 mb-4">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-400 text-sm ml-2">/ {plan.priceNote}</span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f.text} className="flex items-start gap-2.5 text-sm">
                      {f.ok
                        ? <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        : <X className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
                      }
                      <span className={f.ok ? 'text-gray-700' : 'text-gray-400'}>{f.text}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.ctaHref}
                  className={`block text-center py-3 rounded-xl font-medium transition-colors ${plan.ctaStyle}`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* Listing expiry info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" /> Trajanje oglasa
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                <div className="text-2xl font-bold text-blue-700 mb-1">15 dana</div>
                <div className="font-semibold text-gray-800 mb-1">Standardni oglas</div>
                <p className="text-sm text-gray-500">
                  Za kratkoročne poslove, jednokratne angažmane, hitne potrebe i sezonske radove.
                </p>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-xl p-5">
                <div className="text-2xl font-bold text-green-700 mb-1">30 dana</div>
                <div className="font-semibold text-gray-800 mb-1">Dugoročni oglas</div>
                <p className="text-sm text-gray-500">
                  Za stalne pozicije, redovne angažmane i poslove koji zahtevaju duži rok traženja.
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Nakon isteka, oglas se automatski deaktivira. Možete ga obnoviti u svakom trenutku iz kontrolne table.
            </p>
          </div>

          {/* Hitno info */}
          <div className="bg-red-50 border border-red-100 rounded-2xl p-8 mb-8">
            <div className="flex items-start gap-4">
              <div className="text-3xl">🚨</div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Hitna berza — besplatno</h2>
                <p className="text-gray-600 leading-relaxed">
                  Hitna berza je sekcija za urgentne potrebe — kvar u stanu, hitna selidba, potreban radnik danas.
                  Svi korisnici mogu besplatno postavljati hitne oglase. U budućnosti planiramo opciju
                  plaćenog isticanja hitnih oglasa radi veće vidljivosti, ali osnovna funkcionalnost
                  ostaje besplatna zauvek.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Česta pitanja o cenama</h2>
            <div className="space-y-5">
              {[
                {
                  q: 'Mogu li kao fizičko lice imati više oglasa?',
                  a: 'Fizičko lice može imati 1 aktivan oglas po tipu posla/poziciji. Na primer, možete imati oglas za molerske radove i oglas za selidbe istovremeno, ali ne dva oglasa za molere.',
                },
                {
                  q: 'Kako se aktivira puno članstvo za firmu?',
                  a: 'Kontaktirajte nas na podrska@expertpro.rs ili putem kontakt forme. Admin pregleda zahtev i odobrava puno članstvo. Bićete obavešteni emailom.',
                },
                {
                  q: 'Da li postoji probni period za firme?',
                  a: 'Da — besplatni plan dozvoljava 1 aktivan oglas bez vremenskog ograničenja. To je idealno za isprobavanje platforme pre prelaska na puno članstvo.',
                },
                {
                  q: 'Šta se dešava kad mi oglas istekne?',
                  a: 'Oglas se automatski deaktivira po isteku roka (15 ili 30 dana). Možete ga obnoviti iz sekcije "Moji oglasi" u kontrolnoj tabli jednim klikom.',
                },
              ].map((faq) => (
                <div key={faq.q} className="border-b border-gray-50 pb-5 last:border-0 last:pb-0">
                  <h3 className="font-semibold text-gray-900 mb-1.5">{faq.q}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
