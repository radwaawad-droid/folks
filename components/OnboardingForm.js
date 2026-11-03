'use client'

import { useState } from 'react'

const SUB_AREAS = ['Saheel','Palmera','Alvorada','Mirador','Alma','Savannah','Hattan','Al Reem','AR2','AR3','Other / not sure']

export default function OnboardingForm({ defaultName = '' }) {
  const [fullName, setFullName] = useState(defaultName)
  const [subArea, setSubArea] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    if (!fullName.trim() || !subArea) { setError('Please add your name and community.'); return }
    setLoading(true); setError('')
    try {
      const r = await fetch('/api/onboard', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName.trim(), sub_area: subArea }),
      })
      const j = await r.json()
      if (!j.ok) { setError(j.error || 'Something went wrong.'); setLoading(false); return }
      window.location.href = '/browse'
    } catch (e) { setError(String(e)); setLoading(false) }
  }

  return (
    <form onSubmit={submit}>
      {error && <div className="err">{error}</div>}

      <label className="label">Full name</label>
      <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)}
        placeholder="e.g. Radwa Awad" required />

      <label className="label" style={{ marginTop: 14 }}>Community in Arabian Ranches</label>
      <select className="input" value={subArea} onChange={(e) => setSubArea(e.target.value)} required>
        <option value="">Select your community…</option>
        {SUB_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
      </select>

      <button className="btn full" style={{ marginTop: 16 }} disabled={loading}>
        {loading ? 'Please wait…' : 'Continue'}
      </button>
    </form>
  )
}
