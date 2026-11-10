import Link from 'next/link'
import DeleteAccount from '@/components/DeleteAccount'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Delete your account — folks',
  description: 'How to delete your folks account and all associated data.',
}

const card = {
  background: '#fff', border: '1px solid var(--line-2)', borderRadius: 16,
  padding: '20px 22px', marginBottom: 16, boxShadow: 'var(--shadow-sm)',
}
const h2 = {
  fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: 19,
  color: 'var(--green)', margin: '0 0 10px',
}
const li = { margin: '7px 0', lineHeight: 1.55 }
const SUPPORT = 'dxbfolks@gmail.com'

export default async function DeleteAccountPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main className="container page" style={{ maxWidth: 680 }}>
      <Link href="/" className="auth-logo" style={{ justifyContent: 'flex-start', fontSize: 26, marginBottom: 10 }}>
        folks <span className="d" />
      </Link>

      <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 600, fontSize: 30, marginBottom: 6 }}>
        Delete your account
      </h1>
      <p className="muted-sub" style={{ marginBottom: 20 }}>
        You can permanently delete your folks account and all of your data at any time. This can’t be undone.
      </p>

      <div style={card}>
        <h2 style={h2}>What gets deleted</h2>
        <ul style={{ paddingLeft: 18, margin: 0 }}>
          <li style={li}>Your account and sign-in (email/Google login).</li>
          <li style={li}>Your profile — name, community, photo and rating.</li>
          <li style={li}>Your listings, and any bookings tied to them.</li>
          <li style={li}>Your “Wanted” posts and the messages in them.</li>
          <li style={li}>Your notification settings and devices.</li>
        </ul>
        <p style={{ ...li, color: 'var(--muted)', marginTop: 12 }}>
          Deletion is immediate. Any residual copies in encrypted backups are purged within 90 days.
        </p>
      </div>

      <div style={card}>
        <h2 style={h2}>How to delete your account</h2>
        {user ? (
          <>
            <p style={li}>You’re signed in, so you can delete it right here:</p>
            <DeleteAccount />
          </>
        ) : (
          <p style={li}>
            <strong>In the app:</strong> open folks, go to your <strong>Profile</strong>, and tap
            {' '}<strong>“Delete my account”</strong> at the bottom. Or{' '}
            <Link className="linkish" href="/">sign in here</Link> and a delete button will appear on this page.
          </p>
        )}
        <p style={{ ...li, marginTop: 12 }}>
          <strong>Can’t sign in?</strong> Email <a className="linkish" href={`mailto:${SUPPORT}`}>{SUPPORT}</a>{' '}
          from the email address on your account and ask us to delete it. We’ll remove your account and data
          within 7 days and confirm by reply.
        </p>
      </div>

      <p className="muted-sub" style={{ fontSize: 13 }}>
        Questions about your data? See our <Link className="linkish" href="/privacy">privacy policy</Link>.
      </p>
    </main>
  )
}
