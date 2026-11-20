import Link from "next/link";
import { AsciiWord } from "@/components/ascii/AsciiWord";
import { Logo } from "@/components/brand/Logo";
import { Label } from "@/components/ui/Section";
import { CONTACTS, EVENT, NAV, RULEBOOK_URL } from "@/lib/content";

const WORD = ["EPOCH DATATHON"];
const WORD_MOBILE = ["EPOCH", "DATATHON"];

const link = "inline-flex min-h-tap items-center gap-2 font-bold hover:text-gold lg:min-h-9";

export function Footer() {
  return (
    <footer className="mt-section border-t border-line">
      <div className="grid gap-12 px-gutter py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-gutter-lg">
        <div>
          <Logo size="md" />
          <p className="mt-6 font-bold uppercase">{EVENT.name} Datathon</p>
          <p className="mt-1 text-muted">{EVENT.tagline}</p>
        </div>

        <nav aria-label="Footer">
          <Label className="text-gold">Explore</Label>
          <ul className="mt-4">
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={`/${n.href}`} className={link}>
                  {n.label}
                </a>
              </li>
            ))}
            <li>
              <Link href="/register" className={link}>
                Register <span aria-hidden>↗</span>
              </Link>
            </li>
            <li>
              <a href={RULEBOOK_URL} target="_blank" rel="noopener noreferrer" className={link}>
                Rulebook <span aria-hidden>↗</span>
              </a>
            </li>
          </ul>
        </nav>

        <div>
          <Label className="text-gold">Contact us at</Label>
          <ul className="mt-4 space-y-4">
            {CONTACTS.map((c) => (
              <li key={c.name}>
                <p className="font-bold">{c.name}</p>
                <p className="text-sm text-muted">{c.role}</p>
                {"phone" in c && (
                  <a
                    href={`tel:+91${c.phone}`}
                    className="inline-flex min-h-tap items-center font-bold underline decoration-gold decoration-2 underline-offset-4 hover:text-gold lg:min-h-8"
                  >
                    {c.phone}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <Label className="text-gold">Conducted by</Label>
          <p className="mt-4 font-bold">{EVENT.society}</p>
          <p className="mt-1 text-sm text-muted">
            {EVENT.department}
            <br />
            {EVENT.college}
          </p>
          <p className="mt-6 text-sm text-muted">
            {EVENT.date} · {EVENT.time}
            <br />
            {EVENT.venue}
          </p>
        </div>
      </div>

      <div className="px-gutter lg:px-gutter-lg">
        <AsciiWord lines={WORD} mobileLines={WORD_MOBILE} label="EPOCH Datathon" mode="inview" />
      </div>

      <div className="mt-8 flex flex-col gap-2 border-t border-line px-gutter py-6 sm:flex-row sm:justify-between lg:px-gutter-lg">
        <Label className="text-muted">Clean it. Train it. Pitch it.</Label>
        <Label className="text-muted">© 2026 {EVENT.society}</Label>
      </div>
    </footer>
  );
}
