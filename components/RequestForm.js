'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function RequestForm({ item, isSample }) {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [message, setMessage] = useState('')

  async function submit(e) {
    e.preventDefault()
    setError('')

    // Sample listings are placeholders — just show the success state.
    if (isSample) { setSent(true); return }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      router.push('/login')
      return
    }

    const { error } = await supabase.from('bookings').insert({
      item_id: item.id,
      borrower_id: user.id,
      lender_id: item.owner_id,
      start_date: start || null,
      end_date: end || null,
      message,
      fee_total: 0,
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="sent">
        <div className="burst">🎉</div>
        <h3>Request sent!</h3>
        <p>We’ll let you know as soon as the owner responds.</p>
        <ol className="stepper">
          <li className="done">Requested</li>
          <li className="now">Waiting for the owner to accept</li>
          <li>Arrange an easy pickup</li>
          <li>Return &amp; leave a review</li>
        </ol>
      </div>
    )
  }

  if (!open) {
    return <button className="btn full" onClick={() => setOpen(true)}>Request to borrow</button>
  }

  return (
    <form onSubmit={submit} className="reqform">
      {error && <div className="err">{error}</div>}
      <div className="daterow">
        <label className="datebox">
          <small>Pickup</small>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} required />
        </label>
        <label className="datebox">
          <small>Return</small>
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} required />
        </label>
      </div>
      <label className="label" style={{ marginTop: 12 }}>Message to the owner</label>
      <textarea
        className="input"
        rows={3}
        placeholder="Hi! Could I borrow this for the weekend?"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button className="btn full" style={{ marginTop: 14 }} disabled={loading}>
        {loading ? 'Sending…' : 'Send request'}
      </button>
    </form>
  )
}
