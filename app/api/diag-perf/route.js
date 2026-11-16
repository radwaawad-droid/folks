import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
const TOKEN = '100c851e3370ae4062e3b76c'

export async function GET(req) {
  if (new URL(req.url).searchParams.get('t') !== TOKEN)
    return NextResponse.json({ ok: false }, { status: 403 })
  const supabase = createClient()
  const timings = {}
  async function time(label, fn) {
    const t0 = Date.now()
    let rows = null, err = null, bytes = 0
    try { const r = await fn(); err = r.error?.message || null; rows = r.count ?? (r.data?.length ?? null); bytes = JSON.stringify(r.data || '').length }
    catch (e) { err = String(e) }
    timings[label] = { ms: Date.now() - t0, rows, bytes, err }
  }
  // 1: trivial round trip (count only)
  await time('count_items_head', () => supabase.from('items').select('id', { count: 'exact', head: true }))
  // 2: browse query WITHOUT photos
  await time('items_no_photos', () => supabase.from('items').select('id, title, fee_per_day, status, category, created_at').eq('status','available').order('created_at',{ascending:false}).limit(100))
  // 3: browse query WITH photos (as the real page does)
  await time('items_with_photos', () => supabase.from('items').select('id, title, fee_per_day, is_free, status, category, photos, created_at, owner:profiles(full_name, rating_avg, sub_area)').eq('status','available').order('created_at',{ascending:false}).limit(100))
  // 4: second trivial round trip (to see steady per-call latency)
  await time('count_items_head_2', () => supabase.from('items').select('id', { count: 'exact', head: true }))
  return NextResponse.json({
    ok: true,
    region: process.env.VERCEL_REGION || null,
    timings,
  })
}
