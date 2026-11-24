'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { avatarColor } from '@/lib/avatar'
import ImageCropper from '@/components/ImageCropper'
import { uploadPhoto } from '@/lib/upload'

const SUB_AREAS = ['Saheel','Palmera','Alvorada','Mirador','Alma','Savannah','Hattan','Al Reem','AR2','AR3','Other / not sure']

export default function EditProfileForm({ profile }) {
  const supabase = createClient()
  const [fullName, setFullName] = useState(profile.full_name || '')
  const [subArea, setSubArea] = useState(profile.sub_area || '')
  const [preview, setPreview] = useState(profile.avatar_url || null)
  const [newAvatar, setNewAvatar] = useState(null)     // uploaded URL for the cropped photo, or null if unchanged
  const [pendingFile, setPendingFile] = useState(null) // raw file waiting to be cropped
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function onPick(f) {
    if (!f) return
    if (f.size > 8 * 1024 * 1024) { setError('Please choose an image under 8 MB.'); return }
    setError('')
    setPendingFile(f) // opens the cropper
  }

  async function onCropped(blob) {
    setPendingFile(null)
    setUploading(true); setError('')
    try {
      const url = await uploadPhoto(supabase, blob)
      if (url) { setNewAvatar(url); setPreview(url) }
      else setError('Couldn’t process that photo — please try another.')
    } catch (_) {
      setError('Couldn’t process that photo — please try another.')
    }
    setUploading(false)
  }

  async function save(e) {
    e.preventDefault(); setError(''); setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/'; return }

    const avatar_url = newAvatar !== null ? newAvatar : (profile.avatar_url || null)

    const { error: upErr } = await supabase.from('profiles').update({
      full_name: fullName.trim(),
      sub_area: subArea || null,
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
                 : <span className="avatar big" style={{ background: avatarColor(fullName) }}>{(fullName || 'Y').charAt(0).toUpperCase()}</span>}
        <label className="btn sm ghost edit-avatar-btn">
          {uploading ? 'Uploading…' : (preview ? 'Change photo' : 'Add photo')}
          <input type="file" accept="image/*" style={{ display: 'none' }} disabled={uploading}
            onChange={(e) => { onPick(e.target.files?.[0] || null); e.target.value = '' }} />
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

      <button className="btn full" disabled={loading || uploading}>
        {loading ? 'Saving…' : uploading ? 'Uploading photo…' : 'Save changes'}
      </button>

      {pendingFile && (
        <ImageCropper
          file={pendingFile}
          out={600}
          onDone={onCropped}
          onCancel={() => setPendingFile(null)}
        />
      )}
    </form>
  )
}
