/* ============================================================================
   KushagraOS — visitor awareness
   The OS feels alive & aware (Craft Doctrine / Signature Enhancements):
   - returning-visitor memory (localStorage)
   - time-of-day greeting + clock-preferred theme
   Pure helpers; storage failures degrade gracefully.
   ========================================================================== */

import type { Theme } from "./theme";

const VISITS_KEY = "kos-visits";

export interface VisitState {
  isReturning: boolean;
  visits: number;
}

/** Read prior visit count without mutating it. */
export function getVisitState(): VisitState {
  try {
    const raw = Number(localStorage.getItem(VISITS_KEY) ?? "0");
    const visits = Number.isFinite(raw) && raw > 0 ? raw : 0;
    return { isReturning: visits > 0, visits };
  } catch {
    return { isReturning: false, visits: 0 };
  }
}

/** Increment and persist the visit count. Call once per session at mount. */
export function recordVisit(): VisitState {
  const { visits } = getVisitState();
  const next = visits + 1;
  try {
    localStorage.setItem(VISITS_KEY, String(next));
  } catch {
    /* non-fatal */
  }
  return { isReturning: visits > 0, visits: next };
}

/** Time-of-day greeting, system-flavored. */
export function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 5) return "Burning the midnight oil";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 22) return "Good evening";
  return "Working late";
}

/** Theme the local clock suggests (06:00–18:00 → day). User can override. */
export function clockPreferredTheme(date = new Date()): Theme {
  const h = date.getHours();
  return h >= 6 && h < 18 ? "day" : "night";
}
