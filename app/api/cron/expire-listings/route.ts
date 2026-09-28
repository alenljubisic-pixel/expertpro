import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Runs once a day (see vercel.json). Flips listings whose expires_at has
// passed from 'active' to 'expired', via a SECURITY DEFINER Postgres
// function so no service_role key is needed here.
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase.rpc('expire_old_listings')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { error: promoError } = await supabase.rpc('demote_expired_promotions')

  return NextResponse.json({
    expired: data ?? 0,
    promotionsDemoteError: promoError ? promoError.message : null,
  })
}
