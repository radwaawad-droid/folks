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
  }
  return NextResponse.redirect(`${origin}${next}`)
}
