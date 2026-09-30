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

type PublicIdentity = {
  id?: string | null
  type?: string | null
  name?: string | null
  username?: string | null
}

/** Physical people are identified only by their platform alias in public UI. */
export function publicName(profile: PublicIdentity | null | undefined): string {
  if (!profile) return 'Korisnik'
  if (profile.type !== 'company' && profile.type !== 'agency') {
    if (profile.username) return profile.username
    return profile.id ? `ep-${profile.id.replaceAll('-', '').slice(0, 16)}` : 'Korisnik'
  }
  return safeName(profile.name)
}

export function publicInitial(profile: PublicIdentity | null | undefined): string {
  return publicName(profile)[0].toUpperCase()
}
