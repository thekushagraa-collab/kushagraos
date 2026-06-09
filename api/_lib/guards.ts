/* ============================================================================
   Public-site safeguards for the assistant endpoint. The site is public and the
   brain costs money, so every request is capped + rate-limited + spend-bounded.
   NOTE: the in-memory rate limiter is per-serverless-instance (best-effort). For
   production-grade limits across instances, back this with Upstash/KV — the
   interface here is deliberately swappable.
   ========================================================================== */

/** Reject prompts longer than this (chars). Caps input spend + abuse surface. */
export const MAX_INPUT_CHARS = 600;
/** Spend cap: max tokens the model may emit per answer. */
export const MAX_OUTPUT_TOKENS = 512;
/** Spend cap for the work apps (Flow/Atlas/Forge) — they emit structured JSON
    with a few items, so a touch more headroom than a spoken answer. */
export const RUN_MAX_OUTPUT_TOKENS = 760;
/** Spend cap for Mission Mode — one orchestration call assembling five agents'
    contributions into a single growth plan, so it needs more headroom. */
export const MISSION_MAX_OUTPUT_TOKENS = 1100;
/** Rate limit: N requests per WINDOW_MS per caller key. */
export const RATE_MAX = 8;
export const RATE_WINDOW_MS = 60_000;

const hits = new Map<string, number[]>();

export interface RateResult {
  ok: boolean;
  retryAfterMs: number;
}

/** Sliding-window rate check for a caller key (ip/session). Best-effort. */
export function checkRate(key: string, now = Date.now()): RateResult {
  const cutoff = now - RATE_WINDOW_MS;
  const recent = (hits.get(key) ?? []).filter((t) => t > cutoff);
  if (recent.length >= RATE_MAX) {
    const retryAfterMs = Math.max(0, recent[0] + RATE_WINDOW_MS - now);
    hits.set(key, recent);
    return { ok: false, retryAfterMs };
  }
  recent.push(now);
  hits.set(key, recent);
  return { ok: true, retryAfterMs: 0 };
}

/** Trim + hard-cap input length. */
export function capInput(raw: string): string {
  return raw.trim().slice(0, MAX_INPUT_CHARS);
}
