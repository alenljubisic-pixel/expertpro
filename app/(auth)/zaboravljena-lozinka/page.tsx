'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setPending(true)
    setError('')
    const supabase = createClient()
    const { error: requestError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/nova-lozinka`,
    })
    setPending(false)
    if (requestError) setError('Slanje nije uspelo. Pokušaj ponovo kasnije.')
    else setDone(true)
  }

  return <main className="min-h-screen bg-gray-50 px-4 py-16">
    <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-sm">
      <Link href="/login" className="text-sm text-blue-600">← Nazad na prijavu</Link>
      <h1 className="mt-6 text-2xl font-bold">Zaboravljena lozinka</h1>
      <p className="mt-2 text-sm text-gray-600">Poslaćemo link za novu lozinku na tvoju e-mail adresu.</p>
      {done ? <p role="status" className="mt-6 rounded-lg bg-green-50 p-4 text-green-800">Ako nalog postoji, poslat je link za promenu lozinke. Proveri i spam folder.</p>
        : <form onSubmit={submit} className="mt-6 space-y-4">
          <label htmlFor="recovery-email" className="block text-sm font-medium">E-mail</label>
          <input id="recovery-email" type="email" required autoComplete="email" value={email}
            onChange={event => setEmail(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-3" />
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={pending} className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white disabled:opacity-50">
            {pending ? 'Šaljem…' : 'Pošalji link'}
          </button>
        </form>}
    </div>
  </main>
}
