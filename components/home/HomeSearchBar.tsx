'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Loader2, Navigation } from 'lucide-react'
import { CITY_COORDS, getNearestCity } from '@/lib/city-distance'

export default function HomeSearchBar() {
  const [query, setQuery] = useState('')
  const [city, setCity] = useState('')
  const [detecting, setDetecting] = useState(false)
  const [locationError, setLocationError] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (city) params.set('city', city)
    router.push(`/oglasi?${params.toString()}`)
  }

  const handleOkoMene = () => {
    if (!navigator.geolocation) {
      setLocationError('Uređaj ne podržava lokaciju. Izaberi grad ručno.')
      return
    }
    setLocationError('')
    setDetecting(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nearest = getNearestCity(pos.coords.latitude, pos.coords.longitude)
        setCity(nearest)
        setDetecting(false)
      },
      () => {
        setDetecting(false)
        setLocationError('Lokacija nije dostupna. Izaberi grad ručno.')
      },
      { timeout: 8000, maximumAge: 300000 }
    )
  }

  return (
    <form onSubmit={handleSearch} className="bg-white rounded-2xl p-2 shadow-xl max-w-2xl mx-auto flex gap-2 flex-wrap">
      <div className="flex-1 flex items-center gap-2 px-4">
        <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
        <input
          type="text"
          aria-label="Usluga ili posao koji tražiš"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Šta tražiš? (spremačica, vodoinstalater...)"
          className="flex-1 text-gray-700 outline-none text-sm min-w-0"
        />
      </div>
      <div className="flex items-center gap-1 px-3 border-l border-gray-200">
        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <select
          aria-label="Izaberi grad"
          value={city}
          onChange={e => setCity(e.target.value)}
          className="text-gray-700 outline-none text-sm bg-transparent max-w-[100px]"
        >
          <option value="">Svi gradovi</option>
          {Object.keys(CITY_COORDS).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button
          type="button"
          onClick={handleOkoMene}
          title="Detektuj moj grad"
          aria-label="Predloži najbliži grad prema lokaciji"
          disabled={detecting}
          className="ml-1 p-1 text-blue-500 hover:text-blue-700 transition-colors flex-shrink-0"
        >
          {detecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
        </button>
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-5 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors whitespace-nowrap text-sm flex-shrink-0"
      >
        Pretraži
      </button>
      {locationError && <p role="status" className="w-full px-3 text-xs text-red-600">{locationError}</p>}
    </form>
  )
}
