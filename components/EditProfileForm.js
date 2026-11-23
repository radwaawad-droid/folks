'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { avatarColor } from '@/lib/avatar'

const SUB_AREAS = ['Saheel','Palmera','Alvorada','Mirador','Alma','Savannah','Hattan','Al Reem','AR2','AR3','Other / not sure']

export default function EditProfileForm({ profile }) {
  const supabase = createClient()
  const [fullName, setFullName] = useState(profile.full_name || '')
  const [subArea, setSubArea] = useState(profile.sub_area || '')
  const [preview, setPreview] = useState(profile.avatar_url || null)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Sign-in email change (separate flow — needs email confirmation).
  const currentEmail = profile.email || ''
  const [showEmail, setShowEmail] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailErr, setEmailErr] = useState('')
  const [emailMsg, setEmailMsg] = useState('')

  function onPick(f) {
    setFile(f)
    if (f) { const r = new FileReader(); r.onload = () => setPreview(r.result); r.readAsDataURL(f) }
  }

  async function save(e) {
    e.preventDefault(); setError(''); setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/'; return }

    let avatar_url = profile.avatar_url || null
    if (file) {
      if (file.size > 2 * 1024 * 1024) { setLoading(false); setError('Please choose an image under 2 MB.'); return }
      try {
        avatar_url = await new Promise((res, rej) => {
          const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file)
        })
      } catch (_) {}
    }

    const { error: upErr } = await supabase.from('profiles').update({
      full_name: fullName.trim(),
      sub_area: subArea || null,
      avatar_url,
    }).eq('id', user.id)

    setLoading(false)
    if (upErr) { setError(upErr.message); return }
    window.location.href = '/profile'
  }

  async function changeEmail(e) {
    e.preventDefault(); setEmailErr(''); setEmailMsg('')
    const next = newEmail.trim().toLowerCase()
    if (!next || !next.includes('@')) { setEmailErr('Enter a valid email address.'); return }
    if (next === currentEmail.toLowerCase()) { setEmailErr('That’s already your email.'); return }
    setEmailLoading(true)
    const { error: upErr } = await supabase.auth.updateUser(
      { email: next },
      { emailRedirectTo: `${window.location.origin}/auth/callback?next=/profile` }
    )
    setEmailLoading(false)
    if (upErr) { setEmailErr(upErr.message); return }
    setEmailMsg(`Almost done — we sent a confirmation link to ${next}. Open it to finish the change. (Check your spam folder if it’s not there, and you may also get a confirmation at your current email.)`)
    setShowEmail(false); setNewEmail('')
  }

  return (
    <>
      <form className="listform" onSubmit={save}>
        {error && <div className="err">{error}</div>}

        <div className="edit-avatar-row">
          {preview ? <img className="edit-avatar" src={preview} alt="" />
                   : <span className="avatar big" style={{ background: avatarColor(fullName) }}>{(fullName || 'Y').charAt(0).toUpperCase()}</span>}
          <label className="btn sm ghost edit-avatar-btn">
            Change photo
            <input type="file" accept="image/*" style={{ display: 'none' }}
              onChange={(e) => onPick(e.target.files?.[0] || null)} />
          </label>
        </div>

        <div className="field">
          <label className="label">Full name</label>
          <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>

        <div className="field">
          <label className="label">Community in Arabian Ranches</label>
          <select className="input" value={subArea} onChange={(e) => setSubArea(e.target.value)} required>
            <option value="">Select your community…</option>
            {SUB_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <button className="btn full" disabled={loading}>{loading ? 'Saving…' : 'Save changes'}</button>
      </form>

      <div className="email-box">
        <div className="email-head">
          <div>
            <div className="label" style={{ marginBottom: 2 }}>Email</div>
            <div className="email-current">{currentEmail || '—'}</div>
            <div className="hint" style={{ marginTop: 4 }}>You sign in with this address, and it’s where folks sends your notifications.</div>
          </div>
          {!showEmail && (
            <button type="button" className="btn sm ghost" onClick={() => { setShowEmail(true); setEmailMsg(''); setEmailErr('') }}>
              Change
            </button>
          )}
        </div>

        {emailMsg && <div className="email-ok">{emailMsg}</div>}

        {showEmail && (
          <form onSubmit={changeEmail} style={{ marginTop: 12 }}>
            {emailErr && <div className="err">{emailErr}</div>}
            <label className="label">New email</label>
            <input className="input" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
              placeholder="you@example.com" autoComplete="email" required />
            <div className="email-actions">
              <button className="btn sm" disabled={emailLoading}>{emailLoading ? 'Sending…' : 'Send confirmation link'}</button>
              <button type="button" className="linkish" onClick={() => { setShowEmail(false); setNewEmail(''); setEmailErr('') }}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </>
  )
}
