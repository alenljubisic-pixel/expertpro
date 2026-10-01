export const AVAILABILITY_TIME_OPTIONS = [
  { value: 'flexible', label: 'Po dogovoru' },
  { value: 'morning', label: 'Pre podne' },
  { value: 'afternoon', label: 'Posle podne' },
  { value: 'all_day', label: 'Ceo dan' },
  { value: 'around_clock', label: '24h / po pozivu' },
] as const

export const AVAILABILITY_DAY_OPTIONS = [
  { value: 'flexible', label: 'Po dogovoru' },
  { value: 'weekdays', label: 'Radnim danima' },
  { value: 'weekends', label: 'Vikendom' },
  { value: 'both', label: 'Radnim danima i vikendom' },
] as const

export function matchingTimes(value?: string): string[] | null {
  switch (value) {
    case 'morning': return ['morning', 'all_day', 'around_clock']
    case 'afternoon': return ['afternoon', 'all_day', 'around_clock']
    case 'all_day': return ['all_day', 'around_clock']
    case 'around_clock': return ['around_clock']
    default: return null
  }
}

export function matchingDays(value?: string): string[] | null {
  switch (value) {
    case 'weekdays': return ['weekdays', 'both']
    case 'weekends': return ['weekends', 'both']
    default: return null
  }
}

export function availabilityLabel(time?: string | null, days?: string | null): string | null {
  const timeLabel = AVAILABILITY_TIME_OPTIONS.find(option => option.value === time)?.label
  const daysLabel = AVAILABILITY_DAY_OPTIONS.find(option => option.value === days)?.label
  const parts = [time !== 'flexible' ? timeLabel : null, days !== 'flexible' ? daysLabel : null].filter(Boolean)
  return parts.length ? parts.join(' · ') : null
}
