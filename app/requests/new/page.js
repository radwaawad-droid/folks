import { redirect } from 'next/navigation'
import Nav from '@/components/Nav'
import NewRequestForm from '@/components/NewRequestForm'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export default async function NewRequestPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('profiles').select('community_id, full_name').eq('id', user.id).maybeSingle()
  if (!profile?.full_name) redirect('/')

  let communityId = profile.community_id
  if (!communityId) {
    const { data: c } = await supabase.from('communities').select('id').eq('name', 'Arabian Ranches').maybeSingle()
    communityId = c?.id || null
  }

  return (
    <>
      <Nav />
      <main className="container page">
        <a href="/requests" className="linkish">← Back to wanted</a>
        <h1 className="sec-title" style={{ marginTop: 12 }}>Post a request</h1>
        <p className="muted-sub">Tell neighbours what you’re looking for — they’ll reply if they have it.</p>
        <NewRequestForm communityId={communityId} />
      </main>
    </>
  )
}
