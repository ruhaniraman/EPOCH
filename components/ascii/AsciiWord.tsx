"use client";

import { useEffect, useRef } from "react";

/**
 * Huge word drawn in ASCII characters, with the video's scramble: characters
 * start scattered and grey, then fly in and settle into the letters in gold.
 *
 * How it works:
 * 1. The word is drawn in the headline font (Bebas Neue) onto a hidden,
 *    low-resolution canvas where 1 pixel ≈ 1 character cell. Every cell that
 *    lands inside a letter becomes a particle, so the ASCII letters have the
 *    exact shapes of our headline font, with no hand-made bitmap font.
 * 2. One visible <canvas> draws all particles each frame (thousands of DOM
 *    nodes would stutter on phones). Each particle eases from a random start
 *    point to its cell, with its own small delay.
 * 3. mode="pinned" (the video's effect): place inside a tall element marked
 *    data-ascii-track, in a position:sticky full-screen box. While you scroll
 *    through the track the word stays on screen: sparse characters scattered
 *    over the whole screen → a grey cloud → gold letters. Scrolling back up
 *    reverses it. mode="inview": plays once on a timer when it scrolls into
 *    view (used in the footer, which can't scroll far enough to pin).
 * 4. prefers-reduced-motion: draws the finished word once. No motion, no flicker.
 *
 * Accessibility: the wrapper is role="img" with aria-label; the canvas is hidden.
 */

const SCATTER = "$#@%&*+=?!/\\|[]{}<>~^;:".split("");
const DENSE = "$#@%&8*".split("");
const pick = (a: string[]) => a[(Math.random() * a.length) | 0];
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

interface Particle {
  tx: number;
  ty: number;
  sx: number;
  sy: number;
  d: number;
  g: number; // which word this character belongs to
  c: string; // settled character
  s: string; // character while travelling
}

