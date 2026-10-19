'use client'

import { useState } from 'react'

export default function Gallery({ photos, alt }) {
  const [active, setActive] = useState(0)
  if (!Array.isArray(photos) || photos.length === 0) return null

  return (
    <div className="gallery">
      <div className="detail-hero withimg">
        <img className="ph-img" src={photos[active]} alt={alt} />
      </div>
      {photos.length > 1 && (
        <div className="gallery-thumbs">
          {photos.map((src, i) => (
            <button type="button" key={i}
              className={`gallery-thumb ${i === active ? 'on' : ''}`}
              onClick={() => setActive(i)} aria-label={`Photo ${i + 1}`}>
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
