/* ============================================================================
   AI Lab — the R&D wing (Phase E). Two LIVE exhibits prove builder-researcher
   depth, not a brag list:
     • selfcorrect — an agent drafts, critiques itself, then revises (the eval
       mindset, live).
     • prompt — a naive prompt vs an engineered one, with a measurable quality
       delta (prompt engineering as a discipline).
   Same transport pattern as agentsCore/missionCore: strict-JSON tool prompt +
   realistic fallback, so every exhibit ALWAYS returns a usable result (no key /
   provider error / bad JSON → fallback). The model returns JSON ONLY.
   ========================================================================== */

import { capInput, checkRate, RUN_MAX_OUTPUT_TOKENS } from "./guards";
import { getProvider } from "./provider";
import { parseJson } from "./agentsCore";

export type LabMode = "selfcorrect" | "prompt";
const MODES: readonly LabMode[] = ["selfcorrect", "prompt"];

export interface LabResult {
  status: number;
  json: Record<string, unknown>;
}

const SYSTEM: Record<LabMode, string> = {
  selfcorrect: `You are AYRA demonstrating a SELF-CORRECTING agent. Given a topic, you
(1) write a quick first draft, (2) critique your OWN draft honestly, (3) produce a
clearly improved revision. Respond with ONLY a JSON object:
{"topic":string,"draft":string,"critique":[string],"improved":string}.
Rules: "draft" = 2-3 sentences, deliberately decent-but-improvable (vague, generic).
"critique" = 2-3 specific, honest weaknesses of the draft. "improved" = 2-4 sentences
that visibly fix those weaknesses (concrete, specific, sharper). No markdown, no backticks.`,

  prompt: `You are AYRA demonstrating PROMPT ARCHITECTURE. Given a user's rough/naive
prompt, rewrite it into a far stronger, production-grade prompt and quantify the upgrade.
Respond with ONLY a JSON object:
{"original":string,"rewritten":string,"upgrades":[string],"scoreBefore":number,"scoreAfter":number}.
Rules: "rewritten" gives the model a clear role, context, explicit constraints, and an output
format. "upgrades" = 3-4 concrete changes you made and why. "scoreBefore" = 1-10 (low, honest).
"scoreAfter" = 1-10 (high). No markdown, no backticks.`,
};

function fallbackResult(mode: LabMode, input: string): Record<string, unknown> {
  const subject = input.length > 70 ? input.slice(0, 67) + "…" : input;
  if (mode === "selfcorrect") {
    return {
      topic: subject,
      draft: `${subject} is important and can really help people. There are many benefits and it's worth considering for most situations.`,
      critique: [
        "Too vague — 'important' and 'many benefits' say nothing concrete.",
        "No specifics, no audience, no evidence — could describe almost anything.",
        "No point of view or actionable takeaway.",
      ],
      improved: `For ${subject}, the leverage is specificity: name the one outcome that matters, the audience it serves, and the single step that moves the needle. Skip the generic upside — show the before/after and let the result make the case.`,
    };
  }
  return {
    original: subject,
    rewritten: `You are an expert assistant. Context: ${subject}. Produce a response with these constraints: (1) lead with the single most important point, (2) be concrete and specific — no filler, (3) limit to 5 sentences, (4) end with one actionable next step. Format: short paragraph + a one-line takeaway.`,
    upgrades: [
      "Added a clear role so the model adopts the right expertise.",
      "Injected context + explicit constraints instead of a vague ask.",
      "Specified an output format (length + structure) for consistency.",
      "Required an actionable takeaway so the output is useful, not generic.",
    ],
    scoreBefore: 3,
    scoreAfter: 9,
  };
}

function asString(v: unknown): string { return typeof v === "string" ? v.trim() : ""; }
function asLines(v: unknown, max: number): string[] {
  if (Array.isArray(v)) return v.map(asString).filter(Boolean).slice(0, max);
  const s = asString(v);
  return s ? [s] : [];
}
function asScore(v: unknown, fallback: number): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(1, Math.min(10, Math.round(n)));
}

function coerce(mode: LabMode, parsed: unknown, input: string): Record<string, unknown> {
  const fb = fallbackResult(mode, input);
  if (!parsed || typeof parsed !== "object") return fb;
  const obj = parsed as Record<string, unknown>;
  if (mode === "selfcorrect") {
    const critique = asLines(obj.critique, 3);
    return {
      topic: asString(obj.topic) || (fb.topic as string),
      draft: asString(obj.draft) || (fb.draft as string),
      critique: critique.length ? critique : (fb.critique as string[]),
      improved: asString(obj.improved) || (fb.improved as string),
    };
  }
  const upgrades = asLines(obj.upgrades, 4);
  return {
    original: asString(obj.original) || (fb.original as string),
    rewritten: asString(obj.rewritten) || (fb.rewritten as string),
    upgrades: upgrades.length ? upgrades : (fb.upgrades as string[]),
    scoreBefore: asScore(obj.scoreBefore, fb.scoreBefore as number),
    scoreAfter: asScore(obj.scoreAfter, fb.scoreAfter as number),
  };
}

interface LabBody { mode?: unknown; input?: unknown }

export async function runLab(body: LabBody, rateKey: string): Promise<LabResult> {
  const mode = typeof body?.mode === "string" ? body.mode : "";
  if (!MODES.includes(mode as LabMode)) return { status: 400, json: { error: "unknown_mode" } };
  const id = mode as LabMode;

  const raw = typeof body?.input === "string" ? body.input : "";
  const input = capInput(raw);
  if (!input) return { status: 400, json: { error: "empty_input" } };

  const rate = checkRate(rateKey);
  if (!rate.ok) return { status: 429, json: { error: "rate_limited", retryAfterMs: rate.retryAfterMs } };

  const provider = getProvider();
  if (!provider) {
    return { status: 200, json: { mode: id, result: fallbackResult(id, input), fallback: true, reason: "no_key" } };
  }

  try {
    const text = await provider.chat(input, SYSTEM[id], { json: true, maxTokens: RUN_MAX_OUTPUT_TOKENS });
    const parsed = parseJson(text);
    if (!parsed || typeof parsed !== "object") {
      return { status: 200, json: { mode: id, result: fallbackResult(id, input), fallback: true, reason: "parse_error", provider: provider.name } };
    }
    return { status: 200, json: { mode: id, result: coerce(id, parsed, input), fallback: false, provider: provider.name } };
  } catch (err) {
    const reason = err instanceof Error ? err.message : "provider_error";
    return { status: 200, json: { mode: id, result: fallbackResult(id, input), fallback: true, reason } };
  }
}
