import Link from 'next/link'
import Nav from '@/components/Nav'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

const CAT_EMOJI = { tools:'🔧', baby:'👶', party:'🎉', bbq:'🍖', camping:'🏕️', sports:'⚽', kitchen:'🍳', garden:'🌿' }

export default async function RequestsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: requests = [] } = await supabase
    .from('item_requests')
    .select('*, requester:profiles!requester_id(full_name, sub_area), replies:request_replies(id)')
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  return (
    <>
      <Nav />
      <main className="container page">
        <div className="sec-head" style={{ marginTop: 6 }}>
          <div>
            <h1 className="sec-title" style={{ margin: 0 }}>Wanted in Arabian Ranches</h1>
            <p className="muted-sub" style={{ margin: '6px 0 0' }}>Can’t find something? Ask your neighbours — someone nearby probably has it.</p>
          </div>
          {user && <Link href="/requests/new" className="btn">＋ Post a request</Link>}
        </div>

        {requests.length === 0 ? (
          <div className="empty">
            No open requests yet. {user
              ? <Link className="linkish" href="/requests/new">Post the first one →</Link>
              : <Link className="linkish" href="/">Sign in to post a request →</Link>}
          </div>
        ) : (
          <div className="rows">
            {requests.map((r) => (
              <Link className="row thread-link" key={r.id} href={`/requests/${r.id}`}>
                <div className="req-emoji">{CAT_EMOJI[r.category] || '📦'}</div>
                <div className="row-main">
                  <b>{r.title}</b>
                  <small>
                    {r.requester?.full_name || 'A neighbour'}
                    {r.requester?.sub_area ? ` · ${r.requester.sub_area}` : ''}
                    {r.days_needed ? ` · needs ${r.days_needed} day${r.days_needed === 1 ? '' : 's'}` : ''}
                  </small>
                </div>
                <span className="reply-count">{(r.replies?.length || 0)} {(r.replies?.length === 1) ? 'reply' : 'replies'}</span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
