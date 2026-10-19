'use client'

import { useState } from 'react'

function fmtDate(d) {
  try { return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }
  catch { return '' }
}

export default function AdminPanel({ items, profiles, counts, meId }) {
  const [tab, setTab] = useState('listings')
  const [busy, setBusy] = useState(null)
  const [err, setErr] = useState('')
  const [q, setQ] = useState('')

  async function call(payload, confirmMsg) {
    if (confirmMsg && !window.confirm(confirmMsg)) return
    setErr(''); setBusy(JSON.stringify(payload))
    try {
      const r = await fetch('/api/admin', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      })
      const j = await r.json()
      if (!j.ok) { setErr(j.error || 'Something went wrong.'); setBusy(null); return }
      window.location.reload()
    } catch (e) { setErr(String(e)); setBusy(null) }
  }

  const ql = q.trim().toLowerCase()
  const shownItems = ql
    ? items.filter((i) => `${i.title} ${i.owner?.full_name || ''} ${i.owner?.username || ''}`.toLowerCase().includes(ql))
    : items
  const shownProfiles = ql
    ? profiles.filter((p) => `${p.full_name || ''} ${p.username || ''} ${p.notify_email || ''} ${p.sub_area || ''}`.toLowerCase().includes(ql))
    : profiles

  return (
    <div>
      <div className="seg" style={{ maxWidth: 360, marginBottom: 16 }}>
        <span className={`segb ${tab === 'listings' ? 'on' : ''}`} onClick={() => setTab('listings')}>
          Listings ({items.length})
        </span>
        <span className={`segb ${tab === 'members' ? 'on' : ''}`} onClick={() => setTab('members')}>
          Members ({profiles.length})
        </span>
      </div>

      <input className="input" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)}
        style={{ marginBottom: 16 }} />

      {err && <div className="err" style={{ marginBottom: 14 }}>{err}</div>}

      {tab === 'listings' && (
        <div className="rows">
          {shownItems.length === 0 && <div className="empty">No listings.</div>}
          {shownItems.map((it) => {
            const photo = Array.isArray(it.photos) && it.photos.length ? it.photos[0] : null
            const payload = { action: 'delete_item', itemId: it.id }
            return (
              <div className="row admin-row" key={it.id}>
                <div className="admin-thumb">
                  {photo ? <img src={photo} alt="" /> : <span>—</span>}
                </div>
                <div className="row-main">
                  <b>{it.title}</b>
                  <small>
                    {it.owner?.full_name || 'Unknown'}{it.owner?.username ? ` · @${it.owner.username}` : ''}
                    {' · '}{it.is_free ? 'Free' : `AED ${it.fee_per_day}/day`}
                    {it.status === 'paused' ? ' · Paused' : ''}
                    {' · '}{fmtDate(it.created_at)}
                  </small>
                </div>
                <a className="btn sm ghost" href={`/item/${it.id}`} target="_blank" rel="noreferrer">View</a>
                <button className="btn sm danger" disabled={busy === JSON.stringify(payload)}
                  onClick={() => call(payload, `Delete “${it.title}”? This can’t be undone.`)}>
                  Delete
                </button>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'members' && (
        <div className="rows">
          {shownProfiles.length === 0 && <div className="empty">No members.</div>}
          {shownProfiles.map((p) => {
            const isSelf = p.id === meId
            const banPayload = { action: p.banned ? 'unban_user' : 'ban_user', userId: p.id }
            return (
              <div className="row admin-row" key={p.id}>
                <div className="admin-av">{(p.full_name || '?').charAt(0).toUpperCase()}</div>
                <div className="row-main">
                  <b>
                    {p.full_name || 'No name'}
                    {p.is_admin && <span className="admin-pill">Admin</span>}
                    {p.banned && <span className="admin-pill banned">Banned</span>}
                  </b>
                  <small>
                    {p.username ? `@${p.username}` : ''}{p.sub_area ? ` · ${p.sub_area}` : ''}
                    {p.notify_email ? ` · ${p.notify_email}` : ''}
                    {' · '}{counts[p.id] || 0} listing{(counts[p.id] || 0) === 1 ? '' : 's'}
                    {' · joined '}{fmtDate(p.created_at)}
                  </small>
                </div>
                {isSelf || p.is_admin ? (
                  <span className="muted-sub" style={{ margin: 0, fontSize: 12 }}>{isSelf ? 'You' : 'Protected'}</span>
                ) : (
                  <button className={`btn sm ${p.banned ? 'ghost' : 'danger'}`}
                    disabled={busy === JSON.stringify(banPayload)}
                    onClick={() => call(banPayload, p.banned
                      ? `Unban ${p.full_name}? They’ll be able to sign in again.`
                      : `Ban ${p.full_name}? This also deletes all their listings. You can unban later.`)}>
                    {p.banned ? 'Unban' : 'Ban'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      <style jsx>{`
        .admin-row{display:flex;align-items:center;gap:12px}
        .admin-thumb{width:46px;height:46px;border-radius:10px;overflow:hidden;background:#fff;border:1px solid var(--line);
          flex:0 0 auto;display:flex;align-items:center;justify-content:center;color:var(--muted)}
        .admin-thumb img{width:100%;height:100%;object-fit:contain;padding:4px}
        .admin-av{width:40px;height:40px;border-radius:50%;background:var(--green);color:#fff;flex:0 0 auto;
          display:flex;align-items:center;justify-content:center;font-family:'Fraunces',Georgia,serif;font-weight:700}
        .admin-pill{display:inline-block;margin-left:8px;font-size:10px;font-weight:700;padding:3px 8px;border-radius:999px;
          background:var(--green-soft);color:var(--green);vertical-align:middle}
        .admin-pill.banned{background:#FBE4DC;color:#C2451F}
      `}</style>
    </div>
  )
}
