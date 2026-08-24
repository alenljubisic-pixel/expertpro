import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'
  const origin = requestUrl.origin

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: sessionData } = await supabase.auth.exchangeCodeForSession(code)

    if (sessionData?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('type, name')
        .eq('id', sessionData.user.id)
        .single()

      if (!profile || !profile.type) {
        await supabase.from('profiles').upsert({
          id: sessionData.user.id,
          email: sessionData.user.email,
          name: sessionData.user.user_metadata?.full_name || sessionData.user.user_metadata?.name || '',
          avatar_url: sessionData.user.user_metadata?.avatar_url || sessionData.user.user_metadata?.picture || null,
          type: 'individual',
          is_approved: true,
        }, { onConflict: 'id' })

        return NextResponse.redirect(`${origin}/dashboard/profile?setup=true`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}
