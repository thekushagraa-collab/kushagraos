/* ============================================================================
   CustomCursor — precision-instrument pointer.
   A crisp dot tracks the cursor 1:1; a soft accent glow ring trails it via
   lerp. Grows over interactive targets, contracts on press. transform/opacity
   only, driven in a single RAF loop (no per-move React state). Disabled for
   coarse pointers and prefers-reduced-motion; hides the native cursor via a
   class on <html> so it can be cleanly reverted.
   ========================================================================== */

import { useEffect, useRef } from "react";
import "./custom-cursor.css";

const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, [data-cursor="target"]';

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!fine || reduced || !dot || !ring) return;

    const root = document.documentElement;
    root.classList.add("has-custom-cursor");

    // Target (true cursor) vs ring (lerped follower)
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let rx = tx;
    let ry = ty;
    let visible = false;
    let frame = 0;

    const render = () => {
      rx += (tx - rx) * 0.18;
      ry += (ty - ry) * 0.18;
      dot.style.transform = `translate3d(${tx}px, ${ty}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!visible) {
        visible = true;
        root.classList.add("cursor-active");
      }
      const overInteractive = (e.target as Element | null)?.closest?.(INTERACTIVE);
      root.classList.toggle("cursor-hover", Boolean(overInteractive));
    };
    const onDown = () => root.classList.add("cursor-press");
    const onUp = () => root.classList.remove("cursor-press");
    const onLeave = () => {
      visible = false;
      root.classList.remove("cursor-active");
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      root.classList.remove(
        "has-custom-cursor",
        "cursor-active",
        "cursor-hover",
        "cursor-press",
      );
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="kos-cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="kos-cursor-dot" aria-hidden="true" />
    </>
  );
}
