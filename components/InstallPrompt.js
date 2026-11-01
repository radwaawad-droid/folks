'use client'

import { useEffect, useState } from 'react'

const DISMISS_KEY = 'folks-install-dismissed'

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null) // Android/Chrome native prompt
  const [iosHint, setIosHint] = useState(false)   // iOS Safari manual hint
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Already installed / running standalone → never show.
    const standalone =
      window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone
    if (standalone) return

    const snoozed = () => {
      try {
        const ts = Number(localStorage.getItem(DISMISS_KEY) || 0)
        return ts && Date.now() - ts < 14 * 86400000
      } catch (_) { return false }
    }

    // Android / desktop Chrome: always capture the native prompt; only
    // auto-show it if the member hasn't recently dismissed it.
    const onBIP = (e) => {
      e.preventDefault()
      setDeferred(e)
      if (!snoozed()) setShow(true)
    }
    window.addEventListener('beforeinstallprompt', onBIP)

    // iOS Safari never fires beforeinstallprompt → manual hint.
    const ua = window.navigator.userAgent || ''
    const isIOS = /iphone|ipad|ipod/i.test(ua)
    const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua)
    if (isIOS && isSafari) { setIosHint(true); if (!snoozed()) setShow(true) }

    // "Get the app" links fire this to re-open the banner, ignoring the snooze.
    const onOpen = () => setShow(true)
    window.addEventListener('folks:install', onOpen)

    const onInstalled = () => setShow(false)
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP)
      window.removeEventListener('folks:install', onOpen)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  function dismiss() {
    setShow(false)
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())) } catch (_) {}
  }

  async function install() {
    if (!deferred) return
    deferred.prompt()
    try { await deferred.userChoice } catch (_) {}
    setDeferred(null)
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="install-bar" role="dialog" aria-label="Install folks">
      <img src="/icon-192.png" alt="" className="install-icon" />
      <div className="install-text">
        <b>Install folks</b>
        <small>
          {iosHint
            ? 'Tap the Share button, then “Add to Home Screen”.'
            : 'Add it to your home screen for one-tap access and notifications.'}
        </small>
      </div>
      {!iosHint && <button className="btn sm" onClick={install}>Install</button>}
      <button className="install-x" onClick={dismiss} aria-label="Dismiss">✕</button>

      <style jsx>{`
        .install-bar{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(84px + env(safe-area-inset-bottom));
          z-index:60;display:flex;align-items:center;gap:12px;width:calc(100% - 32px);max-width:420px;
          background:#fff;border:1px solid var(--line);border-radius:16px;padding:12px 14px;
          box-shadow:0 10px 30px rgba(0,0,0,.14)}
        .install-icon{width:40px;height:40px;border-radius:10px;flex:0 0 auto}
        .install-text{flex:1;min-width:0}
        .install-text b{display:block;font-size:14px}
        .install-text small{display:block;color:var(--muted);font-size:12px;margin-top:2px;line-height:1.4}
        .install-x{background:none;border:none;color:var(--muted);font-size:15px;cursor:pointer;padding:4px;flex:0 0 auto}
        @media(min-width:721px){.install-bar{bottom:24px}}
      `}</style>
    </div>
  )
}
