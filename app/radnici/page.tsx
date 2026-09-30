import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { MapPin, Star, CheckCircle } from 'lucide-react'
import { SERBIAN_CITIES } from '@/types'
import { publicName, publicInitial } from '@/lib/safe-name'

const SKILLS = [
  'Građevina', 'Čišćenje', 'Transport', 'Ugostiteljstvo',
  'Fizički radovi', 'Magacin', 'Čuvanje dece', 'IT podrška',
  'Poljoprivreda', 'Događaji', 'Administracija',
]

export default async function WorkersPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; skill?: string; q?: string; foreign?: string }>
}) {
  const sp = await searchParams
  const supabase = await createClient()

  const { data: workers } = await supabase.rpc('search_workers', {
    p_city: sp.city || null,
    p_skill: sp.skill || null,
    p_query: sp.q?.trim().slice(0, 80) || null,
    p_foreign: sp.foreign === 'yes',
    p_limit: 24,
    p_offset: 0,
  })
  const count = workers?.[0]?.total_count || 0

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Pružaoci usluga</h1>
          <p className="text-sm text-gray-500 mt-1">Prikazani su samo korisnici sa aktivnim oglasom „Nudim uslugu“. Dogovor i poruke ostaju vezani za oglas.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <form method="GET" className="bg-white rounded-xl border border-gray-100 p-5 space-y-5 sticky top-20">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Veština ili korisničko ime</label>
                <input
                  name="q"
                  defaultValue={sp.q}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Pretraži radnike"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Grad</label>
                <select
                  name="city"
                  defaultValue={sp.city || ''}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Svi gradovi</option>
                  {SERBIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Oblast rada</label>
                <div className="space-y-1">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="skill" value="" defaultChecked={!sp.skill} />
                    <span className="text-sm text-gray-700">Sve oblasti</span>
                  </label>
                  {SKILLS.map(s => (
                    <label key={s} className="flex items-center gap-2">
                      <input type="radio" name="skill" value={s} defaultChecked={sp.skill === s} />
                      <span className="text-sm text-gray-700">{s}</span>
                    </label>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" name="foreign" value="yes" defaultChecked={sp.foreign === 'yes'} />
                Strani radnik
              </label>

              <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Filtriraj
              </button>
              <Link href="/radnici" className="block text-center text-xs text-gray-400 hover:text-gray-600">Poništi</Link>
            </form>
          </aside>

          {/* Workers grid */}
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-5">{count} pružalaca usluga</p>

            {!workers || workers.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
                <p className="text-gray-400">Nema aktivnih ponuda usluga za ovu pretragu</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {workers.map((worker: { id: string; username: string | null; city: string | null; bio: string | null; skills: string[] | null; avatar_url: string | null; is_verified: boolean; rating_avg: number | null; available: boolean; is_foreign_worker: boolean; total_count: number }) => (
                  <Link
                    key={worker.id}
                    href={`/profil/${worker.id}`}
                    className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-lg font-bold text-blue-600 flex-shrink-0">
                        {publicInitial({ id: worker.id, username: worker.username, type: 'individual' })}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{publicName({ id: worker.id, username: worker.username, type: 'individual' })}</p>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          {worker.is_verified && (
                            <span className="flex items-center gap-0.5 text-green-600">
                              <CheckCircle className="w-3 h-3" />
                              Verifikovan
                            </span>
                          )}
                          {worker.rating_avg != null && worker.rating_avg > 0 && (
                            <span className="flex items-center gap-0.5">
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              {worker.rating_avg.toFixed(1)}
                            </span>
                          )}
                          {worker.is_foreign_worker && <span className="text-teal-700">Strani radnik · samostalna oznaka</span>}
                        </div>
                      </div>
                    </div>

                    {worker.city && (
                      <p className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                        <MapPin className="w-3 h-3" />
                        {worker.city}
                      </p>
                    )}

                    {worker.bio && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{worker.bio}</p>
                    )}

                    {worker.skills && worker.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {worker.skills.slice(0, 3).map((skill: string) => (
                          <span key={skill} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                            {skill}
                          </span>
                        ))}
                        {worker.skills.length > 3 && (
                          <span className="text-xs text-gray-400">+{worker.skills.length - 3}</span>
                        )}
                      </div>
                    )}

                    {worker.available && (
                      <div className="mt-3 flex items-center gap-1 text-xs text-green-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Dostupan odmah
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
