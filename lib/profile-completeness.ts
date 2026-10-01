// Centralna lista "šta čini popunjen profil". Namerno je ovo JEDNO mesto —
// kad se doda nova vrsta verifikacije (telefon SMS kod, lična karta, itd.),
// dovoljno je dodati novi item ovde (sa svojim weight-om) i procenat će
// automatski da padne za sve naloge dok ne popune i taj novi uslov, pa se
// vrati na 100% kad ga ispune. Ne treba dirati ništa drugo u kodu zbog toga.

export interface ProfileCompletenessInput {
  type: string | null | undefined
  avatarUrl?: string | null
  bio?: string | null
  city?: string | null
  phone?: string | null
  skills?: string[] | null
  experienceYears?: number | null
  pib?: string | null
  isVerified?: boolean | null
}

export interface ProfileCompletenessItem {
  key: string
  label: string
  weight: number
  done: boolean
}

export interface ProfileCompletenessResult {
  percent: number
  color: 'red' | 'yellow' | 'green'
  items: ProfileCompletenessItem[]
  missing: ProfileCompletenessItem[]
}

export function computeProfileCompleteness(input: ProfileCompletenessInput): ProfileCompletenessResult {
  const isIndividual = (input.type || 'individual') === 'individual'

  // Slika je namerno najteža stavka — profil sa slikom dobija mnogo više
  // poverenja i klikova nego profil sa inicijalom u krugu, pa makar sve
  // ostalo bilo popunjeno, bez slike se ne može stići do 100%/zeleno.
  const items: ProfileCompletenessItem[] = [
    { key: 'avatar', label: 'Dodaj profilnu sliku', weight: 30, done: !!input.avatarUrl },
    {
      key: 'bio',
      label: isIndividual ? 'Opiši svoje iskustvo i dostupnost (polje "O meni")' : 'Opiši delatnost firme (polje "O meni")',
      weight: 15,
      done: !!(input.bio && input.bio.trim().length >= 10),
    },
    { key: 'city', label: 'Izaberi grad', weight: 10, done: !!input.city },
    { key: 'phone', label: 'Unesi broj telefona', weight: 10, done: !!(input.phone && input.phone.trim().length >= 6) },
  ]

  if (isIndividual) {
    items.push(
      { key: 'skills', label: 'Izaberi bar jednu veštinu', weight: 15, done: !!(input.skills && input.skills.length > 0) },
      {
        key: 'experience',
        label: 'Unesi godine iskustva',
        weight: 10,
        done: typeof input.experienceYears === 'number' && !Number.isNaN(input.experienceYears),
      },
      { key: 'verified', label: 'Sačekaj verifikaciju naloga (admin)', weight: 10, done: !!input.isVerified },
    )
  } else {
    items.push(
      { key: 'pib', label: 'Unesi PIB', weight: 15, done: !!input.pib },
      { key: 'verified', label: 'Sačekaj verifikaciju naloga (admin)', weight: 20, done: !!input.isVerified },
    )
  }

  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0)
  const doneWeight = items.filter(item => item.done).reduce((sum, item) => sum + item.weight, 0)
  const percent = totalWeight > 0 ? Math.round((doneWeight / totalWeight) * 100) : 0

  const color: ProfileCompletenessResult['color'] = percent >= 100 ? 'green' : percent >= 50 ? 'yellow' : 'red'

  return { percent, color, items, missing: items.filter(item => !item.done) }
}
