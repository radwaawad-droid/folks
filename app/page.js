import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import AuthForm from '@/components/AuthForm'

export const dynamic = 'force-dynamic'

const STEPS = [
  { n: '1', t: 'Find it nearby', d: 'Browse by category and see what neighbours are lending close by.' },
  { n: '2', t: 'Request & chat', d: 'Pick your dates, send a message, and arrange an easy handoff.' },
  { n: '3', t: 'Borrow & review', d: 'Use it, return it, and leave each other a review.' },
]

export default async function Home() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/browse')

  return (
    <div className="lp">
      <header className="lp-nav" id="top">
        <div className="container lp-nav-in">
          <div>
            <div className="logo">folks <span className="d" /></div>
            <div className="lp-tag">a closer community</div>
          </div>
          <Link href="/browse" className="lp-navlink">Browse →</Link>
        </div>
      </header>

      <main className="container wel-main">
        <section className="wel-hero">
          <span className="eyebrow"><span className="d" /> Now in Arabian Ranches</span>
          <h1 className="wel-h1">Borrow what you need <span className="hl">from the folks next door.</span></h1>
          <p className="wel-sub">Your neighbours already own it — borrow it in a few taps instead of buying what you’ll use once.</p>
        </section>

        <section className="wel-auth">
          <AuthForm />
        </section>

        <section className="wel-how">
          <h2 className="wel-how-h">How folks works</h2>
          {STEPS.map((s) => (
            <div className="wel-step" key={s.n}>
              <span className="wel-step-n">{s.n}</span>
              <div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            </div>
          ))}
        </section>

        <div className="wel-trust">
          <span className="wel-pill">✓ Verified neighbours</span>
          <span className="wel-pill">Residents only</span>
          <span className="wel-pill">Rated borrows</span>
        </div>
      </main>

      <footer className="lp-foot">
        <div className="container">
          Made for neighbours in Arabian Ranches, Dubai.
          <br />
          <Link href="/guidelines" className="lp-footlink">Community guidelines</Link>
          <span className="lp-footsep">·</span>
          <Link href="/privacy" className="lp-footlink">Privacy policy</Link>
        </div>
      </footer>
    </div>
  )
}
