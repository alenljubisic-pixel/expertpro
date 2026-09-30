'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  listingId: string
  currentUserId: string | null
  initiallySaved: boolean
  variant?: 'card' | 'detail'
}

export default function SaveButton({ listingId, currentUserId, initiallySaved, variant = 'card' }: Props) {
  const [saved, setSaved] = useState(initiallySaved)
  const [busy, setBusy] = useState(false)
  const supabase = createClient()

  if (!currentUserId) return null

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (busy) return
    setBusy(true)
    const next = !saved
    setSaved(next) // optimistic
    const { error } = next
      ? await supabase.from('saved_listings').insert({ user_id: currentUserId, listing_id: listingId })
      : await supabase.from('saved_listings').delete().eq('user_id', currentUserId).eq('listing_id', listingId)
    if (error) setSaved(!next) // revert on failure
    setBusy(false)
  }

  if (variant === 'detail') {
    return (
      <button
        onClick={toggle}
        disabled={busy}
        title={saved ? 'Ukloni iz sačuvanih' : 'Sačuvaj oglas'}
        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap ${
          saved
            ? 'border-pink-200 bg-pink-50 text-pink-600 hover:bg-pink-100'
            : 'border-gray-200 text-gray-500 hover:bg-gray-50'
        }`}
      >
        <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-pink-500 text-pink-500' : ''}`} />
        {saved ? 'Sačuvano' : 'Sačuvaj'}
      </button>
    )
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      title={saved ? 'Ukloni iz sačuvanih' : 'Sačuvaj oglas'}
      aria-label={saved ? 'Ukloni iz sačuvanih' : 'Sačuvaj oglas'}
      className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 border border-gray-100 shadow-sm hover:bg-white transition-colors"
    >
      <Heart className={`w-4 h-4 ${saved ? 'fill-pink-500 text-pink-500' : 'text-gray-400'}`} />
    </button>
  )
}
