/* ============================================================================
   Mission Mode — AYRA's orchestration centerpiece (Phase D). Given ONE
   natural-language goal, AYRA runs her growth team — Scout → Analyst → Closer →
   Muse → Strategist — and assembles their work into a single growth plan.

   Engineering note: a true 5-call fan-out would blow the public rate/spend caps
   (5× per mission) and stall the demo. Instead ONE orchestration call returns
   the whole plan as five ordered steps; the front-end choreographs the staged
   hand-off animation as it reveals each step. Cost-bounded, fast, and identical
   in feel — and it degrades to a rich fallback with no key. The server reorders
   + backfills steps so the plan is ALWAYS valid (exactly 5, in order).
   ========================================================================== */

import { capInput, checkRate, MISSION_MAX_OUTPUT_TOKENS } from "./guards";
import { getProvider } from "./provider";
import { parseJson } from "./agentsCore";

/** The five specialists Mission Mode orchestrates, in hand-off order. */
export type MissionAgent = "scout" | "analyst" | "closer" | "muse" | "strategist";
export const MISSION_ORDER: readonly MissionAgent[] = [
  "scout", "analyst", "closer", "muse", "strategist",
];

export interface MissionStep {
  agent: MissionAgent;
  /** What this agent did, e.g. "Scout · 42 qualified leads". */
  title: string;
  /** The single most important output line. */
  headline: string;
  /** 2-3 concrete supporting lines. */
  detail: string[];
}

export interface MissionPlan {
  goal: string;
  /** AYRA's one-line framing of the mission. */
  readout: string;
  steps: MissionStep[];
  /** Closing synthesis tying the steps together. */
  summary: string;
}

export interface MissionResult {
  status: number;
  json: Record<string, unknown>;
}

const MISSION_SYSTEM = `You are AYRA, orchestrating Kushagra's autonomous growth team to achieve ONE goal stated by the user. You run five specialists in sequence and synthesize their work into a single growth plan. Respond with ONLY a JSON object:
{"goal":string,"readout":string,"steps":[{"agent":"scout"|"analyst"|"closer"|"muse"|"strategist","title":string,"headline":string,"detail":[string]}],"summary":string}
Rules:
- "readout": ONE sharp sentence in AYRA's concierge voice framing how you'll attack the goal.
- exactly 5 steps, in THIS exact order:
  1. scout — find & qualify the right leads/customers
  2. analyst — research the market/target and surface the sales angle
  3. closer — the outreach approach (a cold-email angle + follow-up cadence)
  4. muse — content to pull inbound (the hook + channels)
  5. strategist — a 2-week plan with channels + KPIs
- each step: "title" = agent + headline metric (e.g. "Scout · 42 qualified leads"), "headline" = the single most important output line, "detail" = 2-3 concrete, specific bullet lines.
- "summary": 1-2 sentences on the expected outcome if executed.
- Be concrete and specific to the goal. Invent realistic but clearly illustrative numbers/names. No markdown, no backticks, no prose outside the JSON.`;

