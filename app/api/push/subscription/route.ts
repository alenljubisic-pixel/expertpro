import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

const allowedPushHost = /^(fcm\.googleapis\.com|updates\.push\.services\.mozilla\.com|web\.push\.apple\.com|[a-z0-9-]+\.notify\.windows\.com)$/

function validEndpoint(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 2048) return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password &&
      allowedPushHost.test(url.hostname) && url.pathname.startsWith('/')
  } catch { return false }
}

export async function GET() {
  return Response.json({ publicKey: process.env.VAPID_PUBLIC_KEY || null })
}

export async function POST(request: Request) {
  const db = await createClient()
  const { data: { user } } = await db.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })
  let payload: unknown
  try { payload = await request.json() } catch { return new Response('Invalid JSON', { status: 400 }) }
  const data = payload as { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } }
  if (!validEndpoint(data?.endpoint) ||
      typeof data.keys?.p256dh !== 'string' || data.keys.p256dh.length < 40 || data.keys.p256dh.length > 256 ||
      typeof data.keys?.auth !== 'string' || data.keys.auth.length < 16 || data.keys.auth.length > 128) {
    return new Response('Invalid subscription', { status: 400 })
  }
  const { error } = await db.from('push_subscriptions').upsert({
    user_id: user.id, endpoint: data.endpoint,
    p256dh: data.keys.p256dh, auth: data.keys.auth,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'endpoint' })
  if (error) {
    console.error('Could not save push subscription:', error)
    return Response.json({ ok: false }, { status: 409 })
  }
  return Response.json({ ok: true })
}

export async function DELETE(request: Request) {
  const db = await createClient()
  const { data: { user } } = await db.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })
  let payload: unknown
  try { payload = await request.json() } catch { return new Response('Invalid JSON', { status: 400 }) }
  const endpoint = (payload as { endpoint?: unknown })?.endpoint
  if (!validEndpoint(endpoint)) return new Response('Invalid subscription', { status: 400 })
  const { error } = await db.from('push_subscriptions').delete()
    .eq('user_id', user.id).eq('endpoint', endpoint)
  if (error) return Response.json({ ok: false }, { status: 500 })
  return Response.json({ ok: true })
}
