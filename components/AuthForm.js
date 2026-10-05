'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

const SUB_AREAS = ['Saheel','Palmera','Alvorada','Mirador','Alma','Savannah','Hattan','Al Reem','AR2','AR3','Other / not sure']

// Supabase Auth uses email+password; we map a username to an internal email
// so people sign in with just a username. This domain is never emailed.
const toEmail = (username) => `${username.trim().toLowerCase()}@folks.local`

export default function AuthForm() {
  const supabase = createClient()
  const [mode, setMode] = useState('signup')   // 'signup' | 'signin'
  const [fullName, setFullName] = useState('')
  const [subArea, setSubArea] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function switchMode(m) { setMode(m); setError('') }

  async function submit(e) {
    e.preventDefault(); setError(''); setLoading(true)

    const uname = username.trim().toLowerCase()
    if (!/^[a-z0-9_]{3,}$/.test(uname)) {
      setLoading(false)
      setError('Username must be at least 3 characters: letters, numbers or underscores only.')
      return
    }

    if (mode === 'signup') {
      if (!fullName.trim() || !subArea) {
        setLoading(false); setError('Please fill in your name and community.'); return
      }
      if (password.length < 6) {
        setLoading(false); setError('Password must be at least 6 characters.'); return
      }

      const { data, error: signErr } = await supabase.auth.signUp({
        email: toEmail(uname),
        password,
        options: { data: { username: uname, full_name: fullName.trim() } },
      })
      if (signErr) {
        setLoading(false)
        setError(signErr.message.includes('already') ? 'That username is taken. Try another.' : signErr.message)
        return
      }

      // Create the profile row (self-declared resident; no phone step anymore).
      const user = data.user
      if (user) {
        const { data: comm } = await supabase
          .from('communities').select('id').eq('name', 'Arabian Ranches').maybeSingle()
        await supabase.from('profiles').upsert({
          id: user.id,
          full_name: fullName.trim(),
          username: uname,
          sub_area: subArea,
          community_id: comm?.id || null,
          phone_verified: true,
          resident_verified: true,
        })
      }
      window.location.href = '/browse'
    } else {
      // Sign in: existing users only.
      const { error: inErr } = await supabase.auth.signInWithPassword({
        email: toEmail(uname),
        password,
      })
      setLoading(false)
      if (inErr) { setError('Wrong username or password, or no account yet. New here? Switch to Sign up.'); return }
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

        <label className="label" style={{ marginTop: mode === 'signup' ? 14 : 0 }}>Username</label>
        <input className="input" value={username} onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. radwa_a" autoComplete="username" required />

        <label className="label" style={{ marginTop: 14 }}>Password</label>
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required />

        <button className="btn full" style={{ marginTop: 16 }} disabled={loading}>
          {loading ? 'Please wait…' : (mode === 'signup' ? 'Create my account' : 'Sign in')}
        </button>
      </form>
    </div>
  )
}
