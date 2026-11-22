import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
const TOKEN = '87d51180ade6c5e8934d77b9'

export async function GET(req) {
  if (new URL(req.url).searchParams.get('t') !== TOKEN)
    return NextResponse.json({ ok: false }, { status: 403 })
  const h = { 'api-key': process.env.BREVO_API_KEY, accept: 'application/json' }
  let events = null, domains = null
  try {
    const r = await fetch('https://api.brevo.com/v3/smtp/statistics/events?limit=15&sort=desc', { headers: h })
    events = (await r.json()).events?.map((e) => ({ date: e.date, event: e.event, subject: e.subject, reason: e.reason }))
  } catch (e) { events = String(e) }
  try {
    const r = await fetch('https://api.brevo.com/v3/senders/domains', { headers: h })
    const j = await r.json()
    domains = j.domains?.map((d) => ({ domain: d.domain, authenticated: d.authenticated, verified: d.verified }))
  } catch (e) { domains = String(e) }
  return NextResponse.json({ ok: true, sender: process.env.BREVO_SENDER || null, domains, events })
}
