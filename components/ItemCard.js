import Link from 'next/link'
import DoorMark from '@/components/DoorMark'

// showStatus: when true (e.g. on your own profile), show an Active/Paused pill.
export default function ItemCard({ item, showStatus = false }) {
  const owner = item.owner || {}
  const photo = Array.isArray(item.photos) && item.photos.length ? item.photos[0] : null
  const paused = item.status === 'paused'
  const rating = owner.rating_avg ? Number(owner.rating_avg).toFixed(1) : null

  return (
    <Link href={`/item/${item.id}`} className="item">
      <div className={photo ? 'ph' : 'ph ph-empty'}>
        {photo
          ? <img className="ph-img" src={photo} alt={item.title} />
          : <DoorMark className="ph-door" />}
        {rating && <span className="rate-pill"><span className="star">★</span> {rating}</span>}
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
          {owner.sub_area ? <span className="l-area"> · {owner.sub_area}</span> : null}
        </div>
      </div>
    </Link>
  )
}
