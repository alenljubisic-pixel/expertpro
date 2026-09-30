import 'server-only'
import { buildPaymentPurpose } from '@/lib/payment-purpose'

export type PaymentKind = 'credit' | 'promotion'

function safeLine(value: string | null, limit: number): string {
  return (value || '—').replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, limit) || '—'
}

type ReviewNotice = {
  kind: PaymentKind
  orderId: string
  reference: string
  orderCode: string
  userCode: string | null
  amount: number
  legalName: string | null
  phone: string | null
  email: string | null
  submittedAt: string | null
}

export async function telegramApi(method: string, body: Record<string, unknown>): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) return false
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
      cache: 'no-store',
    })
    if (!response.ok) return false
    const result = await response.json() as { ok?: boolean }
    return result.ok === true
  } catch {
    return false
  }
}

export async function sendPaymentReview(notice: ReviewNotice): Promise<boolean> {
  if (process.env.TELEGRAM_PAYMENT_APPROVAL_ENABLED !== 'true') return false
  const chatId = process.env.TELEGRAM_PAYMENT_CHAT_ID
  if (!chatId || !process.env.TELEGRAM_BOT_TOKEN) return false
  const callback = [notice.kind === 'credit' ? 'c' : 'p', notice.orderId, notice.reference, notice.amount].join(':')
  if (Buffer.byteLength(callback, 'utf8') > 64) return false
  const registeredAt = notice.submittedAt
    ? new Date(notice.submittedAt).toLocaleString('sr-RS', { timeZone: 'Europe/Belgrade' })
    : '—'
  const text = [
    '⚠️ ExpertPro: korisnik je prijavio uplatu. Ovo NIJE potvrda da je novac stigao.',
    `Vrsta: ${notice.kind === 'credit' ? 'Krediti' : 'Promocija oglasa'}`,
    `Registrovano ime: ${safeLine(notice.legalName, 100)}`,
    `Telefon: ${safeLine(notice.phone, 40)}`,
    `E-mail: ${safeLine(notice.email, 100)}`,
    `Iznos: ${notice.amount.toLocaleString('sr-RS')} RSD`,
    `Poziv na broj: ${notice.reference}`,
    `Svrha uplate: ${buildPaymentPurpose(notice.orderCode, notice.userCode, /^\d{12}$/.test(notice.reference) ? notice.reference : null)}`,
    `Prijavljeno: ${registeredAt}`,
    '',
    'Odobri TEK kada u bankarskom izvodu vidiš isti poziv na broj i iznos. Ime uplatioca može biti drugačije.',
  ].join('\n')
  return telegramApi('sendMessage', {
    chat_id: chatId,
    text,
    reply_markup: {
      inline_keyboard: [
        [{ text: '✅ Proverio sam priliv — odobri', callback_data: callback }],
        [{ text: '🔎 Otvori admin uplate', url: 'https://www.expertpro.app/admin/uplate?filter=review' }],
      ],
    },
  })
}
