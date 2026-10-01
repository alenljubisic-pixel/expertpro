import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { Check, X, Zap, Star, Crown } from 'lucide-react'
import { PROMOTION_TIERS, PROMOTION_PRICES, PROMOTION_DURATIONS, type PromotionTier } from '@/lib/promotions'
import { CREDIT_PACKAGES, PAID_MEMBERSHIP_WELCOME_BONUS_CREDITS, SIGNUP_WELCOME_CREDITS } from '@/lib/credits'

export const metadata = {
  title: 'Cenovnik',
  description: 'Pregled planova i cena na ExpertPro platformi.',
  alternates: { canonical: 'https://www.expertpro.app/cenovnik' },
  openGraph: { title: 'Cenovnik | ExpertPro', description: 'Pregled planova i cena na ExpertPro platformi.', url: 'https://www.expertpro.app/cenovnik' },
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
      { text: '1 besplatan aktivan oglas', ok: true },
      { text: 'Profil sa ocenama i referencama', ok: true },
      { text: 'Poruke i kontakt', ok: true },
      { text: 'Hitna berza (kreditni oglas)', ok: true },
      { text: 'Oglas aktivan 15 dana (standardni)', ok: true },
      { text: 'Oglas aktivan 30 dana (dugoročni)', ok: true },
      { text: 'Dodatni oglasi (1 kredit po oglasu)', ok: true },
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
      { text: '1 besplatan aktivan oglas', ok: true },
      { text: 'Firmski profil (PIB, naziv)', ok: true },
      { text: 'Poruke i kontakt', ok: true },
      { text: 'Oglas aktivan 15 dana (standardni)', ok: true },
      { text: 'Oglas aktivan 30 dana (dugoročni)', ok: true },
      { text: 'Dodatni oglasi (1 kredit po oglasu)', ok: true },
      { text: 'Neograničen broj oglasa bez kredita', ok: false },
      { text: 'Istaknut / Gold oglas (jednokratna uplata)', ok: true },
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
      { text: 'Istaknut / Gold oglas uključen bez doplate', ok: true },
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
              Fizička lica uvek besplatno. Firme i agencije dobijaju pristup proširenim funkcijama i neograničenim oglasima.
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

          {/* Istaknuto / Gold */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              🏆 Istakni oglas
            </h2>
            <p className="text-gray-500 mb-6">
              Dostupno svima (fizička lica, firme, agencije) — jednokratna uplata po oglasu, bez pretplate. Plaćanje se vrši uplatom na tekući račun (IPS/bankovni transfer); oglas se ističe čim admin potvrdi uplatu.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {(['featured', 'gold'] as PromotionTier[]).map((tier) => (
                <div key={tier} className={`rounded-xl border p-5 ${tier === 'gold' ? 'border-amber-300 bg-amber-50/40' : 'border-blue-200 bg-blue-50/40'}`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    {tier === 'gold' ? <Crown className="w-5 h-5 text-amber-500" /> : <Star className="w-5 h-5 text-blue-500" />}
                    <h3 className="font-semibold text-gray-900">{PROMOTION_TIERS[tier].label}</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">{PROMOTION_TIERS[tier].description}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {PROMOTION_DURATIONS.map((d) => (
                      <div key={d} className="bg-white rounded-lg border border-gray-100 py-2 text-center">
                        <div className="text-sm font-bold text-gray-900">{PROMOTION_PRICES[tier][d].toLocaleString('sr-RS')} RSD</div>
                        <div className="text-xs text-gray-400">{d} dana</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hitno info */}
          <div className="bg-red-50 border border-red-100 rounded-2xl p-8 mb-8">
            <div className="flex items-start gap-4 mb-5">
              <div className="text-3xl">🚨</div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Hitna berza — kreditni oglas</h2>
                <p className="text-gray-600 leading-relaxed">
                  Hitna berza je sekcija za urgentne potrebe — kvar u stanu, hitna selidba, potreban radnik danas.
                  Hitni oglasi se objavljuju putem kredita i obaveštavaju dostupne radnike sa ponudom u istom gradu i oblasti. Push stiže onima koji su ga uključili.
                  1 kredit = 1 hitan oglas. Krediti se kupuju u paketima (uplata na tekući račun), ne pojedinačno po oglasu.
                  Svaki novi nalog dobija {SIGNUP_WELCOME_CREDITS} besplatna kredita odmah po registraciji.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Fizička lica</h3>
                <div className="grid grid-cols-3 gap-2">
                  {CREDIT_PACKAGES.individual.map(pkg => (
                    <div key={pkg.key} className="bg-white rounded-lg border border-gray-100 py-2 text-center">
                      <div className="text-sm font-bold text-gray-900">{pkg.price.toLocaleString('sr-RS')} RSD</div>
                      <div className="text-xs text-gray-400">{pkg.credits} kredita</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Firma</h3>
                <div className="grid grid-cols-3 gap-2">
                  {CREDIT_PACKAGES.company.map(pkg => (
                    <div key={pkg.key} className="bg-white rounded-lg border border-gray-100 py-2 text-center">
                      <div className="text-sm font-bold text-gray-900">{pkg.price.toLocaleString('sr-RS')} RSD</div>
                      <div className="text-xs text-gray-400">{pkg.credits} kredita</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Agencija</h3>
                <div className="grid grid-cols-3 gap-2">
                  {CREDIT_PACKAGES.agency.map(pkg => (
                    <div key={pkg.key} className="bg-white rounded-lg border border-gray-100 py-2 text-center">
                      <div className="text-sm font-bold text-gray-900">{pkg.price.toLocaleString('sr-RS')} RSD</div>
                      <div className="text-xs text-gray-400">{pkg.credits} kredita</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Agencije rade sa mnogo većim obimom oglasa pa imaju svoje, veće pakete — po kreditu jeftinije što je paket veći, tako da jedan paket obično pokrije ceo mesec aktivnog oglašavanja bez ponovnog kupovanja svake nedelje.
              Firma ili agencija sa punim članstvom dobija {PAID_MEMBERSHIP_WELCOME_BONUS_CREDITS} gratis kredita jednokratno pri odobrenju punog članstva.
            </p>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Česta pitanja o cenama</h2>
            <div className="space-y-5">
              {[
                {
                  q: 'Mogu li imati više oglasa?',
                  a: 'Prvi aktivan oglas je uvek besplatan (bilo koja rubrika, fizičko lice ili firma). Svaki dodatni aktivan oglas — u istoj ili drugoj rubrici — košta 1 kredit, koji se kupuje na stranici Krediti.',
                },
                {
                  q: 'Kako se aktivira puno članstvo za firmu?',
                  a: 'Kontaktirajte nas na podrska@expertpro.app ili putem kontakt forme. Admin pregleda zahtev i odobrava puno članstvo. Bićete obavešteni u svom nalogu.',
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
