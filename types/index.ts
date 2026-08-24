export type UserType = 'individual' | 'company' | 'agency'
export type ListingType = 'offer' | 'request' | 'urgent'
export type ListingStatus = 'active' | 'filled' | 'expired' | 'cancelled' | 'pending_review'
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn'
export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'premium' | 'agency_starter' | 'agency_pro'

export interface Profile {
  id: string
  type: UserType
  name: string
  email?: string
  phone?: string
  city?: string
  bio?: string
  avatar_url?: string
  employment_status?: 'employed' | 'student' | 'unemployed' | 'freelancer'
  skills?: string[]
  company_name?: string
  pib?: string
  is_verified: boolean
  is_approved: boolean
  is_active: boolean
  rating_avg: number
  rating_count: number
  completed_jobs: number
  subscription_tier: SubscriptionTier
  active_listing_count: number
  created_at: string
}

export interface Category {
  id: number
  name_sr: string
  name_en: string
  icon?: string
  slug: string
  sort_order: number
}

export interface Listing {
  id: string
  user_id: string
  type: ListingType
  title: string
  description?: string
  category_id?: number
  city: string
  location_detail?: string
  price_type?: 'hourly' | 'daily' | 'fixed' | 'negotiable'
  price_amount?: number
  currency: string
  available_from?: string
  available_to?: string
  status: ListingStatus
  is_featured: boolean
  is_urgent: boolean
  view_count: number
  application_count: number
  expires_at: string
  created_at: string
  // Joined
  profiles?: Profile
  categories?: Category
}

export interface Application {
  id: string
  listing_id: string
  applicant_id: string
  message?: string
  proposed_price?: number
  status: ApplicationStatus
  created_at: string
  profiles?: Profile
  listings?: Listing
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  flagged_contact_share: boolean
  is_read: boolean
  created_at: string
  profiles?: Profile
}

export interface Conversation {
  id: string
  participant_1_id: string
  participant_2_id: string
  listing_id?: string
  last_message_at: string
  last_message_preview?: string
  unread_count_1: number
  unread_count_2: number
  created_at: string
  participant_1?: Profile
  participant_2?: Profile
  listings?: Listing
}

export interface Review {
  id: string
  reviewer_id: string
  reviewee_id: string
  listing_id?: string
  rating: number
  comment?: string
  created_at: string
  profiles?: Profile
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  body?: string
  data?: Record<string, unknown>
  is_read: boolean
  created_at: string
}

// Subscription tiers config
export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, { max_listings: number; label_sr: string; price_rsd: number }> = {
  free:           { max_listings: 1,   label_sr: 'Besplatno',        price_rsd: 0 },
  basic:          { max_listings: 3,   label_sr: 'Basic',            price_rsd: 990 },
  pro:            { max_listings: 10,  label_sr: 'Pro',              price_rsd: 2490 },
  premium:        { max_listings: 999, label_sr: 'Premium',          price_rsd: 4990 },
  agency_starter: { max_listings: 20,  label_sr: 'Agencija Starter', price_rsd: 7900 },
  agency_pro:     { max_listings: 999, label_sr: 'Agencija Pro',     price_rsd: 14900 },
}

export const SERBIAN_CITIES = [
  'Beograd', 'Novi Sad', 'Niš', 'Kragujevac', 'Subotica',
  'Zrenjanin', 'Pančevo', 'Čačak', 'Novi Pazar', 'Kruševac',
  'Leskovac', 'Smederevo', 'Valjevo', 'Vranje', 'Šabac',
  'Požarevac', 'Zaječar', 'Kikinda', 'Sombor', 'Pirot',
  'Jagodina', 'Bor', 'Vršac', 'Sremska Mitrovica', 'Prokuplje',
  'Užice', 'Loznica', 'Aleksandrovac', 'Bačka Palanka', 'Kosovska Mitrovica'
]
