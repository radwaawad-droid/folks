import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
const TOKEN = 'd8ad361fddfbbd1540d9b296'

export async function GET(req) {
  if (new URL(req.url).searchParams.get('t') !== TOKEN)
    return NextResponse.json({ ok: false }, { status: 403 })
  const admin = createAdminClient()
  let subCount = null, subErr = null
  try {
    const { count, error } = await admin.from('push_subscriptions').select('id', { count: 'exact', head: true })
    subCount = count; subErr = error?.message || null
  } catch (e) { subErr = String(e) }
  return NextResponse.json({
    ok: true,
    webPush: {
      vapidPublicSet: !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      vapidPrivateSet: !!process.env.VAPID_PRIVATE_KEY,   // without this, web push is silently skipped
    },
    oneSignal: {
      appIdSet: !!process.env.ONESIGNAL_APP_ID,
      restKeySet: !!process.env.ONESIGNAL_REST_KEY,
    },
    subscriptions: { count: subCount, error: subErr },
  })
}
