import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { MapPin, Star, CheckCircle } from 'lucide-react'
import { SERBIAN_CITIES } from '@/types'
import { publicName } from '@/lib/safe-name'
import ProfileAvatar from '@/components/profile/ProfileAvatar'
import { AVAILABILITY_TIME_OPTIONS, AVAILABILITY_DAY_OPTIONS } from '@/lib/listing-availability'
import DetectCityButton from '@/components/location/DetectCityButton'

export const metadata = {
  title: 'Radnici sa aktivnim ponudama rada',
  description: 'Pronađite radnike koji su objavili aktivnu ponudu rada. Filtrirajte po gradu, veštini i dostupnosti i pregledajte njihove oglase pre dogovora.',
  alternates: { canonical: 'https://www.expertpro.app/radnici' },
  openGraph: { title: 'Radnici sa aktivnim ponudama rada', description: 'Aktivne ponude rada po gradovima Srbije.', url: 'https://www.expertpro.app/radnici' },
}

const SKILLS = [
  'Građevina', 'Čišćenje', 'Transport', 'Ugostiteljstvo',
  'Fizički radovi', 'Magacin', 'Čuvanje dece', 'Čuvanje starih', 'Nega i pomoć u kući', 'IT podrška',
  'Poljoprivreda', 'Događaji', 'Administracija',
]

const SKILL_DB_NAME: Record<string, string> = {
  'Građevina': 'Gradjevina i majstori',
  'Čišćenje': 'Ciscenje i odrzavanje',
  'Transport': 'Transport i selidbe',
  'Fizički radovi': 'Pomocni radnici',
  'Magacin': 'Magacin i logistika',
  'Čuvanje dece': 'Čuvanje dece i ljubimaca',
  'Čuvanje starih': 'Nega i pomoć u kući',
  'IT podrška': 'IT i racunari',
  'Događaji': 'Dogadjaji',
}

export default async function WorkersPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; skill?: string; q?: string; foreign?: string; time?: string; days?: string }>
}) {
  const sp = await searchParams
  const supabase = await createClient()

  const { data: workers, error: workersError } = await supabase.rpc('search_workers_available', {
    p_city: sp.city || null,
    p_skill: sp.skill ? (SKILL_DB_NAME[sp.skill] || sp.skill) : null,
    p_query: sp.q?.trim().slice(0, 80) || null,
    p_foreign: sp.foreign === 'yes',
    p_time: sp.time || null,
    p_days: sp.days || null,
    p_limit: 24,
    p_offset: 0,
  })
  const count = workers?.[0]?.total_count || 0
  const allCitiesParams = new URLSearchParams()
  for (const [key, value] of Object.entries(sp)) {
    if (value && key !== 'city') allCitiesParams.set(key, value)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Radnici</h1>
          <p className="text-sm text-gray-500 mt-1">Ovde se radnici sami predstavljaju: veštine, iskustvo i kada su slobodni. Prikazani su samo oni koji su objavili aktivan oglas „Nudim uslugu“. Za dogovor se prijavi na njihov oglas; nema slobodnih privatnih poruka.</p>
          <Link href="/oglasi/novi" className="inline-block mt-3 text-sm font-medium text-blue-700 hover:underline">Ponudi svoj rad →</Link>
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
                <label htmlFor="worker-city" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Grad</label>
                <select
                  id="worker-city"
                  name="city"
                  defaultValue={sp.city || ''}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Svi gradovi</option>
                  {SERBIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <DetectCityButton selectId="worker-city" />
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

              <div>
                <label htmlFor="worker-time" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Slobodan</label>
                <select id="worker-time" name="time" defaultValue={sp.time || ''}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white">
                  <option value="">Bilo kada</option>
                  {AVAILABILITY_TIME_OPTIONS.filter(option => option.value !== 'flexible').map(option =>
                    <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="worker-days" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Dani rada</label>
                <select id="worker-days" name="days" defaultValue={sp.days || ''}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white">
                  <option value="">Bilo kojim danom</option>
                  {AVAILABILITY_DAY_OPTIONS.filter(option => option.value === 'weekdays' || option.value === 'weekends').map(option =>
                    <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
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

            {workersError ? (
              <div role="alert" className="rounded-xl border border-red-100 bg-white p-8 text-center text-sm text-red-700">
                Pretraga radnika trenutno nije dostupna. Pokušaj ponovo za koji trenutak.
              </div>
            ) : !workers || workers.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
                <p className="text-gray-500">Nema aktivnih ponuda usluga za ovu pretragu{sp.city ? ` u gradu ${sp.city}` : ''}.</p>
                {sp.city && <Link href={`/radnici?${allCitiesParams.toString()}`} className="mt-3 inline-block text-sm font-medium text-blue-700 hover:underline">Proširi na sve gradove →</Link>}
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
                      <ProfileAvatar src={worker.avatar_url} type="individual" name={publicName({ id: worker.id, username: worker.username, type: 'individual' })} className="w-12 h-12" />
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
                        Prima upite
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
