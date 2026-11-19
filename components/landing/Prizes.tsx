import { SectionHeader } from "@/components/ui/Section";
import { EVENT, PRIZE_TIERS } from "@/lib/content";
import { TierCell, TierRow } from "./TierGrid";

/** [03] Prizes: same tier-grid layout as the video's sponsor tiers. */
export function Prizes() {
  return (
    <section id="prizes" aria-labelledby="prizes-title" className="scroll-mt-20">
      <SectionHeader index="03" title="Prizes" id="prizes-title" />
      <div className="mt-10 border-t border-line">
        {PRIZE_TIERS.map((tier, ti) => (
          <TierRow key={tier.tier} title={tier.tier} label={tier.label}>
            {tier.prizes.map((p) => (
              <TierCell key={p.key} tag={`${p.n} / ${p.key}`}>
                <p className={`font-display text-6xl leading-none ${ti === 0 ? "text-gold" : "text-ink"}`}>{p.amount}</p>
                <p className="font-bold uppercase tracking-label">{p.title}</p>
              </TierCell>
            ))}
            {ti === PRIZE_TIERS.length - 1 && (
              <TierCell tag="POOL / TOTAL" gold>
                <p className="font-display text-6xl leading-none">{EVENT.prizePool}</p>
                <p className="font-bold uppercase tracking-label">Prize pool</p>
                <p className="text-label font-bold uppercase tracking-label">Awards on {EVENT.awards}</p>
              </TierCell>
            )}
          </TierRow>
        ))}
      </div>
    </section>
  );
}
