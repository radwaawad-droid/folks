import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { sendEmail, escapeHtml } from '@/lib/email'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://folksdxb.com'
const DAYS = 2 // remind this many days after the first offer, if still open

// Daily cron (see vercel.json). Reminds a requester whose Wanted post got an
// offer a couple of days ago but is still open, in case they already found it
// and forgot to close the request. One reminder per request.
export async function GET(req) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const cutoff = new Date(Date.now() - DAYS * 24 * 3600 * 1000).toISOString()

  // Offers older than the cutoff, with their request.
  const { data: replies = [] } = await admin
    .from('request_replies')
    .select('request_id, created_at, request:item_requests!request_id(id, title, status, requester_id, reminded_at)')
    .lt('created_at', cutoff)

  // One target per still-open, not-yet-reminded request.
  const seen = new Set()
  const targets = []
  for (const r of (replies || [])) {
    const rq = r.request
    if (!rq || rq.status !== 'open' || rq.reminded_at) continue
    if (seen.has(rq.id)) continue
    seen.add(rq.id); targets.push(rq)
  }

  let emailed = 0
  for (const rq of targets) {
    const { data: rp } = await admin
      .from('profiles').select('notify_email, full_name').eq('id', rq.requester_id).maybeSingle()
    // Flag it either way so we never remind the same request twice.
    await admin.from('item_requests').update({ reminded_at: new Date().toISOString() }).eq('id', rq.id)

    const to = rp?.notify_email
    if (!to) continue
    const title = rq.title || 'your request'
    const link = `${SITE}/requests/${rq.id}`
    const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:28px 24px;color:#1C2620">
      <div style="font-size:24px;font-weight:700;color:#205C49">folks</div>
      <p style="font-size:15px;line-height:1.6;margin-top:20px">Hi ${escapeHtml(rp?.full_name || 'there')},</p>
      <p style="font-size:15px;line-height:1.6">A neighbour offered <strong>“${escapeHtml(title)}”</strong> a couple of days ago on your Wanted post. Did you get sorted?</p>
      <p style="font-size:15px;line-height:1.6">If you’ve got what you needed, mark your request as found so neighbours know it’s handled. Still looking? No need to do anything.</p>
      <p style="margin:26px 0">
        <a href="${link}" style="background:#F2774E;color:#fff;text-decoration:none;padding:13px 24px;border-radius:12px;font-weight:700;display:inline-block">Mark it as found</a>
      </p>
      <p style="font-size:12px;color:#6B7770;line-height:1.5;margin-top:28px">You’re receiving this because you posted a Wanted request on folks in Arabian Ranches.</p>
    </div>`
    const res = await sendEmail({ to, subject: `Did you find “${title}”?`, html, name: rp?.full_name })
    if (res.ok) emailed++
  }

  return NextResponse.json({ ok: true, scanned: (replies || []).length, reminded: targets.length, emailed })
}
