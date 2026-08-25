import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Zap, Users, Shield, Star, Target, Heart } from 'lucide-react'

export const metadata = {
  title: 'O nama | ExpertPro',
  description: 'Saznajte više o ExpertPro platformi — berzi rada koja spaja radnike i poslodavce širom Srbije.',
}

export default function ONamePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-white border-b border-gray-100 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Zap className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">O nama</h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
              ExpertPro je srpska berza rada koja spaja radnike i poslodavce brzo, jednostavno i pouzdano.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl border border-gray-100 p-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Naša misija</h2>
              <p className="text-gray-600 leading-relaxed text-lg mb-6">
                Verujemo da svako zaslužuje šansu da pokaže svoje veštine i pronađe posao koji odgovara
                njegovim sposobnostima. Istovremeno, firme i privatna lica treba da mogu lako pronaći
                pravu osobu za svaki zadatak — bilo da se radi o hitnoj popravci, sezonskom poslu ili
                dugoročnoj saradnji.
              </p>
              <p className="text-gray-600 leading-relaxed text-lg">
                ExpertPro je nastao iz potrebe da postoji jedno centralno mesto gde se svi mogu naći —
                bez komplikacija, bez posrednika i bez skrivenih troškova.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Naše vrednosti</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Users,
                  title: 'Zajednica',
                  desc: 'Gradimo pouzdanu zajednicu radnika i poslodavaca koji se međusobno poštuju i ocenjuju.',
                  color: 'bg-blue-50 text-blue-600',
                },
                {
                  icon: Shield,
                  title: 'Sigurnost',
                  desc: 'Verifikujemo profile i štitimo podatke korisnika. Vaše informacije su kod nas bezbedne.',
                  color: 'bg-green-50 text-green-600',
                },
                {
                  icon: Star,
                  title: 'Kvalitet',
                  desc: 'Sistem ocenjivanja osigurava da uvek možete pronaći pouzdane i iskusne radnike.',
                  color: 'bg-yellow-50 text-yellow-600',
                },
                {
                  icon: Target,
                  title: 'Efikasnost',
                  desc: 'Hitna berza i pametna pretraga omogućavaju da za nekoliko minuta pronađete pravo rešenje.',
                  color: 'bg-red-50 text-red-600',
                },
                {
                  icon: Heart,
                  title: 'Dostupnost',
                  desc: 'Platforma je dostupna svima — besplatno za fizička lica, sa jasnim planovima za firme.',
                  color: 'bg-pink-50 text-pink-600',
                },
                {
                  icon: Zap,
                  title: 'Inovacija',
                  desc: 'Stalno unapređujemo platformu na osnovu povratnih informacija naše zajednice.',
                  color: 'bg-purple-50 text-purple-600',
                },
              ].map((v) => (
                <div key={v.title} className="bg-white rounded-xl border border-gray-100 p-6">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${v.color}`}>
                    <v.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{v.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-blue-600 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center text-white">
              {[
                { value: '10+', label: 'Kategorija rada' },
                { value: '50+', label: 'Gradova u Srbiji' },
                { value: '100%', label: 'Besplatno za fizička lica' },
                { value: '24/7', label: 'Hitna berza' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-3xl font-bold mb-1">{s.value}</div>
                  <div className="text-blue-100 text-sm">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Imate pitanje?</h2>
            <p className="text-gray-500 mb-6">Stojimo na raspolaganju za sva pitanja i sugestije.</p>
            <a
              href="/kontakt"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Kontaktirajte nas
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
