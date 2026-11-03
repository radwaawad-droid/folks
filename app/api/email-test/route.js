import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// TEMPORARY diagnostic — remove after confirming email works.
const TOKEN = 'diag-7q2x9k4m'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('token') !== TOKEN) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })
  }
  const to = searchParams.get('to') || 'dxbfolks@gmail.com'
  const config = {
    brevoKey: !!process.env.BREVO_API_KEY,
    brevoSender: process.env.BREVO_SENDER || null,
    resendKey: !!process.env.RESEND_API_KEY,
  }
  const result = await sendEmail({
    to,
    subject: 'folks email test',
    html: '<p>This is a folks email test. If you received this, sending works.</p>',
    name: 'folks',
  })
  return NextResponse.json({ ok: true, config, result })
}
