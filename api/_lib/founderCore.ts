/* ============================================================================
   Founder Mode gate (Phase H). Kushagra-only control surface.

   Security model:
   - The passphrase is verified SERVER-SIDE against FOUNDER_KEY. The key never
     ships to the client bundle (no VITE_ prefix) — the browser only ever sends
     a candidate passphrase and receives a yes/no + non-secret status booleans.
   - Secure default: if FOUNDER_KEY is unset, the mode is SEALED (everyone
     denied) — satisfies the DoD "no key → denied".
   - Rate-limited per caller to blunt brute force.
   - The success payload contains only booleans describing which integrations
     are configured — never the key values themselves.
   ========================================================================== */

import { checkRate } from "./guards";

export interface FounderResult {
  status: number;
  json: Record<string, unknown>;
}

interface FounderBody {
  passphrase?: unknown;
}

const str = (v: unknown) => (typeof v === "string" ? v : "");

/** Non-secret booleans: which server integrations are wired (no values leak). */
function integrationStatus() {
  const has = (k: string) => Boolean(process.env[k]?.trim());
  return {
    groq: has("GROQ_API_KEY"),
    gemini: has("GEMINI_API_KEY"),
    web3forms: has("WEB3FORMS_ACCESS_KEY"),
    github: has("GITHUB_TOKEN"),
  };
}

/** Constant-time-ish compare (avoids per-char early exit on equal-length input). */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function runFounder(body: FounderBody, rateKey: string): Promise<FounderResult> {
  const rate = checkRate(`founder:${rateKey}`);
  if (!rate.ok) {
    return { status: 429, json: { ok: false, error: "rate_limited", retryAfterMs: rate.retryAfterMs } };
  }

  const key = process.env.FOUNDER_KEY?.trim();
  // Secure default — with no key configured, Founder Mode is sealed.
  if (!key) return { status: 401, json: { ok: false, error: "denied", reason: "not_configured" } };

  const passphrase = str(body?.passphrase).trim();
  if (!passphrase || !safeEqual(passphrase, key)) {
    return { status: 401, json: { ok: false, error: "denied" } };
  }

  return { status: 200, json: { ok: true, status: integrationStatus() } };
}
