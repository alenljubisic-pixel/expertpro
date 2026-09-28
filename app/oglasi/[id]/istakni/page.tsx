import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ArrowLeft, Star, Crown, Flame } from 'lucide-react'
import {
  PROMOTION_TIERS,
  PROMOTION_PRICES,
  PROMOTION_DURATIONS,
  generateReferenceCode,
  type PromotionTier,
  type PromotionDuration,
} from '@/lib/promotions'
import { CATEGORIES_WITH_ID } from '@/lib/constants'

async function createPromotionOrder(formData: FormData) {
  'use server'
  const listingId = formData.get('listingId') as string
  const tier = formData.get('tier') as PromotionTier
  const duration = Number(formData.get('duration')) as PromotionDuration
  const secondaryCategorySlug = (formData.get('secondaryCategory') as string) || ''

  if (!['featured', 'gold'].includes(tier) || ![7, 15, 30].includes(duration)) {
    redirect(`/oglasi/${listingId}/istakni?error=1`)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: listing } = await supabase
    .from('listings')
    .select('id, user_id')
    .eq('id', listingId)
    .single()
  if (!listing || listing.user_id !== user.id) redirect('/dashboard/oglasi')

  const price = PROMOTION_PRICES[tier][duration]
  const secondaryCategory = tier === 'gold'
    ? CATEGORIES_WITH_ID.find(c => c.slug === secondaryCategorySlug)
    : undefined

  let orderId: string | null = null
  for (let attempt = 0; attempt < 3 && !orderId; attempt++) {
    const { data, error } = await supabase
      .from('listing_promotions')
      .insert({
        listing_id: listingId,
        user_id: user.id,
        tier,
        duration_days: duration,
        price_amount: price,
        reference_code: generateReferenceCode(),
        secondary_category_id: secondaryCategory?.id ?? null,
        secondary_category_slug: secondaryCategory?.slug ?? null,
      })
      .select('id')
      .single()
    if (!error && data) orderId = data.id
  }

  if (!orderId) redirect(`/oglasi/${listingId}/istakni?error=1`)
  redirect(`/oglasi/${listingId}/istakni/${orderId}`)
}

