/* ============================================================================
   KushagraOS — Lenis smooth scroll
   A single RAF-driven Lenis instance. Honors prefers-reduced-motion by
   skipping smoothing entirely. transform/opacity-friendly: Lenis only
   translates the scroll position, never animates layout.
   ========================================================================== */

import Lenis from "lenis";

export interface LenisHandle {
  lenis: Lenis | null;
  destroy: () => void;
}

const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

/**
 * Create and start a Lenis instance with a self-owned RAF loop.
 * Returns a handle whose destroy() stops the loop and tears Lenis down.
 * No-ops (returns a null instance) when reduced motion is requested.
 */
export function startLenis(): LenisHandle {
  if (prefersReducedMotion() || typeof window === "undefined") {
    return { lenis: null, destroy: () => {} };
  }

  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo-out
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.6,
  });

  let frame = 0;
  const raf = (time: number) => {
    lenis.raf(time);
    frame = requestAnimationFrame(raf);
  };
  frame = requestAnimationFrame(raf);

  return {
    lenis,
    destroy: () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    },
  };
}
