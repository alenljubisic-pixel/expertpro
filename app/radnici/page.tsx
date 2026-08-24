import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { MapPin, Star, CheckCircle } from 'lucide-react'
import { SERBIAN_CITIES } from '@/types'

const SKILLS = [
  'Građevina', 'Čišćenje', 'Transport', 'Ugostiteljstvo',
  'Fizički radovi', 'Magacin', 'Čuvanje dece', 'IT podrška',
  'Poljoprivreda', 'Događaji', 'Administracija',
]

export default async function WorkersPage({
  searchParams,
}: {
  searchParams: { city?: string; skill?: string; q?: string }
}) {
  const supabase = await createClient()

  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .eq('type', 'individual')
    .eq('is_active', true)
    .order('rating_avg', { ascending: false })

  if (searchParams.city) query = query.eq('city', searchParams.city)
  if (searchParams.skill) query = query.contains('skills', [searchParams.skill])
  if (searchParams.q) query = query.ilike('name', `%${searchParams.q}%`)

  const { data: workers, count } = await query.limit(24)

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <form method="GET" className="bg-white rounded-xl border border-gray-100 p-5 space-y-5 sticky top-20">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ime</label>
                <input
                  name="q"
                  defaultValue={searchParams.q}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Pretraži radnike"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Grad</label>
                <select
                  name="city"
                  defaultValue={searchParams.city || ''}
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
                    <input type="radio" name="skill" value="" defaultChecked={!searchParams.skill} />
                    <span className="text-sm text-gray-700">Sve oblasti</span>
                  </label>
                  {SKILLS.map(s => (
                    <label key={s} className="flex items-center gap-2">
                      <input type="radio" name="skill" value={s} defaultChecked={searchParams.skill === s} />
                      <span className="text-sm text-gray-700">{s}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Filtriraj
              </button>
              <Link href="/radnici" className="block text-center text-xs text-gray-400 hover:text-gray-600">Poništi</Link>
            </form>
          </aside>

          {/* Workers grid */}
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-5">{count || 0} radnika</p>

            {!workers || workers.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
                <p className="text-gray-400">Nema radnika za ovu pretragu</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {workers.map((worker) => (
                  <Link
                    key={worker.id}
                    href={`/profil/${worker.id}`}
                    className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-lg font-bold text-blue-600 flex-shrink-0">
                        {worker.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{worker.name}</p>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          {worker.is_verified && (
                            <span className="flex items-center gap-0.5 text-green-600">
                              <CheckCircle className="w-3 h-3" />
                              Verifikovan
                            </span>
                          )}
                          {worker.rating_avg > 0 && (
                            <span className="flex items-center gap-0.5">
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              {worker.rating_avg.toFixed(1)}
                            </span>
                          )}
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
