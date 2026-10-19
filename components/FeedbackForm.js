'use client'

import { useState } from 'react'

export default function FeedbackForm() {
  const [kind, setKind] = useState('suggestion')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function submit(e) {
    e.preventDefault()
    const text = message.trim()
    if (!text) return
    setLoading(true); setError('')
    try {
      const r = await fetch('/api/feedback', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, message: text }),
      })
      const j = await r.json()
      if (!j.ok) { setError(j.error || 'Something went wrong.'); setLoading(false); return }
      setSent(true)
    } catch (e) { setError(String(e)) }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="empty" style={{ marginTop: 16 }}>
        Thank you — your {kind} has been sent to the folks team. We read every message.
      </div>
    )
  }

  return (
    <form className="listform" onSubmit={submit}>
      {error && <div className="err">{error}</div>}

      <div className="field">
        <label className="label">What’s this about?</label>
        <div className="seg" style={{ maxWidth: 320 }}>
          <span className={`segb ${kind === 'suggestion' ? 'on' : ''}`} onClick={() => setKind('suggestion')}>Suggestion</span>
          <span className={`segb ${kind === 'complaint' ? 'on' : ''}`} onClick={() => setKind('complaint')}>Complaint</span>
        </div>
      </div>

      <div className="field">
        <label className="label">Your message</label>
        <textarea className="input" rows={6} value={message} onChange={(e) => setMessage(e.target.value)}
          placeholder={kind === 'complaint'
            ? 'Tell us what went wrong — the more detail, the better we can help.'
            : 'We’d love to hear your idea for making folks better.'} required />
      </div>

      <button className="btn full" disabled={loading || !message.trim()}>
        {loading ? 'Sending…' : 'Send to the folks team'}
      </button>
      <p className="muted-sub" style={{ fontSize: 12, marginTop: 10 }}>
        Goes straight to the folks team. We’ll reply to the email on your profile if a response is needed.
      </p>
    </form>
  )
}
