/* ============================================================================
   AYRA's autonomous growth studio — agent engine (server core). Same transport
   pattern as askCore/runCore (Vercel function + Vite dev middleware call
   runAgent()). Each agent has a strict-JSON tool prompt + a realistic fallback
   sample, so every agent ALWAYS returns a usable artifact (no key / provider
   error / bad JSON → fallback). The model returns JSON ONLY; the front-end
   renders it through the branded Style-Lock ArtifactFrame.
   ========================================================================== */

import { capInput, checkRate, RUN_MAX_OUTPUT_TOKENS } from "./guards";
import { getProvider } from "./provider";

export type AgentId =
  | "scout" | "closer" | "muse" | "strategist" | "concierge" | "analyst";

const IDS: readonly AgentId[] = ["scout", "closer", "muse", "strategist", "concierge", "analyst"];

export interface AgentResult {
  status: number;
  json: Record<string, unknown>;
}

/* ---- Per-agent tool prompts (strict JSON, no prose) ----------------------- */
const SYSTEM: Record<AgentId, string> = {
  scout: `You are Scout — Kushagra's lead discovery & qualification agent. Given an
ICP (ideal customer profile), produce a ranked, qualified lead sheet. Respond with
ONLY a JSON object: {"icp":string,"leads":[{"name":string,"handle":string,"link":string,"followers":string,"fitScore":number,"why":string,"opener":string}]}.
Rules: exactly 4 plausible leads, best-fit first, fitScore 0-100, "followers" like
"24.6k", "why" one line, "opener" one hyper-personal first line. Invent realistic
but clearly illustrative names/handles. No markdown, no backticks.`,

  closer: `You are Closer — Kushagra's outreach & follow-up agent. Given a prospect
description, write a personalized cold email + a 3-step follow-up. Respond with ONLY
a JSON object: {"prospect":string,"replyOdds":string,"hooks":[string],"email":{"subject":string,"body":string},"followups":[{"day":number,"message":string}]}.
Rules: "replyOdds" like "38%". 2-3 hooks (the personalization signals used). email.body
2-4 sentences. exactly 3 followups (days 3,7,12). No markdown.`,

  muse: `You are Muse — Kushagra's content engine. Given one idea or topic, produce a
cross-channel content pack in one consistent voice. Respond with ONLY a JSON object:
{"idea":string,"linkedin":string,"tweetThread":[string],"video":{"hook":string,"script":string},"carousel":[string]}.
Rules: tweetThread 3-5 items, carousel 3-5 slide lines, video.hook one scroll-stopping
line. Punchy, no hashtag spam, no markdown.`,

  strategist: `You are Strategist — Kushagra's campaign planner. Given a product + goal
(+ optional budget), produce a 2-week launch plan. Respond with ONLY a JSON object:
{"product":string,"goal":string,"channels":[{"name":string,"why":string}],"calendar":[{"week":number,"focus":string,"posts":number}],"kpis":[string]}.
Rules: 3-4 channels reasoned to the product, exactly 2 calendar weeks, 3-4 kpis. No markdown.`,

  concierge: `You are Concierge — Kushagra's inbox & CRM copilot. Given an incoming
message, triage + draft a reply. Respond with ONLY a JSON object:
{"incoming":string,"intent":"hot"|"warm"|"support"|"spam","reply":string,"crmTag":string,"nextAction":string}.
Rules: reply is on-brand, 2-4 sentences. nextAction is one concrete step. No markdown.`,

  analyst: `You are Analyst — Kushagra's deal-intelligence agent. Given a company or
person, produce a one-page brief that ends in a sales angle. Respond with ONLY a JSON
object: {"target":string,"summary":string,"signals":[string],"painPoints":[string],"pitchAngle":string}.
Rules: 2-3 signals, 2-3 painPoints, pitchAngle is one tailored line. Invent realistic
but clearly illustrative detail. No markdown.`,
};

