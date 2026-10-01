'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { SERBIAN_CITIES } from '@/types'
import { AVAILABILITY_TIME_OPTIONS, AVAILABILITY_DAY_OPTIONS } from '@/lib/listing-availability'
import { ArrowLeft, AlertTriangle } from 'lucide-react'

type ListingType = 'offer' | 'request' | 'urgent'

const CATEGORIES = [
  { icon: '🏗️', name: 'Građevina', slug: 'gradevina', id: 1 },
  { icon: '🧹', name: 'Čišćenje', slug: 'ciscenje', id: 2 },
  { icon: '🚛', name: 'Transport', slug: 'transport', id: 3 },
  { icon: '🍽️', name: 'Ugostiteljstvo', slug: 'ugostiteljstvo', id: 4 },
  { icon: '👷', name: 'Pomoćni radnici', slug: 'pomocni-radnici', id: 5 },
  { icon: '📦', name: 'Magacin', slug: 'magacin', id: 6 },
  { icon: '👶', name: 'Čuvanje dece i ljubimaca', slug: 'cuvanje', id: 7 },
  { icon: '🏠', name: 'Nega i pomoć u kući', slug: 'nega-pomoc-u-kuci', id: 13 },
  { icon: '💻', name: 'IT i računari', slug: 'it', id: 8 },
  { icon: '🌾', name: 'Poljoprivreda', slug: 'poljoprivreda', id: 9 },
  { icon: '🎪', name: 'Događaji', slug: 'dogadjaji', id: 10 },
  { icon: '📋', name: 'Administracija', slug: 'administracija', id: 11 },
  { icon: '📌', name: 'Ostalo', slug: 'ostalo', id: 12 },
]

