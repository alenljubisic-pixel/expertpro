import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import SaveButton from '@/components/listings/SaveButton'
import { MapPin } from 'lucide-react'
import { publicName, publicInitial } from '@/lib/safe-name'

const TYPE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  offer: { label: 'Nudim uslugu', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  request: { label: 'Tražim radnika', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  urgent: { label: '🚨 Hitno', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
}

export const metadata = { title: 'Sačuvani oglasi — ExpertPro', robots: { index: false, follow: false } }

export default async function SavedListingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: saved } = await supabase
    .from('saved_listings')
    .select('created_at, listings(*, profiles!user_id(id, type, name, username, avatar_url, rating_avg, is_verified), categories(icon))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const rows = (saved || []).filter((s: any) => s.listings)

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">❤️ Sačuvani oglasi</h1>
          <p className="text-sm text-gray-500 mt-1">Oglasi koje si sačuvao/la da im se lakše vratiš.</p>
        </div>

        {rows.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <p className="text-4xl mb-4">❤️</p>
            <p className="text-gray-500 mb-2">Još uvek nemaš sačuvanih oglasa</p>
            <Link href="/oglasi" className="text-sm text-blue-600 hover:text-blue-700">Pregledaj oglase →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {rows.map((row: any) => {
              const listing = row.listings
              const typeInfo = TYPE_LABELS[listing.type] || TYPE_LABELS.request
              const profile = listing.profiles as any
              const category = listing.categories as any
              const inactive = listing.status !== 'active'
              return (
                <Link
                  key={listing.id}
                  href={`/oglasi/${listing.id}`}
                  className={`relative block bg-white rounded-xl border hover:shadow-md transition-all overflow-hidden ${inactive ? 'opacity-60' : 'border-gray-100'}`}
                >
                  <SaveButton listingId={listing.id} currentUserId={user.id} initiallySaved={true} />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className={`inline-block text-xs px-2.5 py-1 rounded-full border font-medium ${typeInfo.bg} ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                      {category && <span className="text-lg">{category.icon}</span>}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 text-sm leading-snug">
                      {listing.title}
                    </h3>
                    {inactive && (
                      <p className="text-xs text-amber-600 mb-2">Ovaj oglas više nije aktivan.</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {listing.city}
                      </span>
                      {listing.price_amount && (
                        <span className="font-semibold text-blue-600">
                          {listing.price_amount.toLocaleString('sr-Latn-RS')} RSD
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
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
