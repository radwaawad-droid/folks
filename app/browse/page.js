import Nav from '@/components/Nav'
import BrowseGrid from '@/components/BrowseGrid'
import { createClient } from '@/utils/supabase/server'
import { SAMPLE } from '@/lib/sample'

export const dynamic = 'force-dynamic'

export default async function BrowsePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let items = []
  let usingSample = false
  try {
    let query = supabase
      .from('items')
      .select('*, owner:profiles(full_name, rating_avg, sub_area)')
      .eq('status', 'available')
      .order('created_at', { ascending: false })
    if (user) query = query.neq('owner_id', user.id) // hide your own listings here
    const { data, error } = await query
    if (error) throw error
    items = data || []
  } catch (e) {
    items = []
  }

  if (!items.length) { items = SAMPLE; usingSample = true }

  return (
    <>
      <Nav />
      <main className="container page">
        {usingSample && (
          <div className="empty" style={{ marginBottom: 16 }}>
            Showing sample items. Real listings from neighbours appear here automatically.
          </div>
        )}
        <BrowseGrid items={items} />
      </main>
    </>
  )
}
