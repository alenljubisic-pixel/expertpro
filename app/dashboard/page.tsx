import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CreditsWidget from '@/components/credits/CreditsWidget'
import ReferralCard from '@/components/credits/ReferralCard'
import ProfileAvatar from '@/components/profile/ProfileAvatar'
import PushPermissionCard from '@/components/notifications/PushPermissionCard'
import { reportMonth, monthLabel } from '@/lib/report-month'
import {
  Plus, Briefcase, MessageSquare, Eye, CheckCircle,
  Clock, TrendingUp, Settings, Bell, AlertCircle, Award
} from 'lucide-react'

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const month = reportMonth((await searchParams).month)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const [{ data: completedCount }, { data: completedJobs }, { data: activityRows }] = await Promise.all([
    supabase.rpc('completed_job_count_monthly', { p_user_id: user.id, p_month: `${month}-01` }),
    supabase.rpc('my_completed_jobs_monthly', { p_month: `${month}-01` }),
    supabase.rpc('my_monthly_activity', { p_month: `${month}-01` }),
  ])
  const activity = activityRows?.[0]
  const { data: referralRows } = await supabase.rpc('my_referral_stats')
  const referralStats = referralRows?.[0] ?? { pending_count: 0, rewarded_count: 0, earned_credits: 0 }

  const { data: myListings } = await supabase
    .from('listings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: myApplications } = await supabase
    .from('applications')
    .select('*, listings(*)')
    .eq('applicant_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const isCompanyOrAgency = profile?.type === 'company' || profile?.type === 'agency'

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Zdravo, {profile?.name || user.email?.split('@')[0]}! 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {profile?.type === 'individual' && 'Fizičko lice'}
              {profile?.type === 'company' && 'Firma'}
              {profile?.type === 'agency' && 'Agencija za rad'}
              {profile?.rating_avg && profile.rating_avg > 0
                ? ` · ★ ${profile.rating_avg.toFixed(1)} (${profile.review_count} ocena)`
                : ' · Još nema ocena'}
            </p>
          </div>
          <Link
            href="/oglasi/novi"
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Novi oglas
          </Link>
        </div>

        {/* Approval warning */}
        {isCompanyOrAgency && !profile?.is_approved && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Nalog čeka odobrenje</p>
              <p className="text-sm text-amber-600 mt-0.5">
                Tvoj {profile?.type === 'company' ? 'firmski' : 'agencijski'} nalog je pod reviziom.
                Posle provere videćeš obaveštenje u svom nalogu. Aktivni oglasi su pauzirani dok odobrenje čeka.
              </p>
            </div>
          </div>
        )}

        <div className="mb-6"><PushPermissionCard compact /></div>

        {/* Stats */}
        <form method="get" action="/dashboard" className="flex items-center gap-3 mb-4 text-sm">
          <label htmlFor="dashboard-month" className="font-medium text-gray-700">Mesec statistike</label>
          <input id="dashboard-month" name="month" type="month" defaultValue={month} className="rounded-lg border border-gray-300 px-3 py-2" />
          <button className="text-blue-600 font-medium">Prikaži</button>
        </form>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: <Briefcase className="w-5 h-5 text-blue-600" />, label: 'Objavljenih oglasa u mesecu', value: activity?.listings_posted ?? 0, bg: 'bg-blue-50' },
            { icon: <CheckCircle className="w-5 h-5 text-green-600" />, label: `Završeno — ${monthLabel(month)}`, value: completedCount ?? 0, bg: 'bg-green-50' },
            { icon: <MessageSquare className="w-5 h-5 text-purple-600" />, label: 'Poslatih prijava u mesecu', value: activity?.applications_sent ?? 0, bg: 'bg-purple-50' },
            { icon: <Award className="w-5 h-5 text-yellow-600" />, label: 'Primljenih ocena u mesecu', value: activity?.reviews_received ?? 0, bg: 'bg-yellow-50' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className={`inline-flex p-2 rounded-lg ${stat.bg} mb-3`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-8">
          <h2 className="font-semibold text-gray-900 mb-1">Moji završeni poslovi — {monthLabel(month)}</h2>
          <p className="text-xs text-gray-500 mb-3">Broje se tek kada obe strane potvrde završetak. Kao izvođač ili klijent — nalog nije vezan za jednu ulogu.</p>
          {completedJobs?.length ? (
            <div className="divide-y divide-gray-100">
              {completedJobs.map((job: { listing_id: string; title: string; my_role: string; completed_at: string }) => (
                <Link key={`${job.listing_id}-${job.completed_at}`} href={`/oglasi/${job.listing_id}`} className="flex justify-between gap-3 py-2 text-sm hover:text-blue-600">
                  <span className="truncate">{job.title}</span>
                  <span className="text-xs text-gray-500 whitespace-nowrap">{job.my_role === 'izvodjac' ? 'Izvođač' : 'Klijent'} · {new Date(job.completed_at).toLocaleDateString('sr-RS')}</span>
                </Link>
              ))}
            </div>
          ) : <p className="text-sm text-gray-500">Još nema obostrano potvrđenih završenih poslova.</p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* My Listings */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Moji oglasi</h2>
              <Link href="/dashboard/oglasi" className="text-sm text-blue-600 hover:text-blue-700">
                Vidi sve
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {myListings && myListings.length > 0 ? (
                myListings.map((listing) => (
                  <Link
                    key={listing.id}
                    href={`/oglasi/${listing.id}`}
                    className="flex items-start gap-4 p-5 hover:bg-gray-50 transition-colors"
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      listing.type === 'urgent' ? 'bg-red-100 text-red-700'
                      : listing.type === 'offer' ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                    }`}>
                      {listing.type === 'urgent' ? '🚨' : listing.type === 'offer' ? '💼' : '🔍'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{listing.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{listing.city} · {listing.view_count || 0} pregleda</p>
                    </div>
                    <span className={`flex-shrink-0 text-xs px-2 py-1 rounded-full font-medium ${
                      listing.status === 'active' ? 'bg-green-100 text-green-700'
                      : listing.status === 'closed' ? 'bg-gray-100 text-gray-600'
                      : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {listing.status === 'active' ? 'Aktivan' : listing.status === 'closed' ? 'Zatvoren' : 'Pauziran'}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="p-8 text-center">
                  <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Još nemaš oglase</p>
                  <Link href="/oglasi/novi" className="mt-3 inline-block text-sm text-blue-600 hover:text-blue-700">
                    Postavi prvi oglas →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Credits */}
            <CreditsWidget balance={profile?.credit_balance ?? 0} accountType={profile?.type} />
            <ReferralCard code={profile?.referral_code ?? null} stats={referralStats} />

            {/* Profile card */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-4">
                <ProfileAvatar src={profile?.avatar_url} type={profile?.type} name={profile?.name} className="w-12 h-12" />
                <div>
                  <p className="font-semibold text-gray-900">{profile?.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Link
                  href="/dashboard/profil"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Uredi profil
                </Link>
                <Link
                  href="/obaveštenja"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  Obaveštenja
                </Link>
                {profile?.is_admin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Award className="w-4 h-4" />
                    Admin panel
                  </Link>
                )}
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Brze akcije</h3>
              <div className="space-y-2">
                <Link
                  href="/oglasi/novi?type=offer"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition-colors"
                >
                  <span className="w-6 h-6 rounded bg-green-50 flex items-center justify-center text-xs">💼</span>
                  Nudim uslugu
                </Link>
                <Link
                  href="/oglasi/novi?type=request"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <span className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center text-xs">🔍</span>
                  Tražim radnika
                </Link>
                <Link
                  href="/oglasi/novi?type=urgent"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
                >
                  <span className="w-6 h-6 rounded bg-red-50 flex items-center justify-center text-xs">🚨</span>
                  Hitna berza
                </Link>
                <Link
                  href="/poruke"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 transition-colors"
                >
                  <span className="w-6 h-6 rounded bg-purple-50 flex items-center justify-center text-xs"><MessageSquare className="w-3 h-3 text-purple-600" /></span>
                  Moje poruke
                </Link>
              </div>
            </div>

            {/* Recent applications */}
            {myApplications && myApplications.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Prijave</h3>
                <div className="space-y-3">
                  {myApplications.slice(0, 3).map((app) => (
                    <div key={app.id} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        app.status === 'accepted' ? 'bg-green-500'
                        : app.status === 'rejected' ? 'bg-red-500'
                        : 'bg-yellow-500'
                      }`} />
                      <p className="text-xs text-gray-600 truncate">
                        {(app.listings as any)?.title || 'Oglas'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
