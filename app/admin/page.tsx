import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { Users, Briefcase, MessageSquare, AlertTriangle, CheckCircle, Clock, TrendingUp, Shield } from 'lucide-react'

async function isAdmin(userId: string, supabase: any): Promise<boolean> {
  // Admin check: profile type 'individual' with is_verified=true (customize to your needs)
  // In production, add an 'is_admin' column to profiles
  const { data } = await supabase
    .from('profiles')
    .select('type, is_verified')
    .eq('id', userId)
    .single()
  return data?.type === 'individual' && data?.is_verified === true
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = await isAdmin(user.id, supabase)
  if (!admin) redirect('/dashboard')

  // Stats
  const [
    { count: totalUsers },
    { count: pendingApprovals },
    { count: totalListings },
    { count: activeListings },
    { count: flaggedMessages },
    { data: recentUsers },
    { data: pendingCompanies },
    { data: flaggedMsgs },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_approved', false).in('type', ['company', 'agency']),
    supabase.from('listings').select('*', { count: 'exact', head: true }),
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('messages').select('*', { count: 'exact', head: true }).eq('flagged_contact_share', true),
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.from('profiles').select('*').eq('is_approved', false).in('type', ['company', 'agency']).limit(10),
    supabase.from('messages').select('*, conversations(user1_id, user2_id, listing_id)').eq('flagged_contact_share', true).order('created_at', { ascending: false }).limit(10),
  ])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-blue-600 rounded-xl">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin panel</h1>
            <p className="text-sm text-gray-400">ExpertPro upravljanje platformom</p>
          </div>
        </div>

        {/* Nav tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
          {[
            { href: '/admin', label: 'Pregled', active: true },
            { href: '/admin/users', label: 'Korisnici' },
            { href: '/admin/oglasi', label: 'Oglasi' },
            { href: '/admin/poruke', label: 'Poruke' },
          ].map(tab => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap -mb-px ${
                tab.active
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: <Users className="w-5 h-5 text-blue-600" />, label: 'Ukupno korisnika', value: totalUsers || 0, bg: 'bg-blue-50', href: '/admin/users' },
            { icon: <Clock className="w-5 h-5 text-amber-600" />, label: 'Čeka odobrenje', value: pendingApprovals || 0, bg: 'bg-amber-50', href: '/admin/users', urgent: (pendingApprovals || 0) > 0 },
            { icon: <Briefcase className="w-5 h-5 text-green-600" />, label: 'Aktivnih oglasa', value: activeListings || 0, bg: 'bg-green-50', href: '/admin/oglasi' },
            { icon: <AlertTriangle className="w-5 h-5 text-red-600" />, label: 'Flagovane poruke', value: flaggedMessages || 0, bg: 'bg-red-50', href: '/admin/poruke', urgent: (flaggedMessages || 0) > 0 },
          ].map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className={`bg-white rounded-xl border p-5 hover:shadow-sm transition-all ${
                stat.urgent ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-100'
              }`}
            >
              <div className={`inline-flex p-2 rounded-lg ${stat.bg} mb-3`}>
                {stat.icon}
              </div>
              <p className={`text-2xl font-bold ${stat.urgent && stat.value > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending approvals */}
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Čeka odobrenje
              </h2>
              <Link href="/admin/users" className="text-xs text-blue-600 hover:text-blue-700">Vidi sve</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {pendingCompanies && pendingCompanies.length > 0 ? (
                pendingCompanies.map((company) => (
                  <div key={company.id} className="flex items-center gap-3 p-4">
                    <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center text-sm font-bold text-amber-700 flex-shrink-0">
                      {company.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{company.name}</p>
                      <p className="text-xs text-gray-400">
                        {company.type === 'company' ? 'Firma' : 'Agencija'}
                        {company.pib ? ` · PIB: ${company.pib}` : ''}
                      </p>
                    </div>
                    <ApproveButton profileId={company.id} />
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-sm text-gray-400">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  Nema na čekanju
                </div>
              )}
            </div>
          </div>

          {/* Flagged messages */}
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Flagovane poruke
              </h2>
              <Link href="/admin/poruke" className="text-xs text-blue-600 hover:text-blue-700">Vidi sve</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {flaggedMsgs && flaggedMsgs.length > 0 ? (
                flaggedMsgs.map((msg) => (
                  <div key={msg.id} className="p-4">
                    <div className="flex items-start gap-2 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700 line-clamp-2">{msg.content}</p>
                    </div>
                    <p className="text-xs text-gray-400 ml-5">
                      {new Date(msg.created_at).toLocaleString('sr-RS')}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-sm text-gray-400">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  Nema flagovanih poruka
                </div>
              )}
            </div>
          </div>

          {/* Recent users */}
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                Novi korisnici
              </h2>
              <Link href="/admin/users" className="text-xs text-blue-600 hover:text-blue-700">Vidi sve</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentUsers?.map((u) => (
                <div key={u.id} className="flex items-center gap-3 p-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0">
                    {u.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                    <p className="text-xs text-gray-400 capitalize">
                      {u.type === 'individual' ? 'Fizičko lice' : u.type === 'company' ? 'Firma' : 'Agencija'}
                      {u.city ? ` · ${u.city}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {u.is_approved ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : u.type !== 'individual' ? (
                      <Clock className="w-4 h-4 text-amber-500" />
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// Inline server action button (simplified — in production use Server Actions)
function ApproveButton({ profileId }: { profileId: string }) {
  return (
    <Link
      href={`/admin/users?approve=${profileId}`}
      className="flex-shrink-0 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors"
    >
      Odobri
    </Link>
  )
}
