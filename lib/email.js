// Shared email sender. Uses Brevo if a Brevo key is set (single-sender, no
// domain needed), otherwise Resend. Returns { ok, provider, skipped?, detail? }.
export async function sendEmail({ to, subject, html, name, replyTo }) {
  if (process.env.BREVO_API_KEY) {
    const sender = process.env.BREVO_SENDER
    if (!sender) return { ok: false, skipped: 'no-brevo-sender' }
    const body = {
      sender: { name: 'folks', email: sender },
      to: [{ email: to, name: name || undefined }],
      subject,
      htmlContent: html,
    }
    if (replyTo) body.replyTo = { email: replyTo }
    const r = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(body),
    })
    return r.ok ? { ok: true, provider: 'brevo' } : { ok: false, provider: 'brevo', detail: await r.text().catch(() => '') }
  }
  if (process.env.RESEND_API_KEY) {
    const from = process.env.NOTIFY_FROM || 'folks <onboarding@resend.dev>'
    const body = { from, to, subject, html }
    if (replyTo) body.reply_to = replyTo
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return r.ok ? { ok: true, provider: 'resend' } : { ok: false, provider: 'resend', detail: await r.text().catch(() => '') }
  }
  return { ok: false, skipped: 'no-key' }
}

export function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ))
}
