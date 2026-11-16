import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
const TOKEN = '64da8ad3cc73a7fe851335e4'

export async function GET(req) {
  const url = new URL(req.url)
  if (url.searchParams.get('t') !== TOKEN) return NextResponse.json({ ok: false }, { status: 403 })
  const key = process.env.BREVO_API_KEY
  const h = { 'api-key': key, accept: 'application/json' }
  let sent = null
  if (url.searchParams.get('send') === '1') {
    sent = await sendEmail({
      to: 'hello@folksdxb.com',
      subject: '[folks] live delivery test ' + new Date().toISOString().slice(11,19),
      html: '<p>If this is in your inbox, the feedback pipeline is fully working.</p>',
    })
  }
  let events = null
  try {
    const r = await fetch('https://api.brevo.com/v3/smtp/statistics/events?limit=6&sort=desc', { headers: h })
    events = (await r.json()).events?.map((e) => ({ date: e.date, event: e.event, subject: e.subject, reason: e.reason }))
  } catch (e) { events = String(e) }
  return NextResponse.json({ ok: true, sent, events })
}
