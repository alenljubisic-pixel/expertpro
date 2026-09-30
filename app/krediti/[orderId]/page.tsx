import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ArrowLeft, CheckCircle, Clock, XCircle, QrCode } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import QRCode from 'qrcode'
import { buildIpsQrPayload } from '@/lib/ips-qr'
import { buildPaymentPurpose } from '@/lib/payment-purpose'
import { sendPaymentReview } from '@/lib/telegram-payments'

async function markUserConfirmed(formData: FormData) {
  'use server'
  const orderId = formData.get('orderId') as string
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: before } = await supabase.from('credit_purchases')
    .select('user_id,status').eq('id', orderId).single()
  if (before?.user_id !== user.id || before.status !== 'pending_payment') return
  const { error } = await supabase.rpc('mark_my_credit_purchase_sent', { p_purchase_id: orderId })
  if (error) return
  const [{ data: order }, { data: contacts }, { data: profile }] = await Promise.all([
    supabase.from('credit_purchases')
      .select('status,bank_reference,reference_code,price_amount,user_confirmed_at')
      .eq('id', orderId).single(),
    supabase.rpc('get_my_profile_contact'),
    supabase.from('profiles').select('username').eq('id', user.id).single(),
  ])
  if (order?.status === 'user_confirmed') {
    await sendPaymentReview({
      kind: 'credit', orderId,
      reference: order.bank_reference || order.reference_code,
      orderCode: order.reference_code,
      userCode: profile?.username || null,
      amount: Number(order.price_amount),
      legalName: contacts?.[0]?.legal_name || null,
      phone: contacts?.[0]?.phone || null,
      email: user.email || null,
      submittedAt: order.user_confirmed_at,
    })
  }

  revalidatePath(`/krediti/${orderId}`)
}

export default async function CreditPurchasePaymentPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/krediti/${orderId}`)

  const { data: order } = await supabase.from('credit_purchases').select('*').eq('id', orderId).single()
  if (!order) notFound()
  if (order.user_id !== user.id) redirect('/krediti')

  const [{ data: settings }, { data: profile }] = await Promise.all([
    supabase.from('payment_settings')
      .select('bank_name, account_holder, account_number, payment_reference_note')
      .eq('id', 1).single(),
    supabase.from('profiles').select('username').eq('id', user.id).single(),
  ])
  const purpose = buildPaymentPurpose(order.reference_code, profile?.username, order.bank_reference)

  const bankReady = settings?.account_number && settings?.account_holder

  let ipsQrDataUrl: string | null = null
  if (bankReady) {
    const payload = buildIpsQrPayload({
      accountNumber: settings!.account_number!,
      accountHolder: settings!.account_holder!,
      amountRsd: Number(order.price_amount),
      purposeText: purpose,
      bankReference: order.bank_reference,
    })
    if (payload) {
      try {
        ipsQrDataUrl = await QRCode.toDataURL(payload, { margin: 1, width: 220 })
      } catch {
        ipsQrDataUrl = null
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Link href="/krediti" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5">
          <ArrowLeft className="w-4 h-4" /> Nazad na krediti
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Uplata — {order.credits_amount} kredita</h1>
        <p className="text-sm text-gray-400 mb-6">{Number(order.price_amount).toLocaleString('sr-RS')} {order.currency}</p>

        {order.status === 'paid_confirmed' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-start gap-3 mb-6">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-green-800">Uplata potvrđena — krediti su dodati na tvoj nalog.</p>
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
              <Link href="/krediti" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
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
                <Link href="/kontakt" className="underline">Kontakt</Link> da završiš uplatu.
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6 space-y-4">
                {ipsQrDataUrl && (
                  <div className="flex flex-col items-center gap-2 pb-4 mb-2 border-b border-gray-50">
                    <img src={ipsQrDataUrl} alt="IPS QR kod za uplatu" width={180} height={180} className="rounded-lg" />
                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                      <QrCode className="w-3.5 h-3.5" /> Skeniraj u aplikaciji banke i proveri račun, iznos, poziv na broj i svrhu pre potvrde
                    </p>
                  </div>
                )}
                <Row label="Primalac" value={settings!.account_holder!} />
                {settings?.bank_name && <Row label="Banka" value={settings.bank_name} />}
                <Row label="Broj računa" value={settings!.account_number!} mono />
                <Row label="Iznos" value={`${Number(order.price_amount).toLocaleString('sr-RS')} ${order.currency}`} />
                {order.bank_reference && <Row label="Model / poziv na broj" value={`97 / ${order.bank_reference}`} mono highlight />}
                <Row label="Svrha uplate" value={purpose} mono highlight />
                <p className="text-xs text-gray-400 pt-2 border-t border-gray-50">
                  {order.bank_reference ? 'Pri ručnoj uplati unesi model 97, poziv na broj i svrhu tačno kako su prikazani. Oznaka U: u svrsi identifikuje tvoj nalog. Proveri podatke pre potvrde u banci.' : (settings?.payment_reference_note || 'Za ovu raniju porudžbinu unesi šifru u polje „svrha uplate“. Nije bankarski poziv na broj.')}
                </p>
              </div>
            )}

            {order.status === 'user_confirmed' ? (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-2.5 text-sm text-blue-800">
                <Clock className="w-4 h-4 flex-shrink-0" />
                Označeno je da si poslao/la uplatu — čekamo da admin potvrdi. Krediti se dodaju automatski čim se potvrdi.
              </div>
            ) : (
              <form action={markUserConfirmed}>
                <input type="hidden" name="orderId" value={orderId} />
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
      <span className={`text-sm font-medium text-right break-all ${mono ? 'font-mono' : ''} ${highlight ? 'text-blue-700 bg-blue-50 px-2 py-1 rounded-md' : 'text-gray-900'}`}>
        {value}
      </span>
    </div>
  )
}
