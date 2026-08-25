import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { MapPin, Clock, Search, SlidersHorizontal, Plus } from 'lucide-react'
import { SERBIAN_CITIES } from '@/types'

const CATEGORIES = [
  { icon: '🔨', name: 'Građevina', slug: 'gradevina' },
  { icon: '🧹', name: 'Čišćenje', slug: 'ciscenje' },
  { icon: '🚛', name: 'Transport', slug: 'transport' },
  { icon: '🍴', name: 'Ugostiteljstvo', slug: 'ugostiteljstvo' },
  { icon: '👷', name: 'Pomoćni radnici', slug: 'pomocni-radnici' },
  { icon: '📦', name: 'Magacin', slug: 'magacin' },
  { icon: '👶', name: 'Čuvanje i nega', slug: 'cuvanje' },
  { icon: '💻', name: 'IT i računari', slug: 'it' },
  { icon: '🌾', name: 'Poljoprivreda', slug: 'poljoprivreda' },
  { icon: '🎪', name: 'Događaji', slug: 'dogadjaji' },
  { icon: '📋', name: 'Administracija', slug: 'administracija' },
  { icon: '📌', name: 'Ostalo', slug: 'ostalo' },
]

const TYPE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  offer: { label: 'Nudim uslugu', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  request: { label: 'Tražim radnika', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  urgent: { label: '🚨 Hitno', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
}

const DUMMY_LISTINGS = [
  {
    id: 'd1',
    type: 'request',
    title: 'Tražim iskusnog molera za stan od 60m² u Beogradu',
    description: 'Potreban moler za farbanje 3 sobe, hodnika i kupatila. Stanovanje obezbeđeno. Početak rada odmah.',
    city: 'Beograd',
    price_amount: 800,
    price_type: 'daily',
    profiles: { name: 'Stefan M.', rating_avg: 0, is_verified: false },
    categories: { icon: '🔨' },
  },
  {
    id: 'd2',
    type: 'offer',
    title: 'Vodoinstalater — nudim usluge popravke i montaže',
    description: 'Popravka curenja, montaža sanitarija, zamena cevi. 10 godina iskustva. Dostupan vikendom.',
    city: 'Novi Sad',
    price_amount: 1500,
    price_type: 'fixed',
    profiles: { name: 'Dragan P.', rating_avg: 4.8, is_verified: true },
    categories: { icon: '🔨' },
  },
  {
    id: 'd3',
    type: 'urgent',
    title: 'HITNO — potrebni utovartivači za selidbu danas u 14h',
    description: 'Potrebna 2-3 radnika za selidbu nameštaja iz stana u Zemunu. Posao traje 3-4 sata.',
    city: 'Beograd',
    price_amount: 1200,
    price_type: 'fixed',
    profiles: { name: 'Marina T.', rating_avg: 0, is_verified: false },
    categories: { icon: '🚛' },
  },
  {
    id: 'd4',
    type: 'offer',
    title: 'Čišćenje stanova, kancelarija i poslovnih prostora',
    description: 'Profesionalno čišćenje sa sopstvenom opremom i sredstvima. Beograd i okolina. Tačnost zagarantovana.',
    city: 'Beograd',
    price_amount: 600,
    price_type: 'hourly',
    profiles: { name: 'Jelena K.', rating_avg: 4.9, is_verified: true },
    categories: { icon: '🧹' },
  },
  {
    id: 'd5',
    type: 'request',
    title: 'Potreban kuvar za porodičnu proslavu — 50 osoba',
    description: 'Tražim kuvara koji može da pripremi srpsku trpezu za 50 osoba. Datum: naredni vikend. Nis.',
    city: 'Niš',
    price_amount: 5000,
    price_type: 'fixed',
    profiles: { name: 'Slobodan V.', rating_avg: 0, is_verified: false },
    categories: { icon: '🍴' },
  },
  {
    id: 'd6',
    type: 'offer',
    title: 'IT podrška za firme — mrežna administracija i helpdesk',
    description: 'Nudim IT podršku za mala preduzeća: postavljanje mreže, održavanje računara, backup sistemi.',
    city: 'Novi Sad',
    price_amount: 1200,
    price_type: 'hourly',
    profiles: { name: 'Aleksa Đ.', rating_avg: 5.0, is_verified: true },
    categories: { icon: '💻' },
  },
  {
    id: 'd7',
    type: 'offer',
    title: 'Čuvanje dece uzrasta 1-7 godina — iskusna dadilja',
    description: 'Medicinska sestra sa 8 godina iskustva u radu sa decom. Reference dostupne. Kragujevac.',
    city: 'Kragujevac',
    price_amount: 700,
    price_type: 'hourly',
    profiles: { name: 'Ana B.', rating_avg: 4.7, is_verified: true },
    categories: { icon: '👶' },
  },
  {
    id: 'd8',
    type: 'request',
    title: 'Potrebni radnici za magacin — pakovanje robe, noćna smena',
    description: 'Firma traži 5 radnika za rad u magacinu (noćna smena). Iskustvo nije potrebno. Subotica.',
    city: 'Subotica',
    price_amount: 1800,
    price_type: 'daily',
    profiles: { name: 'ProLogistika d.o.o.', rating_avg: 4.2, is_verified: true },
    categories: { icon: '📦' },
  },
  {
    id: 'd9',
    type: 'urgent',
    title: 'HITNO — elektricar za zamenu osigurica i instalacija',
    description: 'Izgorele osigurace u stanu, deca bez struje. Potreban elektricar sto pre. Vracar, Beograd.',
    city: 'Beograd',
    price_amount: 2500,
    price_type: 'fixed',
    profiles: { name: 'Mirko O.', rating_avg: 0, is_verified: false },
    categories: { icon: '🔨' },
  },
  {
    id: 'd10',
    type: 'offer',
    title: 'Administrativna podrška i data entry — rad od kuće',
    description: 'Nudim usluge administrativne podrške: unos podataka, priprema dokumenata, email korespondencija.',
    city: 'Novi Sad',
    price_amount: 500,
    price_type: 'hourly',
    profiles: { name: 'Tamara L.', rating_avg: 4.6, is_verified: true },
    categories: { icon: '📋' },
  },
]

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: {
    type?: string
    city?: string
    category?: string
    q?: string
    page?: string
  }
}) {
  const supabase = await createClient()
  const page = parseInt(searchParams.page || '1')
  const pageSize = 12
  const offset = (page - 1) * pageSize

  let query = supabase
    .from('listings')
    .select('*, profiles(name, avatar_url, rating_avg, is_verified), categories(name, icon)', { count: 'exact' })
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (searchParams.type) query = query.eq('type', searchParams.type)
  if (searchParams.city) query = query.eq('city', searchParams.city)
  if (searchParams.category) query = query.eq('category_slug', searchParams.category)
  if (searchParams.q) query = query.ilike('title', `%${searchParams.q}%`)

  const { data: listings, count } = await query.range(offset, offset + pageSize - 1)
  const totalPages = Math.ceil((count || 0) / pageSize)

  const isUrgent = searchParams.type === 'urgent'
  const hasFilters = !!(searchParams.type || searchParams.city || searchParams.category || searchParams.q)
  const hasRealListings = listings && listings.length > 0
  const displayListings = hasRealListings ? listings : (!hasFilters ? DUMMY_LISTINGS : [])
  const isDemoMode = !hasRealListings && !hasFilters

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Urgent header */}
      {isUrgent && (
        <div className="bg-red-600 text-white py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3">
            <span className="text-2xl">🚨</span>
            <div>
              <h1 className="font-bold text-lg">Hitna berza</h1>
              <p className="text-red-100 text-sm">Hitni poslovi — radnici se javljaju odmah</p>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <form method="GET" className="bg-white rounded-xl border border-gray-100 p-5 space-y-5 sticky top-20">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Pretraga</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    name="q"
                    type="text"
                    defaultValue={searchParams.q}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Šta tražiš?"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tip oglasa</label>
                <div className="space-y-1">
                  {[
                    { value: '', label: 'Svi oglasi', dot: 'bg-gray-400' },
                    { value: 'offer', label: 'Nudim uslugu', dot: 'bg-green-500' },
                    { value: 'request', label: 'Tražim radnika', dot: 'bg-blue-500' },
                    { value: 'urgent', label: 'Hitno', dot: 'bg-red-500' },
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer py-1">
                      <input
                        type="radio"
                        name="type"
                        value={opt.value}
                        defaultChecked={searchParams.type === opt.value || (!searchParams.type && opt.value === '')}
                        className="text-blue-600"
                      />
                      <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${opt.dot}`} />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
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
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Kategorija</label>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  <label className="flex items-center gap-2 cursor-pointer py-0.5">
                    <input type="radio" name="category" value="" defaultChecked={!searchParams.category} className="text-blue-600" />
                    <span className="text-sm text-gray-700">Sve kategorije</span>
                  </label>
                  {CATEGORIES.map(cat => (
                    <label key={cat.slug} className="flex items-center gap-2 cursor-pointer py-0.5">
                      <input
                        type="radio"
                        name="category"
                        value={cat.slug}
                        defaultChecked={searchParams.category === cat.slug}
                        className="text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{cat.icon} {cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Filtriraj
              </button>
              <Link href="/oglasi" className="block text-center text-xs text-gray-400 hover:text-gray-600">
                Poništi filtere
              </Link>
            </form>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-sm text-gray-500">
                  {hasRealListings ? `${count} oglasa` : isDemoMode ? `${DUMMY_LISTINGS.length} primera oglasa` : 'Nema oglasa'}
                  {searchParams.city ? ` u gradu ${searchParams.city}` : ''}
                </p>
                {isDemoMode && (
                  <p className="text-xs text-amber-600 mt-0.5">📋 Prikazani su primeri oglasa. Budi prvi koji postavlja pravi oglas!</p>
                )}
              </div>
              <Link
                href="/oglasi/novi"
                className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Novi oglas
              </Link>
            </div>

            {displayListings.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                <p className="text-4xl mb-4">🔍</p>
                <p className="text-gray-500 mb-2">Nema oglasa koji odgovaraju pretrazi</p>
                <Link href="/oglasi" className="text-sm text-blue-600 hover:text-blue-700">Poništi filtere</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {displayListings.map((listing: any) => {
                  const typeInfo = TYPE_LABELS[listing.type] || TYPE_LABELS.request
                  const profile = listing.profiles as any
                  const category = listing.categories as any
                  const isDemo = isDemoMode
                  return (
                    <Link
                      key={listing.id}
                      href={isDemo ? '/oglasi/novi' : `/oglasi/${listing.id}`}
                      className={`block bg-white rounded-xl border hover:shadow-md transition-all overflow-hidden ${
                        listing.type === 'urgent' ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-100'
                      }`}
                    >
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <span className={`inline-block text-xs px-2.5 py-1 rounded-full border font-medium ${typeInfo.bg} ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                          {category && (
                            <span className="text-lg">{category.icon}</span>
                          )}
                        </div>

                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 text-sm leading-snug">
                          {listing.title}
                        </h3>

                        {listing.description && (
                          <p className="text-xs text-gray-400 line-clamp-2 mb-3">{listing.description}</p>
                        )}

                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {listing.city}
                          </span>
                          {listing.price_amount && (
                            <span className="font-semibold text-blue-600">
                              {listing.price_amount.toLocaleString('sr-RS')} RSD
                              {listing.price_type === 'hourly' ? '/h' : listing.price_type === 'daily' ? '/dan' : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="border-t border-gray-50 px-5 py-3 flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0">
                          {profile?.name ? profile.name[0].toUpperCase() : '?'}
                        </div>
                        <span className="text-xs text-gray-600 truncate">{profile?.name}</span>
                        {profile?.rating_avg > 0 && (
                          <span className="text-xs text-yellow-600 ml-auto flex-shrink-0">★ {profile.rating_avg.toFixed(1)}</span>
                        )}
                        {profile?.is_verified && (
                          <span className="text-xs text-green-600 flex-shrink-0">✓</span>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <Link
                    key={p}
                    href={`/oglasi?${new URLSearchParams({ ...searchParams, page: p.toString() }).toString()}`}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {p}
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
