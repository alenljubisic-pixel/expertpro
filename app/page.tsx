import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HomeSearchBar from '@/components/home/HomeSearchBar'
import { Star, Shield, Zap, Users, Briefcase, ChevronRight, MapPin, Clock } from 'lucide-react'

const CATEGORIES = [
  { icon: '🏗️', name: 'Građevina', slug: 'gradevina' },
  { icon: '🧹', name: 'Čišćenje', slug: 'ciscenje' },
  { icon: '🚛', name: 'Transport', slug: 'transport' },
  { icon: '🍽️', name: 'Ugostiteljstvo', slug: 'ugostiteljstvo' },
  { icon: '👷', name: 'Fizički radnici', slug: 'pomocni-radnici' },
  { icon: '📦', name: 'Magacin', slug: 'magacin' },
  { icon: '👶', name: 'Čuvanje dece', slug: 'cuvanje' },
  { icon: '💻', name: 'IT i računari', slug: 'it' },
  { icon: '🌾', name: 'Poljoprivreda', slug: 'poljoprivreda' },
  { icon: '🎪', name: 'Događaji', slug: 'dogadjaji' },
  { icon: '🔒', name: 'Obezbeđenje', slug: 'obezbedenje' },
  { icon: '🐕', name: 'Ljubimci', slug: 'ljubimci' },
  { icon: '✂️', name: 'Frizerstvo', slug: 'frizerstvo' },
  { icon: '🔧', name: 'Popravke', slug: 'popravke' },
  { icon: '🌿', name: 'Vrtlarstvo', slug: 'vrtlarstvo' },
  { icon: '📚', name: 'Instrukcije', slug: 'instrukcije' },
  { icon: '📸', name: 'Fotografija', slug: 'fotografija' },
  { icon: '📋', name: 'Administracija', slug: 'administracija' },
  { icon: '🚗', name: 'Auto i moto', slug: 'auto' },
  { icon: '📌', name: 'Ostalo', slug: 'ostalo' },
]

const STATS = [
  { number: '5.000+', label: 'Aktivnih radnika' },
  { number: '1.200+', label: 'Firmi i agencija' },
  { number: '15.000+', label: 'Završenih poslova' },
  { number: '4.8★', label: 'Prosečna ocena' },
]

const FEATURED_LISTINGS = [
  {
    id: 'f1',
    type: 'offer',
    typeLabel: 'Nudim uslugu',
    typeBg: 'bg-green-50 border-green-200 text-green-700',
    title: 'Profesionalno čišćenje stanova i poslovnih prostora — Beograd',
    desc: 'Iskusna spremačica sa 8 godina iskustva. Generalno čišćenje, čišćenje posle selidbe, peglanje. Sopstvena sredstva za čišćenje.',
    city: 'Beograd',
    price: '700 RSD/h',
    name: 'Marija S.',
    rating: '4.9',
    category: '🧹',
    urgent: false,
  },
  {
    id: 'f2',
    type: 'urgent',
    typeLabel: '🚨 Hitno',
    typeBg: 'bg-red-50 border-red-200 text-red-700',
    title: 'HITNO — Tražim pomoćne radnike za selidbu sutra u 8h — Novi Sad',
    desc: 'Potrebna 2–3 fizički snažna radnika za jednodnevnu selidbu. Plaćanje odmah po završetku posla. Prevoz obezbeđen.',
    city: 'Novi Sad',
    price: '3.500 RSD/dan',
    name: 'Firma Selidbe NS',
    rating: '4.7',
    category: '🚛',
    urgent: true,
  },
  {
    id: 'f3',
    type: 'offer',
    typeLabel: 'Nudim uslugu',
    typeBg: 'bg-green-50 border-green-200 text-green-700',
    title: 'Babysitting — čuvanje dece uzrasta 1–10 godina, Beograd i okolina',
    desc: 'Vaspitač po struci sa 5 godina iskustva u čuvanju dece. Dostupna vikendom i tokom školskih praznika. Reference dostupne.',
    city: 'Beograd',
    price: '800 RSD/h',
    name: 'Ana J.',
    rating: '5.0',
    category: '👶',
    urgent: false,
  },
  {
    id: 'f4',
    type: 'request',
    typeLabel: 'Tražim radnika',
    typeBg: 'bg-blue-50 border-blue-200 text-blue-700',
    title: 'Potreban elektricar za zamenu razvodnoga ormana — Niš',
    desc: 'Potrebna zamena glavnog razvodnog ormana u stanu. Posao za pola dana. Traži se licencirani majstor. Plaćanje gotovinom.',
    city: 'Niš',
    price: 'Dogovor',
    name: 'Petar M.',
    rating: '',
    category: '🔧',
    urgent: false,
  },
  {
    id: 'f5',
    type: 'offer',
    typeLabel: 'Nudim uslugu',
    typeBg: 'bg-green-50 border-green-200 text-green-700',
    title: 'Šetanje pasa i pet-siting — Beograd (Zemun, Novi Beograd)',
    desc: 'Ljubitelj životinja sa iskustvom u brizi o psima svih rasa. Šetam pse ujutru i popodne. Imam sopstveni auto za hitne slučajeve.',
    city: 'Beograd',
    price: '400 RSD/šetnja',
    name: 'Jelena V.',
    rating: '4.8',
    category: '🐕',
    urgent: false,
  },
  {
    id: 'f6',
    type: 'request',
    typeLabel: 'Tražim radnika',
    typeBg: 'bg-blue-50 border-blue-200 text-blue-700',
    title: 'Traži se konobar/ica za privatnu proslavu — Kragujevac, subota',
    desc: 'Organizujemo proslavu za 50 osoba. Potrebna jedna ili dve osobe sa iskustvom u posluživanju. Hrana i piće obezbeđeni. Plaćanje na dan.',
    city: 'Kragujevac',
    price: '4.000 RSD/dan',
    name: 'Porodica Đorđević',
    rating: '',
    category: '🍽️',
    urgent: false,
  },
]

