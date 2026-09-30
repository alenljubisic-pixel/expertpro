import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { CheckCircle, Clock, ArrowLeft, Coins, Briefcase, Wallet } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import { reportMonth, monthLabel } from '@/lib/report-month'

interface UserStats {
  id: string
  listings_posted: number
  completed_as_worker: number
  completed_as_client: number
  credits_paid_total: number
  credits_pending_total: number
  promotions_paid_total: number
  promotions_pending_total: number
}

async function isAdmin(userId: string, supabase: any): Promise<boolean> {
  const { data } = await supabase.from('profiles').select('is_admin').eq('id', userId).single()
  return data?.is_admin === true
}

async function approveUser(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(user.id, supabase))) return
  await supabase.from('profiles').update({ is_approved: true, is_active: true }).eq('id', id)
  revalidatePath('/admin/users')
}

async function rejectUser(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(user.id, supabase))) return
  await supabase.from('profiles').update({ is_approved: false, is_active: false }).eq('id', id)
  revalidatePath('/admin/users')
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; page?: string; month?: string }>
}) {
  const sp = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const admin = await isAdmin(user.id, supabase)
  if (!admin) redirect('/dashboard')

  const filter = sp.filter || 'all'
  const month = reportMonth(sp.month)
  const page = Math.max(1, Math.min(10000, Number.parseInt(sp.page || '1', 10) || 1))

  let query = supabase.from('profiles').select('*').order('created_at', { ascending: false })
  if (filter === 'pending') query = query.eq('is_approved', false).in('type', ['company', 'agency'])
  if (filter === 'companies') query = query.eq('type', 'company')
  if (filter === 'agencies') query = query.eq('type', 'agency')
  if (filter === 'individuals') query = query.eq('type', 'individual')

  const { data: users } = await query.range((page - 1) * 50, page * 50 - 1)

  const { data: statsRows } = users?.length
    ? await supabase.rpc('admin_get_user_stats_monthly', { p_user_ids: users.map(u => u.id), p_month: `${month}-01` })
    : { data: [] }
  const statsById = new Map<string, UserStats>((statsRows || []).map((s: UserStats) => [s.id, s]))

  const totalPaidAll = (statsRows || []).reduce(
    (sum: number, s: UserStats) => sum + Number(s.credits_paid_total) + Number(s.promotions_paid_total),
    0
  )
  const totalPendingAll = (statsRows || []).reduce(
    (sum: number, s: UserStats) => sum + Number(s.credits_pending_total) + Number(s.promotions_pending_total),
    0
  )

  const tabs = [
    { value: 'all', label: 'Svi' },
    { value: 'pending', label: 'Na čekanju' },
    { value: 'individuals', label: 'Fizička lica' },
    { value: 'companies', label: 'Firme' },
    { value: 'agencies', label: 'Agencije' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Korisnici</h1>
        </div>
        <form method="get" action="/admin/users" className="flex flex-wrap items-center gap-3 mb-5 text-sm">
          <input type="hidden" name="filter" value={filter} />
          <label htmlFor="admin-month" className="font-medium text-gray-700">Statistika za mesec</label>
          <input id="admin-month" name="month" type="month" defaultValue={month} className="rounded-lg border border-gray-300 px-3 py-2" />
          <button className="text-blue-600 font-medium">Prikaži</button>
          <Link href={`/admin/users/export?month=${month}`} className="ml-auto rounded-lg border border-blue-200 px-3 py-2 text-blue-700">Izvezi CSV za {monthLabel(month)}</Link>
        </form>

        {/* Revenue summary */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <Wallet className="w-3.5 h-3.5 text-green-500" /> Uplaćeno u mesecu — prikazani korisnici
            </div>
            <p className="text-xl font-bold text-gray-900">{totalPaidAll.toLocaleString('sr-RS')} RSD</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" /> Nalozi za uplatu otvoreni u mesecu — prikazani korisnici
            </div>
            <p className="text-xl font-bold text-gray-900">{totalPendingAll.toLocaleString('sr-RS')} RSD</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5 border-b border-gray-200 overflow-x-auto">
          {tabs.map(tab => (
            <Link
              key={tab.value}
              href={`/admin/users?filter=${tab.value}&month=${month}`}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap -mb-px ${
                filter === tab.value
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
          {!users || users.length === 0 ? (
            <div className="p-8 text-center text-gray-400">Nema korisnika u ovoj kategoriji</div>
          ) : (
            users.map((u) => {
              const stats = statsById.get(u.id)
              const totalPaid = stats ? Number(stats.credits_paid_total) + Number(stats.promotions_paid_total) : 0
              const totalPending = stats ? Number(stats.credits_pending_total) + Number(stats.promotions_pending_total) : 0
              return (
              <div key={u.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600 flex-shrink-0">
                  {u.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/admin/users/${u.id}?month=${month}`} className="font-medium text-blue-700 hover:underline text-sm truncate">{u.name || 'N/A'} → detalji</Link>
                  <p className="text-xs text-gray-400">
                    {u.type === 'individual' ? 'Fizičko lice'
                      : u.type === 'company' ? 'Firma'
                      : 'Agencija'}
                    {u.pib ? ` · PIB: ${u.pib}` : ''}
                    {u.city ? ` · ${u.city}` : ''}
                    {u.rating_avg > 0 ? ` · ★ ${u.rating_avg.toFixed(1)}` : ''}
                  </p>
                  <p className="text-xs text-gray-300">
                    {new Date(u.created_at).toLocaleDateString('sr-RS')}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-xs text-gray-600">{u.is_verified ? '✓ Verifikovan' : 'Nije verifikovan'} · {u.is_active ? 'Aktivan' : 'Neaktivan'}</span>
                    <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 rounded-full px-2 py-0.5">
                      <Coins className="w-3 h-3" /> {u.credit_balance ?? 0} kredita sada
                    </span>
                    <span className="flex items-center gap-1 text-xs text-blue-700 bg-blue-50 rounded-full px-2 py-0.5">
                      <Briefcase className="w-3 h-3" /> {stats?.listings_posted ?? 0} oglasa u mesecu
                    </span>
                    <span className="text-xs text-purple-700 bg-purple-50 rounded-full px-2 py-0.5">
                      Završeno: {Number(stats?.completed_as_worker ?? 0) + Number(stats?.completed_as_client ?? 0)} · izvođač {stats?.completed_as_worker ?? 0} / klijent {stats?.completed_as_client ?? 0}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 rounded-full px-2 py-0.5">
                      <Wallet className="w-3 h-3" /> {totalPaid.toLocaleString('sr-RS')} RSD uplaćeno
                    </span>
                    {totalPending > 0 && (
                      <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
                        {totalPending.toLocaleString('sr-RS')} RSD na čekanju
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {u.type === 'individual' || u.is_approved ? (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      {u.is_verified ? 'Verifikovan' : 'Odobren'}
                    </span>
                  ) : (
                    <>
                      <span className="flex items-center gap-1 text-xs text-amber-600">
                        <Clock className="w-4 h-4" />
                        Čeka
                      </span>
                      <form action={approveUser}>
                        <input type="hidden" name="id" value={u.id} />
                        <button type="submit" className="text-xs bg-green-600 text-white px-2.5 py-1 rounded-lg hover:bg-green-700 transition-colors">
                          Odobri
                        </button>
                      </form>
                      <form action={rejectUser}>
                        <input type="hidden" name="id" value={u.id} />
                        <button type="submit" className="text-xs bg-red-500 text-white px-2.5 py-1 rounded-lg hover:bg-red-600 transition-colors">
                          Odbij
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>
              )
            })
          )}
        </div>
        <div className="flex justify-between mt-4 text-sm">
          {page > 1 ? <Link href={`/admin/users?filter=${filter}&month=${month}&page=${page - 1}`} className="text-blue-600">← Prethodna</Link> : <span />}
          {users?.length === 50 && <Link href={`/admin/users?filter=${filter}&month=${month}&page=${page + 1}`} className="text-blue-600">Sledeća →</Link>}
        </div>
      </main>
    </div>
  )
}
