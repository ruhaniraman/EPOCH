import { BigMoment } from "@/components/landing/BigMoment";
import { Faq } from "@/components/landing/Faq";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { Nav } from "@/components/landing/Nav";
import { Pillars } from "@/components/landing/Pillars";
import { Prizes } from "@/components/landing/Prizes";
import { Themes } from "@/components/landing/Themes";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[120rem]">
        <Hero />
        <Pillars />
        <div className="mt-section">
          <BigMoment />
        </div>
        <div className="mt-section">
          <Themes />
        </div>
        <div className="mt-section">
          <Prizes />
        </div>
        <div className="mt-section">
          <Faq />
        </div>
      </main>
      <Footer />
    </>
  );
}
