import type { Metadata } from "next";
import { Footer } from "@/components/landing/Footer";
import { Nav } from "@/components/landing/Nav";
import { LinkButton } from "@/components/ui/Button";
import { Frame } from "@/components/ui/Frame";
import { EVENT } from "@/lib/content";

export const metadata: Metadata = { title: "Rulebook — EPOCH 1.0" };

// EDIT: the full rulebook isn't written yet. The registration rules below are
// confirmed; replace the "Coming soon" block with the remaining sections.
const REGISTRATION_RULES = [
  `${EVENT.totalSlots} teams in total: ${EVENT.slotsPerTheme} per theme, first come first served.`,
  "A theme closes as soon as its 5th team submits.",
  "Teams have 3 or 4 members, with exactly one team lead.",
  "Open to Computer Science (Data Science) students in semester 1, 3, 5 or 7.",
  "Every member gives full name, USN, phone number and semester. Semester 1 students give their admission ID instead of a USN.",
  "A USN or admission ID can only be in one team.",
  "Your theme slot is locked only when you submit, not when you pick it.",
];

export default function RulebookPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl px-gutter pb-section pt-32">
        <p className="text-label font-bold uppercase tracking-label text-gold">[RB] {EVENT.name}</p>
        <h1 className="mt-3 font-display text-section">Rulebook</h1>

        <section className="mt-12" aria-labelledby="reg-rules">
          <h2 id="reg-rules" className="text-2xl font-extrabold uppercase tracking-tight">
            01 / Registration
          </h2>
          <ol className="mt-6 border-t border-line">
            {REGISTRATION_RULES.map((r, i) => (
              <li key={r} className="flex gap-5 border-b border-line py-4">
                <span className="text-label font-bold text-gold">{String(i + 1).padStart(2, "0")}</span>
                <span>{r}</span>
              </li>
            ))}
          </ol>
        </section>

        <Frame className="mt-12 p-6">
          <p className="text-label font-bold uppercase tracking-label text-gold">02 / Event day, judging &amp; conduct</p>
          <p className="mt-3 text-muted">The full rulebook is coming soon. Check back before {EVENT.date}.</p>
        </Frame>

        <div className="mt-12">
          <LinkButton href="/register" arrow>
            Register
          </LinkButton>
        </div>
      </main>
      <Footer />
    </>
  );
}