/* ---- Realistic fallback samples (always valid) ---------------------------- */
function fallbackResult(agent: AgentId, input: string): Record<string, unknown> {
  const subject = input.length > 64 ? input.slice(0, 61) + "…" : input;
  switch (agent) {
    case "scout":
      return {
        icp: subject,
        leads: [
          { name: "Priya Nair", handle: "@loomstack", link: "instagram.com/loomstack", followers: "38.4k", fitScore: 92, why: `Posts weekly about ${subject} — high intent, mid audience.`, opener: `Loomstack's last 3 posts on ${subject} crushed — I'd bet outreach is the bottleneck, not content.` },
          { name: "Marcus Reed", handle: "@calderaco", link: "instagram.com/calderaco", followers: "21.1k", fitScore: 84, why: "Founder-led, replies in DMs, no agency yet.", opener: `You're doing ${subject} manually — one agent does it while you sleep. Worth 10 min?` },
          { name: "Dana Whitfield", handle: "@northpace", link: "instagram.com/northpace", followers: "57.9k", fitScore: 78, why: "Bigger audience, slower cadence — needs a system.", opener: `Northpace fits ${subject} perfectly; the gap is consistency, which is exactly what automation fixes.` },
          { name: "Aria Sol", handle: "@ariasol.co", link: "instagram.com/ariasol.co", followers: "14.2k", fitScore: 71, why: "Rising fast, early enough to lock in.", opener: `Caught your ${subject} reel — you're early, and early is when the system compounds most.` },
        ],
      };
    case "closer":
      return {
        prospect: subject,
        replyOdds: "37%",
        hooks: [`Recent post about ${subject}`, "Founder-led, no agency", "Active in DMs"],
        email: { subject: `quick idea for ${subject}`, body: `Hi — saw your work on ${subject}. Most teams stall because outreach is manual; I build the agent that runs it end to end. Want me to send a 60-second demo tailored to you?` },
        followups: [
          { day: 3, message: "Bumping this — happy to just send the demo, no call needed." },
          { day: 7, message: "Last nudge: I'll record a Loom using your actual profile so you can see it live." },
          { day: 12, message: "Closing the loop — door's open whenever outreach becomes the priority." },
        ],
      };
    case "muse":
      return {
        idea: subject,
        linkedin: `Most people overthink ${subject}. The leverage isn't more effort — it's one system that runs while you sleep. Here's how I'd set it up.`,
        tweetThread: [
          `Everyone's doing ${subject} the hard way. Here's the version that runs itself 🧵`,
          "Step 1: stop doing the repetitive part by hand. That's not your job — it's the system's.",
          "Step 2: wire one trigger → one decision → one action. Boring. Reliable. Compounding.",
          "Do this and you get your week back. DM me 'system' and I'll show you mine.",
        ],
        video: { hook: `The 0.1% of ${subject} that runs the other 99.9%.`, script: `Open on the manual grind. Cut to the agent doing it instantly. End on: "built once, runs forever."` },
        carousel: [`${subject}, automated`, "The manual way vs the system way", "One trigger. One decision. One action.", "Built once. Runs forever."],
      };
    case "strategist":
      return {
        product: subject,
        goal: "Launch + first 100 signups",
        channels: [
          { name: "Short-form video", why: "Fastest reach for a visual, demo-able product." },
          { name: "Founder-led LinkedIn", why: "Builds trust + inbound for B2B buyers." },
          { name: "Targeted DM outreach", why: "Direct pipeline while content compounds." },
        ],
        calendar: [
          { week: 1, focus: "Tease the problem + build anticipation", posts: 6 },
          { week: 2, focus: "Reveal, demo, and convert with proof", posts: 7 },
        ],
        kpis: ["Reach / impressions", "Demo bookings", "Signups", "Reply rate on DMs"],
      };
    case "concierge":
      return {
        incoming: subject,
        intent: "hot",
        reply: `Thanks for reaching out — yes, this is exactly what I build. I can send a tailored 60-second demo today; want it by email or a quick call?`,
        crmTag: "Hot lead · demo requested",
        nextAction: "Send tailored demo within 2 hours; set a 3-day follow-up.",
      };
    case "analyst":
    default:
      return {
        target: subject,
        summary: `${subject} is scaling content/outreach but appears to run it manually — a classic automation gap.`,
        signals: ["Hiring for ops/SDR roles", "Posting cadence rising", "No automation tooling visible"],
        painPoints: ["Personalization doesn't scale by hand", "Founder time spent on repetitive outreach"],
        pitchAngle: `Lead with: "one agent does what your next two hires would — for ${subject}, that's reply-rate lift without headcount."`,
      };
  }
}

/* ---- Robust JSON extraction (shared with missionCore) -------------------- */
export function parseJson(text: string): unknown {
  const tryParse = (s: string): unknown => { try { return JSON.parse(s); } catch { return undefined; } };
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

interface AgentBody { agent?: unknown; input?: unknown }

export async function runAgent(body: AgentBody, rateKey: string): Promise<AgentResult> {
  const agent = typeof body?.agent === "string" ? body.agent : "";
  if (!IDS.includes(agent as AgentId)) return { status: 400, json: { error: "unknown_agent" } };
  const id = agent as AgentId;

  const raw = typeof body?.input === "string" ? body.input : "";
  const input = capInput(raw);
  if (!input) return { status: 400, json: { error: "empty input" } };

  const rate = checkRate(rateKey);
  if (!rate.ok) return { status: 429, json: { error: "rate_limited", retryAfterMs: rate.retryAfterMs } };

  const provider = getProvider();
  if (!provider) {
    return { status: 200, json: { agent: id, result: fallbackResult(id, input), fallback: true, reason: "no_key" } };
  }

  try {
    const text = await provider.chat(input, SYSTEM[id], { json: true, maxTokens: RUN_MAX_OUTPUT_TOKENS });
    const parsed = parseJson(text);
    if (!parsed || typeof parsed !== "object") {
      return { status: 200, json: { agent: id, result: fallbackResult(id, input), fallback: true, reason: "parse_error", provider: provider.name } };
    }
    return { status: 200, json: { agent: id, result: parsed, fallback: false, provider: provider.name } };
  } catch (err) {
    const reason = err instanceof Error ? err.message : "provider_error";
    return { status: 200, json: { agent: id, result: fallbackResult(id, input), fallback: true, reason } };
  }
}
