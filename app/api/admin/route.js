import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { slugify } from '@/lib/categories'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Confirms the caller is signed in AND is an admin. Uses the service-role client
// so the admin check and the moderation actions bypass Row Level Security.
async function requireAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'unauthorized', status: 401 }
  const admin = createAdminClient()
  const { data: me } = await admin
    .from('profiles').select('is_admin').eq('id', user.id).maybeSingle()
  if (!me?.is_admin) return { error: 'forbidden', status: 403 }
  return { admin, user }
}

export async function POST(req) {
  try {
    const body = await req.json()
    const { action, itemId, userId } = body
    const gate = await requireAdmin()
    if (gate.error) return NextResponse.json({ ok: false, error: gate.error }, { status: gate.status })
    const { admin, user } = gate

    if (action === 'delete_item') {
      if (!itemId) return NextResponse.json({ ok: false, error: 'missing itemId' }, { status: 400 })
      const { error } = await admin.from('items').delete().eq('id', itemId)
      if (error) throw error
      return NextResponse.json({ ok: true })
    }

    if (action === 'ban_user' || action === 'unban_user') {
      if (!userId) return NextResponse.json({ ok: false, error: 'missing userId' }, { status: 400 })
      if (userId === user.id) {
        return NextResponse.json({ ok: false, error: "You can't ban yourself." }, { status: 400 })
      }
      // Don't allow banning another admin.
      const { data: target } = await admin.from('profiles').select('is_admin').eq('id', userId).maybeSingle()
      if (target?.is_admin) {
        return NextResponse.json({ ok: false, error: "You can't ban another admin." }, { status: 400 })
      }
      const banned = action === 'ban_user'
      const { error } = await admin.from('profiles').update({ banned }).eq('id', userId)
      if (error) throw error
      if (banned) {
        // Remove their listings from the community immediately.
        await admin.from('items').delete().eq('owner_id', userId)
      }
      return NextResponse.json({ ok: true })
    }

    if (action === 'add_category') {
      const label = (body.label || '').trim()
      const key = slugify(label)
      if (!label || !key) return NextResponse.json({ ok: false, error: 'Enter a category name.' }, { status: 400 })
      const emoji = (body.emoji || '').trim() || '📦'
      const { data: top } = await admin.from('categories').select('sort').order('sort', { ascending: false }).limit(1).maybeSingle()
      const sort = (top?.sort || 0) + 1
      const { error } = await admin.from('categories').insert({ key, label, emoji, sort })
      if (error) return NextResponse.json({ ok: false, error: 'That category already exists (or the name is taken).' }, { status: 400 })
      return NextResponse.json({ ok: true })
    }

    if (action === 'delete_category') {
      if (!body.key) return NextResponse.json({ ok: false, error: 'missing key' }, { status: 400 })
      const { error } = await admin.from('categories').delete().eq('key', body.key)
      if (error) throw error
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: false, error: 'unknown action' }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
