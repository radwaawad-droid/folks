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
      <svg className="boot-mark" viewBox="0 0 120 132" fill="none" role="img" aria-label="folks">
        {/* doorway interior, revealed as the door opens */}
        <path d="M38 122 V58 a22 22 0 0 1 44 0 V122 Z" fill="#E7F0EC" />
        {/* arch frame */}
        <path d="M27 122 V57 a33 33 0 0 1 66 0 V122"
          stroke="#205C49" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        {/* the door, hinged on the right — swings open then shut */}
        <g className="boot-door">
          <path d="M41 122 V62 h38 v60 Z" fill="#F2774E" />
          <circle cx="49" cy="94" r="3.4" fill="#fff" />
        </g>
      </svg>

      <style jsx>{`
        .boot{position:fixed;inset:0;z-index:2000;display:flex;align-items:center;justify-content:center;
          background:var(--paper);transition:opacity .5s ease}
        .boot-hide{opacity:0}
        .boot-mark{width:116px;height:auto;filter:drop-shadow(0 8px 24px rgba(28,38,32,.10))}
        .boot-door{transform-box:fill-box;transform-origin:right center;animation:boot-swing 1.25s ease-in-out both}
        @keyframes boot-swing{
          0%{transform:scaleX(1)}
          40%{transform:scaleX(.08)}
          80%,100%{transform:scaleX(1)}
        }
        @media (prefers-reduced-motion: reduce){ .boot-door{animation:none} }
      `}</style>
    </div>
  )
}
