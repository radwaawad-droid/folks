import Nav from '@/components/Nav'
import BrowseGrid from '@/components/BrowseGrid'
import { createClient } from '@/utils/supabase/server'
import { fetchCategories } from '@/lib/categories'

export const dynamic = 'force-dynamic'

export default async function BrowsePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const categories = await fetchCategories(supabase)

  let items = []
  try {
    let query = supabase
      .from('items')
      .select('id, title, fee_per_day, is_free, status, category, photos, created_at, owner:profiles(full_name, rating_avg, sub_area)')
      .eq('status', 'available')
      .order('created_at', { ascending: false })
      .limit(100)
    if (user) query = query.neq('owner_id', user.id) // hide your own listings here
    const { data, error } = await query
    if (error) throw error
    items = data || []
  } catch (e) {
    items = []
  }

  return (
    <>
      <Nav />
      <main className="container page">
        <BrowseGrid items={items} categories={categories} />
      </main>
    </>
  )
}
