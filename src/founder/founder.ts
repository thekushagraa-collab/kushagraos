/* ============================================================================
   Founder Mode — client seam (Phase H).
   Posts a candidate passphrase to /api/founder, which verifies it SERVER-SIDE
   against FOUNDER_KEY. The browser never holds the key; it only learns yes/no
   plus non-secret integration-health booleans on success.
   ========================================================================== */

import type { FounderStatus } from "../lib/store";

export interface FounderUnlock {
  ok: boolean;
  status?: FounderStatus;
  error?: string;
  retryAfterMs?: number;
}

export async function unlockFounderClient(
  passphrase: string,
  signal?: AbortSignal,
): Promise<FounderUnlock> {
  try {
    const res = await fetch("/api/founder", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ passphrase }),
      signal,
    });
    const data = (await res.json().catch(() => ({}))) as FounderUnlock;
    return {
      ok: Boolean(data?.ok),
      status: data?.status,
      error: data?.error,
      retryAfterMs: data?.retryAfterMs,
    };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    return { ok: false, error: "network_error" };
  }
}

/** The build timeline shown read-only inside Founder Mode. Static by design —
    a private, at-a-glance record of where KushagraOS stands. */
export interface BuildPhase {
  id: string;
  label: string;
  state: "shipped" | "active";
}

export const BUILD_PHASES: ReadonlyArray<BuildPhase> = [
  { id: "1", label: "Foundation — boot, shell, theme, motion", state: "shipped" },
  { id: "2", label: "Windowing — desktop, dock, ⌘K, mobile", state: "shipped" },
  { id: "3", label: "Static apps — about, work, vision, contact", state: "shipped" },
  { id: "A", label: "AYRA persona + narration layer", state: "shipped" },
  { id: "D", label: "Automation Center — six-agent studio", state: "shipped" },
  { id: "E", label: "AI Lab + Mission Mode", state: "shipped" },
  { id: "F", label: "Marketplace → Client → Files", state: "shipped" },
  { id: "G", label: "Integrations + live GitHub", state: "shipped" },
  { id: "H", label: "Founder Mode — private control surface", state: "active" },
  { id: "I", label: "Voice + a11y/perf + deploy", state: "active" },
];
