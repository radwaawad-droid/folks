import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/utils/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
const TOKEN = 'bbb694383d8fb9ce85784ff9'

const BAKED_PUBLIC = 'BObJ65T7qo5vv8VMJRbuRXp88mRgCRShzFVDQQryORSBdMytEdwP_r7ZwjMafkGJXPysln68Y6-m9LTtwNszZS8'

function b64urlToBuf(s){ return Buffer.from(String(s||'').replace(/-/g,'+').replace(/_/g,'/'), 'base64') }
function bufToB64url(b){ return b.toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'') }

export async function GET(req) {
  if (new URL(req.url).searchParams.get('t') !== TOKEN) return NextResponse.json({ ok:false }, { status:403 })
  const admin = createAdminClient()
  const { count } = await admin.from('push_subscriptions').select('id', { count:'exact', head:true })

  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || BAKED_PUBLIC
  const priv = process.env.VAPID_PRIVATE_KEY
  let derived = null, keyPairMatches = null, err = null
  try {
    if (priv) {
      const ec = crypto.createECDH('prime256v1')
      ec.setPrivateKey(b64urlToBuf(priv))
      derived = bufToB64url(ec.getPublicKey())
      keyPairMatches = (derived === pub)
    }
  } catch (e) { err = String(e) }

  return NextResponse.json({
    ok: true,
    subscriptions: count,
    vapidPrivateSet: !!priv,
    publicKeyInUse: pub.slice(0,12) + '…',
    keyPairMatches,
    err,
    oneSignalConfigured: !!(process.env.ONESIGNAL_APP_ID && process.env.ONESIGNAL_REST_KEY),
  })
}
