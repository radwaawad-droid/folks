import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://folks-pearl.vercel.app'
// Until you verify your own domain in Resend, keep the default test sender.
const FROM = process.env.NOTIFY_FROM || 'folks <onboarding@resend.dev>'

function emailHtml({ name, intro, link, cta }) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:28px 24px;color:#1C2620">
    <div style="font-size:24px;font-weight:700;color:#205C49">folks</div>
    <p style="font-size:15px;line-height:1.6;margin-top:20px">Hi ${name || 'there'},</p>
    <p style="font-size:15px;line-height:1.6">${intro}</p>
    <p style="margin:26px 0">
      <a href="${link}" style="background:#F2774E;color:#fff;text-decoration:none;padding:13px 24px;border-radius:12px;font-weight:700;display:inline-block">${cta || 'Open folks'}</a>
    </p>
    <p style="font-size:12px;color:#6B7770;line-height:1.5;margin-top:28px">
      You're receiving this because you're a member of folks in Arabian Ranches.
      You can turn these off by clearing your email in your profile.
    </p>
  </div>`
}

export async function POST(req) {
  try {
    const { type, bookingId } = await req.json()
    if (!type || !bookingId) {
      return NextResponse.json({ ok: false, error: 'missing fields' }, { status: 400 })
    }

    // Who is calling? Must be signed in.
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

    // Look up the booking with the service-role client (so we can read private emails).
    const admin = createAdminClient()
    const { data: b } = await admin
      .from('bookings')
      .select('id, borrower_id, lender_id, item:items(title)')
      .eq('id', bookingId)
      .maybeSingle()
    if (!b) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 })

    // The caller must be part of this booking.
    if (user.id !== b.borrower_id && user.id !== b.lender_id) {
      return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })
    }

    const itemTitle = b.item?.title || 'an item'
    let recipientId, subject, intro, cta, path

    if (type === 'request') {
      if (user.id !== b.borrower_id) return NextResponse.json({ ok: false }, { status: 403 })
      recipientId = b.lender_id
      subject = `New borrow request for your ${itemTitle}`
      intro = `A neighbour would like to borrow your <strong>${itemTitle}</strong> on folks. Open the app to accept, decline, or message them.`
      cta = 'View the request'
      path = '/profile'
    } else if (type === 'accepted' || type === 'declined') {
      if (user.id !== b.lender_id) return NextResponse.json({ ok: false }, { status: 403 })
      recipientId = b.borrower_id
      if (type === 'accepted') {
        subject = `Your request for ${itemTitle} was accepted 🎉`
        intro = `Good news — your request to borrow <strong>${itemTitle}</strong> was accepted. Open folks to message your neighbour and arrange an easy pickup.`
        cta = 'Arrange pickup'
      } else {
        subject = `Update on your request for ${itemTitle}`
        intro = `Your request to borrow <strong>${itemTitle}</strong> wasn't accepted this time. There may be other neighbours with one to lend — have a browse.`
        cta = 'Browse folks'
      }
      path = '/profile'
    } else if (type === 'message') {
      recipientId = user.id === b.borrower_id ? b.lender_id : b.borrower_id
      // Collapse bursts: if the recipient already has unread messages here, they've
      // been emailed once already and haven't opened yet — don't email again.
      const { count } = await admin
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('booking_id', b.id)
        .neq('sender_id', recipientId)
        .is('read_at', null)
      if ((count || 0) > 1) return NextResponse.json({ ok: true, skipped: 'already-unread' })
      subject = `New message about ${itemTitle}`
      intro = `You have a new message on folks about <strong>${itemTitle}</strong>.`
      cta = 'Read & reply'
      path = '/messages'
    } else {
      return NextResponse.json({ ok: false, error: 'unknown type' }, { status: 400 })
    }

    // Recipient's email + name.
    const { data: rp } = await admin
      .from('profiles').select('notify_email, full_name').eq('id', recipientId).maybeSingle()
    const to = rp?.notify_email
    if (!to) return NextResponse.json({ ok: true, skipped: 'no-email' })

    const key = process.env.RESEND_API_KEY
    if (!key) return NextResponse.json({ ok: true, skipped: 'no-key' })

    const html = emailHtml({ name: rp?.full_name, intro, link: `${SITE}${path}`, cta })

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    })

    if (!r.ok) {
      const detail = await r.text().catch(() => '')
      return NextResponse.json({ ok: false, error: 'send failed', detail }, { status: 502 })
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
