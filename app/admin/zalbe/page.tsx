import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import AdminComplaintActions from '@/components/support/AdminComplaintActions'

export default async function AdminComplaintsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) redirect('/dashboard')

  const { data: tickets } = await supabase.from('support_tickets')
    .select('id, title, body, status, admin_note, created_at, review_id, listing_id, reporter:profiles!reporter_id(name), review:reviews!review_id(id, rating, comment, moderated_at)')
    .order('created_at', { ascending: false }).limit(100)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Žalbe korisnika</h1>
          <Link href="/admin" className="text-sm text-blue-600">← Admin panel</Link>
        </div>
        {!tickets?.length ? <p className="rounded-xl bg-white p-8 text-gray-500">Nema žalbi.</p> : (
          <div className="space-y-4">
            {tickets.map(ticket => {
              const reporter = ticket.reporter as any
              const review = ticket.review as any
              return (
                <article key={ticket.id} className="rounded-xl bg-white border border-gray-100 p-5">
                  <div className="flex justify-between gap-3">
                    <h2 className="font-semibold">{ticket.title}</h2>
                    <span className="text-xs text-gray-500">{ticket.status}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{reporter?.name || 'Korisnik'} · {new Date(ticket.created_at).toLocaleString('sr-RS')}</p>
                  <p className="text-sm text-gray-700 whitespace-pre-line mt-3">{ticket.body}</p>
                  {ticket.listing_id && <Link href={`/oglasi/${ticket.listing_id}`} className="block text-sm text-blue-600 mt-2">Pogledaj oglas</Link>}
                  {review && <p className="text-sm text-gray-700 mt-2 rounded-lg bg-gray-50 p-3">Ocena: {review.rating}/5 — {review.comment || 'Bez komentara'} {review.moderated_at ? '(sklonjena)' : ''}</p>}
                  {ticket.admin_note && <p className="text-sm text-gray-500 mt-2">Prethodni odgovor: {ticket.admin_note}</p>}
                  <AdminComplaintActions ticketId={ticket.id} reviewId={ticket.review_id}
                    reviewHidden={!!review?.moderated_at} currentStatus={ticket.status} currentNote={ticket.admin_note} />
                </article>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
