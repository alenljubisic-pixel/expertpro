import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

export const runtime = 'nodejs'
export const maxDuration = 60

type Delivery = {
  notification_id: string
  subscription_id: string
  endpoint: string
  p256dh: string
  auth: string
  title: string
  body: string
  link: string | null
  notification_type: string
}

export async function POST(request: Request) {
  const secret = process.env.BUSINESS_DIGEST_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`)
    return new Response('Unauthorized', { status: 401 })
  const key = process.env.SUPABASE_TELEGRAM_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publicKey = process.env.VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  if (!key || !url || !publicKey || !privateKey)
    return Response.json({ ok: false, reason: 'Push not configured' }, { status: 503 })

  webpush.setVapidDetails('mailto:podrska@expertpro.app', publicKey, privateKey)
  const db = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
  const { data, error } = await db.rpc('claim_push_deliveries', { p_limit: 50 })
  if (error) {
    console.error('Could not claim push deliveries:', error)
    return Response.json({ ok: false, reason: 'Push queue unavailable' }, { status: 503 })
  }

  let sent = 0
  let failed = 0
  for (const delivery of (data || []) as Delivery[]) {
    try {
      const destination = delivery.link?.startsWith('/') && !delivery.link.startsWith('//')
        ? delivery.link : '/obavestenja'
      await webpush.sendNotification({
        endpoint: delivery.endpoint,
        keys: { p256dh: delivery.p256dh, auth: delivery.auth },
      }, JSON.stringify({
        title: delivery.title,
        body: delivery.body,
        url: destination,
        tag: `expertpro-${delivery.notification_id}`,
      }), {
        TTL: 86400,
        urgency: delivery.notification_type === 'urgent_nearby' ? 'high' : 'normal',
      })
      const { error: finishError } = await db.rpc('finish_push_delivery', {
        p_notification_id: delivery.notification_id,
        p_subscription_id: delivery.subscription_id,
        p_sent: true,
        p_gone: false,
        p_error: null,
      })
      if (finishError) throw finishError
      sent++
    } catch (cause) {
      failed++
      const status = (cause as { statusCode?: number }).statusCode
      console.error('Push delivery failed:', cause)
      await db.rpc('finish_push_delivery', {
        p_notification_id: delivery.notification_id,
        p_subscription_id: delivery.subscription_id,
        p_sent: false,
        p_gone: status === 404 || status === 410,
        p_error: cause instanceof Error ? cause.message.slice(0, 500) : 'Unknown error',
      })
    }
  }
  return Response.json({ ok: true, claimed: data?.length || 0, sent, failed })
}
