import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

// Handles the redirect from Google OAuth, email confirmation, and password-reset
// links. Exchanges the one-time code for a session, then sends the user on.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/onboarding'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return NextResponse.redirect(`${origin}/?auth_error=1`)
    }
    // Keep the notification email in lockstep with the sign-in email. This also
    // lands the final step of an email change: the confirmation link comes
    // through here, so notify_email picks up the new address automatically.
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        await supabase.from('profiles')
          .update({ notify_email: user.email.toLowerCase() })
          .eq('id', user.id)
      }
    } catch (_) { /* best-effort */ }
  }
  return NextResponse.redirect(`${origin}${next}`)
}
