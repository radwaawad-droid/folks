import Link from 'next/link'
import Nav from '@/components/Nav'

export const metadata = {
  title: 'Community guidelines — folks',
  description: 'How we borrow and lend kindly in Arabian Ranches.',
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
  display: 'flex',
  alignItems: 'center',
  gap: 10,
}
const li = { margin: '7px 0', lineHeight: 1.55 }
const emoji = { fontSize: 22 }

export default function GuidelinesPage() {
  return (
    <>
      <Nav />
      <main className="container page" style={{ maxWidth: 760 }}>
        <h1 className="browse-head" style={{ marginBottom: 6 }}>Community guidelines</h1>
        <p className="muted-sub" style={{ marginBottom: 24 }}>
          folks works because neighbours look out for each other. A few simple promises keep it kind,
          safe, and easy for everyone in Arabian Ranches.
        </p>

        <section style={card}>
          <h2 style={h2}><span style={emoji}>🤝</span> The folks spirit</h2>
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li style={li}>Treat neighbours the way you&apos;d want to be treated — with honesty and respect.</li>
            <li style={li}>folks is for real Arabian Ranches residents sharing everyday things, not for running a business.</li>
            <li style={li}>Only list items you actually own and are happy to lend.</li>
          </ul>
        </section>

        <section style={card}>
          <h2 style={h2}><span style={emoji}>📦</span> When you borrow</h2>
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li style={li}>Treat your neighbour&apos;s things with care — as if they were your own.</li>
            <li style={li}>Return items <strong>on time</strong> and in the <strong>same condition</strong> you received them.</li>
            <li style={li}>Give things back clean and ready for the next person.</li>
            <li style={li}>If something breaks or goes missing, tell the owner right away and make it right.</li>
          </ul>
        </section>

        <section style={card}>
          <h2 style={h2}><span style={emoji}>🔑</span> When you lend</h2>
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li style={li}>Be honest about the item&apos;s condition and how it works.</li>
            <li style={li}>Only lend things that are safe and in good working order.</li>
            <li style={li}>Reply to requests promptly so neighbours aren&apos;t left waiting.</li>
            <li style={li}>Agree on pickup and return clearly in the chat before handing anything over.</li>
          </ul>
        </section>

        <section style={card}>
          <h2 style={h2}><span style={emoji}>💬</span> Handoff &amp; pickup</h2>
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li style={li}>Arrange pickup and drop-off through folks chat so there&apos;s a record.</li>
            <li style={li}>Choose a time and spot you&apos;re both comfortable with.</li>
            <li style={li}>Check the item together at handover so you&apos;re both on the same page.</li>
          </ul>
        </section>

        <section style={card}>
          <h2 style={h2}><span style={emoji}>💵</span> Free &amp; paid borrowing</h2>
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li style={li}>Many items are free. Some owners set a small daily fee — that&apos;s shown on the listing.</li>
            <li style={li}>Any fee is arranged directly between neighbours. folks doesn&apos;t handle or hold payments.</li>
            <li style={li}>Keep it fair and neighbourly — this isn&apos;t about making money, it&apos;s about helping out.</li>
          </ul>
        </section>

        <section style={card}>
          <h2 style={h2}><span style={emoji}>⭐</span> Reviews</h2>
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li style={li}>Leave an honest, fair review after each borrow — it builds trust for everyone.</li>
            <li style={li}>Be kind. A review is feedback, not a place to vent.</li>
          </ul>
        </section>

        <section style={card}>
          <h2 style={h2}><span style={emoji}>🚫</span> Not allowed</h2>
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li style={li}>Anything illegal, unsafe, or clearly dangerous.</li>
            <li style={li}>Harassment, dishonesty, or treating neighbours badly.</li>
            <li style={li}>Listing items you don&apos;t own, or using folks to sell or advertise.</li>
          </ul>
          <p style={{ margin: '12px 0 0', color: 'var(--muted)', fontSize: 14 }}>
            We may remove listings or members who break these guidelines, to keep folks safe for the community.
          </p>
        </section>

        <section style={{ ...card, background: '#F4F1E8' }}>
          <h2 style={h2}><span style={emoji}>📄</span> The important bit</h2>
          <p style={{ margin: '0 0 10px', lineHeight: 1.6, fontSize: 14, color: 'var(--ink)' }}>
            folks is a community platform that helps neighbours find and arrange borrowing. Any loan is an
            agreement <strong>directly between the two neighbours</strong> involved. folks isn&apos;t a party to
            that agreement and can&apos;t be held responsible for loss, damage, or injury arising from items
            borrowed or lent — please sort those out between yourselves, fairly and in good faith.
          </p>
          <p style={{ margin: 0, lineHeight: 1.6, fontSize: 14, color: 'var(--ink)' }}>
            By using folks you agree to follow these guidelines. We may update them as the community grows.
          </p>
          <p style={{ margin: '12px 0 0', color: 'var(--muted)', fontSize: 13 }}>
            Last updated October 2026 · Questions? Reach out through your profile.
          </p>
        </section>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link href="/browse" className="btn">Back to browsing</Link>
        </div>
      </main>
    </>
  )
}
