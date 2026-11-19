"use client";

import Link from "next/link";
import { SectionHeader } from "@/components/ui/Section";
import { SlotSquares } from "@/components/ui/SlotSquares";
import { EVENT, THEMES } from "@/lib/content";
import { isFull, slotsOpen, useThemes } from "@/lib/useThemes";
import { TierCell, TierRow } from "./TierGrid";

/** [02] Themes: replaces the video's sponsor grid. Live slots per theme. */
export function Themes() {
  const { themes } = useThemes();
  const list = themes ?? THEMES.map((t) => ({ ...t, taken: 0 }));
  const loading = !themes;

  return (
    <section id="themes" aria-labelledby="themes-title" className="scroll-mt-20">
      <SectionHeader index="02" title="Themes" id="themes-title" />
      <div className="mt-10 border-t border-line">
        <TierRow
          title={EVENT.track}
          label="Track"
          aside={
            <p className="text-sm leading-relaxed text-muted">
              {EVENT.slotsPerTheme} teams per theme. First come, first served.{" "}
              {themes && (
                <span className="font-bold text-ink">
                  {slotsOpen(themes)} / {EVENT.totalSlots} open.
                </span>
              )}
            </p>
          }
        >
          {list.map((t, i) => {
            const full = !loading && isFull(t);
            const open = t.capacity - t.taken;
            return (
              <TierCell key={t.id} tag={`0${i + 1} / ${t.code}`}>
                <p className={`font-display text-5xl leading-none lg:text-6xl ${full ? "text-muted line-through decoration-2" : ""}`}>
                  {t.name}
                </p>
                <p className="max-w-64 text-sm text-muted">{t.blurb}</p>
                {loading ? (
                  <span className="text-label font-bold uppercase tracking-label text-muted">Loading slots…</span>
                ) : (
                  <span className="mt-2 flex items-center gap-3">
                    <SlotSquares taken={t.taken} capacity={t.capacity} />
                    <span aria-hidden className={`text-label font-bold uppercase tracking-label ${full ? "text-muted" : "text-gold"}`}>
                      {full ? "Full" : `${open} / ${t.capacity} open`}
                    </span>
                  </span>
                )}
              </TierCell>
            );
          })}
          <Link
            href="/register"
            className="group flex min-h-56 flex-col justify-between bg-bg p-5 transition-colors hover:bg-gold lg:min-h-72 lg:p-6"
          >
            <span className="text-label font-bold uppercase tracking-label text-muted group-hover:text-on-gold">06 / YOU</span>
            <span className="font-display text-5xl leading-none text-gold group-hover:text-on-gold lg:text-6xl">
              Pick yours <span aria-hidden>↗</span>
            </span>
          </Link>
        </TierRow>
      </div>
    </section>
  );
}
