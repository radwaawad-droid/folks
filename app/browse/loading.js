// Shown instantly while the Browse server component fetches listings, so the
// page feels immediate instead of blank during the round-trip.

function Tab({ children, label }) {
  return (
    <span className="tab" aria-hidden="true">
      {children}
      <span>{label}</span>
    </span>
  )
}

export default function BrowseLoading() {
  return (
    <>
      <nav className="nav">
        <div className="container nav-inner">
          <span className="logo">folks <span className="d" /></span>
          <span className="locpill">Arabian Ranches</span>
          <div className="nav-spacer" />
        </div>
      </nav>

      <main className="container page zoom-page" aria-busy="true">
        <div className="sk sk-search" />
        <div className="sk-chips">
          {Array.from({ length: 7 }).map((_, i) => <div key={i} className="sk sk-chip" />)}
        </div>
        <div className="sk sk-head" />
        <div className="grid">
          {Array.from({ length: 9 }).map((_, i) => (
            <div className="sk-card" key={i}>
              <div className="sk sk-ph" />
              <div className="sk sk-line" style={{ width: '72%' }} />
              <div className="sk sk-line" style={{ width: '44%' }} />
            </div>
          ))}
        </div>
      </main>

      {/* Static bottom bar so it doesn't flash out on mobile during load. */}
      <nav className="tabbar" aria-hidden="true">
        <Tab label="Browse"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></svg></Tab>
        <Tab label="Wanted"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10v4a1 1 0 0 0 1 1h2l8 4V5L7 10H5a1 1 0 0 0-1 1z" /><path d="M17 8.5a4.5 4.5 0 0 1 0 7" /></svg></Tab>
        <span className="tab tab-add" aria-hidden="true"><span className="tab-plus">＋</span><span>List</span></span>
        <Tab label="Messages"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.4 8.4 0 0 1-12 7.5L3 21l2-6a8.4 8.4 0 1 1 16-3.5z" /></svg></Tab>
      </nav>
    </>
  )
}
