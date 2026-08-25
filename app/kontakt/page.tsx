import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Mail, MessageSquare, Clock, MapPin } from 'lucide-react'

export const metadata = {
  title: 'Kontakt | ExpertPro',
  description: 'Kontaktirajte tim ExpertPro platforme. Odgovaramo u roku od 24 sata.',
}

export default function KontaktPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Kontakt</h1>
            <p className="text-gray-500 text-lg">Javite nam se — tu smo da pomognemo.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact info */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                <a href="mailto:podrska@expertpro.rs" className="text-blue-600 hover:text-blue-700 text-sm">
                  podrska@expertpro.rs
                </a>
                <p className="text-xs text-gray-400 mt-1">Za opšta pitanja i podršku</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Radno vreme podrške</h3>
                <p className="text-sm text-gray-600">Pon–Pet: 09:00–17:00</p>
                <p className="text-xs text-gray-400 mt-1">Odgovaramo u roku od 24h</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Lokacija</h3>
                <p className="text-sm text-gray-600">Srbija 🇷🇸</p>
                <p className="text-xs text-gray-400 mt-1">Platforma dostupna svuda u Srbiji</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="w-5 h-5 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">FAQ</h3>
                <p className="text-sm text-gray-500 mb-2">Možda je odgovor već tamo.</p>
                <a href="/faq" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Pogledaj česta pitanja →
                </a>
              </div>
            </div>

            {/* Contact form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-100 p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Pošaljite poruku</h2>
                <form
                  action="mailto:podrska@expertpro.rs"
                  method="GET"
                  encType="text/plain"
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ime i prezime</label>
                      <input
                        type="text"
                        name="name"
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Vaše ime"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email adresa</label>
                      <input
                        type="email"
                        name="email"
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="vas@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tema</label>
                    <select
                      name="subject"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Izaberite temu</option>
                      <option value="Opšte pitanje">Opšte pitanje</option>
                      <option value="Problem sa nalogom">Problem sa nalogom</option>
                      <option value="Problem sa oglasom">Problem sa oglasom</option>
                      <option value="Prijava korisnika">Prijava korisnika</option>
                      <option value="Partnerstvo">Partnerstvo</option>
                      <option value="Clanstvo">Članstvo / pretplata</option>
                      <option value="Ostalo">Ostalo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Poruka</label>
                    <textarea
                      name="body"
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Opišite vaš upit što detaljnije..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                  >
                    Pošalji poruku
                  </button>

                  <p className="text-xs text-gray-400 text-center">
                    Klikom na dugme otvarate vaš email klijent. Odgovaramo u roku od 24 radna sata.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
