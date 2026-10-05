import { redirect } from 'next/navigation'
import Nav from '@/components/Nav'
import EditProfileForm from '@/components/EditProfileForm'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export default async function EditProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).maybeSingle()
  if (!profile?.full_name) redirect('/')

  return (
    <>
      <Nav />
      <main className="container page">
        <a href="/profile" className="linkish">← Back to profile</a>
        <h1 className="sec-title" style={{ marginTop: 12 }}>Edit profile</h1>
        <EditProfileForm profile={{
          full_name: profile.full_name, sub_area: profile.sub_area || '',
          avatar_url: profile.avatar_url || null, username: profile.username,
        }} />
      </main>
    </>
  )
}
