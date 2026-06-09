/* ============================================================================
   Framework-agnostic core for the WORK apps (Flow / Atlas / Forge). Same shape
   as askCore: both the Vercel function (api/run.ts) and the Vite dev middleware
   call runRun() — one implementation, two transports. Never throws.

   Each app runs the SAME provider seam as the voice twin, but with its own tool
   system-prompt that demands a strict JSON object. We parse robustly and coerce
   to the app's result shape; any miss (no key, provider error, bad JSON) falls
   back to realistic demo data derived from the input so the OS always "runs".
   ========================================================================== */

import { capInput, checkRate, RUN_MAX_OUTPUT_TOKENS } from "./guards";
import { getProvider } from "./provider";

export type RunApp = "flow" | "atlas" | "forge";
const APPS: readonly RunApp[] = ["flow", "atlas", "forge"];

export interface RunResult {
  status: number;
  json: Record<string, unknown>;
}

/* ---- Result shapes (kept in sync with src/apps/runApp.ts) ----------------- */
interface FlowStep { node: "trigger" | "ai" | "action"; label: string; detail: string }
interface FlowOut { trigger: string; steps: FlowStep[]; action: { channel: "email" | "slack" | "webhook"; title: string; body: string } }
interface AtlasLead { name: string; company: string; role: string; fit: number; predictedReply: string; opener: string }
interface AtlasOut { icp: string; leads: AtlasLead[] }
interface ForgeClip { title: string; hook: string; durationSec: number }
interface ForgeOut { source: string; clips: ForgeClip[]; thread: string[]; captions: string[] }

/* ---- Per-app tool prompts (NOT the twin persona) -------------------------- */
const SYSTEM: Record<RunApp, string> = {
  flow: `You are Flow — Kushagra's visual automation engine. Given a trigger the
user describes, design a Trigger → AI → Action pipeline and "run" it once.
Respond with ONLY a JSON object, no prose, matching exactly:
{"trigger": string, "steps": [{"node":"trigger"|"ai"|"action","label":string,"detail":string}], "action": {"channel":"email"|"slack"|"webhook","title":string,"body":string}}
Rules: exactly 3 steps, one per node in order trigger→ai→action. "detail" is one
crisp line. "action.body" is the real message Flow would send (2-4 sentences).
Be concrete and operator-grade. No markdown, no backticks.`,

  atlas: `You are Atlas — Kushagra's autonomous outbound engine. Given an ICP
(ideal customer profile), research it and produce a ranked outreach plan.
Respond with ONLY a JSON object, no prose, matching exactly:
{"icp": string, "leads": [{"name":string,"company":string,"role":string,"fit":number,"predictedReply":string,"opener":string}]}
Rules: exactly 3 plausible leads, ranked best-fit first. "fit" is 0-100.
"predictedReply" is a percentage string like "38%". "opener" is one hyper-personal
first line. Invent realistic but clearly illustrative companies. No markdown.`,

  forge: `You are Forge — Kushagra's AI content engine. Given a source (a video
topic, podcast, or recording description), turn it into multi-format content.
Respond with ONLY a JSON object, no prose, matching exactly:
{"source": string, "clips": [{"title":string,"hook":string,"durationSec":number}], "thread": [string], "captions": [string]}
Rules: exactly 3 clips (durationSec 15-90), a thread of 3-5 tweets, and 2-3 short
captions. Punchy, no hashtags-spam, no markdown, no backticks.`,
};

/* ---- Robust JSON extraction ---------------------------------------------- */
function parseJson(text: string): unknown {
  const tryParse = (s: string): unknown => {
    try { return JSON.parse(s); } catch { return undefined; }
  };
  const direct = tryParse(text);
  if (direct !== undefined) return direct;
  const stripped = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const fenced = tryParse(stripped);
  if (fenced !== undefined) return fenced;
  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start >= 0 && end > start) return tryParse(stripped.slice(start, end + 1));
  return undefined;
}

const str = (v: unknown, fb = ""): string => (typeof v === "string" && v.trim() ? v.trim() : fb);
const num = (v: unknown, fb: number): number => (typeof v === "number" && Number.isFinite(v) ? v : fb);
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

