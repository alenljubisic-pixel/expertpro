import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import ChatWindow from '@/components/chat/ChatWindow'
import ConversationList from '@/components/chat/ConversationList'
import ConversationsRealtimeRefresher from '@/components/chat/ConversationsRealtimeRefresher'

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ conv?: string; new?: string }>
}) {
  const sp = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let activeConvId = sp.conv

  // Coming from a "Pošalji poruku" button (?new=<otherUserId>): find or
  // create the conversation with that user, then continue as normal.
  if (!activeConvId && sp.new && sp.new !== user.id) {
    const otherUserId = sp.new
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('id')
      .or(
        `and(participant_1_id.eq.${user.id},participant_2_id.eq.${otherUserId}),and(participant_1_id.eq.${otherUserId},participant_2_id.eq.${user.id})`
      )
      .maybeSingle()

    if (existingConv) {
      activeConvId = existingConv.id
    } else {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({ participant_1_id: user.id, participant_2_id: otherUserId })
        .select('id')
        .single()
      if (newConv) activeConvId = newConv.id
    }
  }

  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      *,
      user1:profiles!participant_1_id(id, name, avatar_url, is_verified),
      user2:profiles!participant_2_id(id, name, avatar_url, is_verified),
      listing:listings(id, title, type),
      messages(content, created_at, sender_id)
    `)
    .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
    .order('last_message_at', { ascending: false })

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <ConversationsRealtimeRefresher userId={user.id} />

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
