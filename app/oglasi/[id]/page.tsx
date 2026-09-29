import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ApplyButton from '@/components/listings/ApplyButton'
import JobCompletion from '@/components/listings/JobCompletion'
import { MapPin, Calendar, Users, Star, Clock, ArrowLeft, CheckCircle, Eye, MessageSquare, X, Check } from 'lucide-react'
import { safeName, safeInitial } from '@/lib/safe-name'
import { revalidatePath } from 'next/cache'

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  offer: { label: '💼 Nudim uslugu', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
  request: { label: '🔍 Tražim radnika', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  urgent: { label: '🚨 Hitno', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: listing } = await supabase
    .from('listings')
    .select('title, description, city, status')
    .eq('id', id)
    .single()

  if (!listing) return {}

  const title = `${listing.title} — ${listing.city}`
  const description = (listing.description || `Oglas na ExpertPro platformi u gradu ${listing.city}.`).slice(0, 160)

  return {
    title,
    description,
    alternates: { canonical: `/oglasi/${id}` },
    openGraph: { title, description, url: `/oglasi/${id}`, type: 'website' },
    robots: listing.status === 'active' ? { index: true, follow: true } : { index: false, follow: true },
  }
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
        .select('id, status, applicant_id, owner_finished_at, applicant_finished_at, completed_at')
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
  // Oglasi tipa 'offer' ("Nudim uslugu") ostaju trajno otvoreni — ne koriste
  // tok "biranje jednog kandidata" (select/unselect), jer bi to sugerisalo
  // zatvaranje oglasa posle prvog klijenta. RPC funkcije ovo i same odbijaju,
  // ovo je samo da vlasnik ne vidi dugmad koja bi mu inače bacila grešku.
  const isOfferType = listing.type === 'offer'

  const { data: applicants } = isOwner
    ? await supabase
        .from('applications')
        .select('id, applicant_id, message, proposed_price, status, created_at, owner_finished_at, applicant_finished_at, completed_at, applicant:profiles!applicant_id(id, name, avatar_url, rating_avg, rating_count, is_verified, phone)')
        .eq('listing_id', id)
        .order('created_at', { ascending: false })
    : { data: null }

  const assignedApplication = isOwner
    ? applicants?.find(app => app.status === 'accepted')
    : existingApplication?.status === 'accepted' ? existingApplication : null
  const revieweeId = assignedApplication
    ? (isOwner ? assignedApplication.applicant_id : listing.user_id)
    : null
  const { data: myJobReviews } = user
    ? await supabase.from('reviews').select('reviewee_id')
        .eq('listing_id', id).eq('reviewer_id', user.id)
    : { data: null }
  const reviewedUserIds = new Set((myJobReviews || []).map(review => review.reviewee_id))

  async function rejectApplication(formData: FormData) {
    'use server'
    const applicationId = formData.get('applicationId') as string
    if (!applicationId) return

    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) redirect('/login')

    // RLS already restricts this to the listing owner, but re-check defensively.
    const { data: application } = await supabase
      .from('applications')
      .select('listing_id, status, listings!inner(user_id)')
      .eq('id', applicationId)
      .single()

    const listingOwnerId = (application?.listings as any)?.user_id
    if (!application || listingOwnerId !== currentUser.id || application.status !== 'pending') {
      return
    }

    await supabase.rpc('reject_application', { p_application_id: applicationId })
    revalidatePath(`/oglasi/${id}`)
  }

  async function selectApplicant(formData: FormData) {
    'use server'
    const applicationId = formData.get('applicationId') as string
    if (!applicationId) return

    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) redirect('/login')

    await supabase.rpc('select_application_candidate', { p_application_id: applicationId })
    revalidatePath(`/oglasi/${id}`)
  }

  async function acceptOfferApplicant(formData: FormData) {
    'use server'
    const applicationId = formData.get('applicationId') as string
    if (!applicationId) return
    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) redirect('/login')
    await supabase.rpc('accept_offer_application', { p_application_id: applicationId })
    revalidatePath(`/oglasi/${id}`)
  }

  async function unselectApplicant(formData: FormData) {
    'use server'
    const applicationId = formData.get('applicationId') as string
    if (!applicationId) return

    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) redirect('/login')

    await supabase.rpc('unselect_application_candidate', { p_application_id: applicationId })
    revalidatePath(`/oglasi/${id}`)
  }

  const formatDate = (d: string | null) => {
    if (!d) return null
    return new Date(d).toLocaleDateString('sr-RS', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const jobPostingJsonLd = listing.type !== 'offer' ? {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: listing.title,
    description: listing.description || listing.title,
    datePosted: listing.created_at,
    validThrough: listing.expires_at || undefined,
    employmentType: 'CONTRACTOR',
    hiringOrganization: {
      '@type': profile?.type === 'individual' ? 'Person' : 'Organization',
      name: safeName(profile?.name),
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: listing.city,
        addressCountry: 'RS',
      },
    },
    baseSalary: listing.price_amount ? {
      '@type': 'MonetaryAmount',
      currency: 'RSD',
      value: {
        '@type': 'QuantitativeValue',
        value: listing.price_amount,
        unitText: listing.price_type === 'hourly' ? 'HOUR' : listing.price_type === 'daily' ? 'DAY' : undefined,
      },
    } : undefined,
  } : null

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {jobPostingJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingJsonLd) }}
        />
      )}
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

            {listing.status === 'filled' && (
              <div className="bg-green-600 text-white rounded-xl p-4 flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-bold">Oglas je popunjen</p>
                  <p className="text-green-100 text-sm">Kandidat je izabran i potvrđen. Oglas više nije aktivan za nove prijave.</p>
                </div>
              </div>
            )}

            {/* Title card */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-xs px-3 py-1 rounded-full border font-medium ${typeConfig.bg} ${typeConfig.color} ${typeConfig.border}`}>
                      {typeConfig.label}
                    </span>
                    {listing.is_gold && (
                      <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full border border-amber-300 bg-amber-50 text-amber-700 font-medium">
                        🏆 Gold
                      </span>
                    )}
                    {!listing.is_gold && listing.is_featured && (
                      <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700 font-medium">
                        ⭐ Istaknut
                      </span>
                    )}
                    {listing.engagement_mode && listing.engagement_mode !== 'short_job' && (
                      <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700">
                        {listing.engagement_mode === 'multi_day' ? 'Više dana' : listing.engagement_mode === 'fixed_term' ? 'Na određeno' : 'Stalno zaposlenje'}
                      </span>
                    )}
                    {listing.foreign_workers_welcome && <span className="text-xs px-3 py-1 rounded-full bg-teal-50 text-teal-700">Otvoreno za strane radnike</span>}
                    {category && <span className="text-lg">{category.icon}</span>}
                  </div>
                  <h1 className="text-xl font-bold text-gray-900">{listing.title}</h1>
                </div>
                {isOwner && (
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <Link
                      href={`/oglasi/${listing.id}/uredi`}
                      className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Uredi
                    </Link>
                    <Link
                      href={`/oglasi/${listing.id}/istakni`}
                      className="text-xs text-amber-700 hover:text-amber-800 border border-amber-200 bg-amber-50 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors whitespace-nowrap"
                    >
                      🏆 Istakni oglas
                    </Link>
                  </div>
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

        {user && assignedApplication && revieweeId && (!isOfferType || !isOwner) && (
          <JobCompletion
            applicationId={assignedApplication.id}
            listingId={id}
            revieweeId={revieweeId}
            isOwner={isOwner}
            ownerFinishedAt={assignedApplication.owner_finished_at}
            applicantFinishedAt={assignedApplication.applicant_finished_at}
            completedAt={assignedApplication.completed_at}
            hasReviewed={reviewedUserIds.has(revieweeId)}
          />
        )}

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
                                <form action={isOfferType ? acceptOfferApplicant : selectApplicant}>
                                  <input type="hidden" name="applicationId" value={app.id} />
                                  <button
                                    type="submit"
                                    className="flex items-center gap-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg transition-colors"
                                  >
                                    <Check className="w-3.5 h-3.5" /> {isOfferType ? 'Prihvati klijenta' : 'Prihvati'}
                                  </button>
                                </form>
                                <form action={rejectApplication}>
                                  <input type="hidden" name="applicationId" value={app.id} />
                                  <button
                                    type="submit"
                                    className="flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                                  >
                                    <X className="w-3.5 h-3.5" /> Odbij
                                  </button>
                                </form>
                              </>
                            )}
                            {!isOfferType && app.status === 'selected' && (
                              <>
                                <span className="text-xs font-medium text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg">
                                  ⏳ Čeka potvrdu kandidata
                                </span>
                                <form action={unselectApplicant}>
                                  <input type="hidden" name="applicationId" value={app.id} />
                                  <button
                                    type="submit"
                                    className="flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                                  >
                                    <X className="w-3.5 h-3.5" /> Poništi izbor
                                  </button>
                                </form>
                              </>
                            )}
                            {app.status === 'accepted' && (
                              <span className="text-xs font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">
                                ✓ Potvrđeno — posao dodeljen
                              </span>
                            )}
                            {app.status === 'declined' && (
                              <span className="text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                                Kandidat je odustao
                              </span>
                            )}
                            {app.status === 'rejected' && (
                              <span className="text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                                Odbijeno
                              </span>
                            )}
                            {app.status === 'withdrawn' && (
                              <span className="text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                                Povučeno
                              </span>
                            )}
                            {app.status === 'accepted' && (
                              <Link
                                href={`/poruke?listing=${id}&applicant=${app.applicant_id}`}
                                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors ml-auto"
                              >
                                <MessageSquare className="w-3.5 h-3.5" /> Razgovor
                              </Link>
                            )}
                          </div>
                          {isOfferType && app.status === 'accepted' && (
                            <JobCompletion applicationId={app.id} listingId={id}
                              revieweeId={app.applicant_id} isOwner={true}
                              ownerFinishedAt={app.owner_finished_at}
                              applicantFinishedAt={app.applicant_finished_at}
                              completedAt={app.completed_at}
                              hasReviewed={reviewedUserIds.has(app.applicant_id)} />
                          )}
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
