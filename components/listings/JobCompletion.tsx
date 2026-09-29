'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ReviewForm from '@/components/reviews/ReviewForm'
import Link from 'next/link'

interface Props {
  applicationId: string
  listingId: string
  revieweeId: string
  isOwner: boolean
  ownerFinishedAt: string | null
  applicantFinishedAt: string | null
  completedAt: string | null
  hasReviewed: boolean
}

export default function JobCompletion(props: Props) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const myFinishedAt = props.isOwner ? props.ownerFinishedAt : props.applicantFinishedAt
  const otherFinishedAt = props.isOwner ? props.applicantFinishedAt : props.ownerFinishedAt

  const markFinished = async () => {
    setBusy(true)
    setError('')
    const supabase = createClient()
    const { error: rpcError } = await supabase.rpc('mark_job_finished', {
      p_application_id: props.applicationId,
    })
    if (rpcError) setError('Potvrda nije sačuvana. Pokušaj ponovo.')
    else router.refresh()
    setBusy(false)
  }

  return (
    <section className="mt-6 bg-white rounded-xl border border-gray-100 p-6">
      <h2 className="font-semibold text-gray-900 mb-2">Završetak posla</h2>
      {props.completedAt ? (
        <>
          <p className="text-sm text-green-700 mb-4">Obe strane su potvrdile da je posao završen.</p>
          {props.hasReviewed
            ? <p className="text-sm text-gray-500">Već si ocenio/la ovu saradnju.</p>
            : <ReviewForm revieweeId={props.revieweeId} listingId={props.listingId} />}
        </>
      ) : myFinishedAt ? (
        <p className="text-sm text-amber-700">Označio/la si posao kao završen. Čeka se potvrda druge strane; ocenjivanje tada postaje dostupno.</p>
      ) : (
        <>
          <p className="text-sm text-gray-600 mb-3">
            {otherFinishedAt
              ? 'Druga strana je označila posao kao završen. Potvrdi samo ako je zaista gotov.'
              : 'Kada posao bude stvarno završen, potvrdi ovde. Ocenjivanje se otvara kada to potvrde obe strane.'}
          </p>
          <button type="button" onClick={markFinished} disabled={busy}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">
            {busy ? 'Čuvam...' : 'Posao je završen'}
          </button>
        </>
      )}
      {error && <p role="alert" className="text-sm text-red-600 mt-2">{error}</p>}
      <Link href={`/podrska?listing=${props.listingId}`} className="block text-xs text-blue-600 mt-3">Problem ili spor? Pošalji žalbu</Link>
    </section>
  )
}
