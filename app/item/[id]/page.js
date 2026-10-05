import Link from 'next/link'
import Nav from '@/components/Nav'
import RequestForm from '@/components/RequestForm'
import OwnerControls from '@/components/OwnerControls'
import { createClient } from '@/utils/supabase/server'
import { sampleById } from '@/lib/sample'

export const dynamic = 'force-dynamic'

const CATEGORY_META = {
  tools:   { emoji: '🔧', cls: 'ph-tools', label: 'Tools & DIY' },
  baby:    { emoji: '👶', cls: 'ph-baby', label: 'Baby & Kids' },
  party:   { emoji: '🎉', cls: 'ph-party', label: 'Party & BBQ' },
  bbq:     { emoji: '🍖', cls: 'ph-party', label: 'Party & BBQ' },
  camping: { emoji: '🏕️', cls: 'ph-camp', label: 'Camping' },
  sports:  { emoji: '⚽', cls: 'ph-default', label: 'Sports' },
  kitchen: { emoji: '🍳', cls: 'ph-default', label: 'Kitchen' },
  garden:  { emoji: '🌿', cls: 'ph-camp', label: 'Garden' },
}

export default async function ItemPage({ params }) {
  const supabase = createClient()
  const { id } = params
  const { data: { user } } = await supabase.auth.getUser()

  let item = null
  let isSample = false

  try {
    const { data } = await supabase
      .from('items')
      .select('*, owner:profiles(full_name, rating_avg, rating_count, sub_area)')
      .eq('id', id)
      .maybeSingle()
    item = data
  } catch (e) {
    item = null // e.g. sample id like "s1" isn't a valid uuid — fall back below
  }

  if (!item) {
    item = sampleById(id)
    isSample = !!item
  }

  if (!item) {
    return (
      <>
        <Nav />
        <main className="container page">
          <Link href="/browse" className="linkish">← Back to browsing</Link>
          <div className="empty" style={{ marginTop: 16 }}>This item couldn’t be found.</div>
        </main>
      </>
    )
  }

  const meta = CATEGORY_META[item.category] || { emoji: '📦', cls: 'ph-default', label: 'Item' }
  const owner = item.owner || {}
  const initial = (owner.full_name || 'N').charAt(0)

  // Real reviews written about this item's owner.
  let reviews = []
  if (!isSample && item.owner_id) {
    const { data } = await supabase
      .from('reviews')
      .select('*, reviewer:profiles!reviewer_id(full_name)')
      .eq('reviewee_id', item.owner_id)
      .order('created_at', { ascending: false })
      .limit(5)
    reviews = data || []
  }

  return (
    <>
      <Nav />
      <main className="container page">
        <Link href="/browse" className="linkish">← Back to browsing</Link>

        <div className="detail">
          <div>
            {Array.isArray(item.photos) && item.photos.length ? (
              <div className="detail-hero withimg"><img className="ph-img" src={item.photos[0]} alt={item.title} /></div>
            ) : (
              <div className={`detail-hero ${meta.cls}`}>{item.emoji || meta.emoji}</div>
            )}

            <h1 className="detail-title">{item.title}</h1>
            <div className="detail-sub">{meta.emoji} {meta.label}{owner.sub_area ? ` · ${owner.sub_area}` : ''}</div>

            <div className="dblock">
              <h3>About this item</h3>
              <p>{item.description || 'No description yet.'}</p>
            </div>

            <div className="dblock">
              <h3>What neighbours say</h3>
              {reviews.length === 0 ? (
                <p style={{ color: 'var(--muted)', fontSize: 14 }}>No reviews yet — be the first to borrow.</p>
              ) : (
                reviews.map((r) => (
                  <div className="review" key={r.id}>
                    <div className="review-who">
                      <span className="mini-av">{(r.reviewer?.full_name || 'N').charAt(0)}</span>
                      {r.reviewer?.full_name || 'Neighbour'} · <span className="star">{'★'.repeat(r.rating)}</span>
                    </div>
                    {r.comment && <p>{r.comment}</p>}
                  </div>
                ))
              )}
            </div>
          </div>

          <aside className="book">
            <div className={`book-price ${item.is_free ? 'free' : ''}`}>
              {item.is_free ? 'Free' : `AED ${item.fee_per_day}`}
              {!item.is_free && <small> /day</small>}
            </div>

            <div className="lendcard">
              <span className="avatar">{initial}</span>
              <div>
                <div className="lend-nm">{owner.full_name || 'Neighbour'}</div>
                <div className="lend-rt">
                  <span className="star">★</span> {owner.rating_avg || '—'}
                  {owner.rating_count ? ` · ${owner.rating_count} borrows` : ''}
                </div>
              </div>
            </div>

            <div className="badges">
              <span className="badge">✓ Verified neighbour</span>
              <span className="badge">🏡 Arabian Ranches resident</span>
            </div>

            {!isSample && user && user.id === item.owner_id ? (
              <OwnerControls item={{
                id: item.id, title: item.title, description: item.description,
                is_free: item.is_free, fee_per_day: item.fee_per_day,
                photos: item.photos || [], status: item.status,
              }} />
            ) : (
              <>
                <RequestForm item={{ id: item.id, title: item.title, owner_id: item.owner_id, is_free: item.is_free, fee_per_day: item.fee_per_day }} isSample={isSample} />
                <div className="guarantee">
                  <span>🛡️</span>
                  <small><b>Protected by the folks Guarantee.</b> Every borrow is covered up to AED 1,000.</small>
                </div>
              </>
            )}
          </aside>
        </div>
      </main>
    </>
  )
}
