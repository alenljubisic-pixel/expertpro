import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ArrowRight } from 'lucide-react'
import { BLOG_POSTS, BLOG_UPDATED_AT } from '@/lib/blog-posts'

export const metadata: Metadata = {
  title: 'Blog — lokalni vodiči za poslove i usluge',
  description: 'Praktični vodiči za pronalaženje majstora, pomoći u kući, čuvanja ljubimaca i kratkoročnih ili dugoročnih radnika u Srbiji.',
  alternates: { canonical: 'https://www.expertpro.app/blog' },
  openGraph: { title: 'Lokalni vodiči za poslove i usluge', description: 'Praktični saveti za usluge i radnike po gradovima Srbije.', url: 'https://www.expertpro.app/blog', type: 'website' },
}

const groups = [
  { title: 'Majstori i dom', categories: ['Majstori', 'Dom', 'Renoviranje', 'Dvorište', 'Selidbe'] },
  { title: 'Porodica i ljubimci', categories: ['Nega i pomoć', 'Ljubimci', 'Porodica', 'Porodica i ljubimci'] },
  { title: 'Radnici i angažmani', categories: ['Radnici', 'Dugoročni rad', 'Vodič', 'Rad od kuće', 'Hitno', 'Kratki poslovi'] },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Lokalni vodiči za posao i usluge</h1>
          <p className="text-gray-600 max-w-3xl">Kako da opišete problem, uporedite ponude i dogovorite posao — od popravke bojlera i čuvanja psa do višednevnog angažovanja radnika. Tekstovi su ažurirani u 2026.</p>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-12">
        {groups.map(group => {
          const posts = BLOG_POSTS.filter(post => group.categories.includes(post.category))
          if (!posts.length) return null
          return (
            <section key={group.title} aria-label={group.title}>
              <h2 className="text-2xl font-bold text-gray-900 mb-5">{group.title}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map(post => (
                  <article key={post.slug} className="bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                    <Link href={`/blog/${post.slug}`} className="block h-full p-6">
                      <div className="text-4xl mb-4" aria-hidden="true">{post.icon}</div>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                        <span className="rounded-full bg-blue-50 text-blue-700 px-2 py-1">{post.category}</span>
                        {post.city && <span className="rounded-full bg-gray-100 px-2 py-1">{post.city}</span>}
                      </div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-2 leading-snug">{post.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed mb-4">{post.excerpt}</p>
                      <span className="text-sm text-blue-700 font-medium inline-flex items-center gap-1">Pročitaj vodič <ArrowRight className="w-4 h-4" /></span>
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          )
        })}
        <p className="text-xs text-gray-500">Svi vodiči ažurirani <time dateTime={BLOG_UPDATED_AT}>1. oktobra 2026.</time> Cene i dostupnost dogovaraju korisnici za svaki konkretan posao.</p>
      </main>
      <Footer />
    </div>
  )
}
