/* ============================================================================
   Framework-agnostic request core for the voice twin. Both the Vercel function
   (api/ask.ts) and the Vite dev middleware call runAsk() — one implementation,
   two transports. Returns an HTTP status + JSON body; never throws.
   ========================================================================== */

import { capInput, checkRate, MAX_INPUT_CHARS } from "./guards";
import { getProvider } from "./provider";

export interface AskResult {
  status: number;
  json: Record<string, unknown>;
}

/** Keyword fallback when no provider key is set or the provider errors. Keeps
    the twin useful (and the demo alive) without a backend. */
export function fallbackAnswer(query: string): string {
  const q = query.toLowerCase();
  if (/hire|work with|available|rate|cost|price/.test(q))
    return "Kushagra takes on automation builds and select roles — open the Contact app or email thekushagraa@gmail.com to start a process.";
  if (/flow|atlas|forge|build|project|work/.test(q))
    return "He's shipped Flow (automation builder), Atlas (autonomous outbound), Forge (AI content), the voice twin you're talking to, and CreatorScout. Open the Work app to dig in.";
  if (/who|about|kushagra|you/.test(q))
    return "I'm Kushagra's voice twin. He's a 19-year-old AI automation operator — he builds the 0.1% of the system that quietly runs the other 99.9%.";
  if (/vision|goal|future|billion|million/.test(q))
    return "The plan: ~$10K MRR in 2026, $1M ARR by 2028 with Atlas and Forge, and the long game is automating the boring middle of the economy.";
  return "I'm here to talk about Kushagra and his work — ask about his builds, how to hire him, or where he's headed.";
}

interface AskBody {
  query?: unknown;
}

export async function runAsk(body: AskBody, rateKey: string): Promise<AskResult> {
  const raw = typeof body?.query === "string" ? body.query : "";
  const query = capInput(raw);

  if (!query) return { status: 400, json: { error: "empty query" } };
  if (raw.length > MAX_INPUT_CHARS) {
    // We still answer the capped version, but signal the cap to the client.
    // (Reject outright instead if you prefer hard failures.)
  }

  const rate = checkRate(rateKey);
  if (!rate.ok) {
    return {
      status: 429,
      json: { error: "rate_limited", retryAfterMs: rate.retryAfterMs },
    };
  }

  const provider = getProvider();
  if (!provider) {
    return { status: 200, json: { answer: fallbackAnswer(query), fallback: true, reason: "no_key" } };
  }

  try {
    const answer = await provider.chat(query);
    return { status: 200, json: { answer, fallback: false, provider: provider.name } };
  } catch (err) {
    const reason = err instanceof Error ? err.message : "provider_error";
    return { status: 200, json: { answer: fallbackAnswer(query), fallback: true, reason } };
  }
}
