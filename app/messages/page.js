import { redirect } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/Nav'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export default async function MessagesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  // 1) Item-booking conversations I'm part of.
  const { data: bookings = [] } = await supabase
    .from('bookings')
    .select('*, item:items(title), borrower:profiles!borrower_id(full_name), lender:profiles!lender_id(full_name)')
    .or(`borrower_id.eq.${user.id},lender_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  // 2) Wanted-post conversations: offers I made, plus offers on my requests.
  const { data: myReqs = [] } = await supabase
    .from('item_requests').select('id, title').eq('requester_id', user.id)
  const myReqIds = (myReqs || []).map((r) => r.id)
  const myReqTitle = Object.fromEntries((myReqs || []).map((r) => [r.id, r.title]))

  const { data: mine = [] } = await supabase
    .from('request_replies')
    .select('id, created_at, request:item_requests!request_id(title, requester:profiles!requester_id(full_name))')
    .eq('responder_id', user.id)

  const { data: onMine = [] } = myReqIds.length
    ? await supabase
        .from('request_replies')
        .select('id, created_at, request_id, responder:profiles!responder_id(full_name)')
        .in('request_id', myReqIds)
    : { data: [] }

  // Build one unified, recency-sorted list.
  const items = [
    ...(bookings || []).map((b) => {
      const other = b.borrower_id === user.id ? b.lender : b.borrower
      return {
        key: b.id, href: `/messages/${b.id}`, ts: b.created_at,
        name: other?.full_name || 'Neighbour',
        sub: `${b.item?.title || 'Item'} · ${b.status}`,
      }
    }),
    ...(mine || []).map((r) => ({
      key: `req_${r.id}`, href: `/messages/req_${r.id}`, ts: r.created_at,
      name: r.request?.requester?.full_name || 'Neighbour',
      sub: `Wanted: ${r.request?.title || 'a request'}`,
    })),
    ...(onMine || []).map((r) => ({
      key: `req_${r.id}`, href: `/messages/req_${r.id}`, ts: r.created_at,
      name: r.responder?.full_name || 'Neighbour',
      sub: `Wanted: ${myReqTitle[r.request_id] || 'your request'}`,
    })),
  ].sort((a, b) => new Date(b.ts) - new Date(a.ts))

  return (
    <>
      <Nav />
      <main className="container page">
        <h1 className="sec-title" style={{ marginTop: 6 }}>Messages</h1>
        <p className="muted-sub">Coordinate pickups, returns and Wanted offers with your neighbours.</p>

        {items.length === 0 ? (
          <div className="empty">No conversations yet. They start when you request an item, offer on a Wanted post, or a neighbour reaches out.</div>
        ) : (
          <div className="rows">
            {items.map((c) => (
              <Link className="row thread-link" key={c.key} href={c.href}>
                <div className="avatar" style={{ width: 44, height: 44 }}>
                  {(c.name || 'N').charAt(0).toUpperCase()}
                </div>
                <div className="row-main">
                  <b>{c.name}</b>
                  <small>{c.sub}</small>
                </div>
                <span className="chev">›</span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
