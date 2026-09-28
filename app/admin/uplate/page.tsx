import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { ArrowLeft, Check, X, CreditCard } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import { safeName } from '@/lib/safe-name'
import { PROMOTION_TIERS, type PromotionTier } from '@/lib/promotions'

async function isAdmin(userId: string, supabase: any): Promise<boolean> {
  const { data } = await supabase.from('profiles').select('is_admin').eq('id', userId).single()
  return data?.is_admin === true
}

async function confirmPromotion(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(user.id, supabase))) return
  await supabase.rpc('admin_confirm_promotion', { p_promotion_id: id })
  revalidatePath('/admin/uplate')
}

async function rejectPromotion(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(user.id, supabase))) return
  await supabase.rpc('admin_reject_promotion', { p_promotion_id: id })
  revalidatePath('/admin/uplate')
}

async function updatePaymentSettings(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(user.id, supabase))) return

  await supabase.from('payment_settings').update({
    bank_name: (formData.get('bank_name') as string) || null,
    account_holder: (formData.get('account_holder') as string) || null,
    account_number: (formData.get('account_number') as string) || null,
    payment_reference_note: (formData.get('payment_reference_note') as string) || null,
    updated_at: new Date().toISOString(),
    updated_by: user.id,
  }).eq('id', 1)

  revalidatePath('/admin/uplate')
}

const STATUS_LABEL: Record<string, { label: string; bg: string }> = {
  pending_payment: { label: 'Čeka uplatu', bg: 'bg-gray-100 text-gray-600' },
  user_confirmed: { label: 'Čeka proveru', bg: 'bg-amber-50 text-amber-600' },
  paid_confirmed: { label: 'Potvrđeno', bg: 'bg-green-50 text-green-600' },
  rejected: { label: 'Odbijeno', bg: 'bg-red-50 text-red-600' },
  expired: { label: 'Isteklo', bg: 'bg-gray-100 text-gray-400' },
}

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const sp = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (!(await isAdmin(user.id, supabase))) redirect('/dashboard')

  const filter = sp.filter || 'pending'

  let query = supabase
    .from('listing_promotions')
    .select('*, listings(title), profiles!user_id(name, email)')
    .order('created_at', { ascending: false })

  if (filter === 'pending') query = query.in('status', ['pending_payment', 'user_confirmed'])
  else if (filter !== 'all') query = query.eq('status', filter)

  const { data: orders } = await query.limit(200)

  const { data: settings } = await supabase
    .from('payment_settings')
    .select('bank_name, account_holder, account_number, payment_reference_note')
    .eq('id', 1)
    .single()

  const tabs = [
    { value: 'pending', label: 'Na čekanju' },
    { value: 'paid_confirmed', label: 'Potvrđene' },
    { value: 'rejected', label: 'Odbijene' },
    { value: 'all', label: 'Sve' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Uplate — Istaknuto / Gold</h1>
        </div>

        {/* Bank details settings */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-8">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <CreditCard className="w-4 h-4 text-blue-600" /> Podaci za uplatu (prikazuju se korisnicima)
          </h2>
          {!settings?.account_number && (
            <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              Broj računa nije unet — korisnici trenutno ne mogu da vide gde da uplate. Unesi ga ispod.
            </p>
          )}
          <form action={updatePaymentSettings} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Naziv primaoca (kako stoji na računu)</label>
              <input name="account_holder" defaultValue={settings?.account_holder || ''} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Banka</label>
              <input name="bank_name" defaultValue={settings?.bank_name || ''} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Broj tekućeg računa</label>
              <input name="account_number" defaultValue={settings?.account_number || ''} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg font-mono" placeholder="npr. 160-0000000000000-00" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Napomena za uplatioce (opciono)</label>
              <input name="payment_reference_note" defaultValue={settings?.payment_reference_note || ''} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg" />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                Sačuvaj podatke
              </button>
            </div>
          </form>
        </div>

        <div className="flex gap-2 mb-5 border-b border-gray-200 overflow-x-auto">
          {tabs.map(tab => (
            <Link
              key={tab.value}
              href={`/admin/uplate?filter=${tab.value}`}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap -mb-px ${
                filter === tab.value ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
          {!orders || orders.length === 0 ? (
            <div className="p-8 text-center text-gray-400">Nema porudžbina u ovoj kategoriji</div>
          ) : (
            orders.map((o: any) => {
              const status = STATUS_LABEL[o.status] || STATUS_LABEL.pending_payment
              const tierInfo = PROMOTION_TIERS[o.tier as PromotionTier]
              const canAct = o.status === 'pending_payment' || o.status === 'user_confirmed'
              return (
                <div key={o.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/oglasi/${o.listing_id}`} target="_blank" className="font-medium text-gray-900 text-sm truncate hover:text-blue-600">
                        {o.listings?.title || 'Oglas'}
                      </Link>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${tierInfo.color === 'amber' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                        {tierInfo.label} · {o.duration_days}d
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${status.bg}`}>{status.label}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {safeName(o.profiles?.name)} · {o.price_amount} {o.currency} · šifra{' '}
                      <span className="font-mono text-gray-600">{o.reference_code}</span> ·{' '}
                      {new Date(o.created_at).toLocaleString('sr-RS')}
                    </p>
                    {o.admin_note && <p className="text-xs text-gray-400 mt-0.5">Napomena: {o.admin_note}</p>}
                  </div>

                  {canAct && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <form action={confirmPromotion}>
                        <input type="hidden" name="id" value={o.id} />
                        <button type="submit" className="flex items-center gap-1 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors">
                          <Check className="w-3.5 h-3.5" /> Potvrdi
                        </button>
                      </form>
                      <form action={rejectPromotion}>
                        <input type="hidden" name="id" value={o.id} />
                        <button type="submit" className="flex items-center gap-1 text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                          <X className="w-3.5 h-3.5" /> Odbij
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}
