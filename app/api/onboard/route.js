import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Creates or completes the signed-in member's profile (name, community,
// their email for notifications, Google avatar if any).
export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}))
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

    const meta = user.user_metadata || {}
    const fullName = (body.full_name || meta.full_name || meta.name || '').trim()
    const subArea = (body.sub_area || meta.sub_area || '').trim()
    if (!fullName || !subArea) {
      return NextResponse.json({ ok: false, error: 'Please add your name and community.' }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from('profiles').select('avatar_url').eq('id', user.id).maybeSingle()

    const { data: comm } = await supabase
      .from('communities').select('id').eq('name', 'Arabian Ranches').maybeSingle()

    const avatar = existing?.avatar_url || meta.avatar_url || meta.picture || null

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: fullName,
      sub_area: subArea,
      notify_email: (user.email || '').toLowerCase() || null,
      avatar_url: avatar,
      community_id: comm?.id || null,
      phone_verified: true,
      resident_verified: true,
    })
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
