import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'

export default async function Nav() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let initial = 'Y'
  let avatarUrl = null
  let pendingRequests = 0
  let unreadMessages = 0

  if (user) {
    const { data: profile } = await supabase
      .from('profiles').select('full_name, avatar_url').eq('id', user.id).maybeSingle()
    initial = (profile?.full_name || 'Y').charAt(0).toUpperCase()
    avatarUrl = profile?.avatar_url || null

    // Pending borrow requests on my items.
    const { count: reqCount } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('lender_id', user.id)
      .eq('status', 'requested')
    pendingRequests = reqCount || 0

    // Unread messages in my conversations (sent by the other person).
    const { data: myBookings } = await supabase
      .from('bookings').select('id').or(`borrower_id.eq.${user.id},lender_id.eq.${user.id}`)
    const ids = (myBookings || []).map((b) => b.id)
    if (ids.length) {
      const { count: msgCount } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .in('booking_id', ids)
        .neq('sender_id', user.id)
        .is('read_at', null)
      unreadMessages = msgCount || 0
    }
  }

  return (
    <nav className="nav">
      <div className="container nav-inner">
        <Link href="/browse" className="logo">folks <span className="d" /></Link>
        <span className="locpill">📍 Arabian Ranches</span>
        <div className="nav-spacer" />
        {user ? (
          <>
            <Link href="/requests" className="nav-link">Wanted</Link>
            <Link href="/messages" className="nav-link nav-badge-wrap">
              Messages
              {unreadMessages > 0 && <span className="nav-badge">{unreadMessages}</span>}
            </Link>
            <Link href="/list" className="btn">＋ List an item</Link>
            <Link href="/profile" className="avatar nav-avatar nav-badge-wrap" title="Your profile">
              {avatarUrl ? <img className="avatar-img" src={avatarUrl} alt="" /> : initial}
              {pendingRequests > 0 && <span className="nav-badge nav-badge-dot">{pendingRequests}</span>}
            </Link>
          </>
        ) : (
          <Link href="/" className="btn">Sign in</Link>
        )}
      </div>
    </nav>
  )
}
