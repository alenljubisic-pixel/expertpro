export function reportMonth(value?: string): string {
  const current = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Belgrade' }).slice(0, 7)
  return value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value) ? value : current
}

export function monthLabel(month: string): string {
  return new Intl.DateTimeFormat('sr-Latn-RS', { month: 'long', year: 'numeric', timeZone: 'Europe/Belgrade' })
    .format(new Date(`${month}-15T12:00:00Z`))
}