const TYPE_OPTIONS = [
  { value: 'offer' as ListingType, icon: '💼', label: 'Nudim uslugu', color: 'border-green-400 bg-green-50', activeColor: 'border-green-500 bg-green-50 ring-2 ring-green-200' },
  { value: 'request' as ListingType, icon: '🔍', label: 'Tražim radnika', color: 'border-blue-400 bg-blue-50', activeColor: 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' },
  { value: 'urgent' as ListingType, icon: '🚨', label: 'Hitno!', color: 'border-red-400 bg-red-50', activeColor: 'border-red-500 bg-red-50 ring-2 ring-red-200' },
]

export default function EditListingPage() {
  const params = useParams()
  const listingId = params?.id as string
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)

  const [type, setType] = useState<ListingType>('request')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [city, setCity] = useState('')
  const [locationDetail, setLocationDetail] = useState('')
  const [priceType, setPriceType] = useState<string>('negotiable')
  const [price, setPrice] = useState('')
  const [workersNeeded, setWorkersNeeded] = useState('1')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [availabilityTime, setAvailabilityTime] = useState('flexible')
  const [availabilityDays, setAvailabilityDays] = useState('flexible')

  useEffect(() => {
    if (!listingId) return
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/login'); return }
      const { data: listing } = await supabase.from('listings').select('*').eq('id', listingId).single()
      if (!listing || listing.user_id !== data.user.id) { setNotFound(true); setLoading(false); return }

      setType(listing.type)
      setTitle(listing.title || '')
      setDescription(listing.description || '')
      setCategoryId(listing.category_id)
      setCity(listing.city || '')
      setLocationDetail(listing.location_detail || '')
      setPriceType(listing.price_type || 'negotiable')
      setPrice(listing.price_amount ? String(listing.price_amount) : '')
      setWorkersNeeded(listing.workers_needed ? String(listing.workers_needed) : '1')
      setDateFrom(listing.available_from || '')
      setDateTo(listing.available_to || '')
      setAvailabilityTime(listing.availability_time || 'flexible')
      setAvailabilityDays(listing.availability_days || 'flexible')
      setLoading(false)
    })
  }, [listingId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) { setError('Naslov je obavezan.'); return }
    if (!city) { setError('Izaberi grad.'); return }
    if (!categoryId) { setError('Izaberi kategoriju.'); return }
    if (priceType !== 'negotiable' && (!price || Number(price) <= 0)) {
      setError('Unesi cenu veću od nule ili izaberi „Dogovor“.')
      return
    }

    setSaving(true)
    const selectedCategory = CATEGORIES.find(c => c.id === categoryId)

    const { error: updateError } = await supabase.from('listings').update({
      type,
      title: title.trim(),
      description: description.trim() || null,
      category_id: categoryId,
      category_slug: selectedCategory?.slug,
      city,
      location_detail: locationDetail || null,
      price_type: priceType !== 'negotiable' ? priceType : 'negotiable',
      price_amount: priceType !== 'negotiable' ? Number(price) : null,
      workers_needed: parseInt(workersNeeded) || 1,
      available_from: dateFrom || null,
      available_to: dateTo || null,
      availability_time: type === 'offer' ? availabilityTime : 'flexible',
      availability_days: type === 'offer' ? availabilityDays : 'flexible',
      updated_at: new Date().toISOString(),
    }).eq('id', listingId)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    router.push(`/oglasi/${listingId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Oglas ne postoji ili nemaš pravo da ga uređuješ.</p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex items-center gap-3 mb-6">
          <Link href={`/oglasi/${listingId}`} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Uredi oglas</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">Tip oglasa</label>
            <div className="grid grid-cols-3 gap-3">
              {TYPE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${type === opt.value ? opt.activeColor : 'border-gray-200 bg-white hover:border-gray-300'}`}
                >
                  <div className="text-2xl mb-1">{opt.icon}</div>
                  <p className="text-xs font-semibold text-gray-900">{opt.label}</p>
                </button>
              ))}
            </div>
            {type === 'urgent' && (
              <div className="mt-3 flex items-start gap-2 bg-red-50 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">Hitni oglas šalje push notifikaciju svim radnicima u izabranom gradu.</p>
              </div>
            )}
          </div>

          {type === 'offer' && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Kada je radnik slobodan?</h2>
              <p className="text-sm text-gray-500">Navedi stvarnu dostupnost za ovu ponudu. Ako se menja, ostavi „Po dogovoru“.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block text-sm font-medium text-gray-700">Doba dana
                  <select value={availabilityTime} onChange={e => setAvailabilityTime(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2.5 bg-white">
                    {AVAILABILITY_TIME_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
                <label className="block text-sm font-medium text-gray-700">Dani
                  <select value={availabilityDays} onChange={e => setAvailabilityDays(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2.5 bg-white">
                    {AVAILABILITY_DAY_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Detalji oglasa</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Naslov <span className="text-red-500">*</span></label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <p className="text-xs text-gray-400 mt-1 text-right">{title.length}/120</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Opis</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategorija <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {CATEGORIES.map(cat => (
                  <button key={cat.id} type="button" onClick={() => setCategoryId(cat.id)}
                    className={`p-2 rounded-lg border text-center text-xs transition-all ${categoryId === cat.id ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    <span className="text-lg block mb-0.5">{cat.icon}</span>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Lokacija</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grad <span className="text-red-500">*</span></label>
              <select value={city} onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Izaberi grad</option>
                {SERBIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Opština / Kvart (opcionalno)</label>
              <input type="text" value={locationDetail} onChange={(e) => setLocationDetail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">{type === 'offer' ? 'Moja cena usluge' : 'Cena i uslovi'}</h2>
            {type === 'offer' && <p className="text-sm text-gray-500">Ponudi satnicu, dnevnicu ili fiksnu cenu; ako zavisi od posla, izaberi „Dogovor“.</p>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tip plaćanja</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[{ value: 'hourly', label: 'Po satu' }, { value: 'daily', label: 'Po danu' }, { value: 'fixed', label: 'Fiksno' }, { value: 'negotiable', label: 'Dogovor' }].map(opt => (
                  <button key={opt.value} type="button" onClick={() => setPriceType(opt.value)}
                    className={`py-2.5 px-3 rounded-lg border text-xs font-medium transition-all ${priceType === opt.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            {priceType !== 'negotiable' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cena (RSD)</label>
                <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{type === 'offer' ? 'Dostupan od' : 'Početak rada'}</label>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{type === 'offer' ? 'Dostupan do' : 'Kraj posla'}</label>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            {type !== 'offer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Broj radnika potrebno</label>
                <input type="number" min="1" max="100" value={workersNeeded} onChange={(e) => setWorkersNeeded(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
          )}

          <div className="flex gap-3">
            <Link href={`/oglasi/${listingId}`} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 text-center hover:bg-gray-50 transition-colors">
              Otkaži
            </Link>
            <button type="submit" disabled={saving}
              className="flex-1 py-3 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50 bg-blue-600 hover:bg-blue-700">
              {saving ? 'Čuvam...' : 'Sačuvaj izmene'}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  )
}
