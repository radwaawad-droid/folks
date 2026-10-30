'use client'

import { useEffect, useState } from 'react'
import { VAPID_PUBLIC_KEY, urlBase64ToUint8Array } from '@/lib/push-public'

// 'unsupported' | 'blocked' | 'on' | 'off' | 'busy'
export default function EnableNotifications() {
  const [state, setState] = useState('off')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      setState('unsupported'); return
    }
    if (Notification.permission === 'denied') { setState('blocked'); return }
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setState(sub ? 'on' : 'off'))
      .catch(() => setState('off'))
  }, [])

  async function enable() {
    setMsg(''); setState('busy')
    try {
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') { setState(perm === 'denied' ? 'blocked' : 'off'); return }
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })
      const r = await fetch('/api/push/subscribe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub }),
      })
      const j = await r.json()
      if (!j.ok) throw new Error(j.error || 'failed')
      setState('on')
    } catch (e) {
      setState('off'); setMsg('Couldn’t turn on notifications. Please try again.')
    }
  }

  async function disable() {
    setMsg(''); setState('busy')
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await fetch('/api/push/unsubscribe', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
        await sub.unsubscribe()
      }
      setState('off')
    } catch (e) { setState('on'); setMsg('Couldn’t turn off notifications.') }
  }

  if (state === 'unsupported') return null

  return (
    <div className="notif-row">
      <div className="notif-text">
        <b>Push notifications</b>
        <small>
          {state === 'on' ? 'On — we’ll ping this device about requests, offers and messages.'
            : state === 'blocked' ? 'Blocked in your browser settings. Allow notifications for this site to turn them on.'
            : 'Get a ping when a neighbour requests, offers, or messages you — even when folks is closed.'}
        </small>
        {msg && <small className="notif-err">{msg}</small>}
      </div>
      {state === 'on' && <button className="btn sm ghost" onClick={disable}>Turn off</button>}
      {state === 'off' && <button className="btn sm" onClick={enable}>Turn on</button>}
      {state === 'busy' && <button className="btn sm" disabled>…</button>}

      <style jsx>{`
        .notif-row{display:flex;align-items:center;gap:14px;background:#fff;border:1px solid var(--line);
          border-radius:14px;padding:14px 16px;margin:18px 0}
        .notif-text{flex:1}
        .notif-text b{display:block;font-size:14px}
        .notif-text small{display:block;color:var(--muted);font-size:12px;margin-top:3px;line-height:1.45}
        .notif-err{color:var(--coral) !important}
      `}</style>
    </div>
  )
}
