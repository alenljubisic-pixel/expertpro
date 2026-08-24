import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { CheckCircle, XCircle, Clock, Shield, ArrowLeft } from 'lucide-react'
import { revalidatePath } from 'next/cache'

async function isAdmin(userId: string, supabase: any): Promise<boolean> {
  const { data } = await supabase.from('profiles').select('type, is_verified').eq('id', userId).single()
  return data?.type === 'individual' && data?.is_verified === true
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { filter?: string; approve?: string; reject?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const admin = await isAdmin(user.id, supabase)
  if (!admin) redirect('/dashboard')

  // Handle approve/reject via searchParam (simple approach; use Server Actions in production)
  if (searchParams.approve) {
    await supabase.from('profiles')
      .update({ is_approved: true, is_active: true })
      .eq('id', searchParams.approve)
    redirect('/admin/users')
  }
  if (searchParams.reject) {
    await supabase.from('profiles')
      .update({ is_approved: false, is_active: false })
      .eq('id', searchParams.reject)
    redirect('/admin/users')
  }

  const filter = searchParams.filter || 'all'

  let query = supabase.from('profiles').select('*').order('created_at', { ascending: false })
  if (filter === 'pending') query = query.eq('is_approved', false).in('type', ['company', 'agency'])
  if (filter === 'companies') query = query.eq('type', 'company')
  if (filter === 'agencies') query = query.eq('type', 'agency')
  if (filter === 'individuals') query = query.eq('type', 'individual')

  const { data: users } = await query.limit(50)

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

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5 border-b border-gray-200 overflow-x-auto">
          {tabs.map(tab => (
            <Link
              key={tab.value}
              href={`/admin/users?filter=${tab.value}`}
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
            users.map((u) => (
              <div key={u.id} className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600 flex-shrink-0">
                  {u.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{u.name || 'N/A'}</p>
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
                      <Link
                        href={`/admin/users?approve=${u.id}`}
                        className="text-xs bg-green-600 text-white px-2.5 py-1 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Odobri
                      </Link>
                      <Link
                        href={`/admin/users?reject=${u.id}`}
                        className="text-xs bg-red-500 text-white px-2.5 py-1 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Odbij
                      </Link>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
