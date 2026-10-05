'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function RequestReplies({ requestId, meId, isOwner, initial }) {
  const supabase = createClient()
  const [replies, setReplies] = useState(initial || [])
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    const text = body.trim()
    if (!text) return
    if (!meId) { window.location.href = '/'; return }
    setLoading(true); setError('')
    const { data, error: dbErr } = await supabase
      .from('request_replies')
      .insert({ request_id: requestId, responder_id: meId, body: text })
      .select('*, responder:profiles!responder_id(full_name, sub_area)')
      .single()
    setLoading(false)
    if (dbErr) { setError(dbErr.message); return }
    setReplies((cur) => [...cur, data])
    setBody('')
  }

  return (
    <div className="replies">
      <h3 className="sec-title">{replies.length} {replies.length === 1 ? 'reply' : 'replies'}</h3>

      {replies.length === 0 && (
        <div className="empty">No replies yet. {isOwner ? 'Neighbours who have it will reply here.' : 'Have this? Be the first to reply.'}</div>
      )}

      <div className="rows">
        {replies.map((r) => (
          <div className="row" key={r.id} style={{ alignItems: 'flex-start' }}>
            <div className="avatar" style={{ width: 40, height: 40 }}>
              {(r.responder?.full_name || 'N').charAt(0).toUpperCase()}
            </div>
            <div className="row-main">
              <b>{r.responder?.full_name || 'Neighbour'}
                {r.responder?.sub_area ? <span className="muted-sub" style={{ margin: 0, fontWeight: 400 }}> · {r.responder.sub_area}</span> : null}
              </b>
              <p className="reply-body">{r.body}</p>
            </div>
          </div>
        ))}
      </div>

      {meId && !isOwner && (
        <form className="reply-compose" onSubmit={submit}>
          {error && <div className="err">{error}</div>}
          <label className="label">I have this — reply</label>
          <textarea className="input" rows={2} value={body} onChange={(e) => setBody(e.target.value)}
            placeholder="Yes! I have one you can borrow. When do you need it?" />
          <button className="btn" style={{ marginTop: 10 }} disabled={loading}>
            {loading ? 'Sending…' : 'Send reply'}
          </button>
        </form>
      )}

      {!meId && (
        <div className="empty"><a className="linkish" href="/">Sign in to reply →</a></div>
      )}
    </div>
  )
}
