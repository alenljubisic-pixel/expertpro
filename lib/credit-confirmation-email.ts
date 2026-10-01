import 'server-only'

import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

const sender = 'ExpertPro <no-reply@expertpro.app>'

/** The database creates the outbox row only on a real paid_confirmed transition. */
export async function sendCreditConfirmationEmail(purchaseId: string): Promise<boolean> {
  const key = process.env.SUPABASE_TELEGRAM_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const smtpPassword = process.env.EMAIL_SMTP_PASSWORD
  if (!key || !url || !smtpPassword) {
    console.warn('Credit confirmation email deferred: server email configuration is incomplete')
    return false
  }

  const db = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
  const { data: claimed, error: claimError } = await db.rpc('claim_credit_confirmation_email', {
    p_purchase_id: purchaseId,
  })
  if (claimError) throw claimError
  if (!claimed) return false // Already sent, in progress, or no confirmed payment.

  try {
    const { data: purchase, error: purchaseError } = await db
      .from('credit_purchases')
      .select('id,user_id,credits_amount,price_amount,currency,status')
      .eq('id', purchaseId)
      .single()
    if (purchaseError || !purchase || purchase.status !== 'paid_confirmed') {
      throw purchaseError || new Error('Confirmed credit purchase not found')
    }

    const { data: userResult, error: userError } = await db.auth.admin.getUserById(purchase.user_id)
    const recipient = userResult?.user?.email
    if (userError || !recipient) throw userError || new Error('Credit recipient email not found')

    const host = process.env.EMAIL_SMTP_HOST || 's1014.use1.mysecurecloudhost.com'
    const port = Number(process.env.EMAIL_SMTP_PORT || 465)
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user: process.env.EMAIL_SMTP_USER || 'no-reply@expertpro.app', pass: smtpPassword },
    })
    const amount = Number(purchase.price_amount)
    const credits = Number(purchase.credits_amount)
    const orderUrl = `https://www.expertpro.app/krediti/${purchase.id}`
    const result = await transporter.sendMail({
      from: sender,
      to: recipient,
      subject: 'ExpertPro — krediti su dodati na tvoj nalog',
      text: `Uplata od ${amount} ${purchase.currency || 'RSD'} je potvrđena. ${credits} kredita je uspešno dodato na tvoj ExpertPro nalog. Detalji: ${orderUrl}\n\nZa pomoć piši na podrska@expertpro.app.`,
      html: `<p>Uplata od <strong>${amount} ${purchase.currency || 'RSD'}</strong> je potvrđena.</p><p><strong>${credits} kredita</strong> je uspešno dodato na tvoj ExpertPro nalog.</p><p><a href="${orderUrl}">Pogledaj detalje uplate</a></p><p>Za pomoć: podrska@expertpro.app</p>`,
    })
    if (!result.accepted.includes(recipient)) throw new Error('SMTP did not accept recipient')

    const { error: markError } = await db.from('credit_confirmation_emails')
      .update({ sent_at: new Date().toISOString(), last_error: null })
      .eq('purchase_id', purchaseId)
    if (markError) throw markError
    return true
  } catch (error) {
    await db.from('credit_confirmation_emails')
      .update({ claimed_at: null, last_error: error instanceof Error ? error.message.slice(0, 500) : 'Unknown email error' })
      .eq('purchase_id', purchaseId)
    throw error
  }
}
