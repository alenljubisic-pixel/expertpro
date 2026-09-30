import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { reportMonth } from '@/lib/report-month'

type MonthlyStats = {
  id: string
  listings_posted: number
  completed_as_worker: number
  completed_as_client: number
  credits_paid_total: number
  promotions_paid_total: number
  credits_pending_total: number
  promotions_pending_total: number
}

function csv(value: unknown): string {
  const raw = String(value ?? '')
  const safe = /^[\s]*[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw
  return `"${safe.replaceAll('"', '""')}"`
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Potrebna je prijava.' }, { status: 401 })

  const { data: admin } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!admin?.is_admin) return NextResponse.json({ error: 'Zabranjeno.' }, { status: 403 })

  const month = reportMonth(request.nextUrl.searchParams.get('month') ?? undefined)
  const rows = [
    ['ID', 'Ime', 'Email', 'Tip naloga', 'Grad', 'Verifikovan', 'Odobren', 'Aktivan',
      'Krediti sada', 'Oglasi u mesecu', 'Zavrseno kao izvodjac', 'Zavrseno kao klijent',
      'Uplaceno krediti RSD', 'Uplaceno promocije RSD', 'Na cekanju krediti RSD', 'Na cekanju promocije RSD'],
  ]

  for (let offset = 0; ; offset += 100) {
    const { data: users, error } = await supabase.from('profiles')
      .select('id,name,email,type,city,is_verified,is_approved,is_active,credit_balance')
      .order('id').range(offset, offset + 99)
    if (error) return NextResponse.json({ error: 'Izvoz nije uspeo.' }, { status: 500 })
    if (!users?.length) break

    const { data: stats, error: statsError } = await supabase.rpc('admin_get_user_stats_monthly', {
      p_user_ids: users.map(u => u.id), p_month: `${month}-01`,
    })
    if (statsError) return NextResponse.json({ error: 'Izvoz statistike nije uspeo.' }, { status: 500 })
    const byId = new Map<string, MonthlyStats>((stats || []).map((s: MonthlyStats) => [s.id, s]))

    for (const u of users) {
      const s = byId.get(u.id)
      rows.push([
        u.id, u.name ?? '', u.email ?? '', u.type ?? '', u.city ?? '',
        String(!!u.is_verified), String(!!u.is_approved), String(!!u.is_active),
        String(u.credit_balance ?? 0), String(s?.listings_posted ?? 0),
        String(s?.completed_as_worker ?? 0), String(s?.completed_as_client ?? 0),
        String(s?.credits_paid_total ?? 0), String(s?.promotions_paid_total ?? 0),
        String(s?.credits_pending_total ?? 0), String(s?.promotions_pending_total ?? 0),
      ])
    }
    if (users.length < 100) break
  }

  return new NextResponse(`\uFEFF${rows.map(row => row.map(csv).join(';')).join('\r\n')}\r\n`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="expertpro-korisnici-${month}.csv"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
