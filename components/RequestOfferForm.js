'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { notify } from '@/lib/notify'

// Shown to a neighbour who hasn't offered yet. Sending a message starts a
// conversation with the requester that lives in the Messages tab.
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

    // The reply is the conversation head between this neighbour and the requester.
    const { data: reply, error: dbErr } = await supabase
      .from('request_replies')
      .insert({ request_id: requestId, responder_id: meId, body: text })
      .select('id').single()
    if (dbErr || !reply) { setLoading(false); setError(dbErr?.message || 'Could not send.'); return }

    // The opening message, so it shows in the chat thread.
    await supabase.from('request_messages')
      .insert({ reply_id: reply.id, sender_id: meId, body: text })

    // Notify the requester (push + email) and take this neighbour to the chat.
    notify({ type: 'wanted_offer', replyId: reply.id })
    window.location.href = `/messages/req_${reply.id}`
  }

  return (
    <form className="reply-compose" onSubmit={submit}>
      {error && <div className="err">{error}</div>}
      <label className="label">I have this — message the neighbour</label>
      <textarea className="input" rows={2} value={body} onChange={(e) => setBody(e.target.value)}
        placeholder="Yes! I have one you can borrow. When do you need it?" required />
      <button className="btn" style={{ marginTop: 10 }} disabled={loading}>
        {loading ? 'Sending…' : 'Send message'}
      </button>
      <p className="muted-sub" style={{ margin: '8px 0 0', fontSize: 12 }}>
        This starts a chat in your Messages to sort out the details.
      </p>
    </form>
  )
}
