import { redirect } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/Nav'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export default async function MessagesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  // Any booking I'm part of can hold a conversation.
  const { data: bookings = [] } = await supabase
    .from('bookings')
    .select('*, item:items(title), borrower:profiles!borrower_id(full_name, username), lender:profiles!lender_id(full_name, username)')
    .or(`borrower_id.eq.${user.id},lender_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  return (
    <>
      <Nav />
      <main className="container page">
        <h1 className="sec-title" style={{ marginTop: 6 }}>Messages</h1>
        <p className="muted-sub">Coordinate pickups and returns with your neighbours.</p>

        {bookings.length === 0 ? (
          <div className="empty">No conversations yet. They start when you request an item, or when a neighbour requests one of yours.</div>
        ) : (
          <div className="rows">
            {bookings.map((b) => {
              const other = b.borrower_id === user.id ? b.lender : b.borrower
              return (
                <Link className="row thread-link" key={b.id} href={`/messages/${b.id}`}>
                  <div className="avatar" style={{ width: 44, height: 44 }}>
                    {(other?.full_name || 'N').charAt(0).toUpperCase()}
                  </div>
                  <div className="row-main">
                    <b>{other?.full_name || 'Neighbour'}</b>
                    <small>{b.item?.title || 'Item'} · {b.status}</small>
                  </div>
                  <span className="chev">›</span>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </>
  )
}
