'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import ImageCropper from '@/components/ImageCropper'

export default function OwnerControls({ item }) {
  const supabase = createClient()
  const [editing, setEditing] = useState(false)
  const [description, setDescription] = useState(item.description || '')
  const [isFree, setIsFree] = useState(item.is_free)
  const [fee, setFee] = useState(item.fee_per_day || '')
  const [deposit, setDeposit] = useState(item.deposit || '')
  const [photos, setPhotos] = useState(Array.isArray(item.photos) ? item.photos : [])
  const [pendingFile, setPendingFile] = useState(null)
  const [status, setStatus] = useState(item.status || 'available')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const MAX_PHOTOS = 5

  async function togglePause() {
    setLoading(true); setError('')
    const next = status === 'available' ? 'paused' : 'available'
    const { error } = await supabase.from('items').update({ status: next }).eq('id', item.id)
    setLoading(false)
    if (error) { setError(error.message); return }
    setStatus(next)
  }

  async function save(e) {
    e.preventDefault(); setError(''); setLoading(true)

    const { error: upErr } = await supabase.from('items').update({
      description,
      is_free: isFree,
      fee_per_day: isFree ? 0 : Number(fee || 0),
      deposit: Number(deposit || 0),
      photos,
    }).eq('id', item.id)

    setLoading(false)
    if (upErr) { setError(upErr.message); return }
    window.location.reload()
  }

  async function remove() {
    if (!confirm('Delete this listing? This can’t be undone.')) return
    setLoading(true)
    const { error: delErr } = await supabase.from('items').delete().eq('id', item.id)
    if (delErr) { setLoading(false); setError(delErr.message); return }
    window.location.href = '/profile'
  }

  if (!editing) {
    return (
      <div className="owner-box">
        <div className="owner-tag">
          This is your listing
          {status === 'paused' && <span className="paused-chip">Paused</span>}
        </div>
        <button className="btn full" onClick={() => setEditing(true)}>Edit listing</button>
        <button className="btn full ghost" style={{ marginTop: 10 }} onClick={togglePause} disabled={loading}>
          {status === 'available' ? 'Pause listing' : 'Activate listing'}
        </button>
        <button className="btn full ghost" style={{ marginTop: 10 }} onClick={remove} disabled={loading}>
          Delete listing
        </button>
        {error && <div className="err" style={{ marginTop: 10 }}>{error}</div>}
        {status === 'paused' && (
          <p className="owner-note">Paused listings are hidden from browse but kept in your profile. Activate to make it visible again.</p>
        )}
      </div>
    )
  }

  return (
    <form className="owner-box" onSubmit={save}>
      {error && <div className="err">{error}</div>}

      <label className="label">Description</label>
      <textarea className="input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />

      <label className="label" style={{ marginTop: 14 }}>Price</label>
      <div className="seg">
        <span className={`segb ${isFree ? 'on' : ''}`} onClick={() => setIsFree(true)}>Free</span>
        <span className={`segb ${!isFree ? 'on' : ''}`} onClick={() => setIsFree(false)}>Daily fee</span>
      </div>
      {!isFree && (
        <input className="input" style={{ marginTop: 10 }} type="number" min="0"
          value={fee} onChange={(e) => setFee(e.target.value)} placeholder="AED per day" />
      )}

      <label className="label" style={{ marginTop: 14 }}>Refundable deposit <span style={{fontWeight:500,color:'var(--muted)'}}>(optional)</span></label>
      <input className="input" type="number" min="0"
        value={deposit} onChange={(e) => setDeposit(e.target.value)} placeholder="e.g. 100 — leave blank for none" />

      <label className="label" style={{ marginTop: 14 }}>Photos <span style={{fontWeight:500,color:'var(--muted)'}}>(up to {MAX_PHOTOS})</span></label>
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

      <button className="btn full" style={{ marginTop: 16 }} disabled={loading}>
        {loading ? 'Saving…' : 'Save changes'}
      </button>
      <button type="button" className="linkish" style={{ marginTop: 12 }} onClick={() => setEditing(false)}>
        Cancel
      </button>

      {pendingFile && (
        <ImageCropper
          file={pendingFile}
          onDone={(dataUrl) => { setPhotos((p) => [...p, dataUrl].slice(0, MAX_PHOTOS)); setPendingFile(null) }}
          onCancel={() => setPendingFile(null)}
        />
      )}

      <style jsx>{`
        .photo-grid{display:flex;flex-wrap:wrap;gap:10px;margin-top:4px}
        .photo-tile{position:relative;width:84px;height:84px;border-radius:13px;overflow:hidden;border:1px solid #ECE6DB;background:#fff}
        .photo-tile img{width:100%;height:100%;object-fit:cover;display:block}
        .cover-tag{position:absolute;left:5px;bottom:5px;background:rgba(32,92,73,.9);color:#fff;
          font-size:9px;font-weight:700;padding:2px 6px;border-radius:999px}
        .photo-x{position:absolute;top:4px;right:4px;width:21px;height:21px;border-radius:50%;border:none;
          background:rgba(0,0,0,.55);color:#fff;font-size:14px;line-height:1;cursor:pointer;display:flex;
          align-items:center;justify-content:center}
        .photo-add{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;
          width:84px;height:84px;border:1.5px dashed #CDBFA8;border-radius:13px;background:#fff;cursor:pointer;
          color:#6B7770;font-weight:600;font-size:11.5px}
        .photo-add-plus{font-size:22px;line-height:1;color:#F2774E;font-weight:700}
      `}</style>
    </form>
  )
}
