import { createClient } from '@supabase/supabase-js'
import { sendCreditConfirmationEmail } from '@/lib/credit-confirmation-email'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', { status: 401 })
  }
  const key = process.env.SUPABASE_TELEGRAM_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!key || !url || !process.env.EMAIL_SMTP_PASSWORD) {
    return Response.json({ ok: false, reason: 'Email sender not configured' }, { status: 503 })
  }

  const db = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
  const { data: pending, error } = await db.from('credit_confirmation_emails')
    .select('purchase_id').is('sent_at', null)
    .order('created_at', { ascending: true }).limit(20)
  if (error) return Response.json({ ok: false, reason: 'Queue unavailable' }, { status: 503 })

  let sent = 0
  let failed = 0
  for (const item of pending || []) {
    try {
      if (await sendCreditConfirmationEmail(item.purchase_id)) sent++
    } catch (sendError) {
      failed++
      console.error('Credit confirmation retry failed:', sendError)
    }
  }
  return Response.json({ ok: true, processed: pending?.length || 0, sent, failed })
}
