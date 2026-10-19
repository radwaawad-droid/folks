// Fallback category list, used if the `categories` table is empty or unreachable.
export const DEFAULT_CATEGORIES = [
  { key: 'tools',       label: 'Tools',          emoji: '🔧' },
  { key: 'sports',      label: 'Sports',         emoji: '⚽' },
  { key: 'party',       label: 'Party & Events', emoji: '🎉' },
  { key: 'garden',      label: 'Lawn & Garden',  emoji: '🌿' },
  { key: 'electronics', label: 'Electronics',    emoji: '🔌' },
  { key: 'toys',        label: 'Toys & Games',   emoji: '🧸' },
  { key: 'pets',        label: 'Pet Supplies',   emoji: '🐾' },
  { key: 'bbq',         label: 'BBQ',            emoji: '🍖' },
]

// Reads categories from the DB (sorted), falling back to the defaults above.
export async function fetchCategories(supabase) {
  try {
    const { data } = await supabase.from('categories').select('key, label, emoji').order('sort')
    if (data && data.length) return data
  } catch (_) {}
  return DEFAULT_CATEGORIES
}

// Soft gradient background for a category's placeholder tile (when a listing has no photo).
const CLS = ['ph-tools', 'ph-party', 'ph-camp', 'ph-baby', 'ph-default']
export function clsFor(key) {
  let h = 0
  const s = key || ''
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return CLS[h % CLS.length]
}

// Turns a label into a URL-safe category key, e.g. "Books & Media" -> "books-media".
export function slugify(s) {
  return (s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40)
}