const BLOG_PREVIEWS = [
  {
    slug: 'kako-naci-honorarni-posao-u-srbiji',
    title: 'Kako naći honorarni posao u Srbiji — vodič za 2025.',
    excerpt: 'Otkrijte gde tražiti kratkotrajna zapošljavanja i koje veštine su najtraženije.',
    image: '💼',
    readTime: '7 min',
  },
  {
    slug: 'rad-od-kuce-opcije-srbija',
    title: '10 najpopularnijih poslova od kuće u Srbiji',
    excerpt: 'Od prevođenja do IT podrške — poslovi koje možete raditi kada i gde hoćete.',
    image: '🏠',
    readTime: '6 min',
  },
  {
    slug: 'kako-zaraditi-dodatni-novac',
    title: '15 načina za dodatnu zaradu pored redovnog posla',
    excerpt: 'Realni načini da povećate prihode uz fleksibilno radno vreme.',
    image: '💰',
    readTime: '8 min',
  },
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

            {/* Interactive search bar with geolocation */}
            <HomeSearchBar />

            <p className="text-blue-200 text-xs mt-3 flex items-center justify-center gap-1">
              <MapPin className="w-3 h-3" />
              Klikni na <span className="font-medium">⊕</span> da automatski detektujemo tvoj grad
            </p>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Kategorije usluga</h2>
            <p className="text-gray-500">Pronađi radnike i poslove po oblastima — od fizičkih radova do kreativnih usluga</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 gap-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/oglasi?category=${cat.slug}`}
                className="bg-white rounded-xl p-4 text-center hover:shadow-md hover:border-blue-200 border border-gray-100 transition-all group"
              >
                <div className="text-3xl mb-2">{cat.icon}</div>
                <p className="text-xs font-medium text-gray-700 group-hover:text-blue-600 transition-colors">{cat.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Aktuelni oglasi</h2>
              <p className="text-gray-500 text-sm">Najnoviji poslovi i usluge na platformi</p>
            </div>
            <Link href="/oglasi" className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1">
              Svi oglasi <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURED_LISTINGS.map((listing) => (
              <Link
                key={listing.id}
                href="/oglasi"
                className={`block bg-white rounded-xl border hover:shadow-md transition-all overflow-hidden ${
                  listing.urgent ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-100'
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className={`inline-block text-xs px-2.5 py-1 rounded-full border font-medium ${listing.typeBg}`}>
                      {listing.typeLabel}
                    </span>
                    <span className="text-lg">{listing.category}</span>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 text-sm leading-snug">
                    {listing.title}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-3">{listing.desc}</p>

                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {listing.city}
                    </span>
                    <span className="font-semibold text-blue-600">{listing.price}</span>
                  </div>
                </div>

                <div className="border-t border-gray-50 px-5 py-3 flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0">
                    {listing.name[0]}
                  </div>
                  <span className="text-xs text-gray-600 truncate">{listing.name}</span>
                  {listing.rating && (
                    <span className="text-xs text-yellow-600 ml-auto flex-shrink-0">★ {listing.rating}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/oglasi"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Pogledaj sve oglase <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-gray-50">
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

      {/* Blog Preview */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Blog i saveti</h2>
              <p className="text-gray-500 text-sm">Vodiči za honorarni rad i dodatnu zaradu</p>
            </div>
            <Link href="/blog" className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1">
              Svi tekstovi <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {BLOG_PREVIEWS.map(post => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="block bg-gray-50 rounded-xl border border-gray-100 p-6 hover:shadow-md transition-all">
                <div className="text-4xl mb-3">{post.image}</div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-400">{post.readTime} čitanja</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm leading-snug">{post.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{post.excerpt}</p>
                <span className="mt-3 text-blue-600 text-xs font-medium flex items-center gap-1">
                  Čitaj više <ChevronRight className="w-3 h-3" />
                </span>
              </Link>
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
              { icon: <MapPin className="w-6 h-6 text-blue-600" />, title: 'Oko mene — pretraga po lokaciji', desc: 'Automatski detektuj svoj grad i pronađi radnike u blizini. Svi gradovi u Srbiji pokriveni.' },
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

      {/* FAQ Teaser */}
      <section className="bg-white py-12 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Imate pitanja?</h2>
          <p className="text-gray-500 mb-6">Pogledajte odgovore na najčešća pitanja o platformi, registraciji i bezbednosti.</p>
          <Link href="/faq" className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors font-medium">
            Česta pitanja (FAQ) <ChevronRight className="w-4 h-4" />
          </Link>
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
