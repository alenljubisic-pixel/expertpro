import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ArrowLeft, Copy, CheckCircle, Clock, XCircle } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import { PROMOTION_TIERS, type PromotionTier } from '@/lib/promotions'

async function markUserConfirmed(formData: FormData) {
  'use server'
  const orderId = formData.get('orderId') as string
  const listingId = formData.get('listingId') as string
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase
    .from('listing_promotions')
    .update({ status: 'user_confirmed', user_confirmed_at: new Date().toISOString() })
    .eq('id', orderId)
    .eq('user_id', user.id)
    .eq('status', 'pending_payment')

  revalidatePath(`/oglasi/${listingId}/istakni/${orderId}`)
}

export default async function PromotionPaymentPage({
  params,
}: {
  params: Promise<{ id: string; orderId: string }>
}) {
  const { id, orderId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/oglasi/${id}/istakni/${orderId}`)

  const { data: order } = await supabase
    .from('listing_promotions')
    .select('*, listings(title)')
    .eq('id', orderId)
    .single()
  if (!order) notFound()
  if (order.user_id !== user.id) redirect(`/oglasi/${id}`)

  const { data: settings } = await supabase
    .from('payment_settings')
    .select('bank_name, account_holder, account_number, payment_reference_note')
    .eq('id', 1)
    .single()

  const bankReady = settings?.account_number && settings?.account_holder
  const tierInfo = PROMOTION_TIERS[order.tier as PromotionTier]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Link href={`/oglasi/${id}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5">
          <ArrowLeft className="w-4 h-4" /> Nazad na oglas
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Uplata — {tierInfo.label}</h1>
        <p className="text-sm text-gray-400 mb-6 truncate">{(order.listings as any)?.title} · {order.duration_days} dana</p>

        {order.status === 'paid_confirmed' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-start gap-3 mb-6">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-green-800">Uplata potvrđena — promocija je aktivna.</p>
              <p className="text-sm text-green-700 mt-1">
                Potvrđeno {order.confirmed_at ? new Date(order.confirmed_at).toLocaleString('sr-RS') : ''}.
              </p>
            </div>
          </div>
        )}

        {order.status === 'rejected' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3 mb-6">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Uplata nije potvrđena / odbijena.</p>
              {order.admin_note && <p className="text-sm text-red-700 mt-1">Napomena: {order.admin_note}</p>}
              <Link href={`/oglasi/${id}/istakni`} className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                Pokušaj ponovo →
              </Link>
            </div>
          </div>
        )}

        {(order.status === 'pending_payment' || order.status === 'user_confirmed') && (
          <>
            {!bankReady ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6 text-sm text-amber-800">
                Podaci za uplatu (broj računa) još nisu podešeni u admin panelu. Kontaktiraj nas na strani{' '}
                <Link href="/kontakt" className="underline">Kontakt</Link> da završiš uplatu, ili sačekaj da admin unese podatke pa se vrati na ovu stranicu.
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6 space-y-4">
                <Row label="Primalac" value={settings!.account_holder!} />
                {settings?.bank_name && <Row label="Banka" value={settings.bank_name} />}
                <Row label="Broj računa" value={settings!.account_number!} mono />
                <Row label="Iznos" value={`${Number(order.price_amount).toLocaleString('sr-RS')} ${order.currency}`} />
                <Row label="Poziv na broj / svrha uplate" value={order.reference_code} mono highlight />
                <p className="text-xs text-gray-400 pt-2 border-t border-gray-50">
                  {settings?.payment_reference_note || 'Obavezno upiši ovaj poziv na broj u uplati, kako bismo mogli da povežemo uplatu sa tvojim oglasom.'}
                </p>
              </div>
            )}

            {order.status === 'user_confirmed' ? (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-2.5 text-sm text-blue-800">
                <Clock className="w-4 h-4 flex-shrink-0" />
                Označeno je da si poslao/la uplatu — čekamo da admin potvrdi. Promocija se aktivira automatski čim se potvrdi.
              </div>
            ) : (
              <form action={markUserConfirmed}>
                <input type="hidden" name="orderId" value={orderId} />
                <input type="hidden" name="listingId" value={id} />
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  Poslao/la sam uplatu
                </button>
              </form>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}

function Row({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-medium flex items-center gap-1.5 ${mono ? 'font-mono' : ''} ${highlight ? 'text-blue-700 bg-blue-50 px-2 py-1 rounded-md' : 'text-gray-900'}`}>
        {value}
        <Copy className="w-3.5 h-3.5 text-gray-300" />
      </span>
    </div>
  )
}
