import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const TOKEN = 'fc3e8f89406c12f5ef7a94c8'

export async function GET(req) {
  const url = new URL(req.url)
  if (url.searchParams.get('t') !== TOKEN) {
    return NextResponse.json({ ok: false, error: 'nope' }, { status: 403 })
  }
  const to = url.searchParams.get('to') || 'hello@folksdxb.com'
  const config = {
    brevoKey: !!process.env.BREVO_API_KEY,
    brevoSender: process.env.BREVO_SENDER || null,
    resendKey: !!process.env.RESEND_API_KEY,
    feedbackTo: process.env.FEEDBACK_TO || 'hello@folksdxb.com (default)',
  }
  const result = await sendEmail({
    to,
    subject: '[folks] diagnostic test',
    html: '<p>Diagnostic test from folks. If you can read this, delivery works.</p>',
  })
  return NextResponse.json({ ok: true, config, result })
}
