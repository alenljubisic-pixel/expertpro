import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { AlertTriangle, ArrowLeft, MessageSquare } from 'lucide-react'

async function isAdmin(userId: string, supabase: any): Promise<boolean> {
  const { data } = await supabase.from('profiles').select('type, is_verified').eq('id', userId).single()
  return data?.type === 'individual' && data?.is_verified === true
}

export default async function AdminMessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const admin = await isAdmin(user.id, supabase)
  if (!admin) redirect('/dashboard')

  const { data: flaggedMessages } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!sender_id(name, type),
      conversations(
        id,
        user1:profiles!user1_id(name),
        user2:profiles!user2_id(name),
        listing:listings(title)
      )
    `)
    .eq('flagged_contact_share', true)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Flagovane poruke</h1>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">
            Ove poruke su automatski označene jer sadrže potencijalne kontakt informacije (broj telefona ili email adresu).
            Pregled i intervencija je po nahođenju admina.
          </p>
        </div>

        {!flaggedMessages || flaggedMessages.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
            <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">Nema flagovanih poruka</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
            {flaggedMessages.map((msg) => {
              const sender = msg.sender as any
              const conv = msg.conversations as any
              return (
                <div key={msg.id} className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">{sender?.name}</span>
                        <span className="text-xs text-gray-400 capitalize">({sender?.type === 'individual' ? 'fizičko lice' : sender?.type})</span>
                        <span className="text-xs text-gray-300 ml-auto">
                          {new Date(msg.created_at).toLocaleString('sr-RS')}
                        </span>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-gray-900">
                        {msg.content}
                      </div>
                    </div>
                  </div>
                  {conv && (
                    <div className="ml-7 text-xs text-gray-400">
                      Razgovor: {conv.user1?.name} ↔ {conv.user2?.name}
                      {conv.listing ? ` · Re: ${conv.listing.title}` : ''}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
