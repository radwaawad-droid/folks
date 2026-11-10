import Link from 'next/link'
import Nav from '@/components/Nav'

export const metadata = {
  title: 'Privacy policy — folks',
  description: 'How the folks app collects, uses, shares, and protects your data.',
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
const p = { margin: '0 0 10px', lineHeight: 1.6 }
const SUPPORT = 'dxbfolks@gmail.com'

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="container page" style={{ maxWidth: 760 }}>
        <h1 className="browse-head" style={{ marginBottom: 6 }}>Privacy policy</h1>
        <p className="muted-sub" style={{ marginBottom: 6 }}>Effective 10 November 2026</p>
        <p className="muted-sub" style={{ marginBottom: 24 }}>
          This policy explains how the <strong>folks</strong> app and website (“folks”, “we”, “us”) collect,
          use, share, and protect your information. folks is a community app that lets neighbours borrow and
          lend everyday items. It applies to everyone who uses folks. If you don’t agree with it, please don’t
          use folks.
        </p>

        <section style={card}>
          <h2 style={h2}>Information we collect</h2>
          <p style={p}>We collect only what we need to run folks:</p>
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li style={li}><strong>Account &amp; profile:</strong> your name, the community (sub-area) you choose, a
              username, your email address, and — if you create an account with an email and password — a password,
              which is stored only in a securely hashed form (we never see it in plain text).</li>
            <li style={li}><strong>Google sign-in:</strong> if you choose “Continue with Google”, we receive your
              name, email address, and profile picture from Google to create your account. We do not receive your
              Google password.</li>
            <li style={li}><strong>Content you create:</strong> listings, item photos and descriptions, “Wanted”
              requests, prices and optional deposits, and the ratings and reviews you leave.</li>
            <li style={li}><strong>Communications:</strong> messages you exchange with other members, and borrow
              requests and bookings you take part in.</li>
            <li style={li}><strong>Notifications:</strong> if you turn them on, a push-notification token for your
              browser or device so we can send you alerts.</li>
            <li style={li}><strong>Technical data:</strong> standard information our hosting and infrastructure
              providers process to operate and secure the service, such as your IP address, device/browser type,
              and basic log data.</li>
          </ul>
          <p style={{ ...p, marginTop: 10, color: 'var(--muted)' }}>
            folks is not directed to children. We do not knowingly collect data from anyone under 18.
          </p>
        </section>

        <section style={card}>
          <h2 style={h2}>How we use your information</h2>
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li style={li}>To provide folks — create your account, show listings, and connect borrowers and lenders.</li>
            <li style={li}>To show other members what they need to decide whether to lend or borrow: your name,
              community, rating, and your listings.</li>
            <li style={li}>To send you notifications (by email and, if enabled, push) when a neighbour requests your
              item, responds to you, or sends a message, and to send account emails such as sign-in confirmation and
              password resets.</li>
            <li style={li}>To keep folks safe — verify residents, prevent abuse, and moderate inappropriate content.</li>
            <li style={li}>To maintain, secure, and improve the service.</li>
          </ul>
        </section>

        <section style={card}>
          <h2 style={h2}>How we share your information</h2>
          <p style={p}><strong>With other members:</strong> your profile (name, community, photo, rating) and your
            listings and “Wanted” posts are visible to other folks members, and your messages are shared with the
            neighbour you’re talking to. Your email address and password are never shown to other members.</p>
          <p style={p}><strong>With service providers</strong> who process data only to run folks on our behalf:</p>
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li style={li}><strong>Supabase</strong> — database, account authentication, file storage (for photos),
              and real-time messaging.</li>
            <li style={li}><strong>Vercel</strong> — website and app hosting.</li>
            <li style={li}><strong>Brevo</strong> — delivery of our notification and account emails.</li>
            <li style={li}><strong>Google</strong> — sign-in, when you choose to log in with Google.</li>
            <li style={li}><strong>Push delivery</strong> — your browser or device’s push service (operated by
              Google or Apple), and, for our mobile app, a push-notification provider, used only to deliver alerts.</li>
          </ul>
          <p style={{ ...p, marginTop: 10 }}>We may also disclose information if required by law, or to protect the
            rights, safety, and security of folks and its members.</p>
          <p style={{ ...p, marginBottom: 0 }}><strong>We never sell your personal information, and we don’t use it
            for advertising.</strong></p>
        </section>

        <section style={card}>
          <h2 style={h2}>International transfers</h2>
          <p style={{ ...p, marginBottom: 0 }}>
            Our service providers may store and process your information on servers located outside your country,
            including in the United States and the European Union. We rely on these providers’ safeguards to protect
            your data wherever it is processed.
          </p>
        </section>

        <section style={card}>
          <h2 style={h2}>Data retention &amp; deletion</h2>
          <p style={p}>We keep your information for as long as your account is active. You can delete your account and
            all associated data at any time:</p>
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li style={li}>In the app: <strong>Profile → “Delete my account”</strong>.</li>
            <li style={li}>On the web: visit <Link className="linkish" href="/delete-account">folks-pearl.vercel.app/delete-account</Link>.</li>
            <li style={li}>Or email <a className="linkish" href={`mailto:${SUPPORT}`}>{SUPPORT}</a> from your account email.</li>
          </ul>
          <p style={{ ...p, marginTop: 10, marginBottom: 0 }}>Deletion removes your account, profile, listings,
            requests, messages, bookings, and notification settings immediately. Residual copies in encrypted backups
            are purged within 90 days.</p>
        </section>

        <section style={card}>
          <h2 style={h2}>Your choices &amp; rights</h2>
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li style={li}>Access and edit your profile details and listings any time in the app.</li>
            <li style={li}>Turn push notifications on or off from the prompt in the app.</li>
            <li style={li}>Request deletion of your account and data (see above).</li>
            <li style={li}>Contact us to access or correct your information.</li>
          </ul>
        </section>

        <section style={card}>
          <h2 style={h2}>Security</h2>
          <p style={{ ...p, marginBottom: 0 }}>
            We protect your data with industry-standard measures: encrypted connections (HTTPS), hashed passwords,
            and access controls that limit each member to their own data. No method of transmission or storage is
            100% secure, but we work to protect your information and review our practices regularly.
          </p>
        </section>

        <section style={{ ...card, background: '#F4F1E8' }}>
          <h2 style={h2}>Changes &amp; contact</h2>
          <p style={p}>We may update this policy as folks grows. We’ll change the “Effective” date above and post the
            new version here.</p>
          <p style={{ margin: 0, lineHeight: 1.6 }}>
            Questions about your privacy, or want your data removed? Email us at{' '}
            <strong><a className="linkish" href={`mailto:${SUPPORT}`}>{SUPPORT}</a></strong>.
          </p>
        </section>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link href="/browse" className="btn">Back to browsing</Link>
        </div>
      </main>
    </>
  )
}
