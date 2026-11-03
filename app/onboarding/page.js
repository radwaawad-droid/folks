import { redirect } from 'next/navigation'
import OnboardingForm from '@/components/OnboardingForm'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export default async function OnboardingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('profiles').select('full_name, sub_area, banned').eq('id', user.id).maybeSingle()

  if (profile?.banned) redirect('/suspended')
  if (profile?.full_name && profile?.sub_area) redirect('/browse')

  const meta = user.user_metadata || {}
  const defaultName = profile?.full_name || meta.full_name || meta.name || ''

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
