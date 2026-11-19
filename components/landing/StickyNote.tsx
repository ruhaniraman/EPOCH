import { ELIGIBILITY_NOTE } from "@/lib/content";

/**
 * Gold sticky note taped to the hero: "only for CSE (Data Science)".
 * Slaps on when the page loads, then sways gently from the tape.
 * Pure CSS (see .sticky-note in globals.css); reduced-motion users get it static.
 */
export function StickyNote({ className = "" }: { className?: string }) {
  return (
    <div className={`sticky-note ${className}`}>
      <div role="note" aria-label={`${ELIGIBILITY_NOTE.title} ${ELIGIBILITY_NOTE.body}`} className="sticky-note__paper relative w-64 px-6 pb-7 pt-8 text-on-gold sm:w-72">
        {/* tape */}
        <span aria-hidden className="absolute -top-3 left-1/2 h-7 w-24 -translate-x-1/2 -rotate-3 bg-ink/35 backdrop-blur-[1px]" />

        <p aria-hidden className="font-display text-4xl leading-none tracking-wide">
          {ELIGIBILITY_NOTE.title}
        </p>
        <p aria-hidden className="mt-3 text-sm font-bold leading-snug">
          {ELIGIBILITY_NOTE.body}
        </p>
        <p aria-hidden className="mt-4 border-t-2 border-dashed border-on-gold/40 pt-3 text-label font-bold uppercase tracking-label">
          {ELIGIBILITY_NOTE.footer}
        </p>

        {/* folded corner */}
        <span aria-hidden className="sticky-note__fold absolute bottom-0 right-0 size-7" />
      </div>
    </div>
  );
}
