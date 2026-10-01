import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'

type Mode = 'short' | 'long'

const content = {
  short: {
    eyebrow: 'Kratkoročni poslovi',
    title: 'Posao za danas, vikend ili nekoliko sati',
    intro: 'Treba ti pomoć za konkretan zadatak ili imaš slobodno vreme i želiš dodatnu zaradu? Na ExpertPro možeš objaviti posao, pregledati prijave i izabrati saradnika za taj oglas.',
    listTitle: 'Otvoreni kratkoročni poslovi',
    listHref: '/oglasi?type=request&mode=short_job',
    examples: ['Selidba i utovar', 'Sitne popravke i montaža', 'Čišćenje i pomoć u kući', 'Ispomoć u magacinu ili na događaju'],
    forClients: 'Opiši šta treba uraditi, grad, željeni termin i okvirnu cenu. Kandidati se prijavljuju uz poruku i, po želji, svoju ponudu. Tek kada odabereš kandidata, dogovor prelazi u saradnju za taj posao.',
    forWorkers: 'Ako si slobodan posle posla, pre podne ili vikendom, pregledaj aktuelne zahteve. Možeš i objaviti sopstvenu ponudu usluge sa raspoloživim danima, satnicom ili cenom po dogovoru.',
  },
  long: {
    eyebrow: 'Dugoročni angažmani',
    title: 'Radnik na više dana, meseci ili za stalno',
    intro: 'Kada jedan dan nije dovoljan, objavi potrebu za višednevnim, sezonskim ili stalnim angažmanom. Firme, agencije i pojedinci mogu opisati stvarne uslove, trajanje i lokaciju, a kandidati se prijavljuju na konkretan oglas.',
    listTitle: 'Otvoreni dugoročni angažmani',
    listHref: '/oglasi?type=request&mode=long',
    examples: ['Pomoćni radnici na više dana', 'Sezonski rad i rad na određeno', 'Ispomoć u proizvodnji i magacinu', 'Stalno zaposlenje'],
    forClients: 'Navedi koliko ljudi ti treba, početak, broj dana ili meseci, grad, radno vreme i naknadu ako je poznata. Ako firma ili agencija ima slobodan tim, može objaviti ponudu usluge sa brojem raspoloživih ljudi i uslovima.',
    forWorkers: 'Ako tražiš duži angažman, filtriraj aktivne oglase po gradu i trajanju. Ako već imaš radno mesto, ali želiš dodatnu zaradu, odvojen kratkoročni oglas bolje opisuje tvoju dostupnost.',
  },
} as const

export default async function WorkLanding({ mode }: { mode: Mode }) {
  const copy = content[mode]
  const supabase = await createClient()
  let query = supabase
    .from('listings')
    .select('id, title, city, description, created_at, engagement_mode')
    .eq('status', 'active')
    .in('type', ['request', 'urgent'])
    .order('created_at', { ascending: false })
    .limit(6)

  query = mode === 'short'
    ? query.eq('engagement_mode', 'short_job')
    : query.in('engagement_mode', ['multi_day', 'fixed_term', 'permanent'])

  const { data: listings } = await query

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <section className="bg-blue-700 text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
            <p className="text-blue-100 font-semibold mb-3">{copy.eyebrow} u Srbiji</p>
            <h1 className="text-3xl sm:text-5xl font-bold max-w-3xl leading-tight">{copy.title}</h1>
            <p className="text-lg text-blue-100 mt-5 max-w-3xl leading-relaxed">{copy.intro}</p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link href="/oglasi/novi?type=request" className="rounded-lg bg-white text-blue-800 px-5 py-3 font-semibold hover:bg-blue-50">Objavi potrebu za radnikom</Link>
              <Link href={copy.listHref} className="rounded-lg border border-blue-200 px-5 py-3 font-semibold hover:bg-blue-600">Pogledaj aktivne oglase</Link>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="text-2xl font-bold text-gray-900">Za šta se koristi ova berza?</h2>
          <ul className="grid sm:grid-cols-2 gap-3 mt-6">
            {copy.examples.map(example => <li key={example} className="bg-white rounded-xl border border-gray-200 p-4 text-gray-700">{example}</li>)}
          </ul>
          <div className="grid md:grid-cols-2 gap-5 mt-10">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Ako tražiš radnika</h2>
              <p className="text-gray-700 leading-relaxed">{copy.forClients}</p>
              <Link href="/oglasi/novi?type=request" className="inline-block text-blue-700 font-semibold mt-5 hover:underline">Objavi oglas →</Link>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Ako nudiš svoj rad ili slobodan tim</h2>
              <p className="text-gray-700 leading-relaxed">{copy.forWorkers}</p>
              <Link href="/oglasi/novi?type=offer" className="inline-block text-blue-700 font-semibold mt-5 hover:underline">Objavi ponudu usluge →</Link>
            </div>
          </div>
        </section>

        <section className="bg-white border-y border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
            <div className="flex flex-wrap justify-between items-end gap-3 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{copy.listTitle}</h2>
                <p className="text-gray-600 mt-1">Prikazuju se samo stvarni, trenutno aktivni oglasi.</p>
              </div>
              <Link href={copy.listHref} className="text-blue-700 font-semibold hover:underline">Svi oglasi i filteri →</Link>
            </div>
            {listings?.length ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {listings.map(listing => (
                  <Link key={listing.id} href={`/oglasi/${listing.id}`} className="block rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm">
                    <h3 className="font-semibold text-gray-900">{listing.title}</h3>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{listing.description || 'Pogledaj detalje i uslove oglasa.'}</p>
                    <p className="text-sm text-blue-700 mt-4">{listing.city}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="bg-blue-50 rounded-xl p-5 text-gray-700">Trenutno nema aktivnih oglasa u ovom trajanju. Možeš objaviti prvi konkretan zahtev.</p>
            )}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 text-gray-700 leading-relaxed">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Kako ostati u toku?</h2>
          <p>Oglasi su vezani za grad i konkretan zadatak. Proveri naslov, opis, datum, trajanje i uslove pre prijave. Razgovor i ocenjivanje vezani su za dodeljen posao; sama objava oglasa ne znači da je saradnja ili zaposlenje već dogovoreno.</p>
          <p className="mt-4">Za drugačije trajanje pogledaj <Link href={mode === 'short' ? '/dugorocni-poslovi' : '/kratkorocni-poslovi'} className="text-blue-700 underline">{mode === 'short' ? 'dugoročne angažmane' : 'kratkoročne poslove'}</Link>. Za stalni ili rad na određeno, formalne uslove rada i pravo na rad proveravaju strane koje zaključuju angažman; ExpertPro služi za objavu i povezivanje.</p>
        </section>
      </main>
      <Footer />
    </div>
  )
}
