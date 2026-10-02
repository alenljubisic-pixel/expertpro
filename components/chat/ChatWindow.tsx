'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Send, AlertTriangle, Star } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { safeInitial, safeName } from '@/lib/safe-name'
import type { Message, Profile } from '@/types'

interface ConversationSummary {
  id: string
  participant_1_id: string
  user1?: Pick<Profile, 'id' | 'name'> | null
  user2?: Pick<Profile, 'id' | 'name'> | null
  listing?: { title: string } | null
  locked?: boolean
}

interface Props {
  conversationId: string
  currentUserId: string
  conversations: ConversationSummary[]
}

export default function ChatWindow({ conversationId, currentUserId, conversations }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()

  const conv = conversations.find(c => c.id === conversationId)
  const other = conv?.participant_1_id === currentUserId ? conv?.user2 : conv?.user1
  const isLocked = !conv || !!conv.locked

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    void supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .then(({ data }) => setMessages((data as Message[] | null) || []))

    // Real-time subscription
    const channel = supabase
      .channel(`conv-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, supabase])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending || isLocked) return

    setSending(true)
    setSendError('')
    const content = newMessage.trim()
    setNewMessage('')

    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      content,
    })

    if (error) {
      setNewMessage(content)
      setSendError('Poruka nije poslata. Razgovor je možda zatvoren; osveži stranicu.')
      router.refresh()
    } else {
      // Update conversation preview/timestamp so it sorts to the top of the list
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString(), last_message_preview: content.slice(0, 140) })
        .eq('id', conversationId)
    }

    setSending(false)
  }

  const formatTime = (ts: string) => {
    return new Date(ts).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (ts: string) => {
    const d = new Date(ts)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (d.toDateString() === today.toDateString()) return 'Danas'
    if (d.toDateString() === yesterday.toDateString()) return 'Juče'
    return d.toLocaleDateString('sr-RS')
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-100">
        <Link href="/poruke" aria-label="Nazad na razgovore" className="sm:hidden text-gray-600 hover:text-gray-900 p-1 -ml-1 flex-shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
          {safeInitial(other?.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 text-sm">{safeName(other?.name)}</p>
          {conv?.listing && (
            <p className="text-xs text-gray-400">
              Re: {conv.listing.title}
            </p>
          )}
        </div>
        {other?.id && (
          <Link
            href={`/profil/${other.id}`}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 flex-shrink-0"
          >
            <Star className="w-3.5 h-3.5" />
            Profil / oceni
          </Link>
        )}
      </div>

      {/* Warning / locked notice */}
      {isLocked ? (
        <div className="mx-4 mt-3 flex items-start gap-2 bg-gray-100 border border-gray-200 rounded-lg p-2.5">
          <AlertTriangle className="w-3.5 h-3.5 text-gray-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-600">
            Razgovor je zatvoren: poruke su dozvoljene samo tokom potvrđenog angažmana, do označavanja posla kao završenog. Istorija ostaje vidljiva.
          </p>
        </div>
      ) : (
        <div className="mx-4 mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">
            Sva komunikacija ostaje u sistemu. Deljenje kontakt informacija je zabranjeno i vidljivo adminu.
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, index) => {
          const msgDate = formatDate(msg.created_at)
          const previousDate = index > 0 ? formatDate(messages[index - 1].created_at) : ''
          const showDateSep = msgDate !== previousDate
          const isMe = msg.sender_id === currentUserId

          return (
            <div key={msg.id}>
              {showDateSep && (
                <div className="flex items-center gap-2 my-3">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-400">{msgDate}</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
              )}

              {msg.flagged_contact_share && (
                <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}>
                  <div className="flex items-center gap-1 text-xs text-red-500 bg-red-50 px-2 py-1 rounded-full">
                    <AlertTriangle className="w-3 h-3" />
                    Poruka sadrži kontakt info — vidljivo adminu
                  </div>
                </div>
              )}

              <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm ${
                      isMe
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                    } ${msg.flagged_contact_share ? 'border border-red-300' : ''}`}
                  >
                    {msg.content}
                  </div>
                  <span className={`text-xs mt-1 ${isMe ? 'text-right' : 'text-left'} text-gray-400`}>
                    {formatTime(msg.created_at)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {isLocked ? (
        <div className="p-4 border-t border-gray-100 text-center text-xs text-gray-400">
          Razgovor je zaključan, nije moguće slati nove poruke.
        </div>
      ) : (
        <form onSubmit={sendMessage} className="p-4 border-t border-gray-100">
          {sendError && <p role="alert" className="text-xs text-red-600 mb-2">{sendError}</p>}
          <div className="flex items-center gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Napiši poruku..."
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
          </div>
        </form>
      )}
    </div>
  )
}
