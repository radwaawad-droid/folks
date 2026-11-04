'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function DeleteAccount() {
  const supabase = createClient()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function remove() {
    const ok = window.confirm(
      'Delete your folks account? This permanently removes your listings, bookings and messages. This cannot be undone.'
    )
    if (!ok) return
    const sure = window.confirm('Are you sure? There’s no way to recover your account afterwards.')
    if (!sure) return

    setBusy(true); setError('')
    try {
      const r = await fetch('/api/delete-account', { method: 'POST' })
      const j = await r.json()
      if (!j.ok) { setError(j.error || 'Couldn’t delete your account. Please try again.'); setBusy(false); return }
      await supabase.auth.signOut().catch(() => {})
      window.location.href = '/'
    } catch (e) { setError(String(e)); setBusy(false) }
  }

  return (
    <div className="danger-zone">
      {error && <div className="err" style={{ marginBottom: 10 }}>{error}</div>}
      <button className="del-link" onClick={remove} disabled={busy}>
        {busy ? 'Deleting…' : 'Delete my account'}
      </button>
      <style jsx>{`
        .danger-zone{margin-top:14px}
        .del-link{background:none;border:none;color:#C2451F;font-size:13px;font-weight:600;cursor:pointer;padding:4px}
        .del-link:hover{text-decoration:underline}
        .del-link:disabled{opacity:.6;cursor:not-allowed}
      `}</style>
    </div>
  )
}
