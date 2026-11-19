/**
 * EPOCH hourglass mark, inline so it can never fail to load.
 * Same drawing as public/epoch-mark.svg / epoch-mark-black.svg (keep in sync).
 * Frame uses `frame` colour; sand (the bar-chart pile) uses `sand` colour.
 */
export function Mark({ onGold = false, className = "" }: { onGold?: boolean; className?: string }) {
  const frame = onGold ? "var(--color-on-gold)" : "var(--color-ink)";
  const sand = onGold ? "var(--color-on-gold)" : "var(--color-gold)";
  return (
    <svg viewBox="0 0 40 56" fill="none" aria-hidden className={className}>
      <rect x="0" y="0" width="40" height="5" fill={frame} />
      <rect x="0" y="51" width="40" height="5" fill={frame} />
      <path
        d="M6 5V11L17.5 26V30L6 45V51M34 5V11L22.5 26V30L34 45V51"
        stroke={frame}
        strokeWidth="2.5"
        strokeLinecap="square"
      />
      <path d="M11 14H29L20.5 25H19.5Z" fill={sand} />
      <rect x="19.25" y="29" width="1.5" height="1.5" fill={sand} />
      <rect x="19.25" y="33" width="1.5" height="1.5" fill={sand} />
      <rect x="19.25" y="37" width="1.5" height="1.5" fill={sand} />
      <rect x="9" y="44" width="4" height="4" fill={sand} />
      <rect x="14" y="39" width="5" height="9" fill={sand} />
      <rect x="20" y="41" width="5" height="7" fill={sand} />
      <rect x="26" y="45" width="5" height="3" fill={sand} />
    </svg>
  );
}
