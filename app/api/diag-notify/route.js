import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
const TOKEN = '87d51180ade6c5e8934d77b9'

export async function GET(req) {
  if (new URL(req.url).searchParams.get('t') !== TOKEN)
    return NextResponse.json({ ok: false }, { status: 403 })
  const admin = createAdminClient()
  const { count: total } = await admin.from('profiles').select('id', { count: 'exact', head: true })
  const { count: withEmail } = await admin.from('profiles').select('id', { count: 'exact', head: true }).not('notify_email', 'is', null)
  // sample: do profiles have notify_email? (booleans only, no addresses leaked)
  const { data: sample } = await admin.from('profiles').select('full_name, notify_email').limit(10)
  const sampleFlags = (sample || []).map((p) => ({ name: p.full_name, hasEmail: !!p.notify_email }))
  return NextResponse.json({
    ok: true,
    config: { brevoKey: !!process.env.BREVO_API_KEY, brevoSender: process.env.BREVO_SENDER || null },
    profiles: { total, withEmail, withoutEmail: (total || 0) - (withEmail || 0) },
    sampleFlags,
  })
}
