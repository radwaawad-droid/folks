// Illustrative listings shown until your `items` table has real rows.
export const SAMPLE = [
  { id: 's1', title: 'Bosch cordless drill (18V)', category: 'tools', is_free: true, emoji: '🔧',
    description: 'Great for hanging frames and assembling flat-pack furniture. Comes with two batteries, a charger, and a full bit set. Lightly used and well looked after.',
    owner: { full_name: 'Laila K.', rating_avg: 4.9, rating_count: 23, sub_area: 'Saheel' } },
  { id: 's2', title: 'Bugaboo stroller', category: 'baby', is_free: false, fee_per_day: 30, emoji: '👶',
    description: 'Smooth-riding city stroller, folds flat in seconds. Perfect for visiting family or a weekend at the park.',
    owner: { full_name: 'Nadia R.', rating_avg: 5.0, rating_count: 12, sub_area: 'Palmera' } },
  { id: 's3', title: 'Weber gas BBQ', category: 'bbq', is_free: false, fee_per_day: 45, emoji: '🍖',
    description: 'Three-burner gas grill, cleaned and ready. Great for a garden gathering. Gas bottle included.',
    owner: { full_name: 'Omar H.', rating_avg: 4.8, rating_count: 31, sub_area: 'Alvorada' } },
  { id: 's4', title: '4-person camping tent', category: 'camping', is_free: false, fee_per_day: 40, emoji: '🏕️',
    description: 'Easy-pitch tent, sleeps four comfortably. Ideal for a desert weekend in the cooler months.',
    owner: { full_name: 'Daniel M.', rating_avg: 4.9, rating_count: 8, sub_area: 'Mirador' } },
  { id: 's5', title: 'Extension ladder', category: 'tools', is_free: true, emoji: '🪜',
    description: 'Sturdy aluminium extension ladder, reaches first-floor windows. Happy to lend any weekend.',
    owner: { full_name: 'Sarah T.', rating_avg: 4.7, rating_count: 15, sub_area: 'Alma' } },
  { id: 's6', title: 'Outdoor projector', category: 'party', is_free: false, fee_per_day: 25, emoji: '📽️',
    description: '1080p projector with a portable screen — perfect for a backyard movie night with the kids.',
    owner: { full_name: 'Priya S.', rating_avg: 5.0, rating_count: 19, sub_area: 'Savannah' } },
]

export function sampleById(id) {
  return SAMPLE.find((i) => i.id === id) || null
}
