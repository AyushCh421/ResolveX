// The tick runs past the edge of the square on purpose, like a marker pen on a form.
export function LogoMark({ size = 30, tile = '#1f4fd8', tick = '#f5a524' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect x="2" y="4" width="24" height="24" rx="6" fill={tile} />
      <path d="M9 16.5l5 5L28 7" fill="none" stroke={tick} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Logo({ light = false }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark tile={light ? '#ffffff' : '#1f4fd8'} tick={light ? '#1f4fd8' : '#f5a524'} />
      <span className={`font-display text-[21px] font-bold tracking-tight ${light ? 'text-white' : 'text-ink'}`}>
        ResolveX
      </span>
    </span>
  );
}
