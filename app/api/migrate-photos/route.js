import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const BUCKET = 'item-photos'

// Admin-only: converts any listing photos still stored as base64 data URLs into
// Supabase Storage files, replacing them with short public URLs. Idempotent and
// re-runnable — only touches photos that still start with "data:".
export async function POST() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    const { data: me } = await admin.from('profiles').select('is_admin').eq('id', user.id).maybeSingle()
    if (!me?.is_admin) return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })

    const { data: items = [] } = await admin
      .from('items').select('id, owner_id, photos')

    let converted = 0, itemsTouched = 0, remaining = 0
    const BUDGET = 60 // cap uploads per run so the request never times out

    for (const it of (items || [])) {
      const photos = Array.isArray(it.photos) ? it.photos : []
      if (!photos.some((p) => typeof p === 'string' && p.startsWith('data:'))) continue

      let changed = false
      const next = []
      for (const p of photos) {
        if (typeof p === 'string' && p.startsWith('data:')) {
          if (converted >= BUDGET) { remaining++; next.push(p); continue }
          const url = await uploadDataUrl(admin, it.owner_id || 'legacy', p)
          if (url) { next.push(url); converted++; changed = true }
          else next.push(p)
        } else {
          next.push(p)
        }
      }
      if (changed) {
        const { error } = await admin.from('items').update({ photos: next }).eq('id', it.id)
        if (!error) itemsTouched++
      }
    }

    return NextResponse.json({ ok: true, converted, itemsTouched, remaining })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}

async function uploadDataUrl(admin, ownerId, dataUrl) {
  try {
    const m = /^data:([^;]+);base64,(.*)$/s.exec(dataUrl)
    if (!m) return null
    const contentType = m[1] || 'image/jpeg'
    const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg'
    const buffer = Buffer.from(m[2], 'base64')
    const name = `${ownerId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const { error } = await admin.storage.from(BUCKET)
      .upload(name, buffer, { contentType, cacheControl: '31536000', upsert: false })
    if (error) return null
    const { data } = admin.storage.from(BUCKET).getPublicUrl(name)
    return data?.publicUrl || null
  } catch (_) { return null }
}
