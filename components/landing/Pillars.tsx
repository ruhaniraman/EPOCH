import { Fragment } from "react";
import { Frame, PlusMark } from "@/components/ui/Frame";
import { PILLARS } from "@/lib/content";
import { CleanIllustration, PitchIllustration, TrainIllustration } from "./Illustrations";

const ART = [CleanIllustration, TrainIllustration, PitchIllustration];

/** [01] About: the three feature cards (video's DEVELOPMENT / DESIGN cards). */
export function Pillars() {
  return (
    <section id="about" aria-labelledby="about-title" className="scroll-mt-20 px-gutter lg:px-gutter-lg">
      <h2 id="about-title" className="sr-only">
        About: clean it, train it, pitch it
      </h2>
      <div className="flex flex-col items-stretch gap-6 lg:flex-row lg:gap-4">
        {PILLARS.map((p, i) => {
          const Art = ART[i];
          return (
            <Fragment key={p.n}>
              {i > 0 && <PlusMark className="self-center" />}
              <Frame as="article" className="flex-1 bg-bg">
                <div className="border-b border-line p-6 lg:p-8">
                  <Art footer={p.footer} />
                </div>
                <div className="p-6 lg:p-8">
                  <p className="text-sm font-bold uppercase">
                    <span className="text-muted">{`<${p.n} / `}</span>
                    <span className="text-gold">{p.file}</span>
                    <span>{`${p.ext}>={`}</span>
                  </p>
                  <h3 className="mt-3 text-title font-extrabold uppercase tracking-tight">{p.title}</h3>
                  <p className="mt-4 leading-relaxed text-muted">{p.body}</p>
                </div>
              </Frame>
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}
