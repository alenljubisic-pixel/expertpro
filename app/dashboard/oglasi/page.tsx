import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Plus, Eye, Pencil, Trash2, ArrowLeft } from 'lucide-react'

export default async function MyListingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: listings } = await supabase
    .from('listings')
    .select('*, categories(name, icon)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const typeLabel: Record<string, string> = {
    offer: '💼 Nudim',
    request: '🔍 Tražim',
    urgent: '🚨 Hitno',
  }

  const statusLabel: Record<string, { label: string; cls: string }> = {
    active: { label: 'Aktivan', cls: 'bg-green-100 text-green-700' },
    paused: { label: 'Pauziran', cls: 'bg-yellow-100 text-yellow-700' },
    closed: { label: 'Zatvoren', cls: 'bg-gray-100 text-gray-600' },
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Moji oglasi</h1>
          </div>
          <Link
            href="/oglasi/novi"
            className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novi oglas
          </Link>
        </div>

        {!listings || listings.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <p className="text-4xl mb-4">📋</p>
            <p className="text-gray-500 mb-4">Još nemaš oglase</p>
            <Link href="/oglasi/novi" className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
              Postavi prvi oglas
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
            {listings.map((listing) => {
              const st = statusLabel[listing.status] || statusLabel.active
              return (
                <div key={listing.id} className="flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-400">{typeLabel[listing.type]}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.cls}`}>{st.label}</span>
                    </div>
                    <p className="font-medium text-gray-900 truncate">{listing.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {listing.city} · {(listing.categories as any)?.icon} {(listing.categories as any)?.name} · {listing.view_count || 0} pregleda
                    </p>
                    {listing.price && (
                      <p className="text-sm font-semibold text-blue-600 mt-1">
                        {listing.price.toLocaleString('sr-RS')} RSD
                        {listing.price_type === 'hourly' ? '/h' : listing.price_type === 'daily' ? '/dan' : ''}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/oglasi/${listing.id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                      title="Pogledaj"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/oglasi/${listing.id}/uredi`}
                      className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Uredi"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
