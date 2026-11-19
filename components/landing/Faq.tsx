"use client";

import { useEffect, useId, useState } from "react";
import { CONTACTS, FAQ } from "@/lib/content";

/** Answer "types itself out" behind a block cursor, as in the video.
 *  The full text is always in the DOM (the untyped part is transparent),
 *  so screen readers read it all and the row height never jumps. */
function TypedText({ text }: { text: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(text.length);
      return;
    }
    setN(0);
    const id = setInterval(() => setN((v) => (v >= text.length ? (clearInterval(id), v) : v + 2)), 16);
    return () => clearInterval(id);
  }, [text]);
  const done = n >= text.length;
  return (
    <>
      {text.slice(0, n)}
      {!done && <span aria-hidden className="inline-block h-[1.1em] w-[0.55em] translate-y-[0.2em] bg-gold" />}
      <span className="text-transparent">{text.slice(n)}</span>
    </>
  );
}

export function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  const base = useId();
  const lead = CONTACTS[0];

  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-20 px-gutter lg:px-gutter-lg">
      <div className="grid gap-12 lg:grid-cols-[2fr_3fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="font-mono text-sm font-bold text-gold">[04]</p>
          <h2 id="faq-title" className="mt-4 text-[clamp(2.5rem,6.5vw,4.75rem)] font-extrabold uppercase leading-[0.95] tracking-tight">
            Frequently
            <br />
            asked
            <br />
            <span className="inline-block bg-gold px-2 text-on-gold">Questions</span>
          </h2>
          <p className="mt-6 text-sm text-muted">
            Still stuck? Call {lead.name}:{" "}
            <a
              href={`tel:+91${lead.phone}`}
              className="font-bold text-ink underline decoration-gold decoration-2 underline-offset-4 hover:text-gold"
            >
              {lead.phone}
            </a>
          </p>
        </div>

        <ul className="border-t border-line">
          {FAQ.map((item, i) => {
            const isOpen = open === i;
            const btn = `${base}-q${i}`;
            const panel = `${base}-a${i}`;
            return (
              <li key={item.q} className="border-b border-line">
                <h3>
                  <button
                    id={btn}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panel}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex min-h-16 w-full items-center gap-5 py-4 text-left"
                  >
                    <span className="w-6 shrink-0 text-label font-bold text-gold">{String(i + 1).padStart(2, "0")}</span>
                    <span className={`flex-1 font-bold lg:text-lg ${isOpen ? "text-gold" : "text-ink"}`}>{item.q}</span>
                    <span aria-hidden className={`w-6 shrink-0 text-center text-2xl font-light leading-none ${isOpen ? "text-gold" : ""}`}>
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                </h3>
                <div id={panel} role="region" aria-labelledby={btn} hidden={!isOpen} className="pb-6 pl-11 pr-11 text-sm leading-relaxed">
                  {isOpen && <TypedText text={item.a} />}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