export default async function PromoteListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/oglasi/${id}/istakni`)

  const { data: listing } = await supabase
    .from('listings')
    .select('id, title, user_id, category_slug, is_featured, is_gold, featured_until, gold_until')
    .eq('id', id)
    .single()
  if (!listing) notFound()
  if (listing.user_id !== user.id) redirect(`/oglasi/${id}`)

  const { data: pendingOrders } = await supabase
    .from('listing_promotions')
    .select('id, tier, duration_days, status, created_at')
    .eq('listing_id', id)
    .in('status', ['pending_payment', 'user_confirmed'])
    .order('created_at', { ascending: false })

  const activeGold = listing.is_gold && listing.gold_until && new Date(listing.gold_until) > new Date()
  const activeFeatured = listing.is_featured && listing.featured_until && new Date(listing.featured_until) > new Date()

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Link href={`/oglasi/${id}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5">
          <ArrowLeft className="w-4 h-4" /> Nazad na oglas
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Istakni oglas</h1>
        <p className="text-sm text-gray-400 mb-6 truncate">{listing.title}</p>

        {sp.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-5">
            Došlo je do greške, pokušaj ponovo.
          </div>
        )}

        {(activeGold || activeFeatured) && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
            {activeGold && <p>🏆 Oglas je trenutno <b>Gold</b> do {new Date(listing.gold_until!).toLocaleDateString('sr-RS')}.</p>}
            {activeFeatured && <p>⭐ Oglas je trenutno <b>Istaknut</b> do {new Date(listing.featured_until!).toLocaleDateString('sr-RS')}.</p>}
            <p className="mt-1 text-amber-700/80">Nova uplata dodaje dane na postojeći period.</p>
          </div>
        )}

        {pendingOrders && pendingOrders.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-800 space-y-1">
            <p className="font-medium">Imaš porudžbinu na čekanju:</p>
            {pendingOrders.map(o => (
              <p key={o.id}>
                {PROMOTION_TIERS[o.tier as PromotionTier].label} — {o.duration_days} dana —{' '}
                {o.status === 'user_confirmed' ? 'čeka proveru admina' : 'čeka uplatu'} —{' '}
                <Link href={`/oglasi/${id}/istakni/${o.id}`} className="underline">Otvori</Link>
              </p>
            ))}
          </div>
        )}

        <div className="bg-gradient-to-r from-red-600 to-amber-500 text-white rounded-xl p-4 mb-6 flex items-center gap-3">
          <Flame className="w-6 h-6 flex-shrink-0" />
          <div>
            <p className="font-bold text-sm">🔥 Prilika da budeš viđen — izdvoji se od ostalih oglasa</p>
            <p className="text-xs text-white/90 mt-0.5">Oglasi na vrhu liste privlače prvi pogled. Ne čekaj da te nađu — istakni se odmah.</p>
          </div>
        </div>

        <div className="space-y-6">
          {(['featured', 'gold'] as PromotionTier[]).map(tier => {
            const benefits = tier === 'gold'
              ? [
                  '🥇 Prvo mesto na celoj /oglasi listi — iznad svih ostalih, uključujući Istaknute',
                  '🏆 Zlatna značka i okvir koji se odmah primeti',
                  '📂 Prikaz i u jednoj dodatnoj (srodnoj) rubrici po tvom izboru',
                  '⚡ Prioritet i u pretrazi i u filterima',
                ]
              : [
                  '⭐ Na vrhu liste u okviru svoje kategorije, grada i tipa oglasa',
                  '🔵 Plava značka "Istaknut" na kartici oglasa',
                  '👀 Više pregleda od običnih oglasa ispod',
                ]
            return (
            <div key={tier} className={`bg-white rounded-xl border p-5 ${tier === 'gold' ? 'border-amber-300 ring-1 ring-amber-100' : 'border-gray-100'}`}>
              <div className="flex items-center gap-2 mb-1">
                {tier === 'gold' ? <Crown className="w-5 h-5 text-amber-500" /> : <Star className="w-5 h-5 text-blue-500" />}
                <h2 className="font-semibold text-gray-900">{PROMOTION_TIERS[tier].label}</h2>
                {tier === 'gold' && (
                  <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">NAJVIDLJIVIJE</span>
                )}
              </div>
              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                {benefits.map(b => <li key={b}>{b}</li>)}
              </ul>

              <form action={createPromotionOrder} className="space-y-3">
                <input type="hidden" name="listingId" value={id} />
                <input type="hidden" name="tier" value={tier} />

                {tier === 'gold' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Dodatna (srodna) rubrika — opciono</label>
                    <select name="secondaryCategory" defaultValue="" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white">
                      <option value="">Bez dodatne rubrike</option>
                      {CATEGORIES_WITH_ID.filter(c => c.slug !== listing.category_slug).map(c => (
                        <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3">
                  {PROMOTION_DURATIONS.map(duration => (
                    <button
                      key={duration}
                      type="submit"
                      name="duration"
                      value={duration}
                      className="w-full flex flex-col items-center gap-1 border border-gray-200 rounded-lg p-3 hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
                    >
                      <span className="text-sm font-semibold text-gray-800">{duration} dana</span>
                      <span className="text-xs text-gray-500">{PROMOTION_PRICES[tier][duration].toLocaleString('sr-RS')} RSD</span>
                    </button>
                  ))}
                </div>
              </form>
            </div>
          )})}
        </div>

        <p className="text-xs text-gray-400 mt-6">
          Nakon izbora dobićeš broj računa i jedinstveni pozivni broj za uplatu. Nakon što pošalješ uplatu i admin je potvrdi, promocija se odmah aktivira.
        </p>
      </main>
      <Footer />
    </div>
  )
}
