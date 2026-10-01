import { timingSafeEqual } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { telegramApi } from '@/lib/telegram-payments'
import { sendCreditConfirmationEmail } from '@/lib/credit-confirmation-email'

export const runtime = 'nodejs'

type Callback = {
  id?: string
  from?: { id?: number }
  data?: string
  message?: { message_id?: number; chat?: { id?: number; type?: string } }
}

function matchesSecret(received: string | null, expected: string): boolean {
  if (!received || !expected) return false
  const a = Buffer.from(received)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function POST(request: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET
  const telegramUserId = process.env.TELEGRAM_ADMIN_USER_ID
  const chatId = process.env.TELEGRAM_PAYMENT_CHAT_ID
  const adminProfileId = process.env.TELEGRAM_ADMIN_PROFILE_ID
  const serviceKey = process.env.SUPABASE_TELEGRAM_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!secret || !telegramUserId || !chatId || !adminProfileId || !supabaseUrl || !process.env.TELEGRAM_BOT_TOKEN) {
    return new Response('Bot is not configured', { status: 503 })
  }
  if (!matchesSecret(request.headers.get('x-telegram-bot-api-secret-token'), secret)) {
    return new Response('Unauthorized', { status: 401 })
  }

  let callback: Callback | undefined
  try {
    const update = await request.json() as { callback_query?: Callback }
    callback = update.callback_query
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }
  if (!callback) return Response.json({ ok: true })
  const answer = async (text: string, alert = false) => {
    if (callback?.id) await telegramApi('answerCallbackQuery', { callback_query_id: callback.id, text, show_alert: alert })
  }
  if (String(callback.from?.id) !== telegramUserId ||
      String(callback.message?.chat?.id) !== chatId ||
      !['private', 'group', 'supergroup'].includes(callback.message?.chat?.type || '')) {
    await answer('Nemaš pravo na odobravanje.', true)
    return Response.json({ ok: true })
  }

  if (callback.data === 'expertpro:test') {
    await answer('Test uspešan. Nijedna uplata nije odobrena i nijedan kredit nije dodeljen.', true)
    return Response.json({ ok: true })
  }

  if (!serviceKey || process.env.TELEGRAM_PAYMENT_APPROVAL_ENABLED !== 'true') {
    await answer('Odobravanje uplata još nije podešeno. Proveri admin panel.', true)
    return Response.json({ ok: true })
  }

  const parts = callback.data?.split(':') || []
  const [kindCode, orderId, reference, rawAmount] = parts
  const amount = Number(rawAmount)
  if (parts.length !== 4 || !['c', 'p'].includes(kindCode) ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId || '') ||
      !/^[A-Z0-9-]{1,18}$/.test(reference || '') || !Number.isInteger(amount) || amount <= 0) {
    await answer('Neispravan zahtev.', true)
    return Response.json({ ok: true })
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { data, error } = await supabase.rpc('telegram_confirm_payment', {
    p_kind: kindCode === 'c' ? 'credit' : 'promotion',
    p_order_id: orderId,
    p_reference: reference,
    p_amount: amount,
    p_admin_id: adminProfileId,
  })
  if (error) {
    await answer('Potvrda nije uspela. Proveri status i podatke u admin panelu.', true)
    return Response.json({ ok: true })
  }
  if (kindCode === 'c' && data === 'confirmed') {
    try {
      await sendCreditConfirmationEmail(orderId)
    } catch (emailError) {
      console.error('Credit purchase confirmed, but receipt email failed:', emailError)
    }
  }
  await answer(data === 'already_confirmed' ? 'Ova uplata je već potvrđena.' : 'Uplata potvrđena; kredit/promocija su dodeljeni.')
  if (callback.message?.message_id) {
    await telegramApi('editMessageReplyMarkup', {
      chat_id: chatId,
      message_id: callback.message.message_id,
      reply_markup: { inline_keyboard: [] },
    })
  }
  return Response.json({ ok: true })
}
