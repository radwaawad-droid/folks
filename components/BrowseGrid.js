'use client'

import { useState } from 'react'
import ItemCard from '@/components/ItemCard'
import { DEFAULT_CATEGORIES } from '@/lib/categories'

export default function BrowseGrid({ items, categories }) {
  const cats = (categories && categories.length) ? categories : DEFAULT_CATEGORIES
  const FILTERS = [
    { key: 'all', label: 'All', cats: null },
    ...cats.map((c) => ({ key: c.key, label: c.label, cats: [c.key] })),
  ]

  const [active, setActive] = useState('all')
  const [q, setQ] = useState('')

  const filter = FILTERS.find((f) => f.key === active) || FILTERS[0]
  const term = q.trim().toLowerCase()

  const shown = items.filter((i) => {
    const inCat = filter.cats ? filter.cats.includes(i.category) : true
    if (!inCat) return false
    if (!term) return true
    const hay = `${i.title || ''} ${i.description || ''}`.toLowerCase()
    return hay.includes(term)
  })

  return (
    <>
      <div className="searchbar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7770" strokeWidth="2">
          <circle cx="11" cy="11" r="7" /><path d="m21 21-4-4" />
        </svg>
        <input
          className="searchbar-input"
          placeholder="Search drills, strollers, tents…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {q && <button className="searchbar-clear" onClick={() => setQ('')} aria-label="Clear">✕</button>}
      </div>

      <div className="chips filter-row">
        {FILTERS.map((f) => (
          <span key={f.key}
            className={`chip ${active === f.key ? 'on' : ''}`}
            onClick={() => setActive(f.key)}>{f.label}</span>
        ))}
      </div>

      <div className="browse-head">
        <h1>{term ? `Results for “${q.trim()}”` : 'Near you in Arabian Ranches'}</h1>
        <span className="result-count">{shown.length} {shown.length === 1 ? 'item' : 'items'}</span>
      </div>

      {shown.length === 0
        ? <div className="empty">
            {term ? `Nothing matches “${q.trim()}”. ` : 'No items in this category yet. '}
            Can’t find it? <a className="linkish" href="/requests/new">Post a request →</a> and let neighbours know.
          </div>
        : <div className="grid">{shown.map((item) => <ItemCard key={item.id} item={item} />)}</div>}
    </>
  )
}