/* ---- Always-valid fallback (no key / provider error / bad JSON) ----------- */
function missionFallback(goal: string): MissionPlan {
  const g = goal.length > 80 ? goal.slice(0, 77) + "…" : goal;
  return {
    goal: g,
    readout: `On it. To hit "${g}", I'll run the whole team — find the right people, study them, reach out, pull inbound, and lock a 2-week plan.`,
    steps: [
      {
        agent: "scout",
        title: "Scout · 42 qualified leads",
        headline: `Pulled and ranked 42 prospects matched to "${g}".`,
        detail: [
          "Top tier: 12 high-intent, founder-led accounts with no agency yet.",
          "Each scored 0–100 on fit, with a one-line personalized opener.",
          "Filtered out tire-kickers and oversized accounts that won't reply.",
        ],
      },
      {
        agent: "analyst",
        title: "Analyst · sales angle locked",
        headline: "The market is doing this manually — that's the wedge.",
        detail: [
          "Signal: rising posting cadence + ops/SDR hiring = scaling pain.",
          "Pain: personalization doesn't scale by hand; founder time is the bottleneck.",
          'Angle: "one agent does what your next two hires would."',
        ],
      },
      {
        agent: "closer",
        title: "Closer · 3-step sequence ready",
        headline: "A personalized cold email + 3 follow-ups, ~37% reply odds.",
        detail: [
          "Open with the prospect's most recent post — specific, not templated.",
          "Cadence: day 0 email, day 3 nudge, day 7 Loom, day 12 soft close.",
          "Every send offers value first (a tailored demo), asks for nothing heavy.",
        ],
      },
      {
        agent: "muse",
        title: "Muse · 1 idea → 5 channels",
        headline: `A cross-channel content pack so "${g}" pulls inbound while you sleep.`,
        detail: [
          "Hook: \"the 0.1% of the system that runs the other 99.9%.\"",
          "LinkedIn post + 4-tweet thread + a short-form video script + carousel.",
          "One consistent voice; every piece ends in a soft CTA to the demo.",
        ],
      },
      {
        agent: "strategist",
        title: "Strategist · 2-week launch plan",
        headline: "Channels, calendar, and KPIs — ready to execute Monday.",
        detail: [
          "Week 1: tease the problem (6 posts) + warm the lead list.",
          "Week 2: reveal + demo + convert with proof (7 posts).",
          "KPIs: reach, demo bookings, signups, DM reply rate.",
        ],
      },
    ],
    summary: `Executed end to end, this turns "${g}" into a repeatable pipeline: qualified leads in, personalized outreach + compounding content out, measured against four clear KPIs.`,
  };
}

/* ---- Coercion: guarantee exactly 5 valid steps, in order ----------------- */
function asString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function asLines(v: unknown): string[] {
  if (Array.isArray(v)) {
    return v.map(asString).filter(Boolean).slice(0, 3);
  }
  const single = asString(v);
  return single ? [single] : [];
}

function coerce(parsed: unknown, goal: string): MissionPlan {
  const fb = missionFallback(goal);
  if (!parsed || typeof parsed !== "object") return fb;
  const obj = parsed as Record<string, unknown>;

  const rawSteps = Array.isArray(obj.steps) ? obj.steps : [];
  const byAgent = new Map<MissionAgent, MissionStep>();
  for (const s of rawSteps) {
    if (!s || typeof s !== "object") continue;
    const r = s as Record<string, unknown>;
    const agent = asString(r.agent) as MissionAgent;
    if (!MISSION_ORDER.includes(agent) || byAgent.has(agent)) continue;
    const fallbackStep = fb.steps.find((x) => x.agent === agent)!;
    const detail = asLines(r.detail);
    byAgent.set(agent, {
      agent,
      title: asString(r.title) || fallbackStep.title,
      headline: asString(r.headline) || fallbackStep.headline,
      detail: detail.length ? detail : fallbackStep.detail,
    });
  }

  const steps = MISSION_ORDER.map(
    (a) => byAgent.get(a) ?? fb.steps.find((x) => x.agent === a)!,
  );

  return {
    goal: asString(obj.goal) || goal,
    readout: asString(obj.readout) || fb.readout,
    steps,
    summary: asString(obj.summary) || fb.summary,
  };
}

interface MissionBody { goal?: unknown }

export async function runMission(body: MissionBody, rateKey: string): Promise<MissionResult> {
  const raw = typeof body?.goal === "string" ? body.goal : "";
  const goal = capInput(raw);
  if (!goal) return { status: 400, json: { error: "empty_goal" } };

  const rate = checkRate(rateKey);
  if (!rate.ok) return { status: 429, json: { error: "rate_limited", retryAfterMs: rate.retryAfterMs } };

  const provider = getProvider();
  if (!provider) {
    return { status: 200, json: { plan: missionFallback(goal), fallback: true, reason: "no_key" } };
  }

  try {
    const text = await provider.chat(goal, MISSION_SYSTEM, { json: true, maxTokens: MISSION_MAX_OUTPUT_TOKENS });
    const parsed = parseJson(text);
    if (!parsed || typeof parsed !== "object") {
      return { status: 200, json: { plan: missionFallback(goal), fallback: true, reason: "parse_error", provider: provider.name } };
    }
    return { status: 200, json: { plan: coerce(parsed, goal), fallback: false, provider: provider.name } };
  } catch (err) {
    const reason = err instanceof Error ? err.message : "provider_error";
    return { status: 200, json: { plan: missionFallback(goal), fallback: true, reason } };
  }
}
