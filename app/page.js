import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import AuthForm from '@/components/AuthForm'

export const dynamic = 'force-dynamic'

const PEEK = [
  { e: '🔧', t: 'Cordless drill', p: 'Free', cls: 'ph-tools', who: 'Laila · Saheel' },
  { e: '👶', t: 'Bugaboo stroller', p: 'AED 30/day', cls: 'ph-baby', who: 'Nadia · Palmera' },
  { e: '🍖', t: 'Weber BBQ', p: 'AED 45/day', cls: 'ph-party', who: 'Omar · Alvorada' },
  { e: '🏕️', t: '4-person tent', p: 'AED 40/day', cls: 'ph-camp', who: 'Daniel · Mirador' },
]

export default async function Home() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/browse')

  return (
    <div className="lp">
      <header className="lp-nav" id="top">
        <div className="container lp-nav-in">
          <div className="logo">folks <span className="d" /></div>
          <Link href="/browse" className="lp-navlink">Browse first →</Link>
        </div>
      </header>

      <section className="container lp-hero">
        <div className="lp-hero-copy">
          <span className="eyebrow"><span className="d" /> Now in Arabian Ranches</span>
          <h1 className="lp-h1">Borrow what you need<br/><span className="hl">from the folks next door.</span></h1>
          <p className="lp-sub">
            A drill for the weekend. A stroller for visiting family. A tent for the long weekend away.
            Your neighbours already own it — borrow it in a few taps instead of buying what you’ll use once.
          </p>
          <ul className="lp-points">
            <li><span className="c">✓</span> Real neighbours, verified in your community</li>
            <li><span className="c">✓</span> Lend your own idle gear and clear the clutter</li>
            <li><span className="c">✓</span> Free to join — many items free to borrow</li>
          </ul>
        </div>

        <div className="lp-hero-form">
          <AuthForm />
        </div>
      </section>

      {/* a peek at what's being shared */}
      <section className="container lp-peek">
        <div className="lp-peek-head">
          <h2 className="lp-h2" style={{ textAlign: 'left', margin: 0 }}>A peek at what neighbours share</h2>
          <Link href="/browse" className="lp-navlink">See all →</Link>
        </div>
        <div className="lp-peek-grid">
          {PEEK.map((c, i) => (
            <div className="lp-card" key={i}>
              <div className={`lp-card-ph ${c.cls}`}>{c.e}</div>
              <div className="lp-card-mt">
                <div className="lp-card-t">{c.t}</div>
                <div className={`lp-card-p ${c.p === 'Free' ? 'free' : ''}`}>{c.p}</div>
                <div className="lp-card-w">✓ {c.who}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* trust strip */}
      <div className="lp-trust">
        <div className="container lp-trust-in">
          <span>🏡 Arabian Ranches residents only</span>
          <span>✓ Verified neighbours</span>
          <span>💬 Chat &amp; arrange pickup</span>
          <span>⭐ Rated after every borrow</span>
        </div>
      </div>

      <section className="container lp-how">
        <h2 className="lp-h2">How folks works</h2>
        <div className="lp-steps">
          <div className="lp-step"><div className="n">1</div><h3>Find it nearby</h3><p>Search or browse by category and see what neighbours are lending close by.</p></div>
          <div className="lp-step"><div className="n">2</div><h3>Request &amp; chat</h3><p>Pick your dates, send a message, and arrange an easy handoff in-app.</p></div>
          <div className="lp-step"><div className="n">3</div><h3>Borrow &amp; review</h3><p>Use it, return it, and leave each other a review. Simple and neighbourly.</p></div>
        </div>
      </section>

      <section className="container lp-cats">
        <div className="lp-cat ph-tools"><span>🔧</span>Tools &amp; DIY</div>
        <div className="lp-cat ph-baby"><span>👶</span>Baby &amp; Kids</div>
        <div className="lp-cat ph-party"><span>🎉</span>Party &amp; BBQ</div>
        <div className="lp-cat ph-camp"><span>🏕️</span>Camping</div>
      </section>

      <section className="container lp-final">
        <h2 className="lp-final-h">Join your neighbours on folks</h2>
        <p className="lp-final-sub">Free to join. Set up your profile in under a minute.</p>
        <Link href="#top" className="btn lp-final-btn">Create your account</Link>
      </section>

      <footer className="lp-foot">
        <div className="container">
          folks — borrow from your folks. Made for neighbours in Arabian Ranches, Dubai.
          <br />
          <Link href="/guidelines" className="lp-navlink" style={{ display: 'inline-block', marginTop: 10 }}>
            Community guidelines
          </Link>
        </div>
      </footer>
    </div>
  )
}
