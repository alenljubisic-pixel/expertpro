'use client'

import { useEffect, useState } from 'react'
import { BellRing } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type PushState = 'checking' | 'unavailable' | 'needs_install' | 'blocked' | 'disabled' | 'enabled'

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
}

function toUint8Array(base64Url: string) {
  const padded = base64Url.padEnd(Math.ceil(base64Url.length / 4) * 4, '=')
  const binary = atob(padded.replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(binary, char => char.charCodeAt(0))
}

export default function PushPermissionCard({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<PushState>('checking')
  const [busy, setBusy] = useState(false)
  const [testing, setTesting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    const check = async () => {
      if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !isStandalone()) {
        if (active) setState('needs_install')
        return
      }
      if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
        if (active) setState('unavailable')
        return
      }
      if (Notification.permission === 'denied') {
        if (active) setState('blocked')
        return
      }
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        const subscription = await registration.pushManager.getSubscription()
        if (!active) return
        if (!subscription || Notification.permission !== 'granted') {
          setState('disabled')
          return
        }
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || !active) return
        const { data } = await supabase.from('push_subscriptions').select('id')
          .eq('user_id', user.id).eq('endpoint', subscription.endpoint).maybeSingle()
        if (active) setState(data ? 'enabled' : 'disabled')
      } catch {
        if (active) setState('unavailable')
      }
    }
    check()
    return () => { active = false }
  }, [])

  const enable = async () => {
    setBusy(true)
    setMessage('')
    try {
      // The permission request must happen directly after the user's tap,
      // especially in an iPhone Home Screen web app.
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setState(permission === 'denied' ? 'blocked' : 'disabled')
        setMessage('Bez dozvole telefona push obaveštenja nisu moguća.')
        return
      }
      const config = await fetch('/api/push/subscription', { cache: 'no-store' })
      const { publicKey } = await config.json()
      if (!publicKey) throw new Error('Push trenutno nije podešen na serveru.')
      const registration = await navigator.serviceWorker.register('/sw.js')
      let subscription = await registration.pushManager.getSubscription()
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: toUint8Array(publicKey),
        })
      }
      const save = (value: PushSubscription) => fetch('/api/push/subscription', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(value.toJSON()),
      })
      let result = await save(subscription)
      if (result.status === 409) {
        // A previous account may have used this browser. Its old endpoint
        // cannot be reassigned, so ask the browser for a fresh subscription.
        await subscription.unsubscribe()
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: toUint8Array(publicKey),
        })
        result = await save(subscription)
      }
      if (!result.ok) throw new Error('Nije sačuvana prijava ovog uređaja za obaveštenja.')
      setState('enabled')
      setMessage('Push obaveštenja su uključena na ovom uređaju.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Uključivanje nije uspelo. Pokušaj ponovo.')
    } finally { setBusy(false) }
  }

  const disable = async () => {
    setBusy(true)
    setMessage('')
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        const response = await fetch('/api/push/subscription', {
          method: 'DELETE', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        })
        if (!response.ok) throw new Error('Isključivanje nije uspelo. Pokušaj ponovo.')
        await subscription.unsubscribe()
      }
      setState('disabled')
      setMessage('Push je isključen na ovom uređaju. Obaveštenja u nalogu ostaju.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Isključivanje nije uspelo.')
    } finally { setBusy(false) }
  }

  const testPush = async () => {
    setTesting(true)
    setMessage('')
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (!subscription) throw new Error('Ovaj uređaj više nije prijavljen. Uključi push ponovo.')
      const response = await fetch('/api/push/test', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      })
      if (response.status === 429) throw new Error('Probni push možeš poslati jednom u minutu.')
      if (!response.ok) throw new Error('Probni push nije poslat. Pokušaj ponovo kasnije.')
      setMessage('Probno obaveštenje je poslato. Proveri obaveštenja telefona.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Proba nije uspela.')
    } finally { setTesting(false) }
  }

  if (state === 'checking' || (compact && state === 'enabled')) return null
  return (
    <section className="rounded-xl border border-blue-100 bg-blue-50 p-4" aria-label="Push obaveštenja">
      <div className="flex items-start gap-3">
        <BellRing className="h-5 w-5 shrink-0 text-blue-700" />
        <div>
          <p className="font-semibold text-blue-950">Obaveštenja na telefonu</p>
          {state === 'needs_install' ? (
            <p className="mt-1 text-sm text-blue-800">Na iPhone-u prvo u Safari-ju izaberi Deli → Dodaj na početni ekran, zatim otvori ExpertPro preko ikonice i ovde uključi obaveštenja.</p>
          ) : state === 'unavailable' ? (
            <p className="mt-1 text-sm text-blue-800">Ovaj preglednik ne podržava push. Obaveštenja i dalje vidiš u svom nalogu i putem emaila.</p>
          ) : state === 'blocked' ? (
            <p className="mt-1 text-sm text-blue-800">Dozvola je blokirana. U podešavanjima telefona/preglednika dozvoli obaveštenja za ExpertPro.</p>
          ) : (
            <p className="mt-1 text-sm text-blue-800">{state === 'enabled'
              ? 'Uključena su na ovom uređaju, i kada je aplikacija zatvorena.'
              : 'Uključi push za prijave, poruke, potvrđene uplate i druge važne promene. Telefon će tražiti tvoju dozvolu.'}</p>
          )}
          {(state === 'enabled' || state === 'disabled') && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" disabled={busy || testing} onClick={state === 'enabled' ? disable : enable}
                className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-medium text-white disabled:opacity-60">
                {busy ? 'Sačekaj...' : state === 'enabled' ? 'Isključi na ovom uređaju' : 'Uključi push obaveštenja'}
              </button>
              {state === 'enabled' && <button type="button" disabled={testing || busy} onClick={testPush}
                className="rounded-lg border border-blue-300 px-3 py-2 text-sm font-medium text-blue-800 disabled:opacity-60">
                {testing ? 'Šaljem...' : 'Pošalji probno obaveštenje'}
              </button>}
            </div>
          )}
          {message && <p role="status" className="mt-2 text-xs text-blue-900">{message}</p>}
        </div>
      </div>
    </section>
  )
}