export function AsciiWord({
  lines,
  mobileLines,
  label,
  mode = "pinned",
  oneByOne = false,
  className = "",
}: {
  lines: string[];
  /** alternative line breaks below 640px, so the characters don't get too tiny */
  mobileLines?: string[];
  label: string;
  mode?: "pinned" | "inview";
  /** assemble the words one after another (CLEAN. → TRAIN. → PITCH.) instead of all at once */
  oneByOne?: boolean;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let particles: Particle[] = [];
    let groups = 1;
    let charFont = "";
    let cw = 0;
    let lastWidth = 0;
    let lastHeight = 0;
    const pinned = mode === "pinned";
    const track = wrap.closest<HTMLElement>("[data-ascii-track]");
    let colors = { gold: "#F2C230", grey: "#666666" };

    let raf = 0;
    let visible = false;
    let shown = 0; // smoothed progress actually drawn
    let startedAt = 0; // inview mode
    let lastFlicker = 0;

    function build() {
      const width = wrap.clientWidth;
      if (!width) return;
      lastWidth = width;
      lastHeight = wrap.clientHeight;
      const css = getComputedStyle(document.documentElement);
      const display = css.getPropertyValue("--font-display").trim() || "sans-serif";
      const mono = css.getPropertyValue("--font-mono").trim() || "monospace";
      colors = {
        gold: css.getPropertyValue("--color-gold").trim() || colors.gold,
        grey: css.getPropertyValue("--color-taken").trim() || colors.grey,
      };

      const useLines = width < 640 && mobileLines ? mobileLines : lines;
      const f = width < 640 ? 7 : width < 1024 ? 9 : 11; // character size
      cw = f * 0.6; // monospace advance
      const rh = f * 1.3; // row height
      charFont = `700 ${f}px ${mono}`;

      // Fit the word to the container width.
      const m = document.createElement("canvas").getContext("2d")!;
      m.font = `100px ${display}`;
      const metrics = useLines.map((l) => m.measureText(l));
      const widest = Math.max(...metrics.map((x) => x.width));
      const S = (100 * width * 0.98) / widest;
      const asc = Math.max(...metrics.map((x) => x.actualBoundingBoxAscent)) * (S / 100);
      const desc = Math.max(...metrics.map((x) => x.actualBoundingBoxDescent)) * (S / 100);
      const lineH = asc + desc;
      const gap = S * 0.14;
      const textH = useLines.length * lineH + (useLines.length - 1) * gap;
      // Pinned: the canvas is the whole sticky screen and the word sits in its middle.
      // Otherwise: just enough room around the word for the scattered cloud.
      const H = pinned && !reduced ? Math.max(wrap.clientHeight, textH + rh * 2) : textH + (reduced ? rh : Math.round(textH * 0.25)) * 2;
      const pad = Math.round((H - textH) / 2);

      // Rasterize at cell resolution (×3 supersampling), then read coverage.
      const SS = 3;
      const cols = Math.floor(width / cw);
      const rows = Math.ceil(textH / rh);
      const r = document.createElement("canvas");
      r.width = cols * SS;
      r.height = rows * SS;
      const rc = r.getContext("2d", { willReadFrequently: true })!;
      rc.scale(SS / cw, SS / rh);
      rc.fillStyle = "#fff";
      rc.font = `${S}px ${display}`;
      rc.textBaseline = "alphabetic";
      // Also record each word's box so characters can be grouped per word.
      const boxes: { x0: number; x1: number; y0: number; y1: number }[] = [];
      useLines.forEach((l, i) => {
        const w = metrics[i].width * (S / 100);
        const lineX = (width - w) / 2;
        const y0 = i * (lineH + gap);
        rc.fillText(l, lineX, asc + y0);
        let at = 0;
        for (const word of l.split(" ")) {
          const start = l.indexOf(word, at);
          at = start + word.length;
          const x0 = lineX + m.measureText(l.slice(0, start)).width * (S / 100);
          boxes.push({ x0, x1: x0 + m.measureText(word).width * (S / 100), y0, y1: y0 + lineH });
        }
      });
      groups = oneByOne ? boxes.length : 1;
      const groupOf = (x: number, y: number) => {
        if (!oneByOne) return 0;
        let best = 0;
        let bestD = Infinity;
        boxes.forEach((b, i) => {
          const dx = x < b.x0 ? b.x0 - x : x > b.x1 ? x - b.x1 : 0;
          const dy = y < b.y0 ? b.y0 - y : y > b.y1 ? y - b.y1 : 0;
          if (dx + dy < bestD) {
            bestD = dx + dy;
            best = i;
          }
        });
        return best;
      };
      const data = rc.getImageData(0, 0, r.width, r.height).data;

      particles = [];
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          let sum = 0;
          for (let dy = 0; dy < SS; dy++)
            for (let dx = 0; dx < SS; dx++) sum += data[((y * SS + dy) * r.width + x * SS + dx) * 4 + 3];
          if (sum / (SS * SS) < 110) continue;
          const tx = x * cw;
          const ty = pad + y * rh;
          particles.push({
            tx,
            ty,
            // pinned: start anywhere on screen (video's sparse first frames)
            sx: pinned ? Math.random() * (width - cw) : tx + (Math.random() - 0.5) * width * 0.8,
            sy: pinned ? Math.random() * (H - rh) : Math.min(H - rh, Math.max(0, ty + (Math.random() - 0.5) * H * 1.2)),
            d: Math.random(),
            g: groupOf(tx + cw / 2, y * rh + rh / 2),
            c: pick(DENSE),
            s: pick(SCATTER),
          });
        }
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(reduced ? 1 : shown, performance.now());
    }

    function draw(p: number, now: number) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = charFont;
      ctx.textBaseline = "top";
      const flicker = !reduced && now - lastFlicker > 90;
      if (flicker) lastFlicker = now;

      for (const q of particles) {
        // oneByOne: each word owns an equal slice of the progress, in order.
        const wp = clamp01((p - q.g / groups) * groups);
        if (wp <= 0 || wp < q.d * 0.35) continue; // sparse at first, denser as you scroll
        const local = clamp01((wp - q.d * 0.45) / 0.55);
        const e = easeOut(local);
        const settled = e > 0.985;
        if (flicker && Math.random() < (settled ? 0.015 : 0.08)) {
          if (settled) q.c = pick(DENSE);
          else q.s = pick(SCATTER);
        }
        ctx.globalAlpha = settled ? 1 : 0.35 + 0.55 * e;
        ctx.fillStyle = settled ? colors.gold : colors.grey;
        ctx.fillText(settled ? q.c : q.s, q.sx + (q.tx - q.sx) * e, q.sy + (q.ty - q.sy) * e);
      }
      ctx.globalAlpha = 1;
    }

    function target(now: number) {
      if (mode === "inview") return startedAt ? clamp01((now - startedAt) / 1800) : 0;
      if (!track) return 1;
      const rect = track.getBoundingClientRect();
      const vh = window.innerHeight;
      // Starts a little before the section pins; the word is complete 80% of
      // the way through the pinned scroll, then holds until it unpins.
      const lead = vh * 0.3;
      const distance = Math.max(1, rect.height - vh) * 0.8;
      return clamp01((lead - rect.top) / (distance + lead));
    }

    function loop(now: number) {
      const t = target(now);
      shown += (t - shown) * 0.18;
      if (Math.abs(t - shown) < 0.001) shown = t;
      draw(shown, now);
      if (visible) raf = requestAnimationFrame(loop);
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (reduced) return;
        if (visible && mode === "inview" && !startedAt && entry.intersectionRatio > 0.3) startedAt = performance.now();
        cancelAnimationFrame(raf);
        if (visible) raf = requestAnimationFrame(loop);
      },
      { threshold: [0, 0.3, 0.6] },
    );

    const ro = new ResizeObserver(() => {
      if (Math.abs(wrap.clientWidth - lastWidth) > 1 || (pinned && Math.abs(wrap.clientHeight - lastHeight) > 1)) build();
    });

    let cancelled = false;
    const families = getComputedStyle(document.documentElement);
    Promise.all([
      document.fonts.load(`100px ${families.getPropertyValue("--font-display")}`),
      document.fonts.load(`700 11px ${families.getPropertyValue("--font-mono")}`),
    ])
      .catch(() => {})
      .then(() => {
        if (cancelled) return;
        build();
        io.observe(wrap);
        ro.observe(wrap);
      });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [lines, mobileLines, mode, oneByOne]);

  return (
    <div ref={wrapRef} role="img" aria-label={label} className={`w-full ${className}`}>
      <canvas ref={canvasRef} aria-hidden className="block w-full" />
    </div>
  );
}
