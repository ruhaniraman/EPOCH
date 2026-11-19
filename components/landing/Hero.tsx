"use client";

import { Logo } from "@/components/brand/Logo";
import { LinkButton } from "@/components/ui/Button";
import { CornerTicks } from "@/components/ui/Frame";
import { Label } from "@/components/ui/Section";
import { StickyNote } from "./StickyNote";
import { EVENT } from "@/lib/content";
import { slotsOpen, useThemes } from "@/lib/useThemes";

export function Hero() {
  const { themes } = useThemes();
  const open = themes ? slotsOpen(themes) : null;
  const closed = open === 0;

  const facts = [
    { k: "Date", v: EVENT.date },
    { k: "Time", v: EVENT.time },
    { k: "Venue", v: EVENT.venue },
  ];

  return (
    <section aria-labelledby="hero-title" className="relative px-gutter pb-section pt-32 lg:px-gutter-lg lg:pt-40">
      <h1 id="hero-title" className="sr-only">
        {EVENT.name} {EVENT.kind}
      </h1>

      <p className="text-label font-bold uppercase tracking-label text-muted">
        <span className="text-gold">[00]</span> {EVENT.society} presents
      </p>

      <div className="mt-8">
        <Logo size="lg" />
      </div>

      <p className="mt-10 max-w-2xl text-base leading-relaxed text-muted lg:text-lg">{EVENT.intro}</p>
      <p className="mt-4 text-label font-bold uppercase tracking-label text-muted">
        {EVENT.department} · {EVENT.college}
      </p>

      {/* Eligibility note: pinned top-right on lg+ screens, inline below the intro otherwise. */}
      <StickyNote className="mt-12 ml-2 w-fit lg:absolute lg:right-gutter-lg lg:top-44 lg:mt-0 lg:ml-0 2xl:right-[8%]" />

      {/* Date / time / venue strip */}
      <dl className="relative mt-12 grid border border-line sm:grid-cols-3">
        <CornerTicks />
        {facts.map((f, i) => (
          <div key={f.k} className={`p-5 lg:p-6 ${i > 0 ? "border-t border-line sm:border-l sm:border-t-0" : ""}`}>
            <dt>
              <Label className="text-gold">{f.k}</Label>
            </dt>
            <dd className="mt-2 text-lg font-extrabold uppercase lg:text-xl">{f.v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <p aria-live="polite" className="flex items-center gap-3 text-sm font-bold uppercase tracking-label">
          <span aria-hidden className={`size-2.5 ${closed ? "bg-taken" : "animate-pulse bg-gold"}`} />
          {open === null ? (
            <span className="text-muted">Checking slots…</span>
          ) : closed ? (
            <span>Registrations closed · 0 / {EVENT.totalSlots} slots open</span>
          ) : (
            <span>
              <span className="text-gold">{open}</span> / {EVENT.totalSlots} slots open
            </span>
          )}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <LinkButton href="/register" arrow>
            {closed ? "Registrations closed" : "Register now"}
          </LinkButton>
          <LinkButton href="/rulebook" variant="outline">
            Rulebook
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
