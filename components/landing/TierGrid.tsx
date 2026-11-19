import type { ReactNode } from "react";

/**
 * The video's sponsor-grid layout, reused for themes and prizes:
 * full-width rows, a tier name on the left, a grid of 1px-ruled cells on the
 * right, each cell with a small label in its top-left corner.
 */
export function TierRow({ title, label, aside, cols = 2, children }: {
  title: string;
  label: string;
  aside?: ReactNode;
  cols?: 2 | 3;
  children: ReactNode;
}) {
  return (
    <div className="grid border-b border-line lg:grid-cols-[22%_1fr]">
      <div className="px-gutter py-8 lg:px-gutter-lg lg:py-10">
        <h3 className="text-3xl font-extrabold uppercase tracking-tight">{title}</h3>
        <p className="mt-2 text-label font-bold uppercase tracking-label text-muted">{label}</p>
        {aside && <div className="mt-6">{aside}</div>}
      </div>
      <div className={`grid gap-px border-t border-line bg-line lg:border-l lg:border-t-0 sm:grid-cols-2 ${cols === 3 ? "lg:grid-cols-3" : ""}`}>
        {children}
      </div>
    </div>
  );
}

export function TierCell({ tag, gold = false, children }: { tag: string; gold?: boolean; children: ReactNode }) {
  return (
    <div className={`relative flex min-h-56 flex-col p-5 lg:min-h-72 lg:p-6 ${gold ? "bg-gold text-on-gold" : "bg-bg"}`}>
      <span className={`text-label font-bold uppercase tracking-label ${gold ? "" : "text-muted"}`}>{tag}</span>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-6 text-center">{children}</div>
    </div>
  );
}
