import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { sendEmail, escapeHtml } from '@/lib/email'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Where suggestions & complaints land. Override with FEEDBACK_TO in Vercel.
const FEEDBACK_TO = process.env.FEEDBACK_TO || 'dxbfolks@gmail.com'

export async function POST(req) {
  try {
    const { kind, message } = await req.json()
    const text = (message || '').trim()
    if (!text) return NextResponse.json({ ok: false, error: 'Please write a message.' }, { status: 400 })
    if (text.length > 4000) return NextResponse.json({ ok: false, error: 'That message is too long.' }, { status: 400 })

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ ok: false, error: 'Please sign in first.' }, { status: 401 })

    // Read the sender's details with the service-role client.
    const admin = createAdminClient()
    const { data: me } = await admin
      .from('profiles').select('full_name, username, notify_email, sub_area').eq('id', user.id).maybeSingle()

    const label = kind === 'complaint' ? 'Complaint' : 'Suggestion'
    const senderName = me?.full_name || me?.username || 'A folks member'
    const senderEmail = me?.notify_email || null

    const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1C2620">
      <div style="font-size:20px;font-weight:700;color:#205C49">folks — ${label}</div>
      <p style="font-size:14px;line-height:1.6;margin-top:16px;white-space:pre-wrap">${escapeHtml(text)}</p>
      <hr style="border:none;border-top:1px solid #ECE6DB;margin:20px 0" />
      <p style="font-size:13px;color:#6B7770;line-height:1.6;margin:0">
        From: <strong>${escapeHtml(senderName)}</strong>${me?.username ? ` (@${escapeHtml(me.username)})` : ''}<br/>
        ${me?.sub_area ? `Area: ${escapeHtml(me.sub_area)}<br/>` : ''}
        ${senderEmail ? `Email: ${escapeHtml(senderEmail)}` : 'No email on file'}<br/>
        User ID: ${user.id}
      </p>
    </div>`

    const sent = await sendEmail({
      to: FEEDBACK_TO,
      subject: `[folks] ${label} from ${senderName}`,
      html,
      replyTo: senderEmail || undefined,
    })

    if (sent.skipped === 'no-key' || sent.skipped === 'no-brevo-sender') {
      return NextResponse.json({ ok: false, error: 'Email isn’t set up yet. Please try again later.' }, { status: 503 })
    }
    if (!sent.ok) {
      return NextResponse.json({ ok: false, error: 'Couldn’t send right now — please try again.' }, { status: 502 })
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
