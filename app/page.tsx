import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Search, MapPin, Star, Shield, Zap, Users, Briefcase, ChevronRight } from 'lucide-react'

const CATEGORIES = [
  { icon: '🏗️', name: 'Građevina', slug: 'gradevina' },
  { icon: '🧹', name: 'Čišćenje', slug: 'ciscenje' },
  { icon: '🚛', name: 'Transport', slug: 'transport' },
  { icon: '🍽️', name: 'Ugostiteljstvo', slug: 'ugostiteljstvo' },
  { icon: '👷', name: 'Pomoćni radnici', slug: 'pomocni-radnici' },
  { icon: '📦', name: 'Magacin', slug: 'magacin' },
  { icon: '👶', name: 'Čuvanje i nega', slug: 'cuvanje' },
  { icon: '💻', name: 'IT i računari', slug: 'it' },
  { icon: '🌾', name: 'Poljoprivreda', slug: 'poljoprivreda' },
  { icon: '🎪', name: 'Događaji', slug: 'dogadjaji' },
  { icon: '📋', name: 'Administracija', slug: 'administracija' },
  { icon: '📌', name: 'Ostalo', slug: 'ostalo' },
]

const STATS = [
  { number: '5.000+', label: 'Aktivnih radnika' },
  { number: '1.200+', label: 'Firmi i agencija' },
  { number: '15.000+', label: 'Završenih poslova' },
  { number: '4.8★', label: 'Prosečna ocena' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white text-sm px-4 py-2 rounded-full mb-6 backdrop-blur-sm">
              <Zap className="w-4 h-4" />
              <span>Prva platforma za honorarne poslove u Srbiji</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
              Pronađi posao ili<br />radnika — <span className="text-yellow-300">odmah</span>
            </h1>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Povezi se sa proverenim radnicima i firmama u svom gradu.
              Jednodnevni angažmani, honorarni posao, hitne intervencije — sve na jednom mestu.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Link
                href="/oglasi/novi?type=request"
                className="bg-white text-blue-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-colors shadow-lg"
              >
                🔍 Tražim radnika
              </Link>
              <Link
                href="/oglasi/novi?type=offer"
                className="bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-400 transition-colors border border-blue-400"
              >
                💼 Nudim uslugu
              </Link>
              <Link
                href="/oglasi/novi?type=urgent"
                className="bg-red-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-red-400 transition-colors animate-pulse"
              >
                🚨 Hitno!
              </Link>
            </div>

            {/* Quick search */}
            <div className="bg-white rounded-2xl p-2 shadow-xl max-w-2xl mx-auto flex gap-2">
              <div className="flex-1 flex items-center gap-2 px-4">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Šta tražiš? (spremačica, vodoinstalater...)"
                  className="flex-1 text-gray-700 outline-none text-sm"
                />
              </div>
              <div className="flex items-center gap-2 px-4 border-l border-gray-200">
                <MapPin className="w-5 h-5 text-gray-400" />
                <select className="text-gray-700 outline-none text-sm bg-transparent">
                  <option>Svi gradovi</option>
                  <option>Beograd</option>
                  <option>Novi Sad</option>
                  <option>Niš</option>
                  <option>Kragujevac</option>
                </select>
              </div>
              <Link
                href="/oglasi"
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors whitespace-nowrap text-sm"
              >
                Pretraži
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Urgent Banner */}
      <section className="bg-red-600 text-white py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/oglasi?type=urgent" className="flex items-center justify-center gap-3 hover:opacity-90 transition-opacity">
            <span className="text-lg">🚨</span>
            <span className="font-medium">Hitna berza — Objavi problem, radnici iz tvog grada se javljaju odmah</span>
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold text-blue-600">{s.number}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Kategorije</h2>
            <p className="text-gray-500">Pronađi radnike i poslove po oblastima</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/oglasi?category=${cat.slug}`}
                className="bg-white rounded-xl p-5 text-center hover:shadow-md hover:border-blue-200 border border-gray-100 transition-all group"
              >
                <div className="text-3xl mb-2">{cat.icon}</div>
                <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">{cat.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Kako funkcioniše?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Tri koraka do posla ili radnika</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: <Users className="w-8 h-8 text-blue-600" />,
                title: 'Registruj se',
                desc: 'Kreiraj profil za 2 minuta — kao fizičko lice, firma ili agencija. Verifikacija email-om i telefonom.'
              },
              {
                step: '02',
                icon: <Briefcase className="w-8 h-8 text-blue-600" />,
                title: 'Objavi ili pronađi',
                desc: 'Postavi oglas šta tražiš ili nudiš. Za hitne slučajeve — SOS oglas šalje notifikaciju svim radnicima u blizini.'
              },
              {
                step: '03',
                icon: <Star className="w-8 h-8 text-blue-600" />,
                title: 'Uradi i oceni',
                desc: 'Dogovorite se kroz chat, uradite posao, ocenite jedni druge. Gradi svoju reputaciju na platformi.'
              }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-5 relative">
                  {item.icon}
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                    {item.step.slice(-1)}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Zašto ExpertPro?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Shield className="w-6 h-6 text-blue-600" />, title: 'Verifikovani korisnici', desc: 'Svi korisnici prolaze kroz verifikaciju email-om i brojem telefona. Firme i agencije dodatno odobrava admin.' },
              { icon: <Star className="w-6 h-6 text-blue-600" />, title: 'Dvostrani rejting sistem', desc: 'I radnici i poslodavci ocenjuju jedni druge. Vidiš istoriju posla, procenat dolaznosti i ocene pre angažmana.' },
              { icon: <Zap className="w-6 h-6 text-blue-600" />, title: 'Hitna berza', desc: 'Objavi problem — pokvarena instalacija, selidba danas, nedostaje radnik — i dobij ponude za sat vremena.' },
              { icon: <Search className="w-6 h-6 text-blue-600" />, title: 'Pretraga po gradu', desc: 'Svi gradovi u Srbiji. Pronađi nekog ko je u tvojoj blizini i dostupan odmah.' },
              { icon: <Users className="w-6 h-6 text-blue-600" />, title: 'Moj Tim', desc: 'Angažovao si dobrog radnika? Sačuvaj ga u "Moj Tim" i pozovi ponovo jednim klikom.' },
              { icon: <Shield className="w-6 h-6 text-blue-600" />, title: 'Zaštićena komunikacija', desc: 'Sav razgovor ostaje u chatu. Admin ima uvid ako dođe do problema i interveniše po potrebi.' },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-50 rounded-lg">{item.icon}</div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Počni danas — besplatno</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Registracija je besplatna. Fizička lica koriste platformu bez naknade.
            Firme i agencije imaju grejs period od 6 meseci.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-white text-blue-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-colors"
            >
              Registruj se besplatno
            </Link>
            <Link
              href="/oglasi"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-500 transition-colors"
            >
              Pregledaj oglase
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
