'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

const SUB_AREAS = ['Saheel','Palmera','Alvorada','Mirador','Alma','Savannah','Hattan','Al Reem','AR2','AR3','Other / not sure']

export default function EditProfileForm({ profile }) {
  const supabase = createClient()
  const [fullName, setFullName] = useState(profile.full_name || '')
  const [subArea, setSubArea] = useState(profile.sub_area || '')
  const [email, setEmail] = useState(profile.notify_email || '')
  const [preview, setPreview] = useState(profile.avatar_url || null)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      notify_email: email.trim().toLowerCase() || null,
      avatar_url,
    }).eq('id', user.id)

    setLoading(false)
    if (upErr) { setError(upErr.message); return }
    window.location.href = '/profile'
  }

  return (
    <form className="listform" onSubmit={save}>
      {error && <div className="err">{error}</div>}

      <div className="edit-avatar-row">
        {preview ? <img className="edit-avatar" src={preview} alt="" />
                 : <span className="avatar big">{(fullName || 'Y').charAt(0).toUpperCase()}</span>}
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

      <div className="field">
        <label className="label">Email</label>
        <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com" autoComplete="email" />
        <div className="hint">For notifications when a neighbour wants to borrow or messages you. Never shared.</div>
      </div>

      <div className="field">
        <label className="label">Username</label>
        <input className="input" value={`@${profile.username || ''}`} disabled />
        <div className="hint">Usernames can’t be changed.</div>
      </div>

      <button className="btn full" disabled={loading}>{loading ? 'Saving…' : 'Save changes'}</button>
    </form>
  )
}
