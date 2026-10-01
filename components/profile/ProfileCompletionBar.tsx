'use client'

import { computeProfileCompleteness, ProfileCompletenessInput } from '@/lib/profile-completeness'
import { CheckCircle } from 'lucide-react'

export default function ProfileCompletionBar({ input }: { input: ProfileCompletenessInput }) {
  const { percent, color, missing } = computeProfileCompleteness(input)

  const styles = {
    green: { bg: 'bg-green-50 border-green-200', text: 'text-green-700', bar: 'bg-green-500' },
    yellow: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', bar: 'bg-amber-400' },
    red: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', bar: 'bg-red-400' },
  }[color]

  return (
    <div className={`rounded-xl border p-4 ${styles.bg}`}>
      <div className="flex items-center justify-between mb-2">
        <p className={`text-sm font-semibold flex items-center gap-1.5 ${styles.text}`}>
          {percent >= 100 && <CheckCircle className="w-4 h-4" />}
          {percent >= 100 ? 'Profil je potpuno popunjen' : `Profil je popunjen ${percent}%`}
        </p>
        <span className={`text-xs font-bold ${styles.text}`}>{percent}%</span>
      </div>
      <div className="w-full h-2 bg-white/70 rounded-full overflow-hidden mb-3">
        <div className={`h-full ${styles.bar} transition-all`} style={{ width: `${Math.min(percent, 100)}%` }} />
      </div>
      {missing.length > 0 && <p className="mb-3 text-xs text-gray-700">Unapredi profil: opis, iskustvo i stvarna slika mogu pomoći drugima da procene tvoju ponudu. Polja su opciona; potpuna popunjenost ne garantuje posao.</p>}
      {missing.length > 0 ? (
        <ul className="space-y-1">
          {missing.map(item => (
            <li key={item.key} className={`text-xs flex items-center gap-1.5 ${styles.text}`}>
              <span className="w-1 h-1 rounded-full bg-current flex-shrink-0" />
              {item.label}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-green-600">Odlično — popunjen profil i slika pomažu da ti ljudi više veruju i brže te biraju.</p>
      )}
    </div>
  )
}
