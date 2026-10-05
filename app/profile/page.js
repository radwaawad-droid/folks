import { redirect } from 'next/navigation'
import Nav from '@/components/Nav'
import ItemCard from '@/components/ItemCard'
import SignOutButton from '@/components/SignOutButton'
import IncomingRequests from '@/components/IncomingRequests'
import BookingActions from '@/components/BookingActions'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

const STATUS_LABEL = {
  requested: 'Requested', accepted: 'Accepted', declined: 'Declined',
  active: 'Active', returned: 'Returned', cancelled: 'Cancelled', disputed: 'Disputed',
}

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).maybeSingle()
  if (!profile?.full_name) redirect('/')

  const { data: listings = [] } = await supabase
    .from('items').select('*').eq('owner_id', user.id).order('created_at', { ascending: false })

  const { data: borrows = [] } = await supabase
    .from('bookings')
    .select('*, item:items(title, category), lender:profiles!lender_id(full_name)')
    .eq('borrower_id', user.id)
    .order('created_at', { ascending: false })

  const { data: requests = [] } = await supabase
    .from('bookings')
    .select('*, item:items(title), borrower:profiles!borrower_id(full_name, sub_area)')
    .eq('lender_id', user.id)
    .eq('status', 'requested')
    .order('created_at', { ascending: false })

  // Lending activity: bookings on my items that are past the "requested" stage.
  const { data: lending = [] } = await supabase
    .from('bookings')
    .select('*, item:items(title), borrower:profiles!borrower_id(full_name)')
    .eq('lender_id', user.id)
    .in('status', ['accepted', 'active', 'returned'])
    .order('created_at', { ascending: false })

  // Which bookings have I already reviewed?
  const { data: myReviews = [] } = await supabase
    .from('reviews').select('booking_id').eq('reviewer_id', user.id)
  const reviewedSet = new Set((myReviews || []).map((r) => r.booking_id))

  const initial = (profile.full_name || 'Y').charAt(0).toUpperCase()

  return (
    <>
      <Nav />
      <main className="container page">
        <section className="pcard-row">
          <div className="pcard">
            {profile.avatar_url
              ? <img className="avatar big avatar-img" src={profile.avatar_url} alt="" />
              : <span className="avatar big">{initial}</span>}
            <div>
              <h1 className="pname">{profile.full_name}</h1>
              {profile.username && <div className="uname">@{profile.username}</div>}
              <div className="muted-sub">{profile.sub_area ? `${profile.sub_area} · ` : ''}Arabian Ranches</div>
              <div className="prating">
                {profile.rating_count > 0
                  ? <><span className="star">★</span> {Number(profile.rating_avg).toFixed(1)} · {profile.rating_count} review{profile.rating_count === 1 ? '' : 's'}</>
                  : <span className="muted-sub" style={{ margin: 0 }}>No reviews yet</span>}
              </div>
              <div className="badges" style={{ marginTop: 10 }}>
                <span className="badge">✓ Verified neighbour</span>
                <span className="badge">🏡 Arabian Ranches resident</span>
              </div>
            </div>
            <div className="pcard-actions">
              <a className="btn sm ghost" href="/profile/edit">Edit profile</a>
              <SignOutButton />
            </div>
          </div>
        </section>

        {/* Incoming borrow requests (owner side) */}
        <h2 className="sec-title">Requests to borrow your items</h2>
        {requests.length === 0
          ? <div className="empty">No pending requests right now.</div>
          : <IncomingRequests requests={requests} />}

        {/* My borrows */}
        <h2 className="sec-title">Your borrows</h2>
        {borrows.length === 0
          ? <div className="empty">You haven’t borrowed anything yet. <a className="linkish" href="/browse">Browse items →</a></div>
          : (
            <div className="rows">
              {borrows.map((b) => (
                <div className="row" key={b.id}>
                  <div className="row-main">
                    <b>{b.item?.title || 'Item'}</b>
                    <small>{b.start_date || '—'} → {b.end_date || '—'}</small>
                  </div>
                  <span className={`pill-status s-${b.status}`}>{STATUS_LABEL[b.status] || b.status}</span>
                  <a className="btn sm ghost" href={`/messages/${b.id}`}>Message</a>
                  <BookingActions booking={b} meId={user.id} otherId={b.lender_id}
                    side="borrower" alreadyReviewed={reviewedSet.has(b.id)} />
                </div>
              ))}
            </div>
          )}

        {/* Lending activity (owner side, past request stage) */}
        {lending.length > 0 && (
          <>
            <h2 className="sec-title">Your lending activity</h2>
            <div className="rows">
              {lending.map((b) => (
                <div className="row" key={b.id}>
                  <div className="row-main">
                    <b>{b.item?.title || 'Item'}</b>
                    <small>Lent to {b.borrower?.full_name || 'a neighbour'} · {b.start_date || '—'} → {b.end_date || '—'}</small>
                  </div>
                  <span className={`pill-status s-${b.status}`}>{STATUS_LABEL[b.status] || b.status}</span>
                  <a className="btn sm ghost" href={`/messages/${b.id}`}>Message</a>
                  <BookingActions booking={b} meId={user.id} otherId={b.borrower_id}
                    side="lender" alreadyReviewed={reviewedSet.has(b.id)} />
                </div>
              ))}
            </div>
          </>
        )}

        {/* My listings */}
        <div className="sec-head">
          <h2 className="sec-title" style={{ margin: 0 }}>Your listings</h2>
          <a className="btn sm" href="/list">＋ List an item</a>
        </div>
        {listings.length === 0
          ? <div className="empty">You haven’t listed anything yet. Lending is how folks works — <a className="linkish" href="/list">list your first item →</a></div>
          : <div className="grid">{listings.map((it) => <ItemCard key={it.id} item={it} showStatus />)}</div>}
      </main>
    </>
  )
}
