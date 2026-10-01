import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

export const runtime = 'nodejs'
export const maxDuration = 60

type DigestItem = {
  type: string
  title: string
  message: string | null
  link: string | null
  created_at: string
}
type ClaimedDigest = {
  recipient_user_id: string
  notification_ids: string[]
  items: DigestItem[]
}

const baseUrl = 'https://www.expertpro.app'

function categoryFor(type: string): string {
  if (type === 'new_message') return 'messages'
  if (type.startsWith('application_') || type === 'new_application') return 'applications'
  return 'jobs'
}

function digestText(items: DigestItem[]): string {
  const shown = items.slice(0, 20)
  const lines = shown.map((item, index) => {
    const link = item.link?.startsWith('/') && !item.link.startsWith('//')
      ? `${baseUrl}${item.link}` : `${baseUrl}/obavestenja`
    // Chat contents may contain private details. The email names the sender
    // and links to the protected conversation, but never quotes the message.
    const detail = item.type === 'new_message' ? '' :
      item.type === 'new_application' && item.message ? ` — ${item.message.replace(/\s+/g, ' ').slice(0, 100)}` : ''
    return `${index + 1}. ${item.title}${detail}\n   ${link}`
  })
  const remaining = items.length - shown.length
  return [
    `Imaš ${items.length} novih obaveštenja na ExpertPro platformi.`,
    '', ...lines,
    ...(remaining > 0 ? ['', `Još ${remaining} obaveštenja vidiš na platformi.`] : []),
    '', `Sva obaveštenja: ${baseUrl}/obavestenja`,
    `Izbor email obaveštenja možeš promeniti u profilu: ${baseUrl}/dashboard/profil`,
    '', 'Za pomoć: podrska@expertpro.app',
  ].join('\n')
}

export async function POST(request: Request) {
  const secret = process.env.BUSINESS_DIGEST_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('Unauthorized', { status: 401 })
  }
  const key = process.env.SUPABASE_TELEGRAM_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const smtpPassword = process.env.EMAIL_SMTP_PASSWORD
  if (!key || !url || !smtpPassword) {
    return Response.json({ ok: false, reason: 'Sender not configured' }, { status: 503 })
  }

  const db = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
  const { data, error } = await db.rpc('claim_business_email_digests', { p_limit: 20 })
  if (error) {
    console.error('Could not claim business email digests:', error)
    return Response.json({ ok: false, reason: 'Queue unavailable' }, { status: 503 })
  }

  const port = Number(process.env.EMAIL_SMTP_PORT || 465)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SMTP_HOST || 's1014.use1.mysecurecloudhost.com',
    port,
    secure: port === 465,
    auth: {
      user: process.env.EMAIL_SMTP_USER || 'no-reply@expertpro.app',
      pass: smtpPassword,
    },
  })
  let sent = 0
  let failed = 0
  for (const digest of (data || []) as ClaimedDigest[]) {
    try {
      // Preferences may have changed after the database claimed the batch.
      const { data: digestSettings, error: digestError } = await db
        .from('email_digest_settings').select('frequency')
        .eq('user_id', digest.recipient_user_id).maybeSingle()
      if (digestError) throw digestError
      if (digestSettings?.frequency === 'off') {
        await db.rpc('finish_business_email_digest', {
          p_user_id: digest.recipient_user_id,
          p_notification_ids: digest.notification_ids,
          p_sent: false,
          p_error: 'Recipient disabled email digests',
        })
        continue
      }
      const { data: preferences, error: preferencesError } = await db
        .from('notification_preferences').select('category,email')
        .eq('user_id', digest.recipient_user_id)
      if (preferencesError) throw preferencesError
      const disabled = new Set((preferences || []).filter(item => !item.email).map(item => item.category))
      const enabledItems = digest.items.filter(item => !disabled.has(categoryFor(item.type)))
      if (!enabledItems.length) {
        await db.rpc('finish_business_email_digest', {
          p_user_id: digest.recipient_user_id,
          p_notification_ids: digest.notification_ids,
          p_sent: false,
          p_error: 'Recipient disabled email notifications',
        })
        continue
      }
      const { data: userResult, error: userError } = await db.auth.admin.getUserById(digest.recipient_user_id)
      const recipient = userResult?.user?.email
      if (userError || !recipient) throw userError || new Error('Recipient email not found')
      if (!digest.items?.length) throw new Error('Empty digest')
      const result = await transporter.sendMail({
        from: 'ExpertPro <no-reply@expertpro.app>',
        to: recipient,
        subject: enabledItems.length === 1
          ? 'ExpertPro — novo obaveštenje o poslu'
          : `ExpertPro — ${enabledItems.length} novih obaveštenja`,
        text: digestText(enabledItems),
      })
      if (!result.accepted.includes(recipient)) throw new Error('SMTP did not accept recipient')
      const { error: finishError } = await db.rpc('finish_business_email_digest', {
        p_user_id: digest.recipient_user_id,
        p_notification_ids: digest.notification_ids,
        p_sent: true,
        p_error: null,
      })
      if (finishError) throw finishError
      sent++
    } catch (sendError) {
      failed++
      console.error('Business email digest failed:', sendError)
      await db.rpc('finish_business_email_digest', {
        p_user_id: digest.recipient_user_id,
        p_notification_ids: digest.notification_ids,
        p_sent: false,
        p_error: sendError instanceof Error ? sendError.message.slice(0, 500) : 'Unknown error',
      })
    }
  }
  return Response.json({ ok: true, claimed: data?.length || 0, sent, failed })
}
