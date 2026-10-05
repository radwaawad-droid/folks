'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function OwnerControls({ item }) {
  const supabase = createClient()
  const [editing, setEditing] = useState(false)
  const [description, setDescription] = useState(item.description || '')
  const [isFree, setIsFree] = useState(item.is_free)
  const [fee, setFee] = useState(item.fee_per_day || '')
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState(item.status || 'available')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

    let photos = item.photos
    if (file) {
      if (file.size > 2 * 1024 * 1024) { setLoading(false); setError('Please choose an image under 2 MB.'); return }
      try {
        photos = [await new Promise((res, rej) => {
          const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file)
        })]
      } catch (_) {}
    }

    const { error: upErr } = await supabase.from('items').update({
      description,
      is_free: isFree,
      fee_per_day: isFree ? 0 : Number(fee || 0),
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

      <label className="label" style={{ marginTop: 14 }}>Replace photo <span style={{fontWeight:500,color:'var(--muted)'}}>(optional)</span></label>
      <input className="input" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />

      <button className="btn full" style={{ marginTop: 16 }} disabled={loading}>
        {loading ? 'Saving…' : 'Save changes'}
      </button>
      <button type="button" className="linkish" style={{ marginTop: 12 }} onClick={() => setEditing(false)}>
        Cancel
      </button>
    </form>
  )
}
