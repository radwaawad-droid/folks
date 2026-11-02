'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { VAPID_PUBLIC_KEY, urlBase64ToUint8Array } from '@/lib/push-public'

const SNOOZE_KEY = 'folks-notif-dismissed'

// A gentle, one-time prompt to turn on push notifications. Shows only to a
// signed-in member whose browser supports push, who isn't already subscribed
// and hasn't dismissed it recently. Yields to the install banner if that's up.
export default function NotifPrompt() {
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return
    if (Notification.permission === 'denied') return
    try {
      const ts = Number(localStorage.getItem(SNOOZE_KEY) || 0)
      if (ts && Date.now() - ts < 30 * 86400000) return
    } catch (_) {}

    let cancelled = false
    ;(async () => {
      try {
        const reg = await navigator.serviceWorker.ready
        if (await reg.pushManager.getSubscription()) return // already on
      } catch (_) {}
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return // sign-in required to register a device
      } catch (_) { return }
      await new Promise((r) => setTimeout(r, 1600))
      if (cancelled) return
      if (document.querySelector('.install-bar')) return // let the install prompt go first
      setShow(true)
    })()
    return () => { cancelled = true }
  }, [])

  function dismiss() {
    setShow(false)
    try { localStorage.setItem(SNOOZE_KEY, String(Date.now())) } catch (_) {}
  }

  async function enable() {
    setBusy(true)
    try {
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') { dismiss(); setBusy(false); return }
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })
      await fetch('/api/push/subscribe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub }),
      })
    } catch (_) {}
    setBusy(false)
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="notif-prompt" role="dialog" aria-label="Turn on notifications">
      <img src="/icon-192.png" alt="" className="notif-icon" />
      <div className="notif-copy">
        <b>Turn on notifications?</b>
        <small>Get a ping when a neighbour requests, offers, or messages you — even when folks is closed.</small>
      </div>
      <div className="notif-actions">
        <button className="btn sm" onClick={enable} disabled={busy}>{busy ? '…' : 'Turn on'}</button>
        <button className="notif-x" onClick={dismiss} aria-label="Not now">Not now</button>
      </div>

      <style jsx>{`
        .notif-prompt{position:fixed;left:50%;transform:translateX(-50%);
          bottom:calc(84px + env(safe-area-inset-bottom));z-index:59;
          display:flex;align-items:center;gap:12px;width:calc(100% - 32px);max-width:420px;
          background:#fff;border:1px solid var(--line);border-radius:16px;padding:12px 14px;
          box-shadow:0 10px 30px rgba(0,0,0,.14)}
        .notif-icon{width:38px;height:38px;border-radius:10px;flex:0 0 auto}
        .notif-copy{flex:1;min-width:0}
        .notif-copy b{display:block;font-size:14px}
        .notif-copy small{display:block;color:var(--muted);font-size:12px;margin-top:2px;line-height:1.4}
        .notif-actions{display:flex;flex-direction:column;align-items:stretch;gap:6px;flex:0 0 auto}
        .notif-x{background:none;border:none;color:var(--muted);font-size:12px;cursor:pointer;padding:2px}
      `}</style>
    </div>
  )
}
