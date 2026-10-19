'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function RequestStatus({ requestId, status, isOwner }) {
  const supabase = createClient()
  const [busy, setBusy] = useState(false)
  const closed = status === 'closed'

  async function setStatus(next) {
    setBusy(true)
    const { error } = await supabase
      .from('item_requests').update({ status: next }).eq('id', requestId)
    if (error) { setBusy(false); return }
    window.location.reload()
  }

  return (
    <div className="req-status">
      {closed && <span className="found-badge">Found</span>}

      {isOwner && !closed && (
        <button className="btn sm" disabled={busy} onClick={() => setStatus('closed')}>
          {busy ? 'Saving…' : 'Mark as found'}
        </button>
      )}
      {isOwner && closed && (
        <button className="btn sm ghost" disabled={busy} onClick={() => setStatus('open')}>
          {busy ? 'Saving…' : 'Reopen request'}
        </button>
      )}

      <style jsx>{`
        .req-status{display:flex;align-items:center;gap:10px;margin:14px 0 4px}
        .found-badge{display:inline-block;font-size:12px;font-weight:700;padding:5px 12px;border-radius:999px;
          background:var(--green-soft);color:var(--green)}
      `}</style>
    </div>
  )
}
