// Serbian "IPS QR" payment code — lets a user scan the code with their
// banking app instead of typing the account number and amount by hand.
// Format per National Bank of Serbia (NBS) IPS QR specification:
//   https://ips.nbs.rs/PDF/pdfPreporukeValidacija.pdf
//   https://github.com/ArtBIT/ips-qr-code/wiki/IPS-QR-Code-Format
//
// Deliberately conservative about what goes in the code, because a wrong
// account number or amount here would misdirect real money:
//   - K:PR   fixed — "printed"/on-screen invoice (matches our use case:
//            a one-off bill shown on a web page, not a POS/e-commerce flow).
//   - V:01   fixed version.
//   - C:1    fixed charset flag.
//   - R      payee account number as a bare 18-digit string, NO dashes.
//            We only emit this when the stored account number (entered by
//            the admin as "160-0000000000000-00") strips down to EXACTLY
//            18 digits — anything else and we skip the QR entirely rather
//            than guess/pad, since a malformed account number is the one
//            mistake that could send the payment to the wrong place.
//   - N      payee name, as entered by the admin.
//   - I      "RSD" + amount with a decimal COMMA (not a dot) and no
//            thousands separator, e.g. "RSD1000,00" — this is the exact
//            format the spec requires; a dot here makes some banking apps
//            reject or misparse the code.
//   - SF:221 cashless payment for goods/services (NBS lists 121/221 as
//            generally used for both individuals and legal entities).
//   - S      short human-readable order code in the payment purpose.
//   - RO     model 97 followed by the unique, server-generated numeric
//            reference. Legacy orders without one omit this optional field.
//
// IMPORTANT: this has not been scanned/verified against a real Serbian
// banking app yet. Treat it as "should be correct per the published spec"
// until someone actually scans one and confirms the fields populate right
// — the manual account number / amount / reference shown as plain text on
// the same page is always there as a fallback either way.

export interface IpsQrInput {
  accountNumber: string // as stored, e.g. "160-0000000000000-00"
  accountHolder: string
  amountRsd: number
  purposeText: string
  bankReference?: string | null
}

export function isValidBankReference(value: string | null | undefined): value is string {
  if (!value || !/^\d{12}$/.test(value)) return false
  const base = value.slice(2)
  return Number(value.slice(0, 2)) === 98 - ((Number(base) * 100) % 97)
}

// Returns the raw IPS QR payload string, or null if the account number
// doesn't cleanly resolve to the required 18 digits (in which case callers
// should just skip rendering a QR code and keep the manual-entry fields).
export function buildIpsQrPayload(input: IpsQrInput): string | null {
  const digits = (input.accountNumber || '').replace(/\D/g, '')
  if (digits.length !== 18) return null

  const name = (input.accountHolder || '').trim()
  if (!name) return null

  if (!(input.amountRsd > 0)) return null
  const amountStr = `RSD${input.amountRsd.toFixed(2).replace('.', ',')}`

  const purpose = (input.purposeText || '').trim().slice(0, 35) // keep it short/safe
  if (input.bankReference && !isValidBankReference(input.bankReference)) return null

  const fields = [
    'K:PR',
    'V:01',
    'C:1',
    `R:${digits}`,
    `N:${name}`,
    `I:${amountStr}`,
    'SF:221',
    ...(purpose ? [`S:${purpose}`] : []),
    ...(input.bankReference ? [`RO:97${input.bankReference}`] : []),
  ]

  return fields.join('|')
}
