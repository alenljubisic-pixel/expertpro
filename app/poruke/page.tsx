import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import ChatWindow from '@/components/chat/ChatWindow'
import ConversationList from '@/components/chat/ConversationList'

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: { conv?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      *,
      user1:profiles!user1_id(id, name, avatar_url, is_verified),
      user2:profiles!user2_id(id, name, avatar_url, is_verified),
      listing:listings(id, title, type),
      messages(content, created_at, sender_id)
    `)
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .order('updated_at', { ascending: false })

  const activeConvId = searchParams.conv

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <h1 className="text-xl font-bold text-gray-900 mb-5">Poruke</h1>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ height: 'calc(100vh - 200px)', minHeight: 500 }}>
          <div className="flex h-full">
            {/* Conversation list */}
            <ConversationList
              conversations={conversations || []}
              currentUserId={user.id}
              activeConvId={activeConvId}
            />

            {/* Chat window */}
            {activeConvId ? (
              <ChatWindow
                conversationId={activeConvId}
                currentUserId={user.id}
                conversations={conversations || []}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <p className="text-4xl mb-3">💬</p>
                  <p className="text-gray-500">Izaberi razgovor</p>
                  <p className="text-xs text-gray-400 mt-1">Poruke ostaju u sistemu — bez deljenja kontakata</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
