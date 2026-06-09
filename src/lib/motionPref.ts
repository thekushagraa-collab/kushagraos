/* ============================================================================
   KushagraOS — motion preference
   POLICY: KushagraOS ALWAYS animates by default, regardless of the OS
   `prefers-reduced-motion` setting. The OS media query no longer gates motion.
   The only thing that flattens motion is the in-app Motion control (menubar),
   reflected as `data-motion="on" | "off"` on <html>. Default = "on".
   Single source of truth for applying + persisting that choice.
   ========================================================================== */

export const MOTION_STORAGE_KEY = "kos-motion";

/** Read the motion state the no-FOUC bootstrap (index.html) already committed
    to. Defaults to ON — we ignore the OS reduced-motion preference entirely. */
export function getInitialMotion(): boolean {
  if (typeof document !== "undefined") {
    const fromDom = document.documentElement.getAttribute("data-motion");
    if (fromDom === "off") return false;
    if (fromDom === "on") return true;
  }
  return true;
}

/** Apply the motion state to the document and persist it. Side-effect only. */
export function applyMotion(on: boolean): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-motion", on ? "on" : "off");
  try {
    localStorage.setItem(MOTION_STORAGE_KEY, on ? "on" : "off");
  } catch {
    /* storage unavailable (private mode) — non-fatal */
  }
}
