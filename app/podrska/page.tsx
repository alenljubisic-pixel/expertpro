import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import SupportTicketForm from '@/components/support/SupportTicketForm'

export default async function SupportPage({ searchParams }: {
  searchParams: Promise<{ review?: string; listing?: string }>
}) {
  const sp = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: tickets } = await supabase.from('support_tickets')
    .select('id, title, status, admin_note, created_at')
    .eq('reporter_id', user.id).order('created_at', { ascending: false }).limit(30)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Žalbe i podrška</h1>
          <p className="text-sm text-gray-600 mt-1">Prijavi spornu ocenu, problem sa poslom ili ponašanje korisnika.</p>
        </div>
        <SupportTicketForm userId={user.id} reviewId={sp.review} listingId={sp.listing} />
        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-3">Moje žalbe</h2>
          {!tickets?.length ? <p className="text-sm text-gray-500">Nema poslatih žalbi.</p> : (
            <div className="divide-y divide-gray-100">
              {tickets.map(ticket => (
                <div key={ticket.id} className="py-3 text-sm">
                  <div className="flex justify-between gap-3"><span className="font-medium">{ticket.title}</span><span className="text-gray-500">{ticket.status}</span></div>
                  <p className="text-xs text-gray-400">{new Date(ticket.created_at).toLocaleDateString('sr-RS')}</p>
                  {ticket.admin_note && <p className="text-gray-600 mt-1">Odgovor admina: {ticket.admin_note}</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
