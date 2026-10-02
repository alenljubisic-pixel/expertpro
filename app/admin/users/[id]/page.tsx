import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import ProfileAvatar from '@/components/profile/ProfileAvatar'
import { createClient } from '@/lib/supabase/server'
import { reportMonth, monthLabel } from '@/lib/report-month'
import { revalidatePath } from 'next/cache'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function adjustCredits(formData: FormData) {
  'use server'
  const id = String(formData.get('user_id') || '')
  if (!UUID_PATTERN.test(id)) redirect('/admin/users')
  const month = reportMonth(String(formData.get('month') || ''))
  const returnPath = `/admin/users/${id}?month=${month}`
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: admin } = await supabase.from('profiles').select('is_admin,is_active').eq('id', user.id).single()
  if (!admin?.is_admin || !admin?.is_active) redirect('/dashboard')

  const mode = String(formData.get('mode') || '')
  const amountText = String(formData.get('amount') || '')
  const reason = String(formData.get('reason') || '').trim()
  const requestId = String(formData.get('request_id') || '')
  if (!['add', 'remove', 'set'].includes(mode)
    || !/^(0|[1-9]\d{0,5})$/.test(amountText)
    || !UUID_PATTERN.test(requestId)
    || reason.length < 5 || reason.length > 300) {
    redirect(`${returnPath}&credit_error=${encodeURIComponent('Proveri radnju, iznos i razlog (5–300 znakova).')}`)
  }

  const { error } = await supabase.rpc('master_adjust_user_credits', {
    p_user_id: id,
    p_mode: mode,
    p_amount: Number(amountText),
    p_reason: reason,
    p_request_id: requestId,
  })
  if (error) redirect(`${returnPath}&credit_error=${encodeURIComponent(error.message)}`)
  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${id}`)
  redirect(`${returnPath}&credit_ok=1`)
}

export default async function AdminUserDetailPage({
  params, searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ month?: string; credit_ok?: string; credit_error?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const month = reportMonth(sp.month)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: admin } = await supabase.from('profiles').select('is_admin,is_active').eq('id', user.id).single()
  if (!admin?.is_admin || !admin?.is_active) redirect('/dashboard')

  const [{ data: profile }, { data: stats }, { data: jobs }, { data: contacts }, { data: adjustments }] = await Promise.all([
    supabase.from('profiles').select('id,name,username,type,city,avatar_url,is_verified,is_approved,is_active,credit_balance,created_at').eq('id', id).single(),
    supabase.rpc('admin_get_user_stats_monthly', { p_user_ids: [id], p_month: `${month}-01` }),
    supabase.rpc('admin_user_job_history_monthly', { p_user_id: id, p_month: `${month}-01` }),
    supabase.rpc('admin_profile_contacts', { p_user_ids: [id] }),
    supabase.from('admin_logs').select('created_at,details').eq('action', 'manual_credit_adjustment').eq('target_id', id).order('created_at', { ascending: false }).limit(10),
  ])
  if (!profile) notFound()
  const s = stats?.[0]

  return <div className="min-h-screen bg-gray-50">
    <Navbar />
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Link href={`/admin/users?month=${month}`} className="text-sm text-blue-600">← Svi korisnici</Link>
      <div className="mt-4 flex items-center gap-3">
        <ProfileAvatar src={profile.avatar_url} type={profile.type} name={profile.username || profile.name} className="w-14 h-14" />
        <h1 className="text-2xl font-bold text-gray-900">{profile.type === 'individual' ? profile.username : profile.name}</h1>
      </div>
      {profile.type === 'individual' && <p className="mt-1 text-sm text-gray-600">Ime za administraciju: {contacts?.[0]?.legal_name || 'Nije uneto'}</p>}
      <p className="mt-1 text-sm text-gray-600">{profile.type} · {profile.city || 'Grad nije unet'} · {contacts?.[0]?.email || 'Email nije unet'} · {contacts?.[0]?.phone || 'Telefon nije unet'}</p>
      <p className="mt-1 text-sm text-gray-500">{profile.is_verified ? 'Verifikovan' : 'Nije verifikovan'} · {profile.is_approved ? 'Odobren' : 'Čeka odobrenje'} · {profile.is_active ? 'Aktivan' : 'Neaktivan'} · {profile.credit_balance ?? 0} kredita trenutno</p>
      <section id="credits" className="mt-6 rounded-xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-gray-900">Ručno promeni kredite</h2>
        <p className="mt-1 text-xs text-gray-500">Samo master admin. Ne kreira nalog za uplatu; svaka promena se beleži sa razlogom.</p>
        {sp.credit_ok === '1' && <p role="status" className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-800">Saldo je ažuriran. Trenutno: {profile.credit_balance ?? 0} kredita.</p>}
        {sp.credit_error && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">Izmena nije uspela: {sp.credit_error}</p>}
        <form action={adjustCredits} className="mt-4 grid gap-3 sm:grid-cols-3">
          <input type="hidden" name="user_id" value={id} />
          <input type="hidden" name="month" value={month} />
          <input type="hidden" name="request_id" value={crypto.randomUUID()} />
          <label className="text-sm font-medium text-gray-700">Radnja
            <select name="mode" defaultValue="add" className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2">
              <option value="add">Dodaj</option>
              <option value="remove">Oduzmi</option>
              <option value="set">Postavi tačan saldo</option>
            </select>
          </label>
          <label className="text-sm font-medium text-gray-700">Broj kredita
            <input name="amount" type="number" min="0" max="100000" step="1" required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2" />
          </label>
          <label className="text-sm font-medium text-gray-700 sm:col-span-3">Razlog (obavezno)
            <textarea name="reason" minLength={5} maxLength={300} required rows={2}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="Npr. promotivni krediti za početak rada" />
          </label>
          <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 sm:col-span-3 sm:justify-self-start">Sačuvaj promenu salda</button>
        </form>
        {adjustments && adjustments.length > 0 && (
          <div className="mt-5 border-t border-gray-100 pt-4">
            <h3 className="text-sm font-semibold text-gray-700">Poslednjih 10 izmena</h3>
            <ul className="mt-2 space-y-2 text-sm text-gray-600">
              {adjustments.map((item: { created_at: string; details: Record<string, unknown> }, index: number) => (
                <li key={`${item.created_at}-${index}`} className="flex flex-wrap justify-between gap-2 border-b border-gray-50 pb-2">
                  <span>{String(item.details?.reason || '')}</span>
                  <span className="whitespace-nowrap font-medium">{Number(item.details?.delta) > 0 ? '+' : ''}{String(item.details?.delta ?? '')} → {String(item.details?.balance_after ?? '')} · {new Date(item.created_at).toLocaleString('sr-RS')}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
      <form method="get" className="mt-5 flex items-center gap-3 text-sm">
        <label htmlFor="detail-month">Mesec</label>
        <input id="detail-month" type="month" name="month" defaultValue={month} className="rounded border border-gray-300 px-3 py-2" />
        <button className="font-medium text-blue-600">Prikaži</button>
      </form>
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ['Oglasi', s?.listings_posted ?? 0],
          ['Završeno kao izvođač', s?.completed_as_worker ?? 0],
          ['Završeno kao klijent', s?.completed_as_client ?? 0],
          ['Uplaćeno RSD', Number(s?.credits_paid_total ?? 0) + Number(s?.promotions_paid_total ?? 0)],
        ].map(([label, value]) => <div key={label} className="rounded-xl bg-white p-4 text-sm shadow-sm"><p className="text-gray-500">{label}</p><p className="mt-1 text-xl font-bold">{value}</p></div>)}
      </div>
      <section className="mt-6 rounded-xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Završeni poslovi — {monthLabel(month)}</h2>
        <p className="mt-1 text-xs text-gray-500">Prikazano najnovijih 100; oba učesnika moraju potvrditi završetak.</p>
        {jobs?.length ? <div className="mt-3 divide-y divide-gray-100">
          {jobs.map((job: { listing_id: string; title: string; user_role: string; completed_at: string }) =>
            <Link key={`${job.listing_id}-${job.completed_at}`} href={`/oglasi/${job.listing_id}`} className="flex justify-between gap-3 py-3 text-sm hover:text-blue-600">
              <span className="truncate">{job.title}</span><span className="whitespace-nowrap text-gray-500">{job.user_role === 'izvodjac' ? 'Izvođač' : 'Klijent'} · {new Date(job.completed_at).toLocaleDateString('sr-RS')}</span>
            </Link>)}
        </div> : <p className="mt-4 text-sm text-gray-500">Nema završenih poslova u ovom mesecu.</p>}
      </section>
    </main>
  </div>
}
