import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = 'https://www.expertpro.app'
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/admin', '/api/', '/poruke', '/oglasi/novi', '/oglasi/*/uredi'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
