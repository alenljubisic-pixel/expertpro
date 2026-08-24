'use client'

import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

interface Props {
  conversations: any[]
  currentUserId: string
  activeConvId?: string
}

export default function ConversationList({ conversations, currentUserId, activeConvId }: Props) {
  return (
    <div className="w-full sm:w-72 border-r border-gray-100 flex flex-col flex-shrink-0 overflow-y-auto">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900">Razgovori</h2>
      </div>

      {conversations.length === 0 ? (
        <div className="p-6 text-center text-sm text-gray-400">
          Nema razgovora
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {conversations.map((conv) => {
            const other = conv.user1_id === currentUserId ? conv.user2 : conv.user1
            const lastMsg = conv.messages?.[conv.messages.length - 1]
            const isActive = conv.id === activeConvId

            return (
              <Link
                key={conv.id}
                href={`/poruke?conv=${conv.id}`}
                className={`flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors ${
                  isActive ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                }`}
              >
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600 flex-shrink-0">
                  {other?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{other?.name}</p>
                    {other?.is_verified && <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />}
                  </div>
                  {conv.listing && (
                    <p className="text-xs text-blue-600 truncate">{conv.listing.title}</p>
                  )}
                  {lastMsg && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {lastMsg.sender_id === currentUserId ? 'Ti: ' : ''}{lastMsg.content}
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
