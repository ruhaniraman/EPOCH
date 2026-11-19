import type { ReactNode } from "react";

/** "[02]" small gold index + giant headline word, as in the video. */
export function SectionHeader({ index, title, id }: { index: string; title: string; id?: string }) {
  return (
    <div className="flex items-start gap-4 px-gutter lg:gap-8 lg:px-gutter-lg">
      <span className="mt-[0.9em] font-mono text-sm font-bold text-gold lg:text-base">[{index}]</span>
      <h2 id={id} className="font-display text-section uppercase">
        {title}
      </h2>
    </div>
  );
}

/** Small uppercase mono label. */
export function Label({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`text-label font-bold uppercase tracking-label ${className}`}>{children}</span>;
}
