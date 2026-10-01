import type { Metadata } from 'next'
import WorkLanding from '@/components/seo/WorkLanding'

export const metadata: Metadata = {
  title: 'Dugoročni poslovi i angažovanje radnika u Srbiji',
  description: 'Oglasi za rad na više dana, sezonski angažman, rad na određeno i stalno zaposlenje. Objavi potrebu za radnikom ili ponudu slobodnog tima.',
  alternates: { canonical: '/dugorocni-poslovi' },
  openGraph: { title: 'Dugoročni poslovi u Srbiji', description: 'Aktivni višednevni, sezonski i stalni angažmani radnika.', url: '/dugorocni-poslovi' },
}

export default function LongWorkPage() {
  return <WorkLanding mode="long" />
}
