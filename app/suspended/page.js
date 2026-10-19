import Link from 'next/link'
import SignOutButton from '@/components/SignOutButton'

export const metadata = { title: 'Account suspended — folks' }
export const dynamic = 'force-dynamic'

export default function SuspendedPage() {
  return (
    <main className="container page" style={{ maxWidth: 480, textAlign: 'center', paddingTop: 60 }}>
      <div className="logo" style={{ justifyContent: 'center', fontSize: 28, marginBottom: 20 }}>folks <span className="d" /></div>
      <h1 className="browse-head" style={{ marginBottom: 10 }}>Account suspended</h1>
      <p className="muted-sub" style={{ marginBottom: 24 }}>
        Your folks account has been suspended, so it can’t be used right now.
        If you think this is a mistake, please get in touch at <strong>dxbfolks@gmail.com</strong>.
      </p>
      <SignOutButton />
      <div style={{ marginTop: 16 }}>
        <Link href="/" className="linkish">Back to home</Link>
      </div>
    </main>
  )
}
