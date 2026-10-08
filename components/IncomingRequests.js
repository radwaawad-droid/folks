'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { notify } from '@/lib/notify'

export default function IncomingRequests({ requests }) {
  const supabase = createClient()
  const [busy, setBusy] = useState(null)
  const [err, setErr] = useState('')

  async function setStatus(id, status) {
    setErr(''); setBusy(id)
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id)
    setBusy(null)
    if (error) { setErr(error.message); return }
    // Email the borrower about the decision (best-effort).
    if (status === 'accepted' || status === 'declined') notify({ type: status, bookingId: id })
    window.location.reload()
  }

  return (
    <div className="rows">
      {err && <div className="err">{err}</div>}
      {requests.map((r) => (
        <div className="row req" key={r.id}>
          <div className="row-main">
            <b>{r.item?.title || 'Your item'}</b>
            <small>
              {r.borrower?.full_name || 'A neighbour'}
              {r.borrower?.sub_area ? ` · ${r.borrower.sub_area}` : ''}
              {r.start_date ? ` · ${r.start_date} → ${r.end_date}` : ''}
            </small>
            {r.message && <p className="req-msg">“{r.message}”</p>}
          </div>
          <div className="req-actions">
            <button className="btn sm" disabled={busy === r.id} onClick={() => setStatus(r.id, 'accepted')}>
              {busy === r.id ? '…' : 'Accept'}
            </button>
            <button className="btn sm ghost" disabled={busy === r.id} onClick={() => setStatus(r.id, 'declined')}>
              Decline
            </button>
            <a className="btn sm ghost" href={`/messages/${r.id}`}>Message</a>
          </div>
        </div>
      ))}
    </div>
  )
}
