import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const BASE = 'https://www.expertpro.app'

const BLOG_SLUGS = [
  'kako-naci-honorarni-posao-u-srbiji',
  'rad-od-kuce-opcije-srbija',
  'kako-zaraditi-dodatni-novac',
  'jednodnevni-angazmani-srbija',
  'cuvanje-dece-i-ljubimaca-posao',
  'freelancing-u-srbiji-vodic',
  'hitni-poslovi-srbija',
  'fizicki-radnici-srbija',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/oglasi`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE}/radnici`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE}/blog`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE}/cenovnik`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/faq`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/o-nama`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/kontakt`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/register`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/login`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/privatnost`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE}/uslovi`, changeFrequency: 'yearly', priority: 0.2 },
  ]

  const blogPages: MetadataRoute.Sitemap = BLOG_SLUGS.map((slug) => ({
    url: `${BASE}/blog/${slug}`,
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  let listingPages: MetadataRoute.Sitemap = []
  try {
    const supabase = await createClient()
    const { data: listings } = await supabase
      .from('listings')
      .select('id, updated_at')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(2000)

    listingPages = (listings || []).map((l) => ({
      url: `${BASE}/oglasi/${l.id}`,
      lastModified: l.updated_at ? new Date(l.updated_at) : undefined,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }))
  } catch {
    // If Supabase is unreachable at build time, still return the static pages.
  }

  return [...staticPages, ...blogPages, ...listingPages]
}
