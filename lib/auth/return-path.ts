const LISTING_PATH = /^\/oglasi\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?:\/istakni(?:\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})?)?$/i
const CREDIT_PATH = /^\/krediti(?:\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})?$/i

/** Keep auth redirects on known, internal pages only. */
export function safeAuthReturnPath(value: string | null | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return '/dashboard'
  }

  try {
    const url = new URL(value, 'https://expertpro.app')
    if (url.origin !== 'https://expertpro.app') return '/dashboard'
    if (!LISTING_PATH.test(url.pathname) && !CREDIT_PATH.test(url.pathname)) return '/dashboard'
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return '/dashboard'
  }
}
