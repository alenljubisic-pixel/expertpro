'use client'

import { useEffect, useState } from 'react'
import { Loader2, Navigation } from 'lucide-react'
import { getNearestCity } from '@/lib/city-distance'

export default function DetectCityButton({ selectId }: { selectId: string }) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (localStorage.getItem('ep_auto_city') !== '1' || !navigator.geolocation) return
    const select = document.getElementById(selectId) as HTMLSelectElement | null
    if (!select?.form || select.value) return
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        select.value = getNearestCity(coords.latitude, coords.longitude)
        select.form?.requestSubmit()
      },
      () => setMessage('Automatska lokacija nije dostupna. Izaberi grad ručno.'),
      { timeout: 8000, maximumAge: 300000 }
    )
  }, [selectId])

  const detect = () => {
    if (!navigator.geolocation) {
      setMessage('Uređaj ne podržava lokaciju. Izaberi grad ručno.')
      return
    }
    setMessage('')
    setBusy(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const select = document.getElementById(selectId) as HTMLSelectElement | null
        if (select?.form) {
          select.value = getNearestCity(coords.latitude, coords.longitude)
          localStorage.setItem('ep_auto_city', '1')
          select.form.requestSubmit()
        } else {
          setMessage('Izaberi grad ručno.')
        }
        setBusy(false)
      },
      () => {
        setBusy(false)
        setMessage('Lokacija nije dostupna. Izaberi grad ručno.')
      },
      { timeout: 8000, maximumAge: 300000 }
    )
  }

  return (
    <div>
      <button type="button" onClick={detect} disabled={busy}
        className="mt-2 flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline disabled:opacity-50">
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Navigation className="h-3.5 w-3.5" />}
        Predloži najbliži grad
      </button>
      {message && <p role="status" className="mt-1 text-xs text-red-600">{message}</p>}
    </div>
  )
}
