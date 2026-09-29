'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SupportTicketForm({ userId, reviewId, listingId }: {
  userId: string
  reviewId?: string
  listingId?: string
}) {
  const [title, setTitle] = useState(reviewId ? 'Žalba na ocenu' : '')
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState('')
  const router = useRouter()

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setFeedback('')
    if (title.trim().length < 5 || body.trim().length < 15) {
      setFeedback('Napiši naslov i opis od najmanje 15 znakova.')
      return
    }
    setBusy(true)
    const supabase = createClient()
    const { error } = await supabase.from('support_tickets').insert({
      reporter_id: userId,
      review_id: reviewId || null,
      listing_id: listingId || null,
      title: title.trim(),
      body: body.trim(),
    })
    if (error) setFeedback('Žalba nije poslata. Proveri polja i pokušaj ponovo.')
    else {
      setTitle('')
      setBody('')
      setFeedback('Žalba je poslata. Možeš pratiti status ispod.')
      router.refresh()
    }
    setBusy(false)
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-xl border border-gray-100 p-6 space-y-3">
      <h2 className="font-semibold text-gray-900">Nova žalba</h2>
      <label className="block text-sm text-gray-700">Naslov
        <input value={title} onChange={e => setTitle(e.target.value)} maxLength={120} required
          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2" />
      </label>
      <label className="block text-sm text-gray-700">Šta se dogodilo?
        <textarea value={body} onChange={e => setBody(e.target.value)} maxLength={5000} rows={5} required
          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2" />
      </label>
      <p className="text-xs text-gray-500">Admin pregleda žalbu i može skloniti neprimerenu ocenu. Ocena se ne uklanja automatski.</p>
      {feedback && <p role="status" className="text-sm text-blue-700">{feedback}</p>}
      <button disabled={busy} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
        {busy ? 'Šaljem...' : 'Pošalji žalbu'}
      </button>
    </form>
  )
}
