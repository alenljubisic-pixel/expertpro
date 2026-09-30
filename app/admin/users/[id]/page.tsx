import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase/server'
import { reportMonth, monthLabel } from '@/lib/report-month'

export default async function AdminUserDetailPage({
  params, searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ month?: string }>
}) {
  const { id } = await params
  const month = reportMonth((await searchParams).month)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: admin } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!admin?.is_admin) redirect('/dashboard')

  const [{ data: profile }, { data: stats }, { data: jobs }, { data: contacts }] = await Promise.all([
    supabase.from('profiles').select('id,name,username,type,city,is_verified,is_approved,is_active,credit_balance,created_at').eq('id', id).single(),
    supabase.rpc('admin_get_user_stats_monthly', { p_user_ids: [id], p_month: `${month}-01` }),
    supabase.rpc('admin_user_job_history_monthly', { p_user_id: id, p_month: `${month}-01` }),
    supabase.rpc('admin_profile_contacts', { p_user_ids: [id] }),
  ])
  if (!profile) notFound()
  const s = stats?.[0]

  return <div className="min-h-screen bg-gray-50">
    <Navbar />
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Link href={`/admin/users?month=${month}`} className="text-sm text-blue-600">← Svi korisnici</Link>
      <h1 className="mt-4 text-2xl font-bold text-gray-900">{profile.type === 'individual' ? profile.username : profile.name}</h1>
      {profile.type === 'individual' && <p className="mt-1 text-sm text-gray-600">Ime za administraciju: {contacts?.[0]?.legal_name || 'Nije uneto'}</p>}
      <p className="mt-1 text-sm text-gray-600">{profile.type} · {profile.city || 'Grad nije unet'} · {contacts?.[0]?.email || 'Email nije unet'} · {contacts?.[0]?.phone || 'Telefon nije unet'}</p>
      <p className="mt-1 text-sm text-gray-500">{profile.is_verified ? 'Verifikovan' : 'Nije verifikovan'} · {profile.is_approved ? 'Odobren' : 'Čeka odobrenje'} · {profile.is_active ? 'Aktivan' : 'Neaktivan'} · {profile.credit_balance ?? 0} kredita trenutno</p>
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
