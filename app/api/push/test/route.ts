import { createClient } from '@/lib/supabase/server'
import webpush from 'web-push'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const db = await createClient()
  const { data: { user } } = await db.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })
  let payload: unknown
  try { payload = await request.json() } catch { return new Response('Invalid JSON', { status: 400 }) }
  const endpoint = (payload as { endpoint?: unknown })?.endpoint
  if (typeof endpoint !== 'string' || endpoint.length > 2048)
    return new Response('Invalid subscription', { status: 400 })
  const publicKey = process.env.VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  if (!publicKey || !privateKey) return new Response('Push not configured', { status: 503 })
  const { data, error } = await db.rpc('claim_my_push_test', { p_endpoint: endpoint })
  if (error) return new Response('Push test unavailable', { status: 503 })
  const subscription = data?.[0]
  if (!subscription) return new Response('Wait one minute or enable push on this device', { status: 429 })
  webpush.setVapidDetails('mailto:podrska@expertpro.app', publicKey, privateKey)
  try {
    await webpush.sendNotification({
      endpoint: subscription.endpoint,
      keys: { p256dh: subscription.p256dh, auth: subscription.auth },
    }, JSON.stringify({
      title: 'ExpertPro — probno obaveštenje',
      body: 'Push radi na ovom uređaju. Stvarna obaveštenja stižu kada se nešto desi na tvom nalogu.',
      url: '/obavestenja',
      tag: `expertpro-test-${Date.now()}`,
      forceShow: true,
    }), { TTL: 300 })
    return Response.json({ ok: true })
  } catch (cause) {
    const status = (cause as { statusCode?: number }).statusCode
    if (status === 404 || status === 410) {
      await db.from('push_subscriptions').delete().eq('user_id', user.id).eq('endpoint', endpoint)
    }
    console.error('Push self-test failed:', cause)
    return Response.json({ ok: false }, { status: 502 })
  }
}
