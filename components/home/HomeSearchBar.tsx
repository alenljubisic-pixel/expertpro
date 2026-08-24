'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Loader2, Navigation } from 'lucide-react'

const CITY_COORDS: Record<string, [number, number]> = {
  'Beograd': [44.8176, 20.4569],
  'Novi Sad': [45.2671, 19.8335],
  'Niš': [43.3209, 21.8954],
  'Kragujevac': [44.0128, 20.9114],
  'Subotica': [46.1000, 19.6667],
  'Zrenjanin': [45.3833, 20.3833],
  'Pančevo': [44.8704, 20.6407],
  'Čačak': [43.8914, 20.3497],
  'Novi Pazar': [43.1333, 20.5167],
  'Kruševac': [43.5797, 21.3281],
  'Leskovac': [42.9981, 21.9461],
  'Smederevo': [44.6636, 20.9278],
  'Valjevo': [44.2667, 19.8833],
  'Vranje': [42.5500, 21.9000],
  'Šabac': [44.7500, 19.7000],
  'Požarevac': [44.6100, 21.1900],
  'Zaječar': [43.9010, 22.2755],
  'Kikinda': [45.8304, 20.4677],
  'Sombor': [45.7744, 19.1122],
  'Pirot': [43.1538, 22.5862],
  'Jagodina': [43.9767, 21.2611],
  'Bor': [44.0784, 22.0988],
  'Vršac': [45.1167, 21.3000],
  'Sremska Mitrovica': [44.9667, 19.6167],
  'Prokuplje': [43.2333, 21.5833],
  'Užice': [43.8554, 19.8419],
  'Loznica': [44.5333, 19.2333],
}

function getNearestCity(lat: number, lon: number): string {
  let nearest = 'Beograd'
  let minDist = Infinity
  for (const [city, [cLat, cLon]] of Object.entries(CITY_COORDS)) {
    const d = Math.sqrt((lat - cLat) ** 2 + (lon - cLon) ** 2)
    if (d < minDist) { minDist = d; nearest = city }
  }
  return nearest
}

export default function HomeSearchBar() {
  const [query, setQuery] = useState('')
  const [city, setCity] = useState('')
  const [detecting, setDetecting] = useState(false)
  const router = useRouter()
  const cityRef = useRef<HTMLSelectElement>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (city) params.set('city', city)
    router.push(`/oglasi?${params.toString()}`)
  }

  const handleOkoMene = () => {
    if (!navigator.geolocation) return
    setDetecting(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nearest = getNearestCity(pos.coords.latitude, pos.coords.longitude)
        setCity(nearest)
        setDetecting(false)
      },
      () => {
        setDetecting(false)
      },
      { timeout: 8000 }
    )
  }

  return (
    <form onSubmit={handleSearch} className="bg-white rounded-2xl p-2 shadow-xl max-w-2xl mx-auto flex gap-2">
      <div className="flex-1 flex items-center gap-2 px-4">
        <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Šta tražiš? (spremačica, vodoinstalater...)"
          className="flex-1 text-gray-700 outline-none text-sm min-w-0"
        />
      </div>
      <div className="flex items-center gap-1 px-3 border-l border-gray-200">
        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <select
          ref={cityRef}
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
    </form>
  )
}
