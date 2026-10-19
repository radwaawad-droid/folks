'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { notify } from '@/lib/notify'

// Shown to the requester on a pending offer. Accepting picks this neighbour and
// auto-declines the others; the accepted chat stays open to arrange pickup.
export default function AcceptOffer({ requestId, replyId }) {
  const supabase = createClient()
  const [busy, setBusy] = useState(false)

  async function accept() {
    if (!window.confirm('Accept this offer? Your other offers on this request will be declined. You can still chat to arrange pickup.')) return
    setBusy(true)
    const { error } = await supabase.from('request_replies').update({ status: 'accepted' }).eq('id', replyId)
    if (error) { setBusy(false); return }
    await supabase.from('request_replies').update({ status: 'declined' }).eq('request_id', requestId).neq('id', replyId)
    notify({ type: 'wanted_accepted', replyId })
    window.location.reload()
  }

  return (
    <button className="btn sm" disabled={busy} onClick={accept}>
      {busy ? 'Saving…' : 'Accept this offer'}
    </button>
  )
}
