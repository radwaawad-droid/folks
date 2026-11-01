// The folks door-arch mark as line art. Inherits color via currentColor, so it
// can be tinted with CSS. Used as the quiet placeholder when a listing, hero or
// empty state has no photo of its own.
export default function DoorMark({ className }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none"
      stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M15 56 V31 a17 17 0 0 1 34 0 V56" />
      <path d="M27 56 V33 L39 29 V56 Z" />
      <circle cx="30.5" cy="44" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  )
}
