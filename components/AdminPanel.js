'use client'

import { useState } from 'react'

function fmtDate(d) {
  try { return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }
  catch { return '' }
}

export default function AdminPanel({ items, profiles, categories = [], counts, stats = null, meId }) {
  const [tab, setTab] = useState('listings')
  const [busy, setBusy] = useState(null)
  const [err, setErr] = useState('')
  const [q, setQ] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [newEmoji, setNewEmoji] = useState('')

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

  const tiles = stats ? [
    { label: 'Members', value: stats.members, sub: stats.membersNew ? `+${stats.membersNew} this week` : null },
    { label: 'Active listings', value: stats.listingsActive, sub: stats.listingsNew ? `+${stats.listingsNew} this week` : null },
    { label: 'Pending requests', value: stats.bookingsPending, sub: 'awaiting reply', accent: stats.bookingsPending > 0 },
    { label: 'Active borrows', value: stats.bookingsActive, sub: 'out now' },
    { label: 'Completed', value: stats.bookingsReturned, sub: 'returned safely' },
    { label: 'Wanted open', value: stats.wantedOpen, sub: 'requests posted' },
    { label: 'Reviews', value: stats.reviews, sub: 'left by neighbours' },
    { label: 'Banned', value: stats.banned, sub: stats.banned > 0 ? 'suspended' : 'all clear', accent: stats.banned > 0 },
  ] : []

  return (
    <div>
      {stats && (
        <div className="stat-grid">
          {tiles.map((t) => (
            <div className={`stat-tile ${t.accent ? 'accent' : ''}`} key={t.label}>
              <div className="stat-num">{t.value}</div>
              <div className="stat-lab">{t.label}</div>
              {t.sub && <div className="stat-sub">{t.sub}</div>}
            </div>
          ))}
        </div>
      )}

      <div className="seg" style={{ maxWidth: 520, marginBottom: 16 }}>
        <span className={`segb ${tab === 'listings' ? 'on' : ''}`} onClick={() => setTab('listings')}>
          Listings ({items.length})
        </span>
        <span className={`segb ${tab === 'members' ? 'on' : ''}`} onClick={() => setTab('members')}>
          Members ({profiles.length})
        </span>
        <span className={`segb ${tab === 'categories' ? 'on' : ''}`} onClick={() => setTab('categories')}>
          Categories ({categories.length})
        </span>
      </div>

      {tab !== 'categories' && (
        <input className="input" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)}
          style={{ marginBottom: 16 }} />
      )}

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

      {tab === 'categories' && (
        <div>
          <form className="cat-add" onSubmit={(e) => {
            e.preventDefault()
            const label = newLabel.trim()
            if (!label) return
            call({ action: 'add_category', label, emoji: newEmoji.trim() })
          }}>
            <input className="input" placeholder="New category (e.g. Books)" value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)} />
            <input className="input cat-emoji-in" placeholder="icon" value={newEmoji} maxLength={4}
              onChange={(e) => setNewEmoji(e.target.value)} />
            <button className="btn sm" disabled={!newLabel.trim() || !!busy}>Add</button>
          </form>

          <div className="rows">
            {categories.length === 0 && <div className="empty">No categories yet.</div>}
            {categories.map((c) => {
              const payload = { action: 'delete_category', key: c.key }
              return (
                <div className="row admin-row" key={c.key}>
                  <div className="admin-thumb"><span style={{ fontSize: 20 }}>{c.emoji || '📦'}</span></div>
                  <div className="row-main">
                    <b>{c.label}</b>
                    <small>{c.key}</small>
                  </div>
                  <button className="btn sm danger" disabled={busy === JSON.stringify(payload)}
                    onClick={() => call(payload, `Delete the “${c.label}” category? Existing listings keep their tag, but it stops appearing as a filter.`)}>
                    Delete
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <style jsx>{`
        .stat-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:22px}
        .stat-tile{background:#fff;border:1px solid var(--line);border-radius:14px;padding:16px 16px 14px}
        .stat-tile.accent{border-color:var(--coral);background:#FFF6F1}
        .stat-num{font-family:'Fraunces',Georgia,serif;font-weight:700;font-size:30px;line-height:1;color:var(--green)}
        .stat-tile.accent .stat-num{color:var(--coral)}
        .stat-lab{margin-top:8px;font-weight:700;font-size:13px;color:var(--ink,#2b2b2b)}
        .stat-sub{margin-top:2px;font-size:11px;color:var(--muted)}
        @media(max-width:720px){.stat-grid{grid-template-columns:repeat(2,1fr);gap:10px}
          .stat-num{font-size:26px}}
        .cat-add{display:flex;gap:8px;margin-bottom:16px}
        .cat-emoji-in{max-width:76px;text-align:center}
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
