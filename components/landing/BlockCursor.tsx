"use client";

import { useEffect, useRef } from "react";

/**
 * The video's gold block cursor. It REPLACES the system cursor:
 * - mouse/trackpad only (touch screens have no cursor anyway)
 * - sits exactly on the pointer (top-left corner = click point), no lag,
 *   because it's the only pointer people see and clicks must land where it is
 * - blinks like a terminal cursor once the mouse stops moving
 * - with prefers-reduced-motion, the normal system cursor is kept instead
 * The system cursor is hidden by the `.block-cursor` rule in globals.css.
 */
export function BlockCursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!el || !fine || reduced) return;

    const root = document.documentElement;
    root.classList.add("block-cursor");
    let idle: ReturnType<typeof setTimeout>;

    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      el.style.opacity = "1";
      el.classList.remove("is-idle");
      clearTimeout(idle);
      idle = setTimeout(() => el.classList.add("is-idle"), 700);
    };
    const leave = () => (el.style.opacity = "0");

    window.addEventListener("pointermove", move);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      clearTimeout(idle);
      root.classList.remove("block-cursor");
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);

  return <div ref={ref} aria-hidden className="cursor-block pointer-events-none fixed left-0 top-0 z-[100] h-[18px] w-[9px] bg-gold opacity-0" />;
}
