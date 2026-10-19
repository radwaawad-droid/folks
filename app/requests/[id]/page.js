import { redirect } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/Nav'
import RequestChat from '@/components/RequestChat'
import RequestOfferForm from '@/components/RequestOfferForm'
import RequestStatus from '@/components/RequestStatus'
import AcceptOffer from '@/components/AcceptOffer'
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

  // All offers on this request.
  const { data: replies = [] } = await supabase
    .from('request_replies')
    .select('*, responder:profiles!responder_id(full_name, sub_area)')
    .eq('request_id', id)
    .order('created_at', { ascending: true })

  // Which offers can the current viewer see a private board for?
  //  - the requester sees every offer
  //  - a neighbour sees only their own offer
  const myReply = user ? replies.find((r) => r.responder_id === user.id) : null
  const visibleReplies = isOwner ? replies : (myReply ? [myReply] : [])

  // Load the private messages for the boards this viewer can see.
  let msgsByReply = {}
  if (user && visibleReplies.length) {
    const ids = visibleReplies.map((r) => r.id)
    const { data: msgs = [] } = await supabase
      .from('request_messages').select('*').in('reply_id', ids).order('created_at', { ascending: true })
    msgsByReply = (msgs || []).reduce((acc, m) => {
      (acc[m.reply_id] = acc[m.reply_id] || []).push(m); return acc
    }, {})
  }

  const canOffer = user && !isOwner && !myReply && !closed
  const acceptedExists = replies.some((r) => r.status === 'accepted')

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

        {/* Offer box for a neighbour who hasn't offered yet */}
        {canOffer && <RequestOfferForm requestId={id} meId={user.id} />}

        {/* Private boards */}
        {user && visibleReplies.length > 0 && (
          <section className="offers">
            <h3 className="sec-title">
              {isOwner
                ? `${replies.length} ${replies.length === 1 ? 'neighbour has' : 'neighbours have'} offered`
                : 'Your conversation'}
            </h3>
            {visibleReplies.map((r) => {
              const declined = r.status === 'declined'
              const accepted = r.status === 'accepted'
              return (
                <div className={`offer-card ${declined ? 'is-declined' : ''}`} key={r.id}>
                  <div className="offer-head">
                    <div className="avatar" style={{ width: 38, height: 38 }}>
                      {(r.responder?.full_name || 'N').charAt(0).toUpperCase()}
                    </div>
                    <div className="row-main">
                      <b>{r.responder?.full_name || 'Neighbour'}
                        {accepted && <span className="offer-badge ok">Accepted</span>}
                        {declined && <span className="offer-badge no">Declined</span>}
                        {r.responder?.sub_area ? <span className="muted-sub" style={{ margin: 0, fontWeight: 400 }}> · {r.responder.sub_area}</span> : null}
                      </b>
                      <p className="reply-body">{r.body}</p>
                    </div>
                    {isOwner && !closed && !accepted && !declined && !acceptedExists && (
                      <AcceptOffer requestId={id} replyId={r.id} />
                    )}
                  </div>
                  {declined ? (
                    <p className="muted-sub" style={{ fontSize: 12, margin: '4px 0 0' }}>
                      {isOwner ? 'You went with another neighbour.' : 'The requester went with another neighbour this time.'}
                    </p>
                  ) : (
                    <RequestChat
                      replyId={r.id}
                      meId={user.id}
                      initial={msgsByReply[r.id] || []}
                      disabled={closed}
                    />
                  )}
                </div>
              )
            })}
            {isOwner && !closed && (
              <p className="muted-sub" style={{ fontSize: 12 }}>
                Agreed with someone? Mark the request as found above to close it.
              </p>
            )}
          </section>
        )}

        {/* Empty / signed-out states */}
        {isOwner && replies.length === 0 && !closed && (
          <div className="empty" style={{ marginTop: 14 }}>No offers yet. Neighbours who have it will appear here with a private chat.</div>
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
