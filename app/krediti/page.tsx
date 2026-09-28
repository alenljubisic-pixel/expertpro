import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Zap, ArrowLeft, Gift, Crown, Building2 } from 'lucide-react'
import {
  CREDIT_PACKAGES,
  creditBucketForAccountType,
  findPackage,
  generateCreditReferenceCode,
} from '@/lib/credits'

async function createCreditPurchase(formData: FormData) {
  'use server'
  const packageKey = formData.get('packageKey') as string
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/krediti')

  const { data: profile } = await supabase.from('profiles').select('type').eq('id', user.id).single()
  const bucket = creditBucketForAccountType(profile?.type)
  const pkg = findPackage(bucket, packageKey)
  if (!pkg) redirect('/krediti?error=1')

  let orderId: string | null = null
  for (let attempt = 0; attempt < 3 && !orderId; attempt++) {
    const { data, error } = await supabase
      .from('credit_purchases')
      .insert({
        user_id: user.id,
        package_key: pkg!.key,
        credits_amount: pkg!.credits,
        price_amount: pkg!.price,
        reference_code: generateCreditReferenceCode(),
      })
      .select('id')
      .single()
    if (!error && data) orderId = data.id
  }

  if (!orderId) redirect('/krediti?error=1')
  redirect(`/krediti/${orderId}`)
}

export default async function CreditsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const sp = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/krediti')

  const { data: profile } = await supabase.from('profiles').select('type, credit_balance').eq('id', user.id).single()
  const bucket = creditBucketForAccountType(profile?.type)
  const packages = CREDIT_PACKAGES[bucket]

  const { data: pendingOrders } = await supabase
    .from('credit_purchases')
    .select('id, credits_amount, price_amount, status, created_at')
    .eq('user_id', user.id)
    .in('status', ['pending_payment', 'user_confirmed'])
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Link href="/oglasi/novi" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5">
          <ArrowLeft className="w-4 h-4" /> Nazad
        </Link>

        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-6 h-6 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-900">Krediti</h1>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Trenutni saldo: <b className="text-gray-900">{profile?.credit_balance || 0} kredita</b>
          {' '}· {bucket === 'agency' ? 'cene za agencije' : bucket === 'company' ? 'cene za firme' : 'cene za fizička lica'}.
        </p>

        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6 space-y-4 text-sm">
          <div>
            <p className="font-semibold text-gray-800 mb-1.5 flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-green-500" /> Šta dobijaš gratis
            </p>
            <ul className="space-y-1 ml-5 list-disc text-gray-600 text-sm">
              <li>2 kredita odmah pri registraciji, bez ikakve uplate.</li>
              <li>1 aktivan oglas (bilo koje rubrike) uvek besplatno, trajno.</li>
              {bucket !== 'individual' && (
                <li>+10 kredita gratis, jednokratno, kad ti se odobri puno članstvo.</li>
              )}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-gray-800 mb-1.5 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-blue-500" /> Kad se troši 1 kredit
            </p>
            <ul className="space-y-1 ml-5 list-disc text-gray-600 text-sm">
              <li>Svaki hitan oglas na Hitnoj berzi.</li>
              <li>Svaki dodatni oglas preko prvog besplatnog — ista ili druga rubrika.</li>
            </ul>
          </div>
          <div className="bg-gradient-to-r from-amber-50 to-red-50 border border-amber-100 rounded-lg p-3">
            <p className="font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-500" /> Zašto da uplatiš
            </p>
            <p className="text-gray-600 leading-relaxed">
              Poslodavci i klijenti prvo zovu one koje prvo vide. Dopunom kredita brže i češće
              objavljuješ — a ako uz to platiš Istaknut ili Gold (<Link href="/cenovnik" className="underline font-medium text-amber-700">pogledaj cene</Link>),
              ideš na vrh liste, dobijaš značku i ulaziš u uži izbor kad neko traži baš tvoju
              vrstu posla.
            </p>
          </div>
          {bucket === 'agency' && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-3">
              <p className="font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-600" /> Paketi za agencije
              </p>
              <p className="text-gray-600 leading-relaxed">
                Agencija koja aktivno radi obično objavi 15-30 hitnih i dodatnih oglasa mesečno —
                zato imaš veće pakete, po kreditu jeftinije što je paket veći. Jedan veći paket
                (npr. {CREDIT_PACKAGES.agency[CREDIT_PACKAGES.agency.length - 1].credits} kredita) ti obično pokrije ceo mesec, bez
                sitnih dopuna svake nedelje.
              </p>
            </div>
          )}
        </div>

        {sp.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-5">
            Došlo je do greške, pokušaj ponovo.
          </div>
        )}

        {pendingOrders && pendingOrders.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-800 space-y-1">
            <p className="font-medium">Imaš porudžbinu na čekanju:</p>
            {pendingOrders.map(o => (
              <p key={o.id}>
                {o.credits_amount} kredita — {Number(o.price_amount).toLocaleString('sr-RS')} RSD —{' '}
                {o.status === 'user_confirmed' ? 'čeka proveru admina' : 'čeka uplatu'} —{' '}
                <Link href={`/krediti/${o.id}`} className="underline">Otvori</Link>
              </p>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {packages.map(pkg => (
            <form key={pkg.key} action={createCreditPurchase} className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col">
              <input type="hidden" name="packageKey" value={pkg.key} />
              <p className="text-3xl font-bold text-gray-900 mb-1">{pkg.credits}</p>
              <p className="text-xs text-gray-400 mb-4">kredita</p>
              <p className="text-lg font-semibold text-blue-600 mb-1">{pkg.price.toLocaleString('sr-RS')} RSD</p>
              <p className="text-xs text-gray-400 mb-4">{Math.round(pkg.price / pkg.credits)} RSD po kreditu</p>
              <button
                type="submit"
                className="mt-auto w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Kupi paket
              </button>
            </form>
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-6">
          Nakon izbora paketa dobićeš broj računa i jedinstveni poziv na broj za uplatu. Krediti se dodaju na tvoj nalog čim admin potvrdi uplatu.
        </p>
      </main>
      <Footer />
    </div>
  )
}
