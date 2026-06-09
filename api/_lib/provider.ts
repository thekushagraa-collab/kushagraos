/* ============================================================================
   Provider-agnostic LLM seam. Today: Google Gemini (free tier). Swappable —
   add Claude/OpenAI by implementing the same `chat(system, user)` shape and
   selecting via env. All network keys stay server-side (read from process.env).
   ========================================================================== */

import { SYSTEM_INSTRUCTION } from "./knowledge";
import { MAX_OUTPUT_TOKENS } from "./guards";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

/** Hard ceiling on a provider call. A stalled upstream connection must never
    wedge the request (which would hang the page + the DoD tests). On timeout we
    abort and throw, so the cores fall back gracefully. */
const PROVIDER_TIMEOUT_MS = 12_000;

/** fetch with an enforced timeout via AbortController. We also send
    `connection: close` so the upstream socket is not kept alive in the pool —
    otherwise the long-lived keep-alive connection holds the Node event loop
    open and the dev/preview server (and Playwright workers) won't exit cleanly. */
async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), PROVIDER_TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...init,
      signal: ctrl.signal,
      headers: { ...(init.headers as Record<string, string>), connection: "close" },
    });
  } finally {
    clearTimeout(timer);
  }
}

/** Per-call options. `json` asks the model for a JSON object; `maxTokens`
    overrides the default spend cap (still bounded by the caller). */
export interface ChatOpts {
  json?: boolean;
  maxTokens?: number;
}

export interface ChatProvider {
  name: string;
  /** `system` defaults to the voice-twin persona; other surfaces (Flow/Atlas/
      Forge) pass their own tool prompt. Never throws on a normal completion. */
  chat(userText: string, system?: string, opts?: ChatOpts): Promise<string>;
}

/** Google Gemini via the Generative Language REST API. */
function geminiProvider(apiKey: string): ChatProvider {
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  return {
    name: `gemini:${model}`,
    async chat(userText: string, system = SYSTEM_INSTRUCTION, opts: ChatOpts = {}): Promise<string> {
      const url = `${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`;
      const res = await fetchWithTimeout(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: userText }] }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: opts.maxTokens ?? MAX_OUTPUT_TOKENS,
            topP: 0.9,
            ...(opts.json ? { responseMimeType: "application/json" } : {}),
          },
          safetySettings: [],
        }),
      });

      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        throw new Error(`gemini ${res.status}: ${detail.slice(0, 200)}`);
      }

      const data = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const text = data.candidates?.[0]?.content?.parts
        ?.map((p) => p.text ?? "")
        .join("")
        .trim();
      if (!text) throw new Error("gemini: empty completion");
      return text;
    },
  };
}

/** Groq — OpenAI-compatible chat completions (free tier, fast). */
function groqProvider(apiKey: string): ChatProvider {
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  return {
    name: `groq:${model}`,
    async chat(userText: string, system = SYSTEM_INSTRUCTION, opts: ChatOpts = {}): Promise<string> {
      const res = await fetchWithTimeout("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: userText },
          ],
          temperature: 0.6,
          max_tokens: opts.maxTokens ?? MAX_OUTPUT_TOKENS,
          top_p: 0.9,
          ...(opts.json ? { response_format: { type: "json_object" } } : {}),
        }),
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        throw new Error(`groq ${res.status}: ${detail.slice(0, 200)}`);
      }
      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const text = data.choices?.[0]?.message?.content?.trim();
      if (!text) throw new Error("groq: empty completion");
      return text;
    },
  };
}

/** Resolve the active provider from env (Groq preferred, Gemini fallback), or
    null if no key is configured. Add others by implementing ChatProvider. */
export function getProvider(): ChatProvider | null {
  const groq = process.env.GROQ_API_KEY?.trim();
  if (groq) return groqProvider(groq);
  const gemini = process.env.GEMINI_API_KEY?.trim();
  if (gemini) return geminiProvider(gemini);
  return null;
}
