import { redirect } from 'next/navigation'
import Nav from '@/components/Nav'
import AdminPanel from '@/components/AdminPanel'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const admin = createAdminClient()
  const { data: me } = await admin
    .from('profiles').select('is_admin').eq('id', user.id).maybeSingle()
  if (!me?.is_admin) redirect('/browse')

  const { data: items = [] } = await admin
    .from('items')
    .select('id, title, status, is_free, fee_per_day, photos, created_at, owner:profiles(id, full_name, username)')
    .order('created_at', { ascending: false })

  const { data: profiles = [] } = await admin
    .from('profiles')
    .select('id, full_name, username, sub_area, notify_email, banned, is_admin, created_at')
    .order('created_at', { ascending: false })

  const { data: categories = [] } = await admin
    .from('categories').select('key, label, emoji, sort').order('sort')

  const counts = {}
  ;(items || []).forEach((it) => { const o = it.owner?.id; if (o) counts[o] = (counts[o] || 0) + 1 })

  // Counts that need their own queries (cheap head counts).
  const [bk, bkPending, bkActive, bkReturned, wantedOpen, reviewsTotal] = await Promise.all([
    admin.from('bookings').select('id', { count: 'exact', head: true }),
    admin.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'requested'),
    admin.from('bookings').select('id', { count: 'exact', head: true }).in('status', ['accepted', 'active']),
    admin.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'returned'),
    admin.from('item_requests').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    admin.from('reviews').select('id', { count: 'exact', head: true }),
  ])

  const now = Date.now()
  const within7 = (d) => d && (now - new Date(d).getTime()) < 7 * 86400000
  const stats = {
    members: profiles.length,
    membersNew: profiles.filter((p) => within7(p.created_at)).length,
    banned: profiles.filter((p) => p.banned).length,
    listings: items.length,
    listingsActive: items.filter((i) => i.status === 'available').length,
    listingsPaused: items.filter((i) => i.status === 'paused').length,
    listingsNew: items.filter((i) => within7(i.created_at)).length,
    bookingsTotal: bk.count || 0,
    bookingsPending: bkPending.count || 0,
    bookingsActive: bkActive.count || 0,
    bookingsReturned: bkReturned.count || 0,
    wantedOpen: wantedOpen.count || 0,
    reviews: reviewsTotal.count || 0,
  }

  return (
    <>
      <Nav />
      <main className="container page">
        <h1 className="browse-head" style={{ marginBottom: 4 }}>Admin</h1>
        <p className="muted-sub" style={{ marginBottom: 20 }}>
          Monitor listings and members. Deleting a listing and banning a member can’t be undone from the member’s side — but you can unban.
        </p>
        <AdminPanel
          items={items || []}
          profiles={profiles || []}
          categories={categories || []}
          counts={counts}
          stats={stats}
          meId={user.id}
        />
      </main>
    </>
  )
}
