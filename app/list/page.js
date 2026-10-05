import { redirect } from 'next/navigation'
import Nav from '@/components/Nav'
import ListItemForm from '@/components/ListItemForm'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export default async function ListPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('full_name, community_id').eq('id', user.id).maybeSingle()
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
        <h1 className="browse-head" style={{ marginBottom: 6 }}>List an item</h1>
        <p className="muted-sub">Share something useful with your neighbours — it takes about a minute.</p>
        <ListItemForm communityId={communityId} />
      </main>
    </>
  )
}
