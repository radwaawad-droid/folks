'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

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
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [note, setNote] = useState('')

  async function submit(e) {
    e.preventDefault()
    setError(''); setNote(''); setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/'; return }

    // Store the photo directly in the database as a data URL (no storage bucket needed).
    let photos = []
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setLoading(false)
        setError('Please choose an image under 2 MB.')
        return
      }
      try {
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
        photos = [dataUrl]
      } catch (_) {
        setNote('Listing saved without the photo.')
      }
    }

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
        <input className="input" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <div className="hint">A clear photo gets borrowed faster.</div>
      </div>

      <button className="btn full" disabled={loading}>
        {loading ? 'Publishing…' : 'Publish to Arabian Ranches'}
      </button>
    </form>
  )
}
