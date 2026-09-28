import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Plus, Eye, Pencil, ArrowLeft, Play, Pause, RotateCcw, Crown } from 'lucide-react'
import DeleteListingButton from '@/components/listings/DeleteListingButton'

async function deleteListing(formData: FormData) {
  'use server'
  const listingId = formData.get('listingId') as string
  if (!listingId) return
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  // RLS ("Users can delete own listings") already restricts this to the owner.
  await supabase.from('listings').delete().eq('id', listingId).eq('user_id', user.id)
  revalidatePath('/dashboard/oglasi')
}

async function togglePause(formData: FormData) {
  'use server'
  const listingId = formData.get('listingId') as string
  const nextStatus = formData.get('nextStatus') as string
  if (!listingId || !['active', 'paused'].includes(nextStatus)) return
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { error } = await supabase
    .from('listings')
    .update({ status: nextStatus, updated_at: new Date().toISOString() })
    .eq('id', listingId)
    .eq('user_id', user.id)
  if (error) {
    // Most likely the free-plan listing limit was hit while trying to reactivate.
    redirect(`/dashboard/oglasi?error=${encodeURIComponent(error.message)}`)
  }
  revalidatePath('/dashboard/oglasi')
}

async function renewListing(formData: FormData) {
  'use server'
  const listingId = formData.get('listingId') as string
  if (!listingId) return
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30)
  const { error } = await supabase
    .from('listings')
    .update({ status: 'active', expires_at: expiresAt.toISOString(), updated_at: new Date().toISOString() })
    .eq('id', listingId)
    .eq('user_id', user.id)
  if (error) {
    redirect(`/dashboard/oglasi?error=${encodeURIComponent(error.message)}`)
  }
  revalidatePath('/dashboard/oglasi')
}

export default async function MyListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const sp = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: listings } = await supabase
    .from('listings')
    .select('*, categories(name_sr, icon)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const typeLabel: Record<string, string> = {
    offer: '💼 Nudim',
    request: '🔍 Tražim',
    urgent: '🚨 Hitno',
  }

  const statusLabel: Record<string, { label: string; cls: string }> = {
    active: { label: 'Aktivan', cls: 'bg-green-100 text-green-700' },
    paused: { label: 'Pauziran', cls: 'bg-yellow-100 text-yellow-700' },
    expired: { label: 'Istekao', cls: 'bg-gray-100 text-gray-500' },
    cancelled: { label: 'Otkazan', cls: 'bg-gray-100 text-gray-500' },
    filled: { label: 'Popunjen', cls: 'bg-blue-100 text-blue-700' },
    pending_review: { label: 'Na pregledu', cls: 'bg-amber-100 text-amber-700' },
  }

  const formatDate = (d: string | null) => {
    if (!d) return null
    return new Date(d).toLocaleDateString('sr-RS', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Moji oglasi</h1>
          </div>
          <Link
            href="/oglasi/novi"
            className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novi oglas
          </Link>
        </div>

        {sp.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-5">
            {sp.error}
          </div>
        )}

        {!listings || listings.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <p className="text-4xl mb-4">📋</p>
            <p className="text-gray-500 mb-4">Još nemaš oglase</p>
            <Link href="/oglasi/novi" className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
              Postavi prvi oglas
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
            {listings.map((listing) => {
              const st = statusLabel[listing.status] || statusLabel.active
              const category = listing.categories as any
              return (
                <div key={listing.id} className="flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs text-gray-400">{typeLabel[listing.type]}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.cls}`}>{st.label}</span>
                      {listing.status === 'active' && listing.expires_at && (
                        <span className="text-xs text-gray-300">do {formatDate(listing.expires_at)}</span>
                      )}
                      {listing.is_gold && listing.gold_until && new Date(listing.gold_until) > new Date() && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-50 text-amber-700">
                          🏆 Gold do {formatDate(listing.gold_until)}
                        </span>
                      )}
                      {!listing.is_gold && listing.is_featured && listing.featured_until && new Date(listing.featured_until) > new Date() && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700">
                          ⭐ Istaknut do {formatDate(listing.featured_until)}
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-gray-900 truncate">{listing.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {listing.city} · {category?.icon} {category?.name_sr} · {listing.view_count || 0} pregleda
                    </p>
                    {listing.price_amount && (
                      <p className="text-sm font-semibold text-blue-600 mt-1">
                        {listing.price_amount.toLocaleString('sr-RS')} RSD
                        {listing.price_type === 'hourly' ? '/h' : listing.price_type === 'daily' ? '/dan' : ''}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Link
                      href={`/oglasi/${listing.id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                      title="Pogledaj"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/oglasi/${listing.id}/uredi`}
                      className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Uredi"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/oglasi/${listing.id}/istakni`}
                      className="p-2 text-gray-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                      title="Istakni oglas"
                    >
                      <Crown className="w-4 h-4" />
                    </Link>

                    {(listing.status === 'active' || listing.status === 'paused') && (
                      <form action={togglePause}>
                        <input type="hidden" name="listingId" value={listing.id} />
                        <input type="hidden" name="nextStatus" value={listing.status === 'paused' ? 'active' : 'paused'} />
                        <button
                          type="submit"
                          className="p-2 text-gray-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                          title={listing.status === 'paused' ? 'Aktiviraj' : 'Pauziraj'}
                        >
                          {listing.status === 'paused' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                        </button>
                      </form>
                    )}

                    {(listing.status === 'expired' || listing.status === 'cancelled') && (
                      <form action={renewListing}>
                        <input type="hidden" name="listingId" value={listing.id} />
                        <button
                          type="submit"
                          className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                          title="Obnovi oglas (30 dana)"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </form>
                    )}

                    <DeleteListingButton action={deleteListing} listingId={listing.id} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
