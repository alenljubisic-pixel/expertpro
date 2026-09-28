import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { ArrowLeft, Trash2, Pause, Play } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import { safeName } from '@/lib/safe-name'

async function isAdmin(userId: string, supabase: any): Promise<boolean> {
  const { data } = await supabase.from('profiles').select('is_admin').eq('id', userId).single()
  return data?.is_admin === true
}

async function deleteListing(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(user.id, supabase))) return
  await supabase.from('listings').delete().eq('id', id)
  revalidatePath('/admin/oglasi')
}

async function toggleStatus(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const nextStatus = formData.get('nextStatus') as string
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(user.id, supabase))) return
  await supabase.from('listings').update({ status: nextStatus }).eq('id', id)
  revalidatePath('/admin/oglasi')
}

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>
}) {
  const sp = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const admin = await isAdmin(user.id, supabase)
  if (!admin) redirect('/dashboard')

  const filter = sp.filter || 'all'

  let query = supabase
    .from('listings')
    .select('*, profiles!user_id(name, email, type)')
    .order('created_at', { ascending: false })

  if (filter === 'active') query = query.eq('status', 'active')
  if (filter === 'expired') query = query.eq('status', 'expired')
  if (filter === 'cancelled') query = query.eq('status', 'cancelled')
  if (filter === 'paused') query = query.eq('status', 'paused')
  if (sp.q) query = query.ilike('title', `%${sp.q}%`)

  const { data: listings } = await query.limit(100)

  // Per-user listing counts (for spotting spam/abuse)
  const counts: Record<string, number> = {}
  for (const l of listings || []) {
    counts[l.user_id] = (counts[l.user_id] || 0) + 1
  }

  const tabs = [
    { value: 'all', label: 'Svi' },
    { value: 'active', label: 'Aktivni' },
    { value: 'expired', label: 'Istekli' },
    { value: 'paused', label: 'Pauzirani' },
    { value: 'cancelled', label: 'Otkazani' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Oglasi</h1>
        </div>

        <form className="mb-5">
          <input
            type="text"
            name="q"
            defaultValue={sp.q}
            placeholder="Pretraga po naslovu..."
            className="w-full max-w-sm px-3 py-2 text-sm border border-gray-200 rounded-lg"
          />
        </form>

        <div className="flex gap-2 mb-5 border-b border-gray-200 overflow-x-auto">
          {tabs.map(tab => (
            <Link
              key={tab.value}
              href={`/admin/oglasi?filter=${tab.value}`}
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
          {!listings || listings.length === 0 ? (
            <div className="p-8 text-center text-gray-400">Nema oglasa u ovoj kategoriji</div>
          ) : (
            listings.map((l: any) => {
              const author = l.profiles
              const userListingCount = counts[l.user_id] || 1
              return (
                <div key={l.id} className="flex items-center gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link href={`/oglasi/${l.id}`} target="_blank" className="font-medium text-gray-900 text-sm truncate hover:text-blue-600">
                        {l.title}
                      </Link>
                      <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                        l.status === 'active' ? 'bg-green-50 text-green-600'
                        : l.status === 'expired' ? 'bg-gray-100 text-gray-500'
                        : l.status === 'paused' ? 'bg-amber-50 text-amber-600'
                        : 'bg-red-50 text-red-600'
                      }`}>
                        {l.status}
                      </span>
                      {userListingCount > 3 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 flex-shrink-0">
                          {userListingCount} oglasa ovog korisnika ⚠️
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      {safeName(author?.name)} · {l.city} · {new Date(l.created_at).toLocaleDateString('sr-RS')}
                      {l.expires_at ? ` · ističe ${new Date(l.expires_at).toLocaleDateString('sr-RS')}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <form action={toggleStatus}>
                      <input type="hidden" name="id" value={l.id} />
                      <input type="hidden" name="nextStatus" value={l.status === 'paused' ? 'active' : 'paused'} />
                      <button
                        type="submit"
                        title={l.status === 'paused' ? 'Aktiviraj' : 'Pauziraj'}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      >
                        {l.status === 'paused' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                      </button>
                    </form>
                    <form action={deleteListing}>
                      <input type="hidden" name="id" value={l.id} />
                      <button type="submit" title="Obriši" className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}
