'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

const SUB_AREAS = ['Saheel','Palmera','Alvorada','Mirador','Alma','Savannah','Hattan','Al Reem','AR2','AR3','Other / not sure']

export default function AuthForm() {
  const supabase = createClient()
  const [mode, setMode] = useState('signup')   // 'signup' | 'signin'
  const [fullName, setFullName] = useState('')
  const [subArea, setSubArea] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  function switchMode(m) { setMode(m); setError(''); setNotice('') }
  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  async function google() {
    setError(''); setNotice('')
    const { error: oErr } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${origin}/auth/callback` },
    })
    if (oErr) setError(oErr.message)
  }

  async function forgot() {
    setError(''); setNotice('')
    const addr = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr)) {
      setError('Enter your email above first, then tap “Forgot password”.'); return
    }
    setLoading(true)
    const { error: rErr } = await supabase.auth.resetPasswordForEmail(addr, { redirectTo: `${origin}/auth/callback?next=/reset` })
    setLoading(false)
    if (rErr) { setError(rErr.message); return }
    setNotice('Check your email for a link to reset your password.')
  }

  async function submit(e) {
    e.preventDefault(); setError(''); setNotice('')
    const addr = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr)) {
      setError('Please enter a valid email.'); return
    }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }

    setLoading(true)

    if (mode === 'signup') {
      if (!fullName.trim() || !subArea) {
        setLoading(false); setError('Please fill in your name and community.'); return
      }
      const { data, error: signErr } = await supabase.auth.signUp({
        email: addr,
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
          data: { full_name: fullName.trim(), sub_area: subArea },
        },
      })
      if (signErr) {
        setLoading(false)
        const m = signErr.message.toLowerCase()
        setError(m.includes('already') || m.includes('registered')
          ? 'An account with that email already exists. Try signing in instead.'
          : signErr.message)
        return
      }
      // Supabase hides "email exists" for privacy: on an existing email it returns
      // a user with an empty identities array instead of an error. Catch that.
      const identities = data?.user?.identities
      if (Array.isArray(identities) && identities.length === 0) {
        setLoading(false)
        setError('An account with that email already exists. Try signing in instead.')
        return
      }
      if (!data.session) {
        // Email confirmation is on — the account needs verifying first.
        setLoading(false)
        setNotice('Almost there! Check your email to confirm your account, then sign in.')
        return
      }
      // Session is live — finish the profile, then go in.
      await fetch('/api/onboard', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName.trim(), sub_area: subArea }),
      })
      window.location.href = '/browse'
    } else {
      const { data: signData, error: inErr } = await supabase.auth.signInWithPassword({ email: addr, password })
      if (inErr) { setLoading(false); setError('Wrong email or password. New here? Switch to Sign up.'); return }
      const uid = signData?.user?.id
      if (uid) {
        const { data: prof } = await supabase.from('profiles').select('banned, sub_area, full_name').eq('id', uid).maybeSingle()
        if (prof?.banned) {
          await supabase.auth.signOut()
          setLoading(false)
          setError('This account has been suspended. Please contact folks if you think this is a mistake.')
          return
        }
        setLoading(false)
        window.location.href = (prof?.full_name && prof?.sub_area) ? '/browse' : '/onboarding'
        return
      }
      setLoading(false)
      window.location.href = '/browse'
    }
  }

  return (
    <div className="auth-embed">
      <div className="seg authtabs">
        <span className={`segb ${mode === 'signup' ? 'on' : ''}`} onClick={() => switchMode('signup')}>Sign up</span>
        <span className={`segb ${mode === 'signin' ? 'on' : ''}`} onClick={() => switchMode('signin')}>Sign in</span>
      </div>

      {error && <div className="err">{error}</div>}
      {notice && <div className="notice-box">{notice}</div>}

      <button type="button" className="btn google full" onClick={google}>
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.3 17.7 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-2.8-.4-4.1H24v7.8h12.4c-.3 2.1-1.6 5.2-4.6 7.3l7.1 5.5c4.2-3.9 6.6-9.6 6.6-16.5z"/>
          <path fill="#FBBC05" d="M10.5 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C1 16.3 0 20 0 24s1 7.7 2.6 10.8l7.9-6.1z"/>
          <path fill="#34A853" d="M24 48c6.3 0 11.6-2.1 15.5-5.7l-7.1-5.5c-2 1.3-4.6 2.3-8.4 2.3-6.3 0-11.6-3.8-13.5-9.3l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/>
        </svg>
        Continue with Google
      </button>

      <div className="auth-or"><span>or</span></div>

      <form onSubmit={submit}>
        {mode === 'signup' && (
          <>
            <label className="label">Full name</label>
            <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Radwa Awad" required />

            <label className="label" style={{ marginTop: 14 }}>Community in Arabian Ranches</label>
            <select className="input" value={subArea} onChange={(e) => setSubArea(e.target.value)} required>
              <option value="">Select your community…</option>
              {SUB_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </>
        )}

        <label className="label" style={{ marginTop: mode === 'signup' ? 14 : 0 }}>Email</label>
        <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com" autoComplete="email" required />

        <label className="label" style={{ marginTop: 14 }}>Password</label>
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required />

        {mode === 'signin' && (
          <button type="button" className="linkish" style={{ marginTop: 10 }} onClick={forgot} disabled={loading}>
            Forgot password?
          </button>
        )}

        <button className="btn full" style={{ marginTop: 16 }} disabled={loading}>
          {loading ? 'Please wait…' : (mode === 'signup' ? 'Create my account' : 'Sign in')}
        </button>
      </form>

      <style jsx>{`
        .btn.google{background:#fff;color:var(--ink);border:1.5px solid var(--line);box-shadow:none}
        .btn.google:hover{background:#faf9f6}
        .auth-or{display:flex;align-items:center;gap:12px;color:var(--muted);font-size:12px;margin:16px 0}
        .auth-or::before,.auth-or::after{content:'';flex:1;height:1px;background:var(--line)}
        .notice-box{background:var(--green-soft);color:var(--green);border-radius:10px;padding:10px 12px;font-size:13px;margin-bottom:12px}
      `}</style>
    </div>
  )
}
