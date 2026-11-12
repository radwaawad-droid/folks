'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function ResetForm() {
  const supabase = createClient()
  const [ready, setReady] = useState(false)
  const [valid, setValid] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setValid(!!data?.user)
      setReady(true)
    })
  }, [])

  async function submit(e) {
    e.preventDefault()
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirm) { setError('Passwords don’t match.'); return }
    setLoading(true); setError('')
    const { error: uErr } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (uErr) { setError(uErr.message); return }
    setDone(true)
    setTimeout(() => { window.location.href = '/browse' }, 1400)
  }

  return (
    <main className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">folks <span className="d" /></div>
        <p className="auth-tag">Set a new password</p>

        {!ready ? (
          <div className="empty">Checking your link…</div>
        ) : !valid ? (
          <div className="empty">
            This reset link is invalid or has expired. <a className="linkish" href="/">Back to sign in →</a>
          </div>
        ) : done ? (
          <div className="notice-box">Password updated — taking you in…
            <style jsx>{`.notice-box{background:var(--green-soft);color:var(--green);border-radius:10px;padding:12px;font-size:14px}`}</style>
          </div>
        ) : (
          <form onSubmit={submit}>
            {error && <div className="err">{error}</div>}
            <label className="label">New password</label>
            <div className="pw-wrap">
              <input className="input pw-input" type={showPw ? 'text' : 'password'} value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" required />
              <button type="button" className="pw-toggle" onClick={() => setShowPw((s) => !s)}
                aria-label={showPw ? 'Hide password' : 'Show password'}>{showPw ? 'Hide' : 'Show'}</button>
            </div>
            <label className="label" style={{ marginTop: 14 }}>Confirm password</label>
            <input className="input" type={showPw ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••" autoComplete="new-password" required />
            <button className="btn full" style={{ marginTop: 16 }} disabled={loading}>
              {loading ? 'Saving…' : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
