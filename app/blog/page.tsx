import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Calendar, Clock, ChevronRight } from 'lucide-react'

export const metadata = {
  title: 'Blog — ExpertPro | Saveti za honorarni posao i zaradu u Srbiji',
  description: 'Saveti, vodiči i korisni tekstovi o honorarnom radu, radu od kuće i dodatnoj zaradi u Srbiji.',
}

const POSTS = [
  {
    slug: 'kako-naci-honorarni-posao-u-srbiji',
    title: 'Kako naći honorarni posao u Srbiji — kompletan vodič za 2025.',
    excerpt: 'Honorarni posao je sve popularniji u Srbiji. Otkrijte gde tražiti kratkotrajna zapošljavanja, kako se predstaviti poslodavcima i koje veštine su trenutno najtraženije.',
    date: '2025-06-10',
    readTime: '7 min',
    category: 'Vodič',
    image: '💼',
  },
  {
    slug: 'rad-od-kuce-opcije-srbija',
    title: '10 najpopularnijih poslova od kuće u Srbiji — radite kada hoćete',
    excerpt: 'Od frilenserskog pisanja i prevođenja do IT podrške i onlajn tutoringa — evo najtraženijih poslova koje možete raditi od kuće bez napuštanja grada.',
    date: '2025-06-18',
    readTime: '6 min',
    category: 'Rad od kuće',
    image: '🏠',
  },
  {
    slug: 'kako-zaraditi-dodatni-novac',
    title: 'Kako zaraditi dodatni novac pored redovnog posla — 15 provjerenih načina',
    excerpt: 'Redovna plata nije uvek dovoljna. Otkrijte realne načine da povećate prihode bez napuštanja stalnog posla, uz fleksibilno radno vreme i poslove po vašoj meri.',
    date: '2025-07-01',
    readTime: '8 min',
    category: 'Finansije',
    image: '💰',
  },
  {
    slug: 'jednodnevni-angazmani-srbija',
    title: 'Jednodnevni angažmani — zašto su budućnost tržišta rada u Srbiji',
    excerpt: 'Trend kratkih i hitnih angažmana sve više raste. Firme traže radnike "odmah", a radnici biraju kada i koliko rade. Kako iskoristiti ovaj trend?',
    date: '2025-07-15',
    readTime: '5 min',
    category: 'Trendovi',
    image: '⚡',
  },
  {
    slug: 'cuvanje-dece-i-ljubimaca-posao',
    title: 'Čuvanje dece i kućnih ljubimaca — posao koji se uvek isplati',
    excerpt: 'Babysitting, šetanje pasa, pet-siting — potražnja za ovim uslugama konstantno raste. Saznajte kako da počnete, koliko možete zaraditi i šta poslodavci traže.',
    date: '2025-07-22',
    readTime: '5 min',
    category: 'Usluge',
    image: '🐾',
  },
  {
    slug: 'freelancing-u-srbiji-vodic',
    title: 'Frilenserski rad u Srbiji — praktični vodič od nule do prvog klijenta',
    excerpt: 'Kako registrovati freelance delatnost, naći prve klijente, ugovoriti posao i bezbedno primiti uplatu — sve što treba da znate za početak.',
    date: '2025-08-05',
    readTime: '10 min',
    category: 'Freelancing',
    image: '🖥️',
  },
  {
    slug: 'hitni-poslovi-srbija',
    title: 'Hitni poslovi u Srbiji — kako reagovati brzo i zaraditi',
    excerpt: 'Hitne intervencije, noćne smene, vikend angažmani — hitni poslovi plaćaju bolje, ali zahtevaju brzu reakciju. Saznajte kako se pozicionirati kao pouzdan radnik.',
    date: '2025-08-12',
    readTime: '4 min',
    category: 'Saveti',
    image: '🚨',
  },
  {
    slug: 'fizicki-radnici-srbija',
    title: 'Tražnja za fizičkim radnicima u Srbiji nikad nije bila veća — evo zašto',
    excerpt: 'Građevina, magacini, selidbe, pomoćni radnici — manuelni rad je deficitaran i dobro plaćen. Koji profili su najpopularniji i gde ih tražiti?',
    date: '2025-08-18',
    readTime: '5 min',
    category: 'Trendovi',
    image: '🏗️',
  },
]

const CATEGORY_COLORS: Record<string, string> = {
  'Vodič': 'bg-blue-100 text-blue-700',
  'Rad od kuće': 'bg-green-100 text-green-700',
  'Finansije': 'bg-yellow-100 text-yellow-700',
  'Trendovi': 'bg-purple-100 text-purple-700',
  'Usluge': 'bg-pink-100 text-pink-700',
  'Freelancing': 'bg-indigo-100 text-indigo-700',
  'Saveti': 'bg-orange-100 text-orange-700',
}

export default function BlogPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Blog — Saveti i vodiči</h1>
          <p className="text-gray-500 max-w-2xl">
            Korisni tekstovi o honorarnom radu, radu od kuće i dodatnoj zaradi u Srbiji.
            Ostanite u toku sa trendovima tržišta rada.
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Featured post */}
        <div className="mb-10">
          <Link href={`/blog/${POSTS[0].slug}`} className="block bg-white rounded-2xl border border-gray-100 hover:shadow-lg transition-all overflow-hidden">
            <div className="p-8 sm:flex sm:gap-8 items-center">
              <div className="text-7xl mb-6 sm:mb-0 sm:flex-shrink-0">{POSTS[0].image}</div>
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${CATEGORY_COLORS[POSTS[0].category] || 'bg-gray-100 text-gray-700'}`}>
                    {POSTS[0].category}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{POSTS[0].date}</span>
                  <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{POSTS[0].readTime}</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{POSTS[0].title}</h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{POSTS[0].excerpt}</p>
                <span className="text-blue-600 font-medium text-sm flex items-center gap-1">
                  Čitaj više <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {POSTS.slice(1).map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="block bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all overflow-hidden">
              <div className="p-6">
                <div className="text-4xl mb-4">{post.image}</div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[post.category] || 'bg-gray-100 text-gray-700'}`}>
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-400">{post.readTime}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-snug">{post.title}</h3>
                <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">{post.excerpt}</p>
              </div>
              <div className="px-6 pb-4">
                <span className="text-blue-600 text-xs font-medium flex items-center gap-1">
                  Čitaj više <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
