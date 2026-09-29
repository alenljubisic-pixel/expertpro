'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminComplaintActions({ ticketId, reviewId, reviewHidden, currentStatus, currentNote }: {
  ticketId: string
  reviewId?: string | null
  reviewHidden?: boolean
  currentStatus: string
  currentNote?: string | null
}) {
  const [status, setStatus] = useState(currentStatus)
  const [note, setNote] = useState(currentNote || '')
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState('')
  const router = useRouter()

  const save = async () => {
    setBusy(true)
    const { error } = await createClient().rpc('admin_update_ticket', {
      p_ticket_id: ticketId, p_status: status, p_note: note,
    })
    setFeedback(error ? 'Status nije sačuvan.' : 'Status je sačuvan.')
    if (!error) router.refresh()
    setBusy(false)
  }

  const hideReview = async () => {
    if (!reviewId || note.trim().length < 10) {
      setFeedback('Za uklanjanje ocene napiši razlog od najmanje 10 znakova.')
      return
    }
    setBusy(true)
    const { error } = await createClient().rpc('admin_hide_review', {
      p_review_id: reviewId, p_reason: note.trim(),
    })
    setFeedback(error ? 'Ocena nije uklonjena.' : 'Ocena je sklonjena; prosek je ponovo izračunat.')
    if (!error) router.refresh()
    setBusy(false)
  }

  return (
    <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
      <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} maxLength={2000}
        placeholder="Odgovor korisniku / razlog uklanjanja ocene"
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
      <div className="flex flex-wrap gap-2 items-center">
        <select value={status} onChange={e => setStatus(e.target.value)} className="rounded-lg border border-gray-200 px-2 py-2 text-sm">
          <option value="open">Otvoreno</option>
          <option value="in_review">U obradi</option>
          <option value="resolved">Rešeno</option>
          <option value="rejected">Odbijeno</option>
        </select>
        <button type="button" onClick={save} disabled={busy} className="rounded-lg bg-blue-600 text-white px-3 py-2 text-sm disabled:opacity-50">Sačuvaj tiket</button>
        {reviewId && !reviewHidden && (
          <button type="button" onClick={hideReview} disabled={busy}
            className="rounded-lg bg-red-600 text-white px-3 py-2 text-sm disabled:opacity-50">Skloni ocenu</button>
        )}
      </div>
      {feedback && <p role="status" className="text-sm text-blue-700">{feedback}</p>}
    </div>
  )
}
