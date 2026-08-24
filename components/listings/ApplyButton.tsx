'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { MessageSquare, Send, CheckCircle, XCircle } from 'lucide-react'

interface Props {
  listingId: string
  listingUserId: string
  currentUserId: string | null
  existingApplication: { id: string; status: string } | null
  type: string
}

export default function ApplyButton({ listingId, listingUserId, currentUserId, existingApplication, type }: Props) {
  const [applying, setApplying] = useState(false)
  const [message, setMessage] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [applied, setApplied] = useState(!!existingApplication)
  const [appStatus, setAppStatus] = useState(existingApplication?.status || '')
  const router = useRouter()
  const supabase = createClient()

  if (!currentUserId) {
    return (
      <Link
        href="/login"
        className="w-full block text-center bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors text-sm"
      >
        Prijavi se da bi se javio/la
      </Link>
    )
  }

  if (applied) {
    return (
      <div className="text-center">
        {appStatus === 'accepted' ? (
          <div className="flex items-center justify-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium text-sm">Prijava prihvaćena!</span>
          </div>
        ) : appStatus === 'rejected' ? (
          <div className="flex items-center justify-center gap-2 text-red-500">
            <XCircle className="w-5 h-5" />
            <span className="text-sm">Prijava odbijena</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-yellow-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Prijava poslata</span>
            </div>
            <Link
              href="/poruke"
              className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Otvori poruke
            </Link>
          </div>
        )}
      </div>
    )
  }

  const handleApply = async () => {
    setApplying(true)
    const { error } = await supabase.from('applications').insert({
      listing_id: listingId,
      applicant_id: currentUserId,
      message: message.trim() || null,
      status: 'pending',
    })

    if (!error) {
      // Auto-create conversation between applicant and listing owner
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .or(
          `and(user1_id.eq.${currentUserId},user2_id.eq.${listingUserId}),and(user1_id.eq.${listingUserId},user2_id.eq.${currentUserId})`
        )
        .single()

      if (!existingConv) {
        await supabase.from('conversations').insert({
          user1_id: currentUserId,
          user2_id: listingUserId,
          listing_id: listingId,
        })
      }

      setApplied(true)
      setAppStatus('pending')
      setShowForm(false)
    }
    setApplying(false)
  }

  return (
    <div>
      {!showForm ? (
        <div className="space-y-2">
          <button
            onClick={() => setShowForm(true)}
            className={`w-full py-3 rounded-xl font-medium text-sm text-white transition-colors ${
              type === 'urgent'
                ? 'bg-red-600 hover:bg-red-700'
                : type === 'offer'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {type === 'offer' ? '🤝 Zainteresovan/a sam' : '📩 Prijavi se'}
          </button>
          <Link
            href="/poruke"
            className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Pošalji poruku
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Kratka poruka (opcionalno) — napiši nešto o sebi ili iskustvu..."
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Otkaži
            </button>
            <button
              onClick={handleApply}
              disabled={applying}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50 ${
                type === 'urgent' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              {applying ? 'Šaljem...' : 'Pošalji'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
