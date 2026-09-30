import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { MapPin, Clock, Search, SlidersHorizontal, Plus } from 'lucide-react'
import { SERBIAN_CITIES } from '@/types'
import { publicName, publicInitial } from '@/lib/safe-name'
import SaveButton from '@/components/listings/SaveButton'

const SORT_OPTIONS: Record<string, { label: string; apply: (q: any) => any }> = {
  novo: {
    label: 'Najnovije',
    apply: (q) => q.order('is_gold', { ascending: false }).order('is_featured', { ascending: false }).order('created_at', { ascending: false }),
  },
  cena_rastuce: {
    label: 'Cena: niža ka višoj',
    apply: (q) => q.order('price_amount', { ascending: true, nullsFirst: false }).order('created_at', { ascending: false }),
  },
  cena_opadajuce: {
    label: 'Cena: viša ka nižoj',
    apply: (q) => q.order('price_amount', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false }),
  },
}
// Napomena: sortiranje po oceni oglašivača namerno nije dodato ovde — PostgREST
// ne sortira spoljne (parent) redove po koloni iz to-one relacije ("profiles"),
// samo poredak unutar ugnježdenog rezultata. Za pravo sortiranje po oceni treba
// denormalizovana kolona (npr. listings.owner_rating_avg) ili posebna DB view.

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

// Temporary, non-interactive examples. They are never stored as real jobs.
// Set this to false when the marketplace has enough genuine listings.
const SHOW_DEMO_LISTINGS = true

type DemoListing = {
  title: string
  description: string
  city: string
  category: string
  icon: string
  engagement_mode: 'short_job' | 'multi_day' | 'fixed_term' | 'permanent'
  foreign_workers_welcome?: boolean
}

