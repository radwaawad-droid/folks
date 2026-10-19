import { redirect } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/Nav'
import RequestReplies from '@/components/RequestReplies'
import RequestStatus from '@/components/RequestStatus'
import { createClient } from '@/utils/supabase/server'
import { fetchCategories } from '@/lib/categories'

export const dynamic = 'force-dynamic'

export default async function RequestDetail({ params }) {
  const supabase = createClient()
  const { id } = params
  const { data: { user } } = await supabase.auth.getUser()
  const cats = await fetchCategories(supabase)
  const CAT_EMOJI = Object.fromEntries(cats.map((c) => [c.key, c.emoji]))

  const { data: req } = await supabase
    .from('item_requests')
    .select('*, requester:profiles!requester_id(full_name, sub_area)')
    .eq('id', id)
    .maybeSingle()

  if (!req) {
    return (
      <>
        <Nav />
        <main className="container page">
          <Link href="/requests" className="linkish">← Back to wanted</Link>
          <div className="empty" style={{ marginTop: 16 }}>Request not found.</div>
        </main>
      </>
    )
  }

  const { data: replies = [] } = await supabase
    .from('request_replies')
    .select('*, responder:profiles!responder_id(full_name, sub_area)')
    .eq('request_id', id)
    .order('created_at', { ascending: true })

  const isOwner = user && user.id === req.requester_id

  return (
    <>
      <Nav />
      <main className="container page">
        <Link href="/requests" className="linkish">← Back to wanted</Link>

        <div className="req-detail">
          <div className="req-emoji big">{CAT_EMOJI[req.category] || '📦'}</div>
          <div>
            <h1 className="detail-title">{req.title}</h1>
            <div className="detail-sub">
              {req.requester?.full_name || 'A neighbour'}
              {req.requester?.sub_area ? ` · ${req.requester.sub_area}` : ''}
              {req.days_needed ? ` · needs ${req.days_needed} day${req.days_needed === 1 ? '' : 's'}` : ''}
            </div>
          </div>
        </div>

        {req.description && <p className="req-desc">{req.description}</p>}

        <RequestStatus requestId={id} status={req.status} isOwner={isOwner} />

        <RequestReplies
          requestId={id}
          meId={user?.id || null}
          isOwner={isOwner}
          initial={replies}
          closed={req.status === 'closed'}
        />
      </main>
    </>
  )
}
