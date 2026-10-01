'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Category = 'applications' | 'messages' | 'jobs' | 'listings' | 'opportunities'
type Preference = { category: Category; in_app: boolean; email: boolean }
type EmailFrequency = 'two_hours' | 'daily' | 'off'

const categories: { id: Category; title: string; description: string }[] = [
  { id: 'applications', title: 'Prijave i izbor kandidata', description: 'Nove prijave, prihvatanje i odbijanje.' },
  { id: 'messages', title: 'Poruke', description: 'Nove poruke tokom dodeljenog posla.' },
  { id: 'jobs', title: 'Posao i ocene', description: 'Završetak posla, podsetnici i ocene.' },
  { id: 'listings', title: 'Moji oglasi', description: 'Istek, neaktivnost i pauziranje oglasa.' },
  { id: 'opportunities', title: 'Novi hitni poslovi', description: 'Hitni oglasi u tvojoj blizini.' },
]
const emailActive = new Set<Category>(['applications', 'messages', 'jobs'])

const defaults = (): Preference[] => categories.map(({ id }) => ({ category: id, in_app: true, email: true }))

export default function NotificationPreferences() {
  const [rows, setRows] = useState<Preference[]>(defaults)
  const [frequency, setFrequency] = useState<EmailFrequency>('two_hours')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    let active = true
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [preferences, digestSettings] = await Promise.all([
        supabase.from('notification_preferences')
          .select('category,in_app,email').eq('user_id', user.id),
        supabase.from('email_digest_settings')
          .select('frequency').eq('user_id', user.id).maybeSingle(),
      ])
      if (!active) return
      if (preferences.error || digestSettings.error) {
        setFeedback('Podešavanja trenutno nisu dostupna. Pokušaj ponovo kasnije.')
      } else {
        setRows(defaults().map(row => ({ ...row, ...preferences.data?.find(item => item.category === row.category) })))
        if (digestSettings.data?.frequency) setFrequency(digestSettings.data.frequency as EmailFrequency)
      }
      setLoading(false)
    }
    load()
    return () => { active = false }
  }, [])

  const change = (category: Category, field: 'in_app' | 'email', checked: boolean) => {
    setRows(current => current.map(row => row.category === category ? { ...row, [field]: checked } : row))
    setFeedback('')
  }

  const save = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setFeedback('Prijavi se ponovo da sačuvaš podešavanja.'); return }
    setSaving(true)
    setFeedback('')
    const [preferences, digestSettings] = await Promise.all([
      supabase.from('notification_preferences').upsert(
        rows.map(row => ({ ...row, user_id: user.id, updated_at: new Date().toISOString() })),
        { onConflict: 'user_id,category' }
      ),
      supabase.from('email_digest_settings').upsert(
        { user_id: user.id, frequency, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      ),
    ])
    setFeedback(preferences.error || digestSettings.error
      ? 'Čuvanje nije uspelo. Pokušaj ponovo.' : 'Podešavanja su sačuvana.')
    setSaving(false)
  }

  return (
    <section className="bg-white rounded-xl border border-gray-100 p-6" aria-labelledby="notification-preferences-title">
      <h2 id="notification-preferences-title" className="font-semibold text-gray-900">Obaveštenja</h2>
      <p className="text-xs text-gray-500 mt-1 mb-4">Izaberi šta želiš da dobijaš. Potvrde e-mail adrese i bezbednosne poruke ne mogu da se isključe ovim izborom.</p>
      <p className="text-xs text-blue-700 bg-blue-50 rounded-lg px-3 py-2 mb-4">E-mail za prijave, poruke i posao stiže u jednom sažetku. Izaberi učestalost i isključi kategoriju koja ti smeta. Obaveštenja u aplikaciji podešavaš zasebno; za oglase i hitne prilike e-mail još nije aktivan.</p>
      <label className="block text-sm font-medium text-gray-900 mb-4">
        Učestalost email sažetka
        <select value={frequency} disabled={loading || saving} onChange={event => setFrequency(event.target.value as EmailFrequency)} className="block mt-1 w-full max-w-xs rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
          <option value="two_hours">Najviše jednom u 2 sata</option>
          <option value="daily">Najviše jednom dnevno</option>
          <option value="off">Ne šalji email sažetke</option>
        </select>
      </label>
      <div className="grid grid-cols-[minmax(0,1fr)_4rem_4rem] sm:grid-cols-[minmax(0,1fr)_6rem_6rem] gap-x-2 items-center text-xs text-gray-500 border-b border-gray-100 pb-2">
        <span>Vrsta obaveštenja</span><span className="text-center">U aplikaciji</span><span className="text-center">E-mail</span>
      </div>
      {categories.map(item => {
        const row = rows.find(value => value.category === item.id)!
        return (
          <div key={item.id} className="grid grid-cols-[minmax(0,1fr)_4rem_4rem] sm:grid-cols-[minmax(0,1fr)_6rem_6rem] gap-x-2 items-center py-3 border-b border-gray-100 last:border-0">
            <div><p className="text-sm font-medium text-gray-900">{item.title}</p><p className="text-xs text-gray-500">{item.description}</p></div>
            <label className="flex justify-center"><input type="checkbox" checked={row.in_app} disabled={loading || saving} onChange={event => change(item.id, 'in_app', event.target.checked)} aria-label={`${item.title} u aplikaciji`} /></label>
            <label className="flex justify-center"><input type="checkbox" checked={emailActive.has(item.id) && row.email} disabled={loading || saving || frequency === 'off' || !emailActive.has(item.id)} onChange={event => change(item.id, 'email', event.target.checked)} aria-label={`${item.title} e-mailom`} /></label>
          </div>
        )
      })}
      <div className="flex flex-wrap items-center gap-3 mt-4">
        <button type="button" onClick={save} disabled={loading || saving || !!feedback && feedback.startsWith('Podešavanja trenutno')} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {saving ? 'Čuvam...' : 'Sačuvaj obaveštenja'}
        </button>
        {feedback && <p role="status" className={`text-sm ${feedback.includes('sačuvana') ? 'text-green-700' : 'text-red-700'}`}>{feedback}</p>}
      </div>
    </section>
  )
}
