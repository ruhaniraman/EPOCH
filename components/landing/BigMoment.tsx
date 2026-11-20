import { AsciiWord } from "@/components/ascii/AsciiWord";
import { Frame } from "@/components/ui/Frame";
import { RULE_CARDS } from "@/lib/content";

const LINES = ["CLEAN. TRAIN. PITCH."];
const MOBILE_LINES = ["CLEAN.", "TRAIN.", "PITCH."];

/**
 * The ASCII "big moment" followed by the three text cards (video's BUILD. → THINK BUILD SHIP).
 * The track is 4.5 screens tall; the sticky box keeps the words on screen while
 * that scrolling assembles CLEAN. then TRAIN. then PITCH. Reduced motion: no pinning.
 */
export function BigMoment() {
  return (
    <section aria-labelledby="motto" className="px-gutter lg:px-gutter-lg">
      <h2 id="motto" className="sr-only">
        Clean. Train. Pitch.
      </h2>
      <div data-ascii-track className="relative h-[450svh] motion-reduce:h-auto">
        <div className="sticky top-0 flex h-svh items-center motion-reduce:static motion-reduce:h-auto">
          <AsciiWord lines={LINES} mobileLines={MOBILE_LINES} label="Clean. Train. Pitch." oneByOne className="h-full motion-reduce:h-auto" />
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3 md:gap-12">
        {RULE_CARDS.map((c) => (
          <Frame key={c.title} as="article" className="border-t-0 bg-bg">
            <div className="border-t border-line p-6 pt-8 lg:p-10">
              <h3 className="text-2xl font-extrabold uppercase leading-tight tracking-tight lg:text-[1.75rem]">{c.title}</h3>
              <p className="mt-4 leading-relaxed text-muted">
                {c.body}
                {"link" in c && (
                  <>
                    {" "}
                    <a href={c.link.href} target="_blank" rel="noopener noreferrer" className="font-bold text-ink underline decoration-gold decoration-2 underline-offset-4 hover:text-gold">
                      {c.link.label}
                    </a>
                  </>
                )}
              </p>
            </div>
          </Frame>
        ))}
      </div>
    </section>
  );
}
