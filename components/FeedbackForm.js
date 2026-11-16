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

  function reset() {
    setSent(false); setMessage(''); setError(''); setKind('suggestion')
  }

  if (sent) {
    return (
      <div className="fb-card fb-sent">
        <span className="fb-check" aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M5 12.5l4.2 4.2L19 7" stroke="currentColor" strokeWidth="2.4"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <h2>Message sent</h2>
        <p>Thank you — your {kind} reached the folks team. We read every one, and we’ll reply to the email on your profile if a response is needed.</p>
        <div className="fb-sent-actions">
          <a className="btn" href="/profile">Back to profile</a>
          <button type="button" className="btn ghost" onClick={reset}>Send another</button>
        </div>
      </div>
    )
  }

  return (
    <form className="fb-card" onSubmit={submit}>
      {error && <div className="err">{error}</div>}

      <div className="field">
        <label className="label">What’s this about?</label>
        <div className="seg">
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
      <p className="fb-note">
        Goes straight to the folks team at hello@folksdxb.com. Your name and area come along so we know who to thank.
      </p>
    </form>
  )
}
