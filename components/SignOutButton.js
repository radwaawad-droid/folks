'use client'
import { createClient } from '@/utils/supabase/client'

export default function SignOutButton() {
  const supabase = createClient()
  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }
  return <button className="linkish" onClick={signOut}>Sign out</button>
}
