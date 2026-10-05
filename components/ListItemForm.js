'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import ImageCropper from '@/components/ImageCropper'

const CATEGORIES = [
  { key: 'tools', label: '🔧 Tools & DIY' },
  { key: 'baby', label: '👶 Baby & Kids' },
  { key: 'party', label: '🎉 Party' },
  { key: 'bbq', label: '🍖 BBQ' },
  { key: 'camping', label: '🏕️ Camping' },
  { key: 'sports', label: '⚽ Sports' },
  { key: 'kitchen', label: '🍳 Kitchen' },
  { key: 'garden', label: '🌿 Garden' },
]

export default function ListItemForm({ communityId }) {
  const supabase = createClient()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('tools')
  const [description, setDescription] = useState('')
  const [isFree, setIsFree] = useState(true)
  const [fee, setFee] = useState('')
  const [pendingFile, setPendingFile] = useState(null) // file waiting to be cropped
  const [photo, setPhoto] = useState('')              // final cropped data URL
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [note, setNote] = useState('')

  async function submit(e) {
    e.preventDefault()
    setError(''); setNote(''); setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/'; return }

    // The cropper already produced a compact square JPEG data URL — store it directly.
    const photos = photo ? [photo] : []

    const { error: dbErr } = await supabase.from('items').insert({
      owner_id: user.id,
      community_id: communityId,
      title,
      description,
      category,
      photos,
      is_free: isFree,
      fee_per_day: isFree ? 0 : Number(fee || 0),
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
        <label className="label">Photo <span style={{fontWeight:500,color:'var(--muted)'}}>(optional)</span></label>

        {photo ? (
          <div className="photo-pick">
            <img className="photo-thumb" src={photo} alt="Your photo" />
            <div className="photo-pick-actions">
              <label className="photo-btn ghost">
                Change
                <input type="file" accept="image/*" hidden
                  onChange={(e) => { setPendingFile(e.target.files?.[0] || null); e.target.value = '' }} />
              </label>
              <button type="button" className="photo-btn ghost" onClick={() => setPhoto('')}>Remove</button>
            </div>
          </div>
        ) : (
          <label className="photo-drop">
            <span className="photo-drop-plus">＋</span>
            <span>Add a photo</span>
            <input type="file" accept="image/*" hidden
              onChange={(e) => { setPendingFile(e.target.files?.[0] || null); e.target.value = '' }} />
          </label>
        )}
        <div className="hint">A clear photo gets borrowed faster. You can crop and zoom it next.</div>
      </div>

      <button className="btn full" disabled={loading}>
        {loading ? 'Publishing…' : 'Publish to Arabian Ranches'}
      </button>

      {pendingFile && (
        <ImageCropper
          file={pendingFile}
          onDone={(dataUrl) => { setPhoto(dataUrl); setPendingFile(null) }}
          onCancel={() => setPendingFile(null)}
        />
      )}

      <style jsx>{`
        .photo-drop{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;
          padding:26px;border:1.5px dashed #CDBFA8;border-radius:16px;background:#fff;cursor:pointer;
          color:#6B7770;font-weight:600;font-size:14px}
        .photo-drop-plus{font-size:30px;line-height:1;color:#F2774E;font-weight:700}
        .photo-pick{display:flex;align-items:center;gap:14px}
        .photo-thumb{width:96px;height:96px;object-fit:cover;border-radius:14px;border:1px solid #ECE6DB}
        .photo-pick-actions{display:flex;flex-direction:column;gap:8px}
        .photo-btn{background:#fff;color:#205C49;border:1.5px solid #205C49;border-radius:12px;
          padding:9px 16px;font-weight:700;font-size:14px;cursor:pointer;text-align:center}
      `}</style>
    </form>
  )
}
