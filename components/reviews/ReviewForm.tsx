'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Star, Loader2 } from 'lucide-react'

interface Props {
  revieweeId: string
  listingId: string
}

export default function ReviewForm({ revieweeId, listingId }: Props) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const submit = async () => {
    if (rating < 1) {
      setError('Izaberi ocenu od 1 do 5 zvezdica.')
      return
    }
    setSubmitting(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Moraš biti prijavljen/a.')
      setSubmitting(false)
      return
    }

    const { error: insertError } = await supabase.from('reviews').insert({
      reviewer_id: user.id,
      reviewee_id: revieweeId,
      listing_id: listingId,
      rating,
      comment: comment.trim() || null,
    })

    setSubmitting(false)

    if (insertError) {
      if (insertError.message?.includes('obostrano')) {
        setError('Ocena je moguća tek kada obe strane potvrde završetak posla.')
      } else if (insertError.code === '23505') {
        setError('Već si ocenio/la saradnju na ovom poslu.')
      } else {
        setError('Došlo je do greške, pokušaj ponovo.')
      }
      return
    }

    setDone(true)
    router.refresh()
  }

  if (done) {
    return (
      <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl p-4">
        Hvala na oceni! 🎉
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h3 className="font-semibold text-gray-900 mb-3 text-sm">Oceni saradnju na ovom poslu</h3>

      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHoverRating(n)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-0.5"
          >
            <Star
              className={`w-6 h-6 ${
                n <= (hoverRating || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'
              }`}
            />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Opciono: napiši kratak komentar o iskustvu..."
        rows={3}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg mb-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}

      <button
        onClick={submit}
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
        Pošalji ocenu
      </button>
    </div>
  )
}
