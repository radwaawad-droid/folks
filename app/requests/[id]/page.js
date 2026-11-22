import Link from 'next/link'
import Nav from '@/components/Nav'
import RequestOfferForm from '@/components/RequestOfferForm'
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

  const isOwner = user && user.id === req.requester_id
  const closed = req.status === 'closed'

  // Conversations on this request that the viewer can see (RLS-scoped):
  //  - the requester sees every offer; a neighbour sees only their own.
  const { data: replies = [] } = await supabase
    .from('request_replies').select('id, responder_id').eq('request_id', id)

  const myReply = user ? (replies || []).find((r) => r.responder_id === user.id) : null
  const canOffer = user && !isOwner && !myReply && !closed

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

        {/* Neighbour who hasn't offered yet: start a conversation. */}
        {canOffer && <RequestOfferForm requestId={id} meId={user.id} />}

        {/* Neighbour who already offered: jump back to their chat. */}
        {myReply && (
          <div className="empty" style={{ marginTop: 14 }}>
            You’ve offered on this. <Link className="linkish" href={`/messages/req_${myReply.id}`}>Open your conversation →</Link>
          </div>
        )}

        {/* Requester: offers arrive as chats in Messages. */}
        {isOwner && (
          <div className="empty" style={{ marginTop: 14 }}>
            {replies.length > 0
              ? <>{replies.length} {replies.length === 1 ? 'neighbour has' : 'neighbours have'} offered — <Link className="linkish" href="/messages">open Messages to chat →</Link></>
              : 'When a neighbour offers, your chat with them will appear in your Messages.'}
          </div>
        )}

        {closed && (
          <div className="empty" style={{ marginTop: 14 }}>This request is marked as found — it’s closed.</div>
        )}
        {!user && (
          <div className="empty" style={{ marginTop: 14 }}><a className="linkish" href="/">Sign in to offer this →</a></div>
        )}
      </main>
    </>
  )
}