const DEMO_LISTINGS: DemoListing[] = [
  { title: 'Električar za sitne popravke u stanu', description: 'Zamena tri utičnice i pregled instalacija u dvosobnom stanu. Termin po dogovoru.', city: 'Beograd', category: 'gradevina', icon: '🔨', engagement_mode: 'short_job' },
  { title: 'Pomoć pri selidbi nameštaja', description: 'Utovar i istovar nameštaja tokom jednog dana; potrebna su dva radnika.', city: 'Novi Sad', category: 'transport', icon: '🚛', engagement_mode: 'short_job' },
  { title: 'Čišćenje stana posle renoviranja', description: 'Generalno čišćenje poda, kuhinje i kupatila nakon krečenja.', city: 'Niš', category: 'ciscenje', icon: '🧹', engagement_mode: 'short_job' },
  { title: 'Montaža polica i kuhinjskih elemenata', description: 'Montaža dve police i visećih kuhinjskih elemenata na licu mesta.', city: 'Kragujevac', category: 'gradevina', icon: '🔨', engagement_mode: 'short_job' },
  { title: 'Ispomoć na događaju tokom vikenda', description: 'Priprema sale ujutru i raspremanje po završetku događaja.', city: 'Subotica', category: 'dogadjaji', icon: '🎪', engagement_mode: 'short_job' },
  { title: 'Podešavanje kućne računarske mreže', description: 'Povezivanje rutera, računara i štampača u kućnoj mreži.', city: 'Beograd', category: 'it', icon: '💻', engagement_mode: 'short_job' },
  { title: 'Pomoć pri sređivanju dvorišta', description: 'Košenje trave, orezivanje žive ograde i sakupljanje zelenog otpada.', city: 'Čačak', category: 'poljoprivreda', icon: '🌾', engagement_mode: 'short_job' },
  { title: 'Utovar robe u magacinu', description: 'Ispomoć pri utovaru i sortiranju robe u jednoj smeni.', city: 'Pančevo', category: 'magacin', icon: '📦', engagement_mode: 'short_job' },
  { title: 'Pomoćni građevinski radnici za nekoliko dana', description: 'Pomoć pri pripremi materijala i čišćenju gradilišta tokom radne nedelje.', city: 'Beograd', category: 'gradevina', icon: '🔨', engagement_mode: 'multi_day', foreign_workers_welcome: true },
  { title: 'Osoblje za višednevni događaj', description: 'Postavljanje opreme, priprema prostora i rad na događaju kroz više dana.', city: 'Novi Sad', category: 'dogadjaji', icon: '🎪', engagement_mode: 'multi_day' },
  { title: 'Pomoć u pakovanju proizvoda', description: 'Pakovanje, etiketiranje i slaganje proizvoda u magacinu.', city: 'Niš', category: 'magacin', icon: '📦', engagement_mode: 'multi_day', foreign_workers_welcome: true },
  { title: 'Sezonski rad u poljoprivredi', description: 'Rad na sortiranju i pakovanju plodova tokom sezone.', city: 'Zrenjanin', category: 'poljoprivreda', icon: '🌾', engagement_mode: 'fixed_term', foreign_workers_welcome: true },
  { title: 'Administrativna podrška na projektu', description: 'Unos podataka, evidencija dokumenata i komunikacija sa saradnicima.', city: 'Beograd', category: 'administracija', icon: '📋', engagement_mode: 'fixed_term' },
  { title: 'Radnik u proizvodnji na određeno', description: 'Rad u smenama na pakovanju i kontroli gotovih proizvoda.', city: 'Kragujevac', category: 'pomocni-radnici', icon: '👷', engagement_mode: 'fixed_term', foreign_workers_welcome: true },
  { title: 'Magacinski radnik za stalni angažman', description: 'Prijem, slaganje i izdavanje robe u skladištu.', city: 'Novi Sad', category: 'magacin', icon: '📦', engagement_mode: 'permanent', foreign_workers_welcome: true },
  { title: 'Pomoćni kuvar za stalni angažman', description: 'Priprema namirnica i održavanje radne stanice u kuhinji.', city: 'Beograd', category: 'ugostiteljstvo', icon: '🍴', engagement_mode: 'permanent' },
]

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string
    city?: string
    category?: string
    q?: string
    page?: string
    mode?: string
    foreign?: string
    sort?: string
    price_min?: string
    price_max?: string
  }>
}) {
  const sp = await searchParams
  const supabase = await createClient()
  const page = parseInt(sp.page || '1')
  const pageSize = 12
  const offset = (page - 1) * pageSize
  const sortKey = sp.sort && SORT_OPTIONS[sp.sort] ? sp.sort : 'novo'

  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase
    .from('listings')
    .select('*, profiles!user_id(id, type, name, username, avatar_url, rating_avg, is_verified), categories(icon)', { count: 'exact' })
    .eq('status', 'active')
  query = SORT_OPTIONS[sortKey].apply(query)

  if (sp.type) query = query.eq('type', sp.type)
  if (sp.mode === 'long') query = query.in('engagement_mode', ['multi_day', 'fixed_term', 'permanent'])
  else if (['short_job', 'multi_day', 'fixed_term', 'permanent'].includes(sp.mode || '')) query = query.eq('engagement_mode', sp.mode!)
  if (sp.foreign === 'yes') query = query.eq('foreign_workers_welcome', true)
  if (sp.city) query = query.eq('city', sp.city)
  const priceMin = sp.price_min ? parseInt(sp.price_min) : null
  const priceMax = sp.price_max ? parseInt(sp.price_max) : null
  if (priceMin !== null && !Number.isNaN(priceMin)) query = query.gte('price_amount', priceMin)
  if (priceMax !== null && !Number.isNaN(priceMax)) query = query.lte('price_amount', priceMax)
  // Gold listings can also carry a secondary ("srodna") category — match either.
  if (sp.category) query = query.or(`category_slug.eq.${sp.category},secondary_category_slug.eq.${sp.category}`)
  if (sp.q) query = query.ilike('title', `%${sp.q}%`)

  const { data: listings, count } = await query.range(offset, offset + pageSize - 1)
  const totalPages = Math.ceil((count || 0) / pageSize)

  const isUrgent = sp.type === 'urgent'
  const hasFilters = !!(sp.type || sp.city || sp.category || sp.q || sp.mode || sp.foreign || sp.price_min || sp.price_max)
  const displayListings = listings || []

  const savedIds = new Set<string>()
  if (user && displayListings.length > 0) {
    const { data: saved } = await supabase
      .from('saved_listings')
      .select('listing_id')
      .eq('user_id', user.id)
      .in('listing_id', displayListings.map((l: any) => l.id))
    saved?.forEach((s) => savedIds.add(s.listing_id))
  }
  const demoCandidates = sp.mode === 'long'
    ? DEMO_LISTINGS.filter(item => item.engagement_mode !== 'short_job')
    : sp.mode && sp.mode !== 'short_job'
      ? DEMO_LISTINGS.filter(item => item.engagement_mode === sp.mode)
      : sp.mode === 'short_job'
        ? DEMO_LISTINGS.filter(item => item.engagement_mode === 'short_job')
        : [...DEMO_LISTINGS.slice(0, 4), ...DEMO_LISTINGS.slice(8, 12)]
  const demoListings = SHOW_DEMO_LISTINGS && sp.type === 'request' && page === 1 && !sp.q && !sp.city && !sp.category && !sp.foreign
    ? demoCandidates
    : []

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
      {sp.type === 'request' && (
        <div className="bg-blue-600 text-white py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-bold text-lg">{sp.mode === 'long' ? 'Dugoročni poslovi' : 'Berza aktivnih poslova'}</h1>
            <p className="text-blue-100 text-sm">Samo trenutno otvoreni oglasi koji čekaju kandidata.</p>
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
                    defaultValue={sp.q}
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
                        defaultChecked={sp.type === opt.value || (!sp.type && opt.value === '')}
                        className="text-blue-600"
                      />
                      <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${opt.dot}`} />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="engagement-mode" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Trajanje angažmana</label>
                <select id="engagement-mode" name="mode" defaultValue={sp.mode || ''}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white">
                  <option value="">Sva trajanja</option>
                  <option value="long">Svi dugoročni</option>
                  <option value="short_job">Jednokratan posao</option>
                  <option value="multi_day">Više dana</option>
                  <option value="fixed_term">Više meseci / određeno</option>
                  <option value="permanent">Stalno zaposlenje</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" name="foreign" value="yes" defaultChecked={sp.foreign === 'yes'} />
                Otvoreno za strane radnike
              </label>

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
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Cena (RSD)</label>
                <div className="flex items-center gap-2">
                  <input
                    name="price_min"
                    type="number"
                    min={0}
                    inputMode="numeric"
                    defaultValue={sp.price_min || ''}
                    placeholder="Od"
                    className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-300 text-xs">–</span>
                  <input
                    name="price_max"
                    type="number"
                    min={0}
                    inputMode="numeric"
                    defaultValue={sp.price_max || ''}
                    placeholder="Do"
                    className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Odnosi se samo na oglase koji imaju unetu cenu.</p>
              </div>

              <div>
                <label htmlFor="sort" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Sortiraj</label>
                <select id="sort" name="sort" defaultValue={sortKey}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white">
                  {Object.entries(SORT_OPTIONS).map(([key, opt]) => (
                    <option key={key} value={key}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Kategorija</label>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  <label className="flex items-center gap-2 cursor-pointer py-0.5">
                    <input type="radio" name="category" value="" defaultChecked={!sp.category} className="text-blue-600" />
                    <span className="text-sm text-gray-700">Sve kategorije</span>
                  </label>
                  {CATEGORIES.map(cat => (
                    <label key={cat.slug} className="flex items-center gap-2 cursor-pointer py-0.5">
                      <input
                        type="radio"
                        name="category"
                        value={cat.slug}
                        defaultChecked={sp.category === cat.slug}
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
                  {displayListings.length > 0 ? `${count} aktivnih oglasa` : 'Nema aktivnih oglasa'}
                  {demoListings.length > 0 ? ` · ${demoListings.length} primera` : ''}
                  {sp.city ? ` u gradu ${sp.city}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {user && (
                  <Link
                    href="/sacuvano"
                    className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    ❤️ Sačuvano
                  </Link>
                )}
                <Link
                  href="/oglasi/novi"
                  className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Novi oglas
                </Link>
              </div>
            </div>

            {displayListings.length === 0 && demoListings.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                <p className="text-4xl mb-4">🔍</p>
                <p className="text-gray-500 mb-2">
                  {hasFilters ? 'Nema oglasa koji odgovaraju pretrazi' : 'Trenutno nema aktivnih oglasa'}
                </p>
                {hasFilters ? (
                  <Link href="/oglasi" className="text-sm text-blue-600 hover:text-blue-700">Poništi filtere</Link>
                ) : (
                  <Link href="/oglasi/novi" className="text-sm text-blue-600 hover:text-blue-700">Budi prvi koji postavlja oglas →</Link>
                )}
              </div>
            ) : displayListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {displayListings.map((listing: any) => {
                  const typeInfo = TYPE_LABELS[listing.type] || TYPE_LABELS.request
                  const profile = listing.profiles as any
                  const category = listing.categories as any
                  return (
                    <Link
                      key={listing.id}
                      href={`/oglasi/${listing.id}`}
                      className={`relative block bg-white rounded-xl border hover:shadow-md transition-all overflow-hidden ${
                        listing.is_gold ? 'border-amber-300 ring-1 ring-amber-200'
                        : listing.type === 'urgent' ? 'border-red-200 ring-1 ring-red-100'
                        : 'border-gray-100'
                      }`}
                    >
                      <SaveButton listingId={listing.id} currentUserId={user?.id ?? null} initiallySaved={savedIds.has(listing.id)} />
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`inline-block text-xs px-2.5 py-1 rounded-full border font-medium ${typeInfo.bg} ${typeInfo.color}`}>
                              {typeInfo.label}
                            </span>
                            {listing.is_gold && (
                              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-amber-300 bg-amber-50 text-amber-700 font-medium">
                                🏆 Gold
                              </span>
                            )}
                            {listing.engagement_mode && listing.engagement_mode !== 'short_job' && (
                              <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                                {listing.engagement_mode === 'multi_day' ? 'Više dana' : listing.engagement_mode === 'fixed_term' ? 'Na određeno' : 'Stalno'}
                              </span>
                            )}
                            {listing.foreign_workers_welcome && <span className="text-xs px-2 py-1 rounded-full bg-teal-50 text-teal-700">Strani radnici</span>}
                            {!listing.is_gold && listing.is_featured && (
                              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700 font-medium">
                                ⭐ Istaknut
                              </span>
                            )}
                          </div>
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
                          {publicInitial(profile)}
                        </div>
                        <span className="text-xs text-gray-600 truncate">{publicName(profile)}</span>
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
            ) : null}

            {demoListings.length > 0 && (
              <section className="mt-8" aria-label="Primeri oglasa">
                <h2 className="text-sm font-medium text-gray-500 mb-4">Primeri oglasa · neaktivni prikazi</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {demoListings.map((item) => (
                    <article key={item.title} className="bg-white rounded-xl border border-gray-200 p-5" aria-label={`Neaktivni primer oglasa: ${item.title}`}>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex flex-wrap gap-1.5">
                          {item.engagement_mode !== 'short_job' && (
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                              {item.engagement_mode === 'multi_day' ? 'Više dana' : item.engagement_mode === 'fixed_term' ? 'Na određeno' : 'Stalno'}
                            </span>
                          )}
                          {item.foreign_workers_welcome && <span className="text-xs px-2 py-1 rounded-full bg-teal-50 text-teal-700">Strani radnici</span>}
                        </div>
                        <span aria-hidden="true" className="text-lg">{item.icon}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1 text-sm leading-snug">{item.title}</h3>
                      <p className="text-xs text-gray-500 mb-3">{item.description}</p>
                      <p className="flex items-center gap-1 text-xs text-gray-500"><MapPin className="w-3 h-3" />{item.city}</p>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <Link
                    key={p}
                    href={`/oglasi?${new URLSearchParams({ ...sp, page: p.toString() }).toString()}`}
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
