import Link from 'next/link'
import { Zap } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-lg">ExpertPro</span>
            </Link>
            <p className="text-sm leading-relaxed">
              Platforma za honorarne poslove i usluge u Srbiji. Poveži se sa poslodavcima i radnicima.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Oglasi</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/oglasi?type=request" className="hover:text-white transition-colors">Tražim radnika</Link></li>
              <li><Link href="/oglasi?type=offer" className="hover:text-white transition-colors">Nudim uslugu</Link></li>
              <li><Link href="/oglasi?type=urgent" className="hover:text-white transition-colors">🚨 Hitna berza</Link></li>
              <li><Link href="/radnici" className="hover:text-white transition-colors">Profili radnika</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Platforme</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/register?type=individual" className="hover:text-white transition-colors">Za fizička lica</Link></li>
              <li><Link href="/register?type=company" className="hover:text-white transition-colors">Za firme</Link></li>
              <li><Link href="/register?type=agency" className="hover:text-white transition-colors">Za agencije</Link></li>
              <li><Link href="/cenovnik" className="hover:text-white transition-colors">Cenovnik</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Kompanija</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/o-nama" className="hover:text-white transition-colors">O nama</Link></li>
              <li><Link href="/kontakt" className="hover:text-white transition-colors">Kontakt</Link></li>
              <li><Link href="/uslovi" className="hover:text-white transition-colors">Uslovi korišćenja</Link></li>
              <li><Link href="/privatnost" className="hover:text-white transition-colors">Politika privatnosti</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm">© 2026 ExpertPro. Sva prava zadržana.</p>
          <p className="text-sm">Napravljeno u Srbiji 🇷🇸</p>
        </div>
      </div>
    </footer>
  )
}
