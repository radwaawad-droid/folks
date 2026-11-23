'use client'

import { useEffect, useState } from 'react'

// A brief branded boot screen: the folks door opens and closes once, then the
// splash fades into the app. Shows once per session (cold open), not on every
// internal navigation.
export default function BootSplash() {
  const [hide, setHide] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    try { sessionStorage.setItem('folks-booted', '1') } catch (_) {}
    const t1 = setTimeout(() => setHide(true), 1250)   // let one open+close play
    const t2 = setTimeout(() => setGone(true), 1750)   // then remove after the fade
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (gone) return null

  return (
    <div id="boot-splash" className={hide ? 'boot boot-hide' : 'boot'} aria-hidden="true">
      <svg className="boot-mark" width="120" height="120" viewBox="0 0 120 120" fill="none" role="img" aria-label="folks">
        {/* the app-icon tile — same colours as the logo */}
        <rect x="0" y="0" width="120" height="120" rx="27" fill="#205C49" />
        {/* white arch frame */}
        <path d="M36 95 V52 a24 24 0 0 1 48 0 V95"
          stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        {/* coral door, hinged on the right — swings open then shut, revealing the green behind */}
        <g className="boot-door">
          <path d="M47 95 V60 h26 v35 Z" fill="#F2774E" />
          <circle cx="53" cy="79" r="2.6" fill="#fff" />
        </g>
      </svg>
    </div>
  )
}
