import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const requestedNext = requestUrl.searchParams.get('next') || '/dashboard'
  const next = requestedNext === '/nova-lozinka' ? requestedNext : '/dashboard'
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
        .select('type, name, avatar_url')
        .eq('id', sessionData.user.id)
        .single()

      const oauthAvatar =
        sessionData.user.user_metadata?.avatar_url ||
        sessionData.user.user_metadata?.picture ||
        null

      // Google/Facebook nalog garantuje da je email/identitet već potvrđen
      // kod tog provajdera — ne treba nam dodatna email verifikacija na
      // sajtu, pa novom nalogu odmah damo "verifikovan" bedž.
      const provider = sessionData.user.app_metadata?.provider
      const isTrustedOAuth = provider === 'google' || provider === 'facebook'

      if (!profile || !profile.type) {
        await supabase.from('profiles').upsert({
          id: sessionData.user.id,
          email: sessionData.user.email,
          name: sessionData.user.user_metadata?.full_name || sessionData.user.user_metadata?.name || '',
          avatar_url: oauthAvatar,
          type: 'individual',
          is_approved: true,
          is_verified: isTrustedOAuth,
        }, { onConflict: 'id' })

        return NextResponse.redirect(`${origin}/dashboard/profile?setup=true`)
      }

      // Postojeći profil (npr. napravljen pre uvođenja avatara, ili je korisnik
      // originalno registrovan email/lozinkom pa se sada prvi put uloguje i preko
      // Google/Facebook naloga sa istim emailom) — dopuni sliku ako je nema,
      // ali nikad ne prepisuj sliku koju je korisnik sam ručno postavio.
      if (!profile.avatar_url && oauthAvatar) {
        await supabase
          .from('profiles')
          .update({ avatar_url: oauthAvatar })
          .eq('id', sessionData.user.id)
      }

      // NAPOMENA: is_verified se namerno NE dopunjava ovde za postojeće
      // profile — trg_prevent_privilege_escalation trigger tiho poništava
      // svaki pokušaj korisnika da sam sebi podigne is_verified (isto pravilo
      // kao za is_admin), pa čak i ovaj server-side kod (koji radi u ime
      // ulogovanog korisnika, ne kao service_role) ne bi uspeo. Postojeći
      // Google/Facebook nalozi koji su napravljeni PRE ove izmene se
      // jednokratno dopunjuju preko supabase/migration_verify_oauth_backfill.sql
      // (Alen pokreće ručno).
    }
  }

  return NextResponse.redirect(new URL(next, origin))
}
