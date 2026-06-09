/* ============================================================================
   AYRA's autonomous growth studio — agent catalog + client (front-end).
   Six named agents a visitor can run; each returns a structured artifact that
   the branded Style-Lock ArtifactFrame renders. Result shapes mirror
   api/_lib/agentsCore.ts. Any transport failure degrades to a local sample so
   the studio always produces something. The real engine runs server-side.
   ========================================================================== */

export type AgentId =
  | "scout" | "closer" | "muse" | "strategist" | "concierge" | "analyst";

/* ---- Artifact shapes (mirror the server) --------------------------------- */
export interface ScoutLead {
  name: string; handle: string; link: string; followers: string;
  fitScore: number; why: string; opener: string;
}
export interface ScoutArtifact { icp: string; leads: ScoutLead[] }

export interface CloserArtifact {
  prospect: string; replyOdds: string; hooks: string[];
  email: { subject: string; body: string };
  followups: { day: number; message: string }[];
}

export interface MuseArtifact {
  idea: string; linkedin: string; tweetThread: string[];
  video: { hook: string; script: string }; carousel: string[];
}

export interface StrategistArtifact {
  product: string; goal: string;
  channels: { name: string; why: string }[];
  calendar: { week: number; focus: string; posts: number }[];
  kpis: string[];
}

export interface ConciergeArtifact {
  incoming: string; intent: "hot" | "warm" | "support" | "spam";
  reply: string; crmTag: string; nextAction: string;
}

export interface AnalystArtifact {
  target: string; summary: string;
  signals: string[]; painPoints: string[]; pitchAngle: string;
}

export interface AgentArtifactMap {
  scout: ScoutArtifact;
  closer: CloserArtifact;
  muse: MuseArtifact;
  strategist: StrategistArtifact;
  concierge: ConciergeArtifact;
  analyst: AnalystArtifact;
}

export interface AgentReply<K extends AgentId> {
  result: AgentArtifactMap[K];
  fallback: boolean;
}

/* ---- Catalog (UI metadata; signature accent within the cool system) ------- */
export interface AgentMeta {
  id: AgentId;
  name: string;
  role: string;
  blurb: string;
  /** Signature accent — within KushagraOS's cool system (+ gold). Style Lock. */
  accent: string;
  metric: string;
  inputLabel: string;
  placeholder: string;
  examples: string[];
}

export const AGENTS: AgentMeta[] = [
  {
    id: "scout", name: "Scout", role: "Lead discovery & qualification",
    blurb: "Type an ICP — get a ranked, qualified lead sheet with fit scores and openers.",
    accent: "#6FB1E8", metric: "Qualifies 40+ leads in seconds",
    inputLabel: "Describe your ideal customer (ICP)",
    placeholder: 'e.g. "vegan skincare brands, 10–50k followers"',
    examples: ["vegan skincare brands, 10–50k followers", "B2B SaaS founders in fintech", "fitness coaches launching a course"],
  },
  {
    id: "closer", name: "Closer", role: "Outreach & follow-up",
    blurb: "Paste a prospect — get a personalized cold email + 3-step follow-up + reply odds.",
    accent: "#C8A86B", metric: "Drafts a full sequence in 2 min",
    inputLabel: "Describe the prospect (bio / site / context)",
    placeholder: 'e.g. "founder of a DTC coffee brand, posts about sourcing"',
    examples: ["founder of a DTC coffee brand", "agency owner scaling cold email", "SaaS marketer launching a podcast"],
  },
  {
    id: "muse", name: "Muse", role: "Content engine",
    blurb: "One idea — a cross-channel pack: LinkedIn, X thread, video hook+script, carousel.",
    accent: "#D8B36A", metric: "1 idea → 5 channels",
    inputLabel: "Give me one idea or topic",
    placeholder: 'e.g. "why most automation projects fail"',
    examples: ["why most automation projects fail", "the 0.1% that runs the 99.9%", "how to price AI services"],
  },
  {
    id: "strategist", name: "Strategist", role: "Campaign planner",
    blurb: "Product + goal — a 2-week launch plan with channels, calendar, and KPIs.",
    accent: "#7FC8B0", metric: "A full launch plan in one run",
    inputLabel: "Product + goal (+ budget)",
    placeholder: 'e.g. "launch a $49/mo lead-gen tool, get first 100 users"',
    examples: ["launch a $49/mo lead-gen tool", "promote a free automation workshop", "relaunch a stale newsletter"],
  },
  {
    id: "concierge", name: "Concierge", role: "Inbox & CRM copilot",
    blurb: "Paste an incoming message — intent triage + on-brand reply + CRM tag + next action.",
    accent: "#8FA0E0", metric: "Triages + drafts in one pass",
    inputLabel: "Paste an incoming message",
    placeholder: 'e.g. "Hi, do you build WhatsApp automations? What\'s pricing?"',
    examples: ["Do you build WhatsApp automations?", "Following up on my refund request", "Partnership opportunity for you"],
  },
  {
    id: "analyst", name: "Analyst", role: "Deal intelligence",
    blurb: "A company or person — a one-page brief that ends in a tailored pitch angle.",
    accent: "#6FD0C8", metric: "Research → sales angle, not just facts",
    inputLabel: "Company or person to research",
    placeholder: 'e.g. "a 12-person marketing agency in Austin"',
    examples: ["a 12-person marketing agency in Austin", "a DTC skincare brand scaling ads", "a fintech startup hiring SDRs"],
  },
];

export function getAgent(id: AgentId): AgentMeta {
  const found = AGENTS.find((a) => a.id === id);
  if (!found) throw new Error(`unknown agent: ${id}`);
  return found;
}

const MAX_CHARS = 600;

/** Call AYRA's agent engine. Transport failure → minimal graceful shell so the
    UI never crashes (the SERVER already returns rich fallbacks without a key). */
export async function runAgentClient<K extends AgentId>(
  id: K,
  input: string,
  signal?: AbortSignal,
): Promise<AgentReply<K>> {
  const trimmed = input.trim().slice(0, MAX_CHARS);
  try {
    const res = await fetch("/api/agent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ agent: id, input: trimmed }),
      signal,
    });
    const ct = res.headers.get("content-type") ?? "";
    if (!res.ok || !ct.includes("application/json")) throw new Error("bad response");
    const data = (await res.json()) as { result?: AgentArtifactMap[K]; fallback?: boolean };
    if (!data.result) throw new Error("no result");
    return { result: data.result, fallback: Boolean(data.fallback) };
  } catch {
    return { result: {} as AgentArtifactMap[K], fallback: true };
  }
}
