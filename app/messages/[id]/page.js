import { redirect } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/Nav'
import ChatThread from '@/components/ChatThread'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export default async function ThreadPage({ params }) {
  const supabase = createClient()
  const { id } = params
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, item:items(title), borrower:profiles!borrower_id(full_name), lender:profiles!lender_id(full_name)')
    .eq('id', id)
    .maybeSingle()

  if (!booking || (booking.borrower_id !== user.id && booking.lender_id !== user.id)) {
    return (
      <>
        <Nav />
        <main className="container page">
          <Link href="/messages" className="linkish">← Back to messages</Link>
          <div className="empty" style={{ marginTop: 16 }}>Conversation not found.</div>
        </main>
      </>
    )
  }

  const other = booking.borrower_id === user.id ? booking.lender : booking.borrower
  const { data: initial = [] } = await supabase
    .from('messages').select('*').eq('booking_id', id).order('created_at', { ascending: true })

  return (
    <>
      <Nav />
      <main className="container page">
        <Link href="/messages" className="linkish">← Back to messages</Link>
        <div className="thread-head">
          <div className="avatar" style={{ width: 42, height: 42 }}>
            {(other?.full_name || 'N').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="thread-name">{other?.full_name || 'Neighbour'}</div>
            <div className="thread-sub">{booking.item?.title || 'Item'} · {booking.status}</div>
          </div>
        </div>
        <ChatThread bookingId={id} meId={user.id} initial={initial} />
      </main>
    </>
  )
}
