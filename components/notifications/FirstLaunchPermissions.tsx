'use client'

import { useState, useSyncExternalStore } from 'react'
import { MapPin, X } from 'lucide-react'
import PushPermissionCard from '@/components/notifications/PushPermissionCard'
import { getNearestCity } from '@/lib/city-distance'

const SETUP_DISMISSED_KEY = 'ep_device_setup_dismissed'

function subscribeToStorage(callback: () => void) {
  window.addEventListener('storage', callback)
  return () => window.removeEventListener('storage', callback)
}

function isFirstVisit() {
  return localStorage.getItem(SETUP_DISMISSED_KEY) !== '1'
}

export default function FirstLaunchPermissions() {
  const firstVisit = useSyncExternalStore(subscribeToStorage, isFirstVisit, () => false)
  const [dismissed, setDismissed] = useState(false)
  const [locating, setLocating] = useState(false)
  const [locationMessage, setLocationMessage] = useState('')
  const visible = firstVisit && !dismissed

  const dismiss = () => {
    localStorage.setItem(SETUP_DISMISSED_KEY, '1')
    setDismissed(true)
  }

  const enableLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Ovaj uređaj ne podržava lokaciju. Grad možeš izabrati ručno u pretrazi.')
      return
    }
    setLocating(true)
    setLocationMessage('Tražim najbliži grad…')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const city = getNearestCity(coords.latitude, coords.longitude)
        localStorage.setItem('ep_auto_city', '1')
        setLocationMessage(`Najbliži grad: ${city}. Predlagaću ga u pretrazi na ovom uređaju.`)
        setLocating(false)
      },
      () => {
        setLocationMessage('Lokacija nije odobrena ili nije dostupna. Grad možeš izabrati ručno.')
        setLocating(false)
      },
      { timeout: 8000, maximumAge: 300000 }
    )
  }

  if (!visible) return <div className="mb-6"><PushPermissionCard compact /></div>

  return (
    <section className="mb-6 rounded-xl border border-blue-200 bg-white p-4 shadow-sm" aria-labelledby="device-setup-title">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 id="device-setup-title" className="font-semibold text-gray-900">Podesi ExpertPro na ovom telefonu</h2>
          <p className="mt-1 text-sm text-gray-600">
            Uključi obaveštenja za prijave i poruke, pa po želji dozvoli lokaciju za predlog najbližeg grada. Telefon će te pitati za svaku dozvolu posebno.
          </p>
        </div>
        <button type="button" onClick={dismiss} aria-label="Zatvori podešavanje" className="shrink-0 rounded-lg p-1 text-gray-500 hover:bg-gray-100">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-3">
        <PushPermissionCard />
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
            <div>
              <p className="font-semibold text-gray-900">Najbliži grad</p>
              <p className="mt-1 text-sm text-gray-600">Koristimo lokaciju samo za predlog grada u pretrazi, ne za praćenje u pozadini.</p>
              <button type="button" onClick={enableLocation} disabled={locating}
                className="mt-3 rounded-lg bg-blue-700 px-3 py-2 text-sm font-medium text-white disabled:opacity-60">
                {locating ? 'Tražim grad…' : 'Dozvoli lokaciju i predloži grad'}
              </button>
              {locationMessage && <p role="status" className="mt-2 text-xs text-gray-700">{locationMessage}</p>}
            </div>
          </div>
        </div>
      </div>
      <button type="button" onClick={dismiss} className="mt-4 text-sm font-medium text-blue-700 hover:underline">
        Gotovo / podesi kasnije
      </button>
    </section>
  )
}
