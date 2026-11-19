"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { NAV } from "@/lib/content";

export function Nav() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");

  // Scroll-spy: underline the section currently on screen.
  useEffect(() => {
    const els = NAV.map((n) => document.querySelector(n.href)).filter(Boolean) as Element[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(`#${e.target.id}`);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <nav aria-label="Main" className="mx-auto flex h-16 items-center justify-between px-gutter lg:px-gutter-lg">
        <Link href="/" className="flex items-center py-2" aria-label="EPOCH home">
          <Logo size="sm" />
        </Link>

        <ul className="hidden items-center gap-12 md:flex">
          {NAV.map((n) => (
            <li key={n.href}>
              <a
                href={n.href}
                className={`group relative flex min-h-tap items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] ${
                  active === n.href ? "text-ink" : "text-ink/90 hover:text-ink"
                }`}
              >
                <span className="text-gold">{n.n}</span>
                {n.label}
                <span
                  aria-hidden
                  className={`absolute inset-x-0 bottom-2 h-0.5 bg-gold transition-transform duration-[var(--duration-base)] ${
                    active === n.href ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link
            href="/register"
            className="inline-flex min-h-tap items-center gap-3 bg-gold px-5 text-sm font-bold uppercase tracking-[0.12em] text-on-gold hover:bg-ink"
          >
            Register <span aria-hidden>↗</span>
          </Link>
          <button
            type="button"
            className="inline-flex size-tap items-center justify-center border border-line-strong md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span aria-hidden className="font-bold text-gold">
              {open ? "−" : "≡"}
            </span>
          </button>
        </div>
      </nav>

      {open && (
        <ul id="mobile-menu" className="border-t border-line bg-bg md:hidden">
          {NAV.map((n) => (
            <li key={n.href} className="border-b border-line">
              <a
                href={n.href}
                onClick={() => setOpen(false)}
                className="flex min-h-14 items-center gap-3 px-gutter text-sm font-bold uppercase tracking-[0.12em]"
              >
                <span className="text-gold">{n.n}</span>
                {n.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
