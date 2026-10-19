import { redirect } from 'next/navigation'
import Nav from '@/components/Nav'
import FeedbackForm from '@/components/FeedbackForm'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export default async function FeedbackPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  return (
    <>
      <Nav />
      <main className="container page" style={{ maxWidth: 560 }}>
        <h1 className="browse-head" style={{ marginBottom: 4 }}>Suggestions & complaints</h1>
        <p className="muted-sub" style={{ marginBottom: 20 }}>
          Got an idea to make folks better, or something that didn’t go well? Tell us — every message reaches the team.
        </p>
        <FeedbackForm />
      </main>
    </>
  )
}
