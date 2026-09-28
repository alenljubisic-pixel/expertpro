import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ApplyButton from '@/components/listings/ApplyButton'
import { MapPin, Calendar, Users, Star, Clock, ArrowLeft, CheckCircle, Eye, MessageSquare, X, Check } from 'lucide-react'
import { safeName, safeInitial } from '@/lib/safe-name'
import { revalidatePath } from 'next/cache'

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  offer: { label: '💼 Nudim uslugu', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
  request: { label: '🔍 Tražim radnika', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  urgent: { label: '🚨 Hitno', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
}

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Increment view count
  await supabase.rpc('increment_view_count', { listing_id: id })

  const { data: listing } = await supabase
    .from('listings')
    .select('*, profiles!user_id(*), categories(*)')
    .eq('id', id)
    .single()

  if (!listing) notFound()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: existingApplication } = user
    ? await supabase
        .from('applications')
        .select('id, status')
        .eq('listing_id', id)
        .eq('applicant_id', user.id)
        .single()
    : { data: null }

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, reviewer:profiles!reviewer_id(name, avatar_url)')
    .eq('reviewee_id', listing.user_id)
    .order('created_at', { ascending: false })
    .limit(5)

  const profile = listing.profiles as any
  const category = listing.categories as any
  const typeConfig = TYPE_CONFIG[listing.type] || TYPE_CONFIG.request
  const isOwner = user?.id === listing.user_id

  const { data: applicants } = isOwner
    ? await supabase
        .from('applications')
        .select('id, message, proposed_price, status, created_at, applicant:profiles!applicant_id(id, name, avatar_url, rating_avg, rating_count, is_verified, phone)')
        .eq('listing_id', id)
        .order('created_at', { ascending: false })
    : { data: null }

  async function updateApplicationStatus(formData: FormData) {
    'use server'
    const applicationId = formData.get('applicationId') as string
    const newStatus = formData.get('newStatus') as string
    if (!applicationId || !['accepted', 'rejected'].includes(newStatus)) return

    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) redirect('/login')

    // RLS already restricts this to the listing owner, but re-check defensively.
    const { data: application } = await supabase
      .from('applications')
      .select('listing_id, listings!inner(user_id)')
      .eq('id', applicationId)
      .single()

    const listingOwnerId = (application?.listings as any)?.user_id
    if (!application || listingOwnerId !== currentUser.id) {
      return
    }

    await supabase.from('applications').update({ status: newStatus }).eq('id', applicationId)
    revalidatePath(`/oglasi/${id}`)
  }

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
                          {safeInitial(reviewer?.name)}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{safeName(reviewer?.name)}</span>
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
                  {safeInitial(profile?.name)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{safeName(profile?.name)}</p>
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
                  {applicants && (
                    <p className="text-sm font-semibold text-blue-600 mt-1">
                      {applicants.length} prijava
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

        {/* Applicants (owner only) */}
        {isOwner && (
          <div className="mt-6 bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Prijave ({applicants?.length || 0})</h2>
            {!applicants || applicants.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Još uvek nema prijava na ovaj oglas.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {applicants.map((app) => {
                  const applicant = app.applicant as any
                  return (
                    <div key={app.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600 flex-shrink-0">
                          {safeInitial(applicant?.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <Link href={`/profil/${applicant?.id}`} className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                              {safeName(applicant?.name)}
                            </Link>
                            {applicant?.is_verified && (
                              <span className="flex items-center gap-0.5 text-xs text-green-600">
                                <CheckCircle className="w-3 h-3" /> Verifikovan
                              </span>
                            )}
                            {applicant?.rating_avg > 0 && (
                              <span className="flex items-center gap-0.5 text-xs text-gray-400">
                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                {applicant.rating_avg.toFixed(1)} ({applicant.rating_count || 0})
                              </span>
                            )}
                            <span className="text-xs text-gray-300 ml-auto">
                              {new Date(app.created_at).toLocaleDateString('sr-RS')}
                            </span>
                          </div>

                          {app.proposed_price && (
                            <p className="text-sm text-blue-600 font-medium mb-1">
                              Ponuđena cena: {app.proposed_price.toLocaleString('sr-RS')} RSD
                            </p>
                          )}

                          {app.message && (
                            <p className="text-sm text-gray-600 mb-2 whitespace-pre-line">{app.message}</p>
                          )}

                          <div className="flex items-center gap-2 flex-wrap">
                            {app.status === 'pending' && (
                              <>
                                <form action={updateApplicationStatus}>
                                  <input type="hidden" name="applicationId" value={app.id} />
                                  <input type="hidden" name="newStatus" value="accepted" />
                                  <button
                                    type="submit"
                                    className="flex items-center gap-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg transition-colors"
                                  >
                                    <Check className="w-3.5 h-3.5" /> Prihvati
                                  </button>
                                </form>
                                <form action={updateApplicationStatus}>
                                  <input type="hidden" name="applicationId" value={app.id} />
                                  <input type="hidden" name="newStatus" value="rejected" />
                                  <button
                                    type="submit"
                                    className="flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                                  >
                                    <X className="w-3.5 h-3.5" /> Odbij
                                  </button>
                                </form>
                              </>
                            )}
                            {app.status === 'accepted' && (
                              <span className="text-xs font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">
                                ✓ Prihvaćeno
                              </span>
                            )}
                            {app.status === 'rejected' && (
                              <span className="text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                                Odbijeno
                              </span>
                            )}
                            <Link
                              href={`/poruke?new=${applicant?.id}`}
                              className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors ml-auto"
                            >
                              <MessageSquare className="w-3.5 h-3.5" /> Poruka
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
