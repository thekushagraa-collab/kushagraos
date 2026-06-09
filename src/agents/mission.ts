/* ============================================================================
   Mission Mode — client catalog + transport (Phase D). One goal → AYRA runs her
   growth team (Scout → Analyst → Closer → Muse → Strategist) → one assembled
   growth plan. Result shapes mirror api/_lib/missionCore.ts. Transport failure
   degrades to a minimal local plan so the centerpiece always produces something;
   the SERVER already returns a rich fallback without a key.
   ========================================================================== */

import { getAgent, type AgentId } from "./agents";

/** The five specialists Mission Mode orchestrates, in hand-off order. */
export type MissionAgent = Extract<
  AgentId,
  "scout" | "analyst" | "closer" | "muse" | "strategist"
>;
export const MISSION_ORDER: readonly MissionAgent[] = [
  "scout", "analyst", "closer", "muse", "strategist",
];

export interface MissionStep {
  agent: MissionAgent;
  title: string;
  headline: string;
  detail: string[];
}

export interface MissionPlan {
  goal: string;
  readout: string;
  steps: MissionStep[];
  summary: string;
}

export interface MissionReply {
  plan: MissionPlan;
  fallback: boolean;
}

/** Per-step display chrome (name + signature accent), sourced from the agent
    catalog so Mission Mode and the studio stay visually in sync. */
export function missionAgentMeta(agent: MissionAgent): { name: string; accent: string } {
  const a = getAgent(agent);
  return { name: a.name, accent: a.accent };
}

/** AYRA's own identity for the assembled-plan Style-Lock frame. */
export const MISSION_IDENTITY = {
  id: "mission",
  name: "Mission",
  role: "AYRA ran the full team",
  accent: "#9FD8FF",
} as const;

export const MISSION_EXAMPLES: readonly string[] = [
  "I run a skincare brand — get me customers",
  "Launch my $49/mo SaaS to its first 100 users",
  "Fill my consulting calendar for next month",
];

const MAX_CHARS = 600;

/** Minimal client-side shell if the network itself fails (server has the rich
    fallback). Keeps the choreography + artifact from ever rendering empty. */
function clientFallback(goal: string): MissionPlan {
  const mk = (agent: MissionAgent, title: string, headline: string): MissionStep => ({
    agent, title, headline, detail: ["Reconnecting to AYRA — showing a preview of the flow."],
  });
  return {
    goal,
    readout: `Queuing the team for "${goal}".`,
    steps: [
      mk("scout", "Scout · qualifying leads", "Finding and ranking the right prospects."),
      mk("analyst", "Analyst · sales angle", "Researching the market and the wedge."),
      mk("closer", "Closer · outreach", "Drafting a personalized sequence."),
      mk("muse", "Muse · content", "Spinning up cross-channel content."),
      mk("strategist", "Strategist · plan", "Assembling a 2-week launch plan."),
    ],
    summary: "Run again in a moment for the full, live growth plan.",
  };
}

/** Call AYRA's Mission orchestrator. */
export async function runMissionClient(goal: string, signal?: AbortSignal): Promise<MissionReply> {
  const trimmed = goal.trim().slice(0, MAX_CHARS);
  try {
    const res = await fetch("/api/mission", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ goal: trimmed }),
      signal,
    });
    const ct = res.headers.get("content-type") ?? "";
    if (!res.ok || !ct.includes("application/json")) throw new Error("bad response");
    const data = (await res.json()) as { plan?: MissionPlan; fallback?: boolean };
    if (!data.plan || !Array.isArray(data.plan.steps)) throw new Error("no plan");
    return { plan: data.plan, fallback: Boolean(data.fallback) };
  } catch {
    return { plan: clientFallback(trimmed), fallback: true };
  }
}
