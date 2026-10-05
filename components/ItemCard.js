import Link from 'next/link'

const CATEGORY_META = {
  tools:   { emoji: '🔧', cls: 'ph-tools' },
  baby:    { emoji: '👶', cls: 'ph-baby' },
  party:   { emoji: '🎉', cls: 'ph-party' },
  bbq:     { emoji: '🍖', cls: 'ph-party' },
  camping: { emoji: '🏕️', cls: 'ph-camp' },
  sports:  { emoji: '⚽', cls: 'ph-default' },
  kitchen: { emoji: '🍳', cls: 'ph-default' },
  garden:  { emoji: '🌿', cls: 'ph-camp' },
}

// showStatus: when true (e.g. on your own profile), show an Active/Paused pill.
export default function ItemCard({ item, showStatus = false }) {
  const meta = CATEGORY_META[item.category] || { emoji: '📦', cls: 'ph-default' }
  const owner = item.owner || {}
  const photo = Array.isArray(item.photos) && item.photos.length ? item.photos[0] : null
  const paused = item.status === 'paused'

  return (
    <Link href={`/item/${item.id}`} className="item">
      <div className={photo ? 'ph' : `ph ${meta.cls}`}>
        {photo ? <img className="ph-img" src={photo} alt={item.title} /> : (item.emoji || meta.emoji)}
        {showStatus && (
          <span className={`status-pill ${paused ? 'paused' : 'active'}`}>
            {paused ? 'Paused' : 'Active'}
          </span>
        )}
      </div>
      <div className="mt">
        <div className="t">{item.title}</div>
        <div className={`p ${item.is_free ? 'free' : ''}`}>
          {item.is_free ? 'Free' : `AED ${item.fee_per_day}/day`}
        </div>
        <div className="l">
          <span className="vk">✓</span> {owner.full_name || 'Neighbour'}
          {owner.rating_avg ? <> · <span className="star">★</span>{owner.rating_avg}</> : null}
          {owner.sub_area ? ` · ${owner.sub_area}` : ''}
        </div>
      </div>
    </Link>
  )
}
