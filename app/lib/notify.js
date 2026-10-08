// Fire-and-forget notification trigger. Never blocks or breaks the core action —
// if the email fails or the user has no email on file, the app carries on as normal.
export function notify(payload) {
  try {
    fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true, // lets the request finish even if the page navigates away
    }).catch(() => {})
  } catch (_) {
    // ignore — notifications are best-effort
  }
}
