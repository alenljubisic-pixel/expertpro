// Pricing and shared helpers for the two paid listing-promotion tiers
// (Istaknut / Gold), paid manually via IPS/bank transfer — see
// supabase/migration_listing_promotions.sql for the DB side.
//
// Prices are a starting default set by the developer; change them here any
// time (no DB migration needed) — nothing else in the app hardcodes a price.

export type PromotionTier = 'featured' | 'gold'
export type PromotionDuration = 7 | 15 | 30

export const PROMOTION_TIERS: Record<PromotionTier, { label: string; description: string; color: string }> = {
  featured: {
    label: 'Istaknut',
    description: 'Oglas se prikazuje na vrhu liste u okviru svoje kategorije, grada i tipa oglasa.',
    color: 'blue',
  },
  gold: {
    label: 'Gold',
    description: 'Oglas se prikazuje na samom vrhu — iznad svih ostalih, uključujući Istaknute — na celoj /oglasi listi, uz zlatni okvir i značku.',
    color: 'amber',
  },
}

export const PROMOTION_PRICES: Record<PromotionTier, Record<PromotionDuration, number>> = {
  featured: { 7: 490, 15: 890, 30: 1490 },
  gold: { 7: 990, 15: 1790, 30: 2990 },
}

export const PROMOTION_DURATIONS: PromotionDuration[] = [7, 15, 30]

export function promotionPrice(tier: PromotionTier, duration: PromotionDuration): number {
  return PROMOTION_PRICES[tier][duration]
}

// Short, human-typeable reference code the user puts in "poziv na broj" /
// "svrha uplate" so the admin can match a bank statement line to an order.
export function generateReferenceCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O/1/I confusion
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return `EP-${code}`
}
