import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
const TOKEN = '64da8ad3cc73a7fe851335e4'

export async function GET(req) {
  const url = new URL(req.url)
  if (url.searchParams.get('t') !== TOKEN) return NextResponse.json({ ok: false }, { status: 403 })
  const h = { 'api-key': process.env.BREVO_API_KEY, accept: 'application/json' }
  async function get(p) {
    try { const r = await fetch('https://api.brevo.com' + p, { headers: h }); return await r.json() }
    catch (e) { return String(e) }
  }
  const senders = await get('/v3/senders')
  const domains = await get('/v3/senders/domains')
  return NextResponse.json({
    ok: true,
    envSender: process.env.BREVO_SENDER || null,
    senders: senders.senders?.map((s) => ({ email: s.email, active: s.active })) || senders,
    domains: domains.domains?.map((d) => ({ domain: d.domain, authenticated: d.authenticated, verified: d.verified })) || domains,
  })
}
