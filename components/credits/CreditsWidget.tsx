'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Coins, ChevronDown, Zap, Crown, Gift } from 'lucide-react'

interface Props {
  balance: number
  accountType?: string | null
}

export default function CreditsWidget({ balance, accountType }: Props) {
  const [open, setOpen] = useState(false)
  const isBusiness = accountType === 'company' || accountType === 'agency'

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
              <Coins className="w-4.5 h-4.5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Tvoji krediti</p>
              <p className="text-xl font-bold text-gray-900 leading-tight">{balance ?? 0}</p>
            </div>
          </div>
          <Link
            href="/krediti"
            className="flex-shrink-0 bg-amber-500 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-amber-600 transition-colors"
          >
            Dopuni
          </Link>
        </div>

        {balance <= 1 && (
          <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mt-3">
            {balance === 0
              ? 'Ostao si bez kredita — dodatni oglas ili hitna objava trenutno nije moguća bez dopune.'
              : 'Ostao ti je samo 1 kredit. Dopuni na vreme da ne propustiš priliku da objaviš hitan oglas.'}
          </p>
        )}

        <button
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between text-xs text-gray-500 hover:text-gray-700 mt-3 pt-3 border-t border-gray-50"
        >
          <span>Šta su krediti i zašto bi trebalo da ih imam?</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {open && (
        <div className="px-5 pb-5 -mt-2 space-y-4 text-xs text-gray-600">
          <div>
            <p className="font-semibold text-gray-800 mb-1.5 flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-green-500" /> Šta dobijaš gratis
            </p>
            <ul className="space-y-1 ml-5 list-disc">
              <li>2 kredita odmah pri registraciji — probaj Hitnu berzu bez uplate.</li>
              <li>1 aktivan oglas (bilo koje rubrike) uvek besplatno, trajno.</li>
              {isBusiness && (
                <li>+10 kredita gratis kad ti se odobri puno članstvo (firma/agencija).</li>
              )}
            </ul>
          </div>

          <div>
            <p className="font-semibold text-gray-800 mb-1.5 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-blue-500" /> Kad se troši 1 kredit
            </p>
            <ul className="space-y-1 ml-5 list-disc">
              <li>Svaki hitan oglas (Hitna berza) — jer se hitni oglasi ističu i traže brzu reakciju, pa je namerno ograničeno da lista ne bi bila preplavljena.</li>
              <li>Svaki dodatni oglas preko prvog besplatnog — bez obzira da li je u istoj ili drugoj rubrici.</li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-red-50 border border-amber-100 rounded-lg p-3">
            <p className="font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-500" /> Zašto da uplatiš
            </p>
            <p className="text-gray-600 leading-relaxed">
              Što pre reaguješ na posao, veća je šansa da te izaberu — poslodavci prvo zovu
              one koje prvo vide. Dopunom kredita brže objavljuješ hitne i dodatne oglase, a
              uz Istaknut/Gold ({' '}
              <Link href="/cenovnik" className="underline font-medium text-amber-700">pogledaj cene</Link>
              {' '}) ideš i na vrh liste, dobijaš značku i ulaziš u uži izbor kad neko traži baš
              tvoju vrstu posla — bilo da nudiš uslugu ili tražiš radnika.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
