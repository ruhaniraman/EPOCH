import { Mark } from "./Mark";

type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, { word: string; sub: string; gap: string; mark: string; track: string }> = {
  sm: { word: "text-[2.25rem] leading-[0.8]", sub: "text-[0.45rem] mt-1", gap: "gap-2", mark: "w-6", track: "tracking-[0.18em]" },
  md: { word: "text-[4.5rem] leading-[0.8]", sub: "text-[0.7rem] mt-1.5", gap: "gap-3", mark: "w-11", track: "tracking-lockup" },
  lg: {
    word: "text-hero",
    sub: "text-[clamp(0.8rem,2.6vw,1.5rem)] mt-2",
    gap: "gap-[clamp(0.75rem,2vw,1.5rem)]",
    mark: "w-[clamp(3.5rem,15vw,8.5rem)]",
    track: "tracking-lockup",
  },
};

/**
 * Logo lockup: hourglass mark on the left (drawn inline, see Mark.tsx), "EPOCH"
 * in Bebas Neue, and "DATATHON" in gold Space Mono spread across the
 * word's width underneath.
 */
export function Logo({ size = "sm", onGold = false, className = "" }: { size?: Size; onGold?: boolean; className?: string }) {
  const s = SIZES[size];
  return (
    <span className={`inline-flex items-center ${s.gap} ${className}`} aria-label="EPOCH Datathon" role="img">
      <Mark onGold={onGold} className={`${s.mark} h-auto shrink-0`} />
      <span aria-hidden className="inline-flex flex-col">
        <span className={`font-display ${onGold ? "text-on-gold" : "text-ink"} ${s.word}`}>EPOCH</span>
        <span className={`flex justify-between font-lockup uppercase leading-none ${onGold ? "text-on-gold" : "text-gold"} ${s.sub}`}>
          <span className={s.track}>Datathon</span>
        </span>
      </span>
    </span>
  );
}
