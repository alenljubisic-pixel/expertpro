/**
 * Returns a safe display name — never exposes raw email addresses.
 * If the stored name looks like an email (contains '@'), returns 'Korisnik'.
 */
export function safeName(name: string | null | undefined): string {
  if (!name || name.trim() === '' || name.includes('@')) return 'Korisnik'
  return name.trim()
}

/**
 * Returns a single uppercase letter for use in avatar circles.
 * Falls back to 'K' (for Korisnik) when name is absent or is an email.
 */
export function safeInitial(name: string | null | undefined): string {
  const display = safeName(name)
  return display[0].toUpperCase()
}
