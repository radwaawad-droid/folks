import webpush from 'web-push'
import { createAdminClient } from '@/utils/supabase/admin'

const PUBLIC =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  'BObJ65T7qo5vv8VMJRbuRXp88mRgCRShzFVDQQryORSBdMytEdwP_r7ZwjMafkGJXPysln68Y6-m9LTtwNszZS8'
const PRIVATE = process.env.VAPID_PRIVATE_KEY
const CONTACT = process.env.VAPID_CONTACT || 'mailto:dxbfolks@gmail.com'
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://folks-pearl.vercel.app'

let vapidReady = false
function ensureVapid() {
  if (vapidReady || !PRIVATE) return vapidReady
  webpush.setVapidDetails(CONTACT, PUBLIC, PRIVATE)
  vapidReady = true
  return true
}

// Send a Web Push to all of a member's registered browsers. Dead subscriptions
// (expired / unsubscribed) are pruned. Best-effort: never throws.
async function sendWebPush(admin, userId, payload) {
  if (!ensureVapid()) return
  const { data: subs = [] } = await admin
    .from('push_subscriptions').select('endpoint, p256dh, auth').eq('user_id', userId)
  if (!subs || !subs.length) return
  const body = JSON.stringify(payload)
  await Promise.all(subs.map(async (s) => {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        body
      )
    } catch (e) {
      const code = e?.statusCode
      if (code === 404 || code === 410) {
        try { await admin.from('push_subscriptions').delete().eq('endpoint', s.endpoint) } catch (_) {}
      }
    }
  }))
}

// Send a native push via OneSignal (for the App Store / Play Store app), keyed
// to the member's external user id (their Supabase user id). Skipped unless
// OneSignal env is configured. Best-effort: never throws.
async function sendOneSignal(userId, payload) {
  const appId = process.env.ONESIGNAL_APP_ID
  const restKey = process.env.ONESIGNAL_REST_KEY
  if (!appId || !restKey) return
  try {
    await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Basic ${restKey}` },
      body: JSON.stringify({
        app_id: appId,
        include_external_user_ids: [userId],
        channel_for_external_user_ids: 'push',
        headings: { en: payload.title || 'folks' },
        contents: { en: payload.body || '' },
        url: payload.url?.startsWith('http') ? payload.url : `${SITE}${payload.url || '/browse'}`,
      }),
    })
  } catch (_) { /* best-effort */ }
}

// One call to reach a member everywhere. `payload` = { title, body, url, tag }.
// url may be a path ('/requests/123') or absolute.
export async function pushToUser(userId, payload, admin = null) {
  if (!userId) return
  const a = admin || createAdminClient()
  await Promise.all([
    sendWebPush(a, userId, payload),
    sendOneSignal(userId, payload),
  ])
}
