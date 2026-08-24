import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { MapPin, Star, CheckCircle, Briefcase, MessageSquare } from 'lucide-react'

export default async function PublicProfilePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .eq('is_active', true)
    .single()

  if (!profile) notFound()

  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .eq('user_id', params.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(6)

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, reviewer:profiles!reviewer_id(name)')
    .eq('reviewee_id', params.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: { user } } = await supabase.auth.getUser()
  const isOwnProfile = user?.id === params.id

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile card */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-20">
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-3xl font-bold text-blue-600 mx-auto mb-3">
                  {profile.name?.[0]?.toUpperCase() || '?'}
                </div>
                <h1 className="text-xl font-bold text-gray-900">{profile.name}</h1>
                <p className="text-sm text-gray-400 capitalize mt-0.5">
                  {profile.type === 'individual' ? 'Fizičko lice'
                    : profile.type === 'company' ? 'Firma'
                    : 'Agencija'}
                </p>
              </div>

              <div className="space-y-2 mb-5">
                {profile.is_verified && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Verifikovan/a
                  </div>
                )}
                {profile.city && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />
                    {profile.city}
                  </div>
                )}
                {profile.rating_avg > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    {profile.rating_avg.toFixed(1)} ({profile.rating_count || 0} ocena)
                  </div>
                )}
                {profile.completed_jobs > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Briefcase className="w-4 h-4" />
                    {profile.completed_jobs} završenih poslova
                  </div>
                )}
              </div>

              {profile.skills && profile.skills.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Veštine</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.skills.map((skill: string) => (
                      <span key={skill} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile.languages && profile.languages.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Jezici</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.languages.map((lang: string) => (
                      <span key={lang} className="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {!isOwnProfile && user && (
                <Link
                  href={`/poruke?new=${params.id}`}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Pošalji poruku
                </Link>
              )}
              {isOwnProfile && (
                <Link
                  href="/dashboard/profil"
                  className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Uredi profil
                </Link>
              )}
            </div>
          </div>

          {/* Main content */}
          <div className="md:col-span-2 space-y-5">
            {/* Bio */}
            {profile.bio && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-2">O meni / O nama</h2>
                <p className="text-gray-600 text-sm leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Active listings */}
            {listings && listings.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Aktivni oglasi</h2>
                <div className="space-y-3">
                  {listings.map((listing) => (
                    <Link
                      key={listing.id}
                      href={`/oglasi/${listing.id}`}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-50"
                    >
                      <span className="text-lg">
                        {listing.type === 'offer' ? '💼' : listing.type === 'urgent' ? '🚨' : '🔍'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{listing.title}</p>
                        <p className="text-xs text-gray-400">{listing.city}</p>
                      </div>
                      {listing.price_amount && (
                        <span className="text-xs font-semibold text-blue-600 flex-shrink-0">
                          {listing.price_amount.toLocaleString('sr-RS')} RSD
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {reviews && reviews.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Ocene</h2>
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
                        <p className="text-xs text-gray-300 ml-9 mt-1">
                          {new Date(review.created_at).toLocaleDateString('sr-RS')}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {(!listings || listings.length === 0) && (!reviews || reviews.length === 0) && !profile.bio && (
              <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
                <p className="text-gray-400">Profil je tek kreiran</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
