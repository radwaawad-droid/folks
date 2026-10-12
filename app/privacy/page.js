import Link from 'next/link'
import Nav from '@/components/Nav'

export const metadata = {
  title: 'Privacy policy — folks',
  description: 'What folks collects, how it is used, and your choices.',
}

const card = {
  background: '#fff',
  border: '1px solid var(--line-2)',
  borderRadius: 16,
  padding: '20px 22px',
  marginBottom: 16,
  boxShadow: 'var(--shadow-sm)',
}
const h2 = {
  fontFamily: "'Quicksand', sans-serif",
  fontWeight: 700,
  fontSize: 19,
  color: 'var(--green)',
  margin: '0 0 10px',
}
const li = { margin: '7px 0', lineHeight: 1.55 }

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="container page" style={{ maxWidth: 760 }}>
        <h1 className="browse-head" style={{ marginBottom: 6 }}>Privacy policy</h1>
        <p className="muted-sub" style={{ marginBottom: 24 }}>
          folks is a community app for neighbours in Arabian Ranches to borrow and lend everyday things.
          This page explains what we collect and why, in plain language.
        </p>

        <section style={card}>
          <h2 style={h2}>What we collect</h2>
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li style={li}>Your name, community (sub-area), and username.</li>
            <li style={li}>Your email address, used to send you notifications.</li>
            <li style={li}>A password, stored securely (we never see it in plain text).</li>
            <li style={li}>Listings you post, including photos and descriptions.</li>
            <li style={li}>Borrow requests, messages, bookings, and reviews you take part in.</li>
          </ul>
        </section>

        <section style={card}>
          <h2 style={h2}>How we use it</h2>
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li style={li}>To run the service — show listings, connect borrowers and lenders, and keep your profile.</li>
            <li style={li}>To email you when a neighbour requests your item, responds to a request, or sends a message.</li>
            <li style={li}>To show other members the information needed to decide whether to lend or borrow (your name, community, rating, and listings).</li>
          </ul>
        </section>

        <section style={card}>
          <h2 style={h2}>What we don&apos;t do</h2>
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li style={li}>We don&apos;t sell your personal information.</li>
            <li style={li}>We don&apos;t share your email address with other members.</li>
            <li style={li}>We don&apos;t use your data for advertising.</li>
          </ul>
        </section>

        <section style={card}>
          <h2 style={h2}>Where your data is stored</h2>
          <p style={{ margin: 0, lineHeight: 1.6 }}>
            Your information is stored securely with our hosting and database providers (Vercel and Supabase)
            and with the service that delivers our notification emails. These providers process data only to
            run folks on our behalf.
          </p>
        </section>

        <section style={card}>
          <h2 style={h2}>Your choices</h2>
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li style={li}>Edit or remove your profile details and listings any time in the app.</li>
            <li style={li}>Turn off notification emails by clearing your email in your profile.</li>
            <li style={li}>Ask us to delete your account and associated data by getting in touch.</li>
          </ul>
        </section>

        <section style={{ ...card, background: '#F4F1E8' }}>
          <h2 style={h2}>Contact</h2>
          <p style={{ margin: 0, lineHeight: 1.6, fontSize: 14 }}>
            Questions about your privacy, or want your data removed? Email us at{' '}
            <strong>dxbfolks@gmail.com</strong>.
          </p>
          <p style={{ margin: '12px 0 0', color: 'var(--muted)', fontSize: 13 }}>
            Last updated October 2026. We may update this policy as folks grows; we&apos;ll post any changes here.
          </p>
        </section>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link href="/browse" className="btn">Back to browsing</Link>
        </div>
      </main>
    </>
  )
}
