import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import ChatWindow from '@/components/chat/ChatWindow'
import ConversationList from '@/components/chat/ConversationList'
import ConversationsRealtimeRefresher from '@/components/chat/ConversationsRealtimeRefresher'

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ conv?: string; listing?: string; applicant?: string }>
}) {
  const sp = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let activeConvId = sp.conv

  // Only a confirmed assignment can open a listing-specific conversation.
  if (!activeConvId && sp.listing) {
    const { data: listing } = await supabase.from('listings')
      .select('id, user_id, type').eq('id', sp.listing).maybeSingle()
    const applicantId = listing?.user_id === user.id ? sp.applicant : user.id
    const { data: accepted } = applicantId
      ? await supabase.from('applications')
        .select('applicant_id').eq('listing_id', sp.listing)
        .eq('applicant_id', applicantId).eq('status', 'accepted').maybeSingle()
      : { data: null }
    const otherUserId = listing && accepted
      ? (user.id === listing.user_id ? accepted.applicant_id
        : user.id === accepted.applicant_id ? listing.user_id : null)
      : null
    if (otherUserId && listing && accepted) {
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('listing_id', sp.listing)
        .or(`and(participant_1_id.eq.${user.id},participant_2_id.eq.${otherUserId}),and(participant_1_id.eq.${otherUserId},participant_2_id.eq.${user.id})`)
        .maybeSingle()

      if (existingConv) {
        activeConvId = existingConv.id
      } else {
        const { data: newConv } = await supabase
          .from('conversations')
          .insert({ participant_1_id: listing.user_id, participant_2_id: accepted.applicant_id, listing_id: sp.listing })
        .select('id')
        .single()
        if (newConv) activeConvId = newConv.id
      }
    }
  }

  const { data: rawConversations } = await supabase
    .from('conversations')
    .select(`
      *,
      user1:profiles!participant_1_id(id, name, avatar_url, is_verified),
      user2:profiles!participant_2_id(id, name, avatar_url, is_verified),
      listing:listings(id, title, type, status, user_id),
      messages(content, created_at, sender_id)
    `)
    .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
    .order('last_message_at', { ascending: false })

  // Old general and pre-assignment conversations remain readable as history.
  const listingIds = Array.from(
    new Set((rawConversations || []).map(c => (c.listing as any)?.id).filter(Boolean) as string[])
  )

  let activePairs = new Set<string>()
  if (listingIds.length > 0) {
    const { data: chosen } = await supabase
      .from('applications')
      .select('listing_id, applicant_id, status, owner_finished_at, applicant_finished_at')
      .in('listing_id', listingIds)
      .eq('status', 'accepted')
    activePairs = new Set((chosen || [])
      .filter(w => !w.owner_finished_at && !w.applicant_finished_at)
      .map(w => `${w.listing_id}:${w.applicant_id}`))
  }

  const conversations = (rawConversations || []).map(c => {
    const listing = c.listing as any
    let locked = true
    if (listing) {
      const applicantId = c.participant_1_id === listing.user_id
        ? c.participant_2_id
        : c.participant_2_id === listing.user_id ? c.participant_1_id : null
      locked = !applicantId || !activePairs.has(`${listing.id}:${applicantId}`)
    }
    return { ...c, locked }
  })

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
