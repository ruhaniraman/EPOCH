import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "gold" | "outline" | "ghost";

const base =
  "inline-flex min-h-tap items-center justify-center gap-3 px-6 font-mono text-sm font-bold uppercase tracking-label transition-colors duration-[var(--duration-fast)] disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  gold: "bg-gold text-on-gold hover:bg-ink",
  outline: "border border-line-strong text-ink hover:border-gold hover:text-gold",
  ghost: "text-muted hover:text-ink",
};

export const buttonClass = (variant: Variant = "gold", className = "") => `${base} ${variants[variant]} ${className}`;

export function LinkButton({
  href,
  variant = "gold",
  arrow = false,
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  arrow?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={buttonClass(variant, className)}>
      {children}
      {arrow && <span aria-hidden>↗</span>}
    </Link>
  );
}

export function Button({
  variant = "gold",
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type="button" className={buttonClass(variant, className)} {...rest} />;
}

export function Spinner({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`inline-block size-3 animate-spin border-2 border-current border-r-transparent ${className}`} />;
}
