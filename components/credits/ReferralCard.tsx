'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Gift, Share2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Stats = { pending_count: number; rewarded_count: number; earned_credits: number }
const STORAGE_KEY = 'expertpro_referral_code'

export default function ReferralCard({ code, stats }: { code: string | null; stats: Stats }) {
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const pendingCode = window.localStorage.getItem(STORAGE_KEY)
    if (!pendingCode) return
    window.localStorage.removeItem(STORAGE_KEY)
    const supabase = createClient()
    void supabase.rpc('claim_referral', { p_code: pendingCode }).then(({ data, error }) => {
      if (error) console.error('Referral attribution failed:', error.message)
      if (data) router.refresh()
    })
  }, [router])

  const link = code ? `https://www.expertpro.app/register?ref=${encodeURIComponent(code)}` : ''

  const copy = async () => {
    if (!link) return
    await navigator.clipboard.writeText(link)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2500)
  }

  const share = async () => {
    if (!link) return
    if (navigator.share) {
      try { await navigator.share({ title: 'ExpertPro', text: 'Pridruži se ExpertPro platformi.', url: link }) }
      catch { /* Korisnik je zatvorio meni za deljenje. */ }
    } else await copy()
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5">
      <div className="flex items-center gap-2 text-amber-900"><Gift className="h-5 w-5" /><h2 className="font-semibold">Nagrade · pozovi novog člana</h2></div>
      <p className="mt-2 text-sm text-gray-700">Zaradi <strong>2 kredita</strong> kada pozvani potvrdi email i objavi potpun oglas (opis najmanje 80 znakova) koji ostane aktivan 24 sata. Nagrada se obračunava jednom dnevno.</p>
      <p className="mt-1 text-xs text-gray-500">Pozvani već dobija 2 početna kredita. Najviše 5 nagrađenih preporuka po nalogu; lažni i neaktivni oglasi se ne računaju.</p>
      {code && <>
        <div className="mt-4 break-all rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs text-gray-700">{link}</div>
        <div className="mt-3 flex gap-2">
          <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700"><Copy className="h-3.5 w-3.5" />{copied ? 'Kopirano' : 'Kopiraj link'}</button>
          <button type="button" onClick={share} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100"><Share2 className="h-3.5 w-3.5" />Podeli</button>
        </div>
        <p className="mt-3 text-xs text-gray-600">Tvoj kod: <span className="font-mono font-semibold">{code}</span></p>
      </>}
      <p className="mt-3 border-t border-amber-200 pt-3 text-xs text-gray-600">Na čekanju: {stats.pending_count} · Nagrađeno: {stats.rewarded_count}/5 · Zarađeno: {stats.earned_credits} kredita</p>
    </div>
  )
}
