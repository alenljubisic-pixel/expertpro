import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { BLOG_POSTS, BLOG_UPDATED_AT } from '@/lib/blog-posts'

const BASE = 'https://www.expertpro.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/oglasi`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE}/radnici`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE}/blog`, lastModified: new Date(BLOG_UPDATED_AT), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE}/cenovnik`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/faq`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/o-nama`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/kontakt`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/privatnost`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE}/uslovi`, changeFrequency: 'yearly', priority: 0.2 },
  ]

  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: new Date(BLOG_UPDATED_AT),
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
