// Web Push public (application server) key. Public keys are safe to ship to the
// browser. Overridable via env, with the generated default baked in so push
// works as soon as VAPID_PRIVATE_KEY is set on the server.
export const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  'BObJ65T7qo5vv8VMJRbuRXp88mRgCRShzFVDQQryORSBdMytEdwP_r7ZwjMafkGJXPysln68Y6-m9LTtwNszZS8'

export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}
