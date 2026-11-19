import type { ElementType, ReactNode } from "react";

/** Square corner ticks, as on the video's cards. Place inside a `relative` box. */
export function CornerTicks() {
  const tick = "pointer-events-none absolute size-[7px] bg-tick";
  return (
    <span aria-hidden className="contents">
      <span className={`${tick} -left-[4px] -top-[4px]`} />
      <span className={`${tick} -right-[4px] -top-[4px]`} />
      <span className={`${tick} -bottom-[4px] -left-[4px]`} />
      <span className={`${tick} -bottom-[4px] -right-[4px]`} />
    </span>
  );
}

/** 1px-bordered box with square corner ticks. */
export function Frame({
  as: Tag = "div",
  className = "",
  children,
  ...rest
}: { as?: ElementType; className?: string; children: ReactNode } & Record<string, unknown>) {
  return (
    <Tag className={`relative border border-line ${className}`} {...rest}>
      <CornerTicks />
      {children}
    </Tag>
  );
}

/** The accent "+" the video puts between cards. */
export function PlusMark({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden className={`select-none font-mono text-3xl font-light leading-none text-gold ${className}`}>
      +
    </span>
  );
}