/* ---- Coerce parsed JSON → strict app shape (null if unusable) ------------- */
function coerce(app: RunApp, raw: unknown, input: string): FlowOut | AtlasOut | ForgeOut | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;

  if (app === "flow") {
    const steps = arr(o.steps)
      .map((s): FlowStep | null => {
        const r = s as Record<string, unknown>;
        const node = str(r.node);
        if (node !== "trigger" && node !== "ai" && node !== "action") return null;
        return { node, label: str(r.label, node), detail: str(r.detail) };
      })
      .filter((s): s is FlowStep => s !== null);
    const action = (o.action ?? {}) as Record<string, unknown>;
    const channelRaw = str(action.channel, "email");
    const channel = (["email", "slack", "webhook"].includes(channelRaw) ? channelRaw : "email") as FlowOut["action"]["channel"];
    if (steps.length < 2) return null;
    return {
      trigger: str(o.trigger, input),
      steps,
      action: { channel, title: str(action.title, "Pipeline output"), body: str(action.body) },
    };
  }

  if (app === "atlas") {
    const leads = arr(o.leads)
      .map((l): AtlasLead => {
        const r = l as Record<string, unknown>;
        return {
          name: str(r.name, "Lead"),
          company: str(r.company, "—"),
          role: str(r.role, "—"),
          fit: Math.max(0, Math.min(100, num(r.fit, 70))),
          predictedReply: str(r.predictedReply, "—"),
          opener: str(r.opener),
        };
      })
      .filter((l) => l.opener);
    if (leads.length < 1) return null;
    return { icp: str(o.icp, input), leads };
  }

  // forge
  const clips = arr(o.clips)
    .map((c): ForgeClip => {
      const r = c as Record<string, unknown>;
      return { title: str(r.title, "Clip"), hook: str(r.hook), durationSec: Math.round(num(r.durationSec, 30)) };
    })
    .filter((c) => c.hook);
  const thread = arr(o.thread).map((t) => str(t)).filter(Boolean);
  const captions = arr(o.captions).map((c) => str(c)).filter(Boolean);
  if (clips.length < 1 && thread.length < 1) return null;
  return { source: str(o.source, input), clips, thread, captions };
}

/* ---- Realistic demo fallback (no key / provider error / bad JSON) --------- */
function fallbackResult(app: RunApp, input: string): FlowOut | AtlasOut | ForgeOut {
  const subject = input.length > 64 ? input.slice(0, 61) + "…" : input;
  if (app === "flow") {
    return {
      trigger: subject,
      steps: [
        { node: "trigger", label: "Trigger", detail: `Fires on: ${subject}` },
        { node: "ai", label: "AI reason", detail: "Classify intent, draft the response, decide the channel." },
        { node: "action", label: "Action", detail: "Send the drafted message + log the run." },
      ],
      action: {
        channel: "email",
        title: `Re: ${subject}`,
        body: `Got it — Flow caught "${subject}" and handled it end to end. This is the demo pipeline; with a live key it drafts and sends for real to email, Slack, or a webhook.`,
      },
    };
  }
  if (app === "atlas") {
    return {
      icp: subject,
      leads: [
        { name: "Priya Nair", company: "Loomstack", role: "Head of Growth", fit: 92, predictedReply: "41%", opener: `Saw Loomstack is scaling outbound for "${subject}" — most teams burn out on personalization at volume. Atlas fixes exactly that.` },
        { name: "Marcus Reed", company: "Caldera Labs", role: "Founder", fit: 84, predictedReply: "33%", opener: `You're hiring SDRs to do what one agent can. Worth 10 minutes on "${subject}"?` },
        { name: "Dana Whitfield", company: "Northpace", role: "VP Sales", fit: 76, predictedReply: "27%", opener: `Northpace's motion fits "${subject}" — predicted reply lift is the part teams underestimate.` },
      ],
    };
  }
  return {
    source: subject,
    clips: [
      { title: "The hook", hook: `The one line that makes people stop scrolling about ${subject}.`, durationSec: 28 },
      { title: "The proof", hook: `Why ${subject} actually works — with the receipt.`, durationSec: 47 },
      { title: "The turn", hook: `What nobody tells you about ${subject}.`, durationSec: 19 },
    ],
    thread: [
      `Spent a while on ${subject}. Here's the part that actually moved the needle 🧵`,
      `Most people stop at the obvious step. The leverage is one layer deeper.`,
      `Do this instead — and let the system run it while you sleep.`,
    ],
    captions: [
      `${subject} — the 0.1% that runs the other 99.9%.`,
      `Built with Forge. Editable drafts, not slop.`,
    ],
  };
}

interface RunBody { app?: unknown; input?: unknown }

export async function runRun(body: RunBody, rateKey: string): Promise<RunResult> {
  const app = typeof body?.app === "string" ? body.app : "";
  if (!APPS.includes(app as RunApp)) return { status: 400, json: { error: "unknown_app" } };
  const typedApp = app as RunApp;

  const raw = typeof body?.input === "string" ? body.input : "";
  const input = capInput(raw);
  if (!input) return { status: 400, json: { error: "empty input" } };

  const rate = checkRate(rateKey);
  if (!rate.ok) return { status: 429, json: { error: "rate_limited", retryAfterMs: rate.retryAfterMs } };

  const provider = getProvider();
  if (!provider) {
    return { status: 200, json: { app: typedApp, result: fallbackResult(typedApp, input), fallback: true, reason: "no_key" } };
  }

  try {
    const text = await provider.chat(input, SYSTEM[typedApp], { json: true, maxTokens: RUN_MAX_OUTPUT_TOKENS });
    const result = coerce(typedApp, parseJson(text), input);
    if (!result) {
      return { status: 200, json: { app: typedApp, result: fallbackResult(typedApp, input), fallback: true, reason: "parse_error", provider: provider.name } };
    }
    return { status: 200, json: { app: typedApp, result, fallback: false, provider: provider.name } };
  } catch (err) {
    const reason = err instanceof Error ? err.message : "provider_error";
    return { status: 200, json: { app: typedApp, result: fallbackResult(typedApp, input), fallback: true, reason } };
  }
}
