'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

// side: 'borrower' | 'lender' — which role the current user plays on this booking.
export default function BookingActions({ booking, meId, otherId, side, alreadyReviewed }) {
  const supabase = createClient()
  const [status, setStatus] = useState(booking.status)
  const [reviewed, setReviewed] = useState(alreadyReviewed)
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function markReturned() {
    setBusy(true); setError('')
    const { error } = await supabase.from('bookings').update({ status: 'returned' }).eq('id', booking.id)
    setBusy(false)
    if (error) { setError(error.message); return }
    setStatus('returned')
  }

  async function submitReview(e) {
    e.preventDefault(); setBusy(true); setError('')
    const { error } = await supabase.from('reviews').insert({
      booking_id: booking.id,
      reviewer_id: meId,
      reviewee_id: otherId,
      role: side === 'borrower' ? 'as_borrower' : 'as_lender',
      rating,
      comment: comment.trim() || null,
    })
    setBusy(false)
    if (error) { setError(error.message); return }
    setReviewed(true); setShowForm(false)
  }

  return (
    <div className="booking-actions">
      {error && <div className="err" style={{ marginBottom: 8 }}>{error}</div>}

      {(status === 'accepted' || status === 'active') && (
        <button className="btn sm" onClick={markReturned} disabled={busy}>
          {busy ? '…' : 'Mark returned'}
        </button>
      )}

      {status === 'returned' && reviewed && <span className="reviewed-tag">✓ You reviewed</span>}

      {status === 'returned' && !reviewed && !showForm && (
        <button className="btn sm" onClick={() => setShowForm(true)}>Leave a review</button>
      )}

      {status === 'returned' && !reviewed && showForm && (
        <form className="review-form" onSubmit={submitReview}>
          <div className="stars-pick">
            {[1,2,3,4,5].map((n) => (
              <span key={n} className={`star-pick ${n <= rating ? 'on' : ''}`}
                onClick={() => setRating(n)}>★</span>
            ))}
          </div>
          <textarea className="input" rows={2} placeholder="How did it go? (optional)"
            value={comment} onChange={(e) => setComment(e.target.value)} />
          <div className="review-form-actions">
            <button className="btn sm" disabled={busy}>{busy ? 'Saving…' : 'Submit review'}</button>
            <button type="button" className="linkish" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  )
}
