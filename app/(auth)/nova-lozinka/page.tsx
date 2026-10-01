'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function NewPasswordPage() {
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    void supabase.auth.getUser().then(({ data }) => setReady(Boolean(data.user)))
  }, [])

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (password.length < 8) return setError('Lozinka mora imati najmanje 8 karaktera.')
    if (password !== confirmation) return setError('Lozinke se ne poklapaju.')
    setPending(true)
    setError('')
    const { error: updateError } = await createClient().auth.updateUser({ password })
    setPending(false)
    if (updateError) setError('Promena nije uspela. Zatraži novi link i pokušaj ponovo.')
    else setDone(true)
  }

  return <main className="min-h-screen bg-gray-50 px-4 py-16">
    <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold">Nova lozinka</h1>
      {done ? <p role="status" className="mt-6 rounded-lg bg-green-50 p-4 text-green-800">Lozinka je promenjena. <Link href="/dashboard" className="underline">Otvori nalog</Link>.</p>
        : !ready ? <p className="mt-6 text-sm text-gray-600">Ako si otvorio važeći link iz mejla, sačekaj trenutak. U suprotnom <Link href="/zaboravljena-lozinka" className="text-blue-600 underline">zatraži novi link</Link>.</p>
          : <form onSubmit={submit} className="mt-6 space-y-4">
            <label htmlFor="new-password" className="block text-sm font-medium">Nova lozinka</label>
            <input id="new-password" type="password" required minLength={8} autoComplete="new-password" value={password}
              onChange={event => setPassword(event.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-3" />
            <label htmlFor="confirm-password" className="block text-sm font-medium">Ponovi novu lozinku</label>
            <input id="confirm-password" type="password" required minLength={8} autoComplete="new-password" value={confirmation}
              onChange={event => setConfirmation(event.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-3" />
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <button type="submit" disabled={pending} className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white disabled:opacity-50">
              {pending ? 'Čuvam…' : 'Sačuvaj novu lozinku'}
            </button>
          </form>}
    </div>
  </main>
}
