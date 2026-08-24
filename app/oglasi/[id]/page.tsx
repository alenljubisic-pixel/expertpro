import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ApplyButton from '@/components/listings/ApplyButton'
import { MapPin, Calendar, Users, Star, Clock, ArrowLeft, CheckCircle, Eye } from 'lucide-react'

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  offer: { label: '💼 Nudim uslugu', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
  request: { label: '🔍 Tražim radnika', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  urgent: { label: '🚨 Hitno', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
}

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  // Increment view count
  await supabase.rpc('increment_view_count', { listing_id: params.id })

  const { data: listing } = await supabase
    .from('listings')
    .select('*, profiles(*), categories(*)')
    .eq('id', params.id)
    .single()

  if (!listing) notFound()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: existingApplication } = user
    ? await supabase
        .from('applications')
        .select('id, status')
        .eq('listing_id', params.id)
        .eq('applicant_id', user.id)
        .single()
    : { data: null }

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, reviewer:profiles!reviewer_id(name, avatar_url)')
    .eq('reviewee_id', listing.user_id)
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: applicationCount } = await supabase
    .from('applications')
    .select('id', { count: 'exact' })
    .eq('listing_id', params.id)

  const profile = listing.profiles as any
  const category = listing.categories as any
  const typeConfig = TYPE_CONFIG[listing.type] || TYPE_CONFIG.request
  const isOwner = user?.id === listing.user_id

  const formatDate = (d: string | null) => {
    if (!d) return null
    return new Date(d).toLocaleDateString('sr-RS', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Link href="/oglasi" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-5 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Nazad na oglase
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-5">
            {/* Type badge */}
            {listing.type === 'urgent' && (
              <div className="bg-red-600 text-white rounded-xl p-4 flex items-center gap-3">
                <span className="text-2xl">🚨</span>
                <div>
                  <p className="font-bold">Hitan oglas</p>
                  <p className="text-red-100 text-sm">Radnici u ovom gradu su obavešteni. Prijave stižu brzo.</p>
                </div>
              </div>
            )}

            {/* Title card */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-3 py-1 rounded-full border font-medium ${typeConfig.bg} ${typeConfig.color} ${typeConfig.border}`}>
                      {typeConfig.label}
                    </span>
                    {category && <span className="text-lg">{category.icon}</span>}
                  </div>
                  <h1 className="text-xl font-bold text-gray-900">{listing.title}</h1>
                </div>
                {isOwner && (
                  <Link
                    href={`/oglasi/${listing.id}/uredi`}
                    className="flex-shrink-0 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Uredi
                  </Link>
                )}
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-5">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {listing.city}{listing.location_detail ? `, ${listing.location_detail}` : ''}
                </span>
                {listing.available_from && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {formatDate(listing.available_from)}
                    {listing.available_to && ` — ${formatDate(listing.available_to)}`}
                  </span>
                )}
                {listing.workers_needed && listing.workers_needed > 1 && (
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {listing.workers_needed} radnika
                  </span>
                )}
                <span className="flex items-center gap-1.5 ml-auto">
                  <Eye className="w-4 h-4" />
                  {listing.view_count || 0} pregleda
                </span>
              </div>

              {/* Price */}
              {listing.price_amount ? (
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg mb-5">
                  <span className="text-xl font-bold">{listing.price_amount.toLocaleString('sr-RS')} RSD</span>
                  <span className="text-sm">
                    {listing.price_type === 'hourly' ? '/ sat'
                      : listing.price_type === 'daily' ? '/ dan'
                      : listing.price_type === 'fixed' ? '(fiksno)'
                      : '(dogovor)'}
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 bg-gray-50 text-gray-500 px-4 py-2 rounded-lg mb-5 text-sm">
                  Cena po dogovoru
                </div>
              )}

              {/* Description */}
              {listing.description && (
                <div>
                  <h2 className="font-semibold text-gray-900 mb-2">Opis</h2>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{listing.description}</p>
                </div>
              )}
            </div>

            {/* Reviews */}
            {reviews && reviews.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Ocene korisnika</h2>
                <div className="space-y-4">
                  {reviews.map((review) => {
                    const reviewer = review.reviewer as any
                    return (
                      <div key={review.id} className="border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                            {reviewer?.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{reviewer?.name}</span>
                          <div className="flex gap-0.5 ml-1">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                            ))}
                          </div>
                        </div>
                        {review.comment && <p className="text-sm text-gray-500 ml-9">{review.comment}</p>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Apply / Contact card */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl font-bold text-blue-600 flex-shrink-0">
                  {profile?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{profile?.name}</p>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    {profile?.is_verified && (
                      <span className="flex items-center gap-0.5 text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        Verifikovan
                      </span>
                    )}
                    {profile?.rating_avg > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        {profile.rating_avg.toFixed(1)} ({profile.rating_count || 0})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {profile?.bio && (
                <p className="text-xs text-gray-500 mb-4 line-clamp-3">{profile.bio}</p>
              )}

              {profile?.city && (
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
                  <MapPin className="w-3 h-3" />
                  {profile.city}
                </div>
              )}

              {!isOwner ? (
                <ApplyButton
                  listingId={listing.id}
                  listingUserId={listing.user_id}
                  currentUserId={user?.id || null}
                  existingApplication={existingApplication}
                  type={listing.type}
                />
              ) : (
                <div className="text-center py-2">
                  <p className="text-xs text-gray-400">Ovo je tvoj oglas</p>
                  {applicationCount && (
                    <p className="text-sm font-semibold text-blue-600 mt-1">
                      {applicationCount.length} prijava
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Profile link */}
            <Link
              href={`/profil/${listing.user_id}`}
              className="block bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-all text-sm text-center text-blue-600 hover:text-blue-700"
            >
              Pogledaj profil →
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
