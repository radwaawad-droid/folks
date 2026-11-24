'use client'

import { useEffect, useState } from 'react'

// A gentle, one-time nudge shown only to iPhone/iPad users in Safari who haven't
// installed folks yet — because on iOS, notifications only work for a web app
// added to the Home Screen from Safari.
export default function IosInstallNudge() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    try {
      const ua = navigator.userAgent || ''
      const isIOS = /iphone|ipad|ipod/i.test(ua) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
      // Only real Safari can "Add to Home Screen" with push — not Chrome/Edge/Firefox on iOS.
      const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios|chrome/i.test(ua)
      const standalone = window.navigator.standalone === true ||
        window.matchMedia('(display-mode: standalone)').matches
      const dismissed = localStorage.getItem('folks-ios-nudge') === '1'
      if (isIOS && isSafari && !standalone && !dismissed) {
        const t = setTimeout(() => setShow(true), 2500)
        return () => clearTimeout(t)
      }
    } catch (_) {}
  }, [])

  function dismiss() {
    try { localStorage.setItem('folks-ios-nudge', '1') } catch (_) {}
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="ios-nudge" role="dialog" aria-label="Add folks to your Home Screen">
      <span className="ios-nudge-icon" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 15V3" /><path d="M8 7l4-4 4 4" />
          <path d="M6 11v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8" />
        </svg>
      </span>
      <div className="ios-nudge-text">
        <b>Get folks notifications</b>
        <span>
          Tap the Share button
          <span className="shr" aria-hidden="true">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 15V3" /><path d="M8 7l4-4 4 4" /><path d="M6 11v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8" />
            </svg>
          </span>
          , then “Add to Home Screen”.
        </span>
      </div>
      <button className="ios-nudge-x" onClick={dismiss} aria-label="Dismiss">×</button>
    </div>
  )
}
