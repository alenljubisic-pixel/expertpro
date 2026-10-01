import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { BLOG_POSTS, BLOG_POST_BY_SLUG, BLOG_UPDATED_AT } from '@/lib/blog-posts'

type Props = { params: Promise<{ slug: string }> }
const BASE = 'https://www.expertpro.app'

function renderContent(content: string) {
  return content.trim().split(/\n\s*\n/).map((block, index) => {
    if (block.startsWith('## ')) return <h2 key={index} className="text-2xl font-bold text-gray-900 mt-9 mb-4">{block.slice(3)}</h2>
    if (block.startsWith('### ')) return <h3 key={index} className="text-xl font-semibold text-gray-900 mt-7 mb-3">{block.slice(4)}</h3>
    if (block.startsWith('- ')) return <ul key={index} className="list-disc pl-6 space-y-2 mb-5 text-gray-700">{block.split('\n').map((item, i) => <li key={i}>{item.replace(/^- /, '')}</li>)}</ul>
    return <p key={index} className="mb-5 text-gray-700 leading-7">{block}</p>
  })
}

export function generateStaticParams() {
  return BLOG_POSTS.map(post => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = BLOG_POST_BY_SLUG[slug]
  if (!post) return {}
  const url = `${BASE}/blog/${post.slug}`
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: 'article', title: post.title, description: post.excerpt,
      url, siteName: 'ExpertPro', locale: 'sr_RS',
      publishedTime: BLOG_UPDATED_AT, modifiedTime: BLOG_UPDATED_AT,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = BLOG_POST_BY_SLUG[slug]
  if (!post) notFound()

  const url = `${BASE}/blog/${post.slug}`
  const schema = {
    '@context': 'https://schema.org', '@type': 'BlogPosting',
    headline: post.title, description: post.excerpt,
    datePublished: BLOG_UPDATED_AT, dateModified: BLOG_UPDATED_AT,
    inLanguage: 'sr-RS', mainEntityOfPage: url,
    author: { '@type': 'Organization', name: 'ExpertPro' },
    publisher: { '@type': 'Organization', name: 'ExpertPro', url: BASE },
  }
  const related = BLOG_POSTS.filter(item => item.slug !== slug && (item.category === post.category || (post.city && item.city === post.city))).slice(0, 3)

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
      <main className="flex-1">
        <header className="bg-white border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-blue-700 hover:underline mb-6"><ArrowLeft className="w-4 h-4" /> Svi vodiči</Link>
            <div className="text-5xl mb-4" aria-hidden="true">{post.icon}</div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-4">
              <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">{post.category}</span>
              {post.city && <span>{post.city}</span>}
              <time dateTime={BLOG_UPDATED_AT}>Ažurirano 1. oktobra 2026.</time>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{post.title}</h1>
            <p className="text-gray-600 mt-4">{post.excerpt}</p>
          </div>
        </header>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <article className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">{renderContent(post.content)}</article>
          <aside className="mt-8 bg-blue-700 rounded-2xl p-8 text-white">
            <h2 className="text-xl font-bold mb-2">{post.audience === 'worker' ? 'Tražiš sledeći angažman?' : 'Treba ti pomoć za konkretan posao?'}</h2>
            <p className="text-blue-100 mb-5 text-sm">{post.audience === 'worker' ? 'Pogledaj aktivne zahteve, uslove i grad pre nego što se prijaviš.' : 'Pregledaj ponude u svom gradu ili objavi zahtev sa jasnim opisom, terminom i budžetom.'}</p>
            <div className="flex flex-wrap gap-3">
              <Link href={post.searchHref} className="inline-flex items-center gap-2 bg-white text-blue-700 px-5 py-3 rounded-xl font-semibold hover:bg-blue-50">{post.audience === 'worker' ? 'Pogledaj poslove' : 'Pregledaj oglase'} <ArrowRight className="w-4 h-4" /></Link>
              <Link href={post.audience === 'worker' ? '/register' : '/oglasi/novi'} className="inline-flex items-center rounded-xl border border-white px-5 py-3 font-semibold hover:bg-blue-800">{post.audience === 'worker' ? 'Napravi nalog' : 'Objavi zahtev'}</Link>
            </div>
          </aside>
          {related.length > 0 && <section className="mt-10">
            <h2 className="font-bold text-xl text-gray-900 mb-4">Povezani vodiči</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{related.map(item => <Link key={item.slug} href={`/blog/${item.slug}`} className="block bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow"><span className="text-2xl" aria-hidden="true">{item.icon}</span><span className="block text-sm font-medium text-gray-900 mt-2">{item.title}</span></Link>)}</div>
          </section>}
        </div>
      </main>
      <Footer />
    </div>
  )
}
