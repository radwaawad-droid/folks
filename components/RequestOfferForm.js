'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { notify } from '@/lib/notify'

// Shown to a neighbour who hasn't offered yet. Posting creates a reply, which
// opens a private board between them and the requester.
export default function RequestOfferForm({ requestId, meId }) {
  const supabase = createClient()
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    const text = body.trim()
    if (!text) return
    if (!meId) { window.location.href = '/'; return }
    setLoading(true); setError('')
    const { error: dbErr } = await supabase
      .from('request_replies')
      .insert({ request_id: requestId, responder_id: meId, body: text })
    setLoading(false)
    if (dbErr) { setError(dbErr.message); return }
    notify({ type: 'reply', requestId })
    window.location.reload()
  }

  return (
    <form className="reply-compose" onSubmit={submit}>
      {error && <div className="err">{error}</div>}
      <label className="label">I have this — offer to help</label>
      <textarea className="input" rows={2} value={body} onChange={(e) => setBody(e.target.value)}
        placeholder="Yes! I have one you can borrow. When do you need it?" />
      <button className="btn" style={{ marginTop: 10 }} disabled={loading}>
        {loading ? 'Sending…' : 'Send offer'}
      </button>
      <p className="muted-sub" style={{ margin: '8px 0 0', fontSize: 12 }}>
        This opens a private chat with your neighbour to sort out the details.
      </p>
    </form>
  )
}
