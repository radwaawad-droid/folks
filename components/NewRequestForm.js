'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { DEFAULT_CATEGORIES } from '@/lib/categories'

export default function NewRequestForm({ communityId, categories }) {
  const supabase = createClient()
  const CATEGORIES = (categories && categories.length) ? categories : DEFAULT_CATEGORIES
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0]?.key || 'tools')
  const [description, setDescription] = useState('')
  const [days, setDays] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault(); setError(''); setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/'; return }

    const { error: dbErr } = await supabase.from('item_requests').insert({
      requester_id: user.id,
      community_id: communityId,
      title: title.trim(),
      description: description.trim() || null,
      category,
      days_needed: days ? Number(days) : null,
      status: 'open',
    })
    setLoading(false)
    if (dbErr) { setError(dbErr.message); return }
    window.location.href = '/requests'
  }

  return (
    <form className="listform" onSubmit={submit}>
      {error && <div className="err">{error}</div>}

      <div className="field">
        <label className="label">What are you looking for?</label>
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Cordless drill" required />
      </div>

      <div className="field">
        <label className="label">Category</label>
        <div className="chips">
          {CATEGORIES.map((c) => (
            <span key={c.key} className={`chip ${category === c.key ? 'on' : ''}`}
              onClick={() => setCategory(c.key)}>{c.label}</span>
          ))}
        </div>
      </div>

      <div className="field">
        <label className="label">Details <span style={{fontWeight:500,color:'var(--muted)'}}>(optional)</span></label>
        <textarea className="input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder="Any specifics — brand, size, when you need it…" />
      </div>

      <div className="field">
        <label className="label">How many days do you need it? <span style={{fontWeight:500,color:'var(--muted)'}}>(optional)</span></label>
        <input className="input" type="number" min="1" value={days} onChange={(e) => setDays(e.target.value)}
          placeholder="e.g. 2" />
      </div>

      <button className="btn full" disabled={loading}>{loading ? 'Posting…' : 'Post request'}</button>
    </form>
  )
}
