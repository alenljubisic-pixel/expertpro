// "Krediti" (credits) power two things on the free plan:
//   1) Hitna berza (urgent listings): 1 kredit = 1 objavljen hitan oglas
//      (migration_credits.sql, enforce_urgent_credits()).
//   2) Extra listing slots: the 1st active offer/request listing is free,
//      every additional one (same or different category) costs 1 kredit
//      (migration_listing_limits_v2.sql, enforce_listing_limits()).
// Sold in packages (never as one tiny per-post payment) via the same manual
// IPS/bank-transfer flow as Istaknut/Gold. Individuals pay less per package
// than companies/agencies; upgrading to a paid membership (subscription_tier
// != 'free') grants a one-time welcome bonus automatically (DB trigger), and
// every new signup gets a small free starter balance (migration_credits_signup_bonus.sql).
//
// Prices are a starting default set by the developer; change them here any
// time (no DB migration needed) — nothing else in the app hardcodes a price.

export type CreditAccountBucket = 'individual' | 'business' // company + agency share business pricing

export interface CreditPackage {
  key: string
  credits: number
  price: number
}

export const CREDIT_PACKAGES: Record<CreditAccountBucket, CreditPackage[]> = {
  individual: [
    { key: 'ind_starter', credits: 5, price: 1000 },
    { key: 'ind_standard', credits: 15, price: 2500 },
    { key: 'ind_pro', credits: 35, price: 5000 },
  ],
  business: [
    { key: 'biz_starter', credits: 5, price: 2000 },
    { key: 'biz_standard', credits: 15, price: 5000 },
    { key: 'biz_pro', credits: 40, price: 12000 },
  ],
}

export const CREDITS_PER_URGENT_LISTING = 1

// One-time bonus credited automatically (DB trigger) the moment a profile's
// subscription_tier moves from 'free' to any paid tier (i.e. "Puno članstvo"
// is approved for a company/agency). See migration_credits.sql.
export const PAID_MEMBERSHIP_WELCOME_BONUS_CREDITS = 10

// One-time bonus every new account gets right at registration (individual,
// company or agency alike), so they can try Hitna berza before paying
// anything. See migration_credits_signup_bonus.sql.
export const SIGNUP_WELCOME_CREDITS = 2

export function creditBucketForAccountType(type: string | null | undefined): CreditAccountBucket {
  return type === 'company' || type === 'agency' ? 'business' : 'individual'
}

export function findPackage(bucket: CreditAccountBucket, key: string): CreditPackage | undefined {
  return CREDIT_PACKAGES[bucket].find(p => p.key === key)
}

// Reuses the same short reference-code format as listing promotions so
// admins recognize it as "a payment to match against a bank statement".
export function generateCreditReferenceCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return `EPK-${code}`
}
