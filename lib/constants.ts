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
