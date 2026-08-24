import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import {
  Plus, Star, Briefcase, MessageSquare, Eye, CheckCircle,
  Clock, TrendingUp, Users, Settings, Bell, AlertCircle, Award
} from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

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

  const { data: conversations } = await supabase
    .from('conversations')
    .select('*, messages(content, created_at)')
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .order('updated_at', { ascending: false })
    .limit(5)

  const activeListings = myListings?.filter(l => l.status === 'active').length || 0
  const totalApplications = myApplications?.length || 0

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
                Obično traje do 24 časa. Bićeš obavešten emailom čim bude odobren.
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: <Briefcase className="w-5 h-5 text-blue-600" />, label: 'Aktivnih oglasa', value: activeListings, bg: 'bg-blue-50' },
            { icon: <Users className="w-5 h-5 text-green-600" />, label: 'Prijava', value: totalApplications, bg: 'bg-green-50' },
            { icon: <MessageSquare className="w-5 h-5 text-purple-600" />, label: 'Poruka', value: conversations?.length || 0, bg: 'bg-purple-50' },
            { icon: <Star className="w-5 h-5 text-yellow-600" />, label: 'Prosečna ocena', value: profile?.rating_avg ? `${profile.rating_avg.toFixed(1)} ★` : '—', bg: 'bg-yellow-50' },
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
            {/* Profile card */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl font-bold text-blue-600">
                  {profile?.name ? profile.name[0].toUpperCase() : '?'}
                </div>
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
                {profile?.type === 'individual' && (
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
