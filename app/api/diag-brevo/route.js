import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const TOKEN = '9603ba217389b0583de58abf'

export async function GET(req) {
  const url = new URL(req.url)
  if (url.searchParams.get('t') !== TOKEN) {
    return NextResponse.json({ ok: false, error: 'nope' }, { status: 403 })
  }
  const key = process.env.BREVO_API_KEY
  if (!key) return NextResponse.json({ ok: false, error: 'no BREVO_API_KEY set' })
  const h = { 'api-key': key, accept: 'application/json' }

  async function get(path) {
    try {
      const r = await fetch('https://api.brevo.com' + path, { headers: h })
      const text = await r.text()
      let json; try { json = JSON.parse(text) } catch { json = text }
      return { status: r.status, body: json }
    } catch (e) { return { error: String(e) } }
  }

  const account = await get('/v3/account')
  const senders = await get('/v3/senders')
  const events = await get('/v3/smtp/statistics/events?limit=10&sort=desc')

  // Trim account to just identifying fields
  const acc = account.body && typeof account.body === 'object'
    ? { email: account.body.email, companyName: account.body.companyName, status: account.status }
    : account

  return NextResponse.json({
    ok: true,
    keyTail: key.slice(-6),
    account: acc,
    senders: senders.body,
    recentEvents: events.body,
  })
}
