export const APP_NAME = 'ExpertPro'
export const APP_DESCRIPTION = 'Platforma za honorarne poslove i usluge u Srbiji'

export const LISTING_TYPES = {
  offer:   { label_sr: 'Nudim uslugu',   label_en: 'Offering service',   color: 'blue',   icon: '💼' },
  request: { label_sr: 'Tražim radnika', label_en: 'Seeking worker',     color: 'green',  icon: '🔍' },
  urgent:  { label_sr: '🚨 Hitno!',      label_en: '🚨 Urgent!',         color: 'red',    icon: '🚨' },
} as const

export const PRICE_TYPES = {
  hourly:     { label_sr: 'Po satu',    label_en: 'Per hour' },
  daily:      { label_sr: 'Po danu',    label_en: 'Per day' },
  fixed:      { label_sr: 'Fiksno',     label_en: 'Fixed price' },
  negotiable: { label_sr: 'Dogovor',    label_en: 'Negotiable' },
} as const

export const USER_TYPES = {
  individual: { label_sr: 'Fizičko lice', label_en: 'Individual', icon: '👤' },
  company:    { label_sr: 'Firma',        label_en: 'Company',    icon: '🏢' },
  agency:     { label_sr: 'Agencija',     label_en: 'Agency',     icon: '🏛️' },
} as const

// Canonical category id/slug list (must match the `categories` table's ids).
// Used wherever a category needs to be selected by id, e.g. the Gold
// "srodna rubrika" (secondary category) picker.
export const CATEGORIES_WITH_ID = [
  { icon: '🏗️', name: 'Građevina', slug: 'gradevina', id: 1 },
  { icon: '🧹', name: 'Čišćenje', slug: 'ciscenje', id: 2 },
  { icon: '🚛', name: 'Transport', slug: 'transport', id: 3 },
  { icon: '🍽️', name: 'Ugostiteljstvo', slug: 'ugostiteljstvo', id: 4 },
  { icon: '👷', name: 'Pomoćni radnici', slug: 'pomocni-radnici', id: 5 },
  { icon: '📦', name: 'Magacin', slug: 'magacin', id: 6 },
  { icon: '👶', name: 'Čuvanje i nega', slug: 'cuvanje', id: 7 },
  { icon: '💻', name: 'IT i računari', slug: 'it', id: 8 },
  { icon: '🌾', name: 'Poljoprivreda', slug: 'poljoprivreda', id: 9 },
  { icon: '🎪', name: 'Događaji', slug: 'dogadjaji', id: 10 },
  { icon: '📋', name: 'Administracija', slug: 'administracija', id: 11 },
  { icon: '📌', name: 'Ostalo', slug: 'ostalo', id: 12 },
] as const
