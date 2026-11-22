import { redirect } from 'next/navigation'
import OnboardingForm from '@/components/OnboardingForm'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export default async function OnboardingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('profiles').select('full_name, sub_area, banned, avatar_url').eq('id', user.id).maybeSingle()

  if (profile?.banned) redirect('/suspended')
  if (profile?.full_name && profile?.sub_area) redirect('/browse')

  const meta = user.user_metadata || {}
  const defaultName = profile?.full_name || meta.full_name || meta.name || ''
  const metaName = defaultName.trim()
  const metaArea = (profile?.sub_area || meta.sub_area || '').trim()

  // If we already know the name AND community (e.g. from the email sign-up form),
  // create the profile silently and skip this step — no need to ask twice.
  if (metaName && metaArea) {
    const { data: comm } = await supabase
      .from('communities').select('id').eq('name', 'Arabian Ranches').maybeSingle()
    const { error: upErr } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: metaName,
      sub_area: metaArea,
      notify_email: (user.email || '').toLowerCase() || null,
      avatar_url: profile?.avatar_url || meta.avatar_url || meta.picture || null,
      community_id: comm?.id || null,
      phone_verified: true,
      resident_verified: true,
    })
    if (!upErr) redirect('/browse')
    // If that write failed for any reason, fall through and show the form.
  }

  return (
    <main className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">folks <span className="d" /></div>
        <p className="auth-tag">One quick step to join your neighbours.</p>
        <OnboardingForm defaultName={defaultName} />
      </div>
    </main>
  )
}
