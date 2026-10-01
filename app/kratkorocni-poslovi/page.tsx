import type { Metadata } from 'next'
import WorkLanding from '@/components/seo/WorkLanding'

export const metadata: Metadata = {
  title: 'Kratkoročni poslovi i dodatna zarada u Srbiji',
  description: 'Pronađi ili objavi jednokratan posao za danas, vikend ili nekoliko sati: selidbe, popravke, čišćenje i ispomoć. Aktivni oglasi po gradovima Srbije.',
  alternates: { canonical: '/kratkorocni-poslovi' },
  openGraph: { title: 'Kratkoročni poslovi u Srbiji', description: 'Aktivni jednokratni poslovi i dodatna zarada po gradovima Srbije.', url: '/kratkorocni-poslovi' },
}

export default function ShortWorkPage() {
  return <WorkLanding mode="short" />
}
