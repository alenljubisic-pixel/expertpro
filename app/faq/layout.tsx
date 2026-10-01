import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Česta pitanja',
  description: 'Odgovori na pitanja o objavljivanju oglasa, prijavama, kreditima, izboru kandidata i korišćenju ExpertPro platforme.',
  alternates: { canonical: 'https://www.expertpro.app/faq' },
  openGraph: { title: 'Česta pitanja | ExpertPro', description: 'Odgovori o oglasima, prijavama i kreditima.', url: 'https://www.expertpro.app/faq' },
}

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children
}
