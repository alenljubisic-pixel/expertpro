'use client'

import { useEffect, useState } from 'react'
import { Download, X, Share, PlusSquare } from 'lucide-react'

const DISMISS_KEY = 'ep_install_prompt_dismissed_at'
const DISMISS_DAYS = 14

function isDismissedRecently() {
  try {
    const raw = localStorage.getItem(DISMISS_KEY)
    if (!raw) return false
    const dismissedAt = Number(raw)
    if (Number.isNaN(dismissedAt)) return false
    const days = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24)
    return days < DISMISS_DAYS
  } catch {
    return false
  }
}

function markDismissed() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
  } catch {
    // ignore — no big deal if we ask again next time
  }
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [visible, setVisible] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Ne prikazuj ako je već instalirano kao PWA (standalone mode)
    const isStandalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    if (isStandalone) return
    if (isDismissedRecently()) return

    const ua = window.navigator.userAgent
    const iOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    if (iOS) {
      // iOS Safari nikad ne šalje beforeinstallprompt — pokaži uputstvo posle kratke pauze
      setIsIOS(true)
      const t = setTimeout(() => setVisible(true), 4000)
      return () => {
        clearTimeout(t)
        window.removeEventListener('beforeinstallprompt', handler)
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!visible) return null

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      await deferredPrompt.userChoice
      setDeferredPrompt(null)
    }
    setVisible(false)
    markDismissed()
  }

  const handleDismiss = () => {
    setVisible(false)
    markDismissed()
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 bg-white border border-gray-200 shadow-lg rounded-xl p-4 flex gap-3">
      <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
        <Download className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">Instaliraj ExpertPro</p>
        {isIOS ? (
          <p className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-1">
            Dodaj na početni ekran: dodirni <Share className="w-3.5 h-3.5 inline" /> (Deli) pa
            <PlusSquare className="w-3.5 h-3.5 inline" /> &quot;Dodaj na početni ekran&quot; — dobijaš trenutna obaveštenja o novim poslovima.
          </p>
        ) : (
          <p className="text-xs text-gray-500 mt-1">
            Dobijaš trenutna obaveštenja o novim porukama i hitnim poslovima, čak i kad sajt nije otvoren.
          </p>
        )}
        <div className="flex gap-2 mt-3">
          {!isIOS && (
            <button
              onClick={handleInstall}
              className="text-xs font-medium bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
            >
              Instaliraj
            </button>
          )}
          <button
            onClick={handleDismiss}
            className="text-xs font-medium text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100"
          >
            Kasnije
          </button>
        </div>
      </div>
      <button onClick={handleDismiss} className="text-gray-300 hover:text-gray-500 flex-shrink-0" title="Zatvori">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
