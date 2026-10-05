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

    const { count: reqCount } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('lender_id', user.id)
      .eq('status', 'requested')
    pendingRequests = reqCount || 0

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

  const Avatar = () => (
    <Link href="/profile" className="avatar nav-avatar nav-badge-wrap" title="Your profile">
      {avatarUrl ? <img className="avatar-img" src={avatarUrl} alt="" /> : initial}
      {pendingRequests > 0 && <span className="nav-badge nav-badge-dot">{pendingRequests}</span>}
    </Link>
  )

  return (
    <>
      {/* top bar — clean on every screen */}
      <nav className="nav">
        <div className="container nav-inner">
          <Link href="/browse" className="logo">folks <span className="d" /></Link>
          <span className="locpill">📍 Arabian Ranches</span>
          <div className="nav-spacer" />
          {user ? (
            <>
              {/* desktop-only text links */}
              <Link href="/requests" className="nav-link nav-desktop">Wanted</Link>
              <Link href="/messages" className="nav-link nav-badge-wrap nav-desktop">
                Messages
                {unreadMessages > 0 && <span className="nav-badge">{unreadMessages}</span>}
              </Link>
              <Link href="/list" className="btn nav-desktop" style={{ whiteSpace: 'nowrap' }}>＋ List an item</Link>
              <Avatar />
            </>
          ) : (
            <Link href="/" className="btn" style={{ whiteSpace: 'nowrap' }}>Sign in</Link>
          )}
        </div>
      </nav>

      {/* bottom tab bar — mobile only, shown when signed in */}
      {user && (
        <nav className="tabbar">
          <Link href="/browse" className="tab">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>
            <span>Browse</span>
          </Link>
          <Link href="/requests" className="tab">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4-4"/></svg>
            <span>Wanted</span>
          </Link>
          <Link href="/list" className="tab tab-add">
            <span className="tab-plus">＋</span>
            <span>List</span>
          </Link>
          <Link href="/messages" className="tab nav-badge-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.4 8.4 0 0 1-12 7.5L3 21l2-6a8.4 8.4 0 1 1 16-3.5z"/></svg>
            <span>Messages</span>
            {unreadMessages > 0 && <span className="nav-badge tab-badge">{unreadMessages}</span>}
          </Link>
        </nav>
      )}
    </>
  )
}
