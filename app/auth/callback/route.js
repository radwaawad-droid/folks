import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

// Handles the redirect from Google OAuth, email confirmation, and password-reset
// links. Exchanges the one-time code for a session, then sends the user on.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const nextParam = searchParams.get('next')          // set for password-reset / email-change
  const next = nextParam || '/onboarding'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return NextResponse.redirect(`${origin}/?auth_error=1`)
    }

    const { data: { user } } = await supabase.auth.getUser()

    // Keep the notification email in lockstep with the sign-in email. This also
    // lands the final step of an email change: the confirmation link comes
    // through here, so notify_email picks up the new address automatically.
    try {
      if (user?.email) {
        await supabase.from('profiles')
          .update({ notify_email: user.email.toLowerCase() })
          .eq('id', user.id)
      }
    } catch (_) { /* best-effort */ }

    // Fresh e-mail sign-up confirmation (provider "email", profile not set up yet,
    // and no explicit next — so password-reset/email-change are untouched): the
    // account is now verified, but we want the member to sign in themselves.
    // Drop the auto-created session and send them to the sign-in page.
    if (!nextParam && user?.app_metadata?.provider === 'email') {
      let profileReady = false
      try {
        const { data: prof } = await supabase
          .from('profiles').select('full_name').eq('id', user.id).maybeSingle()
        profileReady = !!prof?.full_name
      } catch (_) {}
      if (!profileReady) {
        try { await supabase.auth.signOut() } catch (_) {}
        return NextResponse.redirect(`${origin}/?verified=1`)
      }
    }
  }
  return NextResponse.redirect(`${origin}${next}`)
}
