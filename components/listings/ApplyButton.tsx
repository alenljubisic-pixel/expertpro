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
  const [responding, setResponding] = useState(false)
  const [applyError, setApplyError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleConfirm = async () => {
    if (!existingApplication) return
    setResponding(true)
    const { error } = await supabase.rpc('confirm_application', { p_application_id: existingApplication.id })
    if (!error) {
      setAppStatus('accepted')
      router.refresh()
    }
    setResponding(false)
  }

  const handleDecline = async () => {
    if (!existingApplication) return
    setResponding(true)
    const { error } = await supabase.rpc('decline_application', { p_application_id: existingApplication.id })
    if (!error) {
      setAppStatus('declined')
      router.refresh()
    }
    setResponding(false)
  }

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
        {appStatus === 'selected' ? (
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-sm font-semibold text-amber-800">🎉 Izabran/a si za ovaj posao!</p>
              <p className="text-xs text-amber-700 mt-1">Potvrdi angažman da bi oglas bio dodeljen tebi.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDecline}
                disabled={responding}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Odustani
              </button>
              <button
                onClick={handleConfirm}
                disabled={responding}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {responding ? 'Šaljem...' : 'Potvrdi angažman'}
              </button>
            </div>
          </div>
        ) : appStatus === 'accepted' ? (
          <div className="flex items-center justify-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium text-sm">Angažman potvrđen — posao je tvoj!</span>
          </div>
        ) : appStatus === 'declined' ? (
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <XCircle className="w-5 h-5" />
            <span className="text-sm">Odustao/la si od ovog angažmana</span>
          </div>
        ) : appStatus === 'rejected' ? (
          <div className="flex items-center justify-center gap-2 text-red-500">
            <XCircle className="w-5 h-5" />
            <span className="text-sm">Izabran je drugi kandidat</span>
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
    if (!message.trim()) {
      setApplyError('Napiši nekoliko reči uz prijavu — vlasnik oglasa treba da zna zašto se javljaš.')
      return
    }
    setApplyError('')
    setApplying(true)
    const { error } = await supabase.from('applications').insert({
      listing_id: listingId,
      applicant_id: currentUserId,
      message: message.trim(),
      status: 'pending',
    })

    if (!error) {
      // Auto-create conversation between applicant and listing owner
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .or(
          `and(participant_1_id.eq.${currentUserId},participant_2_id.eq.${listingUserId}),and(participant_1_id.eq.${listingUserId},participant_2_id.eq.${currentUserId})`
        )
        .single()

      if (!existingConv) {
        await supabase.from('conversations').insert({
          participant_1_id: currentUserId,
          participant_2_id: listingUserId,
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
            onChange={(e) => { setMessage(e.target.value); if (applyError) setApplyError('') }}
            rows={3}
            className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${applyError ? 'border-red-300' : 'border-gray-200'}`}
            placeholder="Napiši nešto o sebi, iskustvu ili zašto si pravi izbor — obavezno uz prijavu..."
          />
          {applyError && <p className="text-xs text-red-500">{applyError}</p>}
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
