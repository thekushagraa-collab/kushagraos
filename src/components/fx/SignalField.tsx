/* ============================================================================
   SignalField — ambient "the OS is quietly alive" background (3 layers).
   1) Vertical light rails, non-uniform spacing; only a few carry a slow
      top→bottom signal pulse, staggered so they never sync. Under reduced-motion
      (and in still frames) a few rails freeze mid-pulse, brightly, so the resting
      state still reads as lit — one sits near the wordmark.
   2) Aurora drift — one large, very soft signal/accent blob, slow breathe.
   3) Cursor spotlight — low-opacity radial glow follows the pointer.
   Plus an edge vignette for depth. All fixed, pointer-events:none, GPU-only.
   ========================================================================== */

import { useEffect, useRef } from "react";
import { useOS } from "../../lib/store";
import "./signal-field.css";

interface Rail {
  left: number;
  pulse: boolean;
  dur: number;
  delay: number;
  /** Frozen mid-pulse position (vh) shown under reduced-motion / still frames. */
  frozen?: number;
  /** Brighter frozen comet (2–3 of these, one near the wordmark). */
  bright?: boolean;
}

/** Non-uniform rail layout. A minority "carry signal" — the contrast (mostly
    still, few pulsing) is what reads as intentional rather than patterned. */
const RAILS: ReadonlyArray<Rail> = [
  { left: 4, pulse: false, dur: 0, delay: 0 },
  { left: 11, pulse: true, dur: 8.5, delay: 0, frozen: 52, bright: true },
  { left: 17, pulse: false, dur: 0, delay: 0 },
  { left: 26, pulse: false, dur: 0, delay: 0 },
  { left: 33, pulse: true, dur: 7, delay: 2.4, frozen: 15, bright: true }, // near wordmark
  { left: 41, pulse: false, dur: 0, delay: 0 },
  { left: 52, pulse: false, dur: 0, delay: 0 },
  { left: 59, pulse: true, dur: 9.5, delay: 5.1, frozen: 70, bright: true },
  { left: 68, pulse: false, dur: 0, delay: 0 },
  { left: 76, pulse: false, dur: 0, delay: 0 },
  { left: 83, pulse: true, dur: 6.5, delay: 3.3, frozen: 36, bright: false },
  { left: 91, pulse: false, dur: 0, delay: 0 },
  { left: 96, pulse: false, dur: 0, delay: 0 },
];

export function SignalField() {
  const spotRef = useRef<HTMLDivElement>(null);
  const motion = useOS((s) => s.motion);

  useEffect(() => {
    // Spotlight follows the pointer only when motion is ON (the in-app control)
    // and the device has a fine pointer. We deliberately ignore the OS
    // prefers-reduced-motion setting — KushagraOS animates by default.
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const spot = spotRef.current;
    if (!motion || !fine || !spot) return;

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight * 0.4;
    let frame = 0;
    let dirty = true;

    const render = () => {
      if (dirty) {
        spot.style.transform = `translate3d(${tx}px, ${ty}px, 0) translate(-50%, -50%)`;
        dirty = false;
      }
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      dirty = true;
      spot.style.opacity = "1";
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", onMove);
      spot.style.opacity = "0";
    };
  }, [motion]);

  return (
    <div className="signal-field" aria-hidden="true">
      <div className="sf-aurora" data-testid="aurora" />
      <div className="sf-rails">
        {RAILS.map((r, i) => (
          <span
            key={i}
            className="sf-rail"
            data-pulse={r.pulse}
            style={
              {
                left: `${r.left}%`,
                "--rail-dur": `${r.dur}s`,
                "--rail-delay": `${r.delay}s`,
                "--rail-frozen": r.frozen != null ? `${r.frozen}vh` : undefined,
              } as React.CSSProperties
            }
          >
            {r.pulse && (
              <span
                className="sf-rail__pulse"
                data-testid="signal-rail-pulse"
                data-bright={r.bright ? "true" : "false"}
              />
            )}
          </span>
        ))}
      </div>
      <div className="sf-vignette" />
      <div ref={spotRef} className="sf-spotlight" data-testid="cursor-spotlight" />
    </div>
  );
}
