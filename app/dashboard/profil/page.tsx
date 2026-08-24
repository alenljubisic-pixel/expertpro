'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { SERBIAN_CITIES } from '@/types'
import { ArrowLeft, Save, Upload, User } from 'lucide-react'

const SKILLS_OPTIONS = [
  'Građevina', 'Vodoinstalacije', 'Elektrika', 'Molerski radovi',
  'Čišćenje', 'Selidbe', 'Fizički radovi', 'Magacin',
  'Vozač', 'Konobar', 'Kuvar', 'Čuvanje dece', 'Čuvanje starih',
  'IT podrška', 'Administracija', 'Poljoprivreda', 'Događaji',
]

export default function ProfileEditPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [profile, setProfile] = useState<any>(null)

  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [city, setCity] = useState('')
  const [phone, setPhone] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [experience, setExperience] = useState('')
  const [available, setAvailable] = useState(true)
  const [languages, setLanguages] = useState<string[]>(['Srpski'])

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (p) {
        setProfile(p)
        setName(p.name || '')
        setBio(p.bio || '')
        setCity(p.city || '')
        setPhone(p.phone || '')
        setSkills(p.skills || [])
        setExperience(p.experience_years?.toString() || '')
        setAvailable(p.available ?? true)
        setLanguages(p.languages || ['Srpski'])
      }
      setLoading(false)
    }
    load()
  }, [])

  const toggleSkill = (skill: string) => {
    setSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    )
  }

  const handleSave = async () => {
    setSaving(true)
    setSuccess(false)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('profiles').update({
      name,
      bio,
      city: city || null,
      phone: phone || null,
      skills,
      experience_years: experience ? parseInt(experience) : null,
      available,
      languages,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id)

    setSaving(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Uredi profil</h1>
        </div>

        <div className="space-y-6">
          {/* Avatar section */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-3xl font-bold text-blue-600">
                {name ? name[0].toUpperCase() : <User className="w-8 h-8" />}
              </div>
              <div>
                <p className="font-medium text-gray-900">{name || 'Tvoje ime'}</p>
                <p className="text-sm text-gray-400 mt-0.5 capitalize">{profile?.type}</p>
                <button className="mt-2 flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700">
                  <Upload className="w-3 h-3" /> Promeni sliku (uskoro)
                </button>
              </div>
            </div>
          </div>

          {/* Basic info */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Osnovne informacije</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {profile?.type === 'individual' ? 'Ime i prezime' : 'Naziv'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio / O meni</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Napiši nešto o sebi, iskustvu ili firmi..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grad</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Izaberi grad</option>
                  {SERBIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+381 6x xxxxxxx"
                />
                <p className="text-xs text-gray-400 mt-1">Neće biti javno prikazano</p>
              </div>
            </div>

            {profile?.type === 'individual' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Godine iskustva</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            )}
          </div>

          {/* Availability & Languages */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Dostupnost</h2>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Trenutno dostupan/na</p>
                <p className="text-xs text-gray-400">Prikazuje se na profilu</p>
              </div>
              <button
                type="button"
                onClick={() => setAvailable(!available)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  available ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  available ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jezici</label>
              <div className="flex flex-wrap gap-2">
                {['Srpski', 'Engleski', 'Nemački', 'Italijanski', 'Mađarski', 'Rumunski'].map(lang => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguages(prev =>
                      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
                    )}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      languages.includes(lang)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Skills (individual only) */}
          {profile?.type === 'individual' && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Veštine i oblast rada</h2>
              <div className="flex flex-wrap gap-2">
                {SKILLS_OPTIONS.map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      skills.includes(skill)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Save */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Čuvam...' : 'Sačuvaj promene'}
            </button>
            {success && (
              <p className="text-sm text-green-600 font-medium">✓ Profil sačuvan!</p>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
