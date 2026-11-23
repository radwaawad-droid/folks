// A stable, on-brand colour for a person's initial avatar, derived from their
// name so the same person always gets the same colour and a list of people
// reads as distinct faces instead of a wall of green.
const PALETTE = [
  '#205C49', // folks green
  '#C85A3C', // coral-deep
  '#4A6FA5', // blue
  '#7A5EA6', // purple
  '#2E7D5B', // emerald
  '#B07A2E', // ochre
  '#A84D6E', // rose
  '#3A7A6E', // teal
  '#5B7A3A', // olive
  '#8A5A3C', // clay
]

export function avatarColor(name) {
  const s = String(name || '').trim() || '?'
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return PALETTE[h % PALETTE.length]
}
