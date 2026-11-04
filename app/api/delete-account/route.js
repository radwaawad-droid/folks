import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Lets a signed-in member permanently delete their own account: their listings,
// bookings, messages and profile, then the login itself. Irreversible.
export async function POST() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    const uid = user.id

    // Best-effort cleanup. Most of these cascade from the profile row, but we
    // remove them explicitly so nothing is left behind if a cascade is missing.
    try { await admin.from('push_subscriptions').delete().eq('user_id', uid) } catch (_) {}
    try { await admin.from('items').delete().eq('owner_id', uid) } catch (_) {}
    try { await admin.from('item_requests').delete().eq('requester_id', uid) } catch (_) {}
    try { await admin.from('profiles').delete().eq('id', uid) } catch (_) {}

    // Finally remove the auth user (the login).
    const { error } = await admin.auth.admin.deleteUser(uid)
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
