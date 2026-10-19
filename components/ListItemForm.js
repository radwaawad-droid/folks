'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import ImageCropper from '@/components/ImageCropper'
import { DEFAULT_CATEGORIES } from '@/lib/categories'

export default function ListItemForm({ communityId, categories }) {
  const supabase = createClient()
  const CATEGORIES = (categories && categories.length) ? categories : DEFAULT_CATEGORIES
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0]?.key || 'tools')
  const [description, setDescription] = useState('')
  const [isFree, setIsFree] = useState(true)
  const [fee, setFee] = useState('')
  const [deposit, setDeposit] = useState('')
  const [pendingFile, setPendingFile] = useState(null) // file waiting to be cropped
  const [photos, setPhotos] = useState([])            // final cropped data URLs
  const [loading, setLoading] = useState(false)
  const MAX_PHOTOS = 5
  const [error, setError] = useState('')
  const [note, setNote] = useState('')

  async function submit(e) {
    e.preventDefault()
    setError(''); setNote(''); setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/'; return }

    const { error: dbErr } = await supabase.from('items').insert({
      owner_id: user.id,
      community_id: communityId,
      title,
      description,
      category,
      photos, // array of cropped square JPEG data URLs; first is the cover
      is_free: isFree,
      fee_per_day: isFree ? 0 : Number(fee || 0),
      deposit: Number(deposit || 0),
      status: 'available',
    })

    setLoading(false)
    if (dbErr) { setError(dbErr.message); return }
    window.location.href = '/profile'
  }

  return (
    <form className="listform" onSubmit={submit}>
      {error && <div className="err">{error}</div>}
      {note && <div className="empty" style={{ marginBottom: 14 }}>{note}</div>}

      <div className="field">
        <label className="label">What is it?</label>
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Bosch cordless drill" required />
      </div>

      <div className="field">
        <label className="label">Category</label>
        <div className="chips">
          {CATEGORIES.map((c) => (
            <span key={c.key}
              className={`chip ${category === c.key ? 'on' : ''}`}
              onClick={() => setCategory(c.key)}>{c.label}</span>
          ))}
        </div>
      </div>

      <div className="field">
        <label className="label">Description</label>
        <textarea className="input" rows={3} value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What it's good for, what's included, anything to know." />
      </div>

      <div className="field">
        <label className="label">Borrowing</label>
        <div className="seg">
          <span className={`segb ${isFree ? 'on' : ''}`} onClick={() => setIsFree(true)}>Free</span>
          <span className={`segb ${!isFree ? 'on' : ''}`} onClick={() => setIsFree(false)}>Set a daily fee</span>
        </div>
        {!isFree && (
          <input className="input" style={{ marginTop: 10 }} type="number" min="0"
            value={fee} onChange={(e) => setFee(e.target.value)} placeholder="AED per day" />
        )}
      </div>

      <div className="field">
        <label className="label">Refundable deposit <span style={{fontWeight:500,color:'var(--muted)'}}>(optional)</span></label>
        <input className="input" type="number" min="0"
          value={deposit} onChange={(e) => setDeposit(e.target.value)} placeholder="e.g. 100 — leave blank for none" />
        <div className="hint">A security amount the borrower leaves and gets back when they return the item safely. Handed over and returned between you — folks doesn’t hold payments.</div>
      </div>

      <div className="field">
        <label className="label">Photos <span style={{fontWeight:500,color:'var(--muted)'}}>(up to {MAX_PHOTOS}, optional)</span></label>

        <div className="photo-grid">
          {photos.map((src, i) => (
            <div className="photo-tile" key={i}>
              <img src={src} alt="" />
              {i === 0 && <span className="cover-tag">Cover</span>}
              <button type="button" className="photo-x" aria-label="Remove"
                onClick={() => setPhotos(photos.filter((_, j) => j !== i))}>×</button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <label className="photo-add">
              <span className="photo-add-plus">＋</span>
              <span>Add</span>
              <input type="file" accept="image/*" hidden
                onChange={(e) => { setPendingFile(e.target.files?.[0] || null); e.target.value = '' }} />
            </label>
          )}
        </div>
        <div className="hint">The first photo is the cover. You can crop &amp; zoom each one.</div>
      </div>

      <button className="btn full" disabled={loading}>
        {loading ? 'Publishing…' : 'Publish to Arabian Ranches'}
      </button>

      {pendingFile && (
        <ImageCropper
          file={pendingFile}
          onDone={(dataUrl) => { setPhotos((p) => [...p, dataUrl].slice(0, MAX_PHOTOS)); setPendingFile(null) }}
          onCancel={() => setPendingFile(null)}
        />
      )}

      <style jsx>{`
        .photo-grid{display:flex;flex-wrap:wrap;gap:10px}
        .photo-tile{position:relative;width:92px;height:92px;border-radius:14px;overflow:hidden;border:1px solid #ECE6DB;background:#fff}
        .photo-tile img{width:100%;height:100%;object-fit:cover;display:block}
        .cover-tag{position:absolute;left:5px;bottom:5px;background:rgba(32,92,73,.9);color:#fff;
          font-size:9.5px;font-weight:700;padding:2px 6px;border-radius:999px}
        .photo-x{position:absolute;top:4px;right:4px;width:22px;height:22px;border-radius:50%;border:none;
          background:rgba(0,0,0,.55);color:#fff;font-size:15px;line-height:1;cursor:pointer;display:flex;
          align-items:center;justify-content:center}
        .photo-add{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;
          width:92px;height:92px;border:1.5px dashed #CDBFA8;border-radius:14px;background:#fff;cursor:pointer;
          color:#6B7770;font-weight:600;font-size:12px}
        .photo-add-plus{font-size:24px;line-height:1;color:#F2774E;font-weight:700}
      `}</style>
    </form>
  )
}
