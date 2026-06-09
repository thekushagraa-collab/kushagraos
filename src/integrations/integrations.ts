/* ============================================================================
   Integrations (Phase G) — the "runs across your tools" feel, safely.
   Gmail / Calendar / Notion / Slack are SIMULATED (demo data, clearly labeled).
   GitHub is REAL and READ-ONLY (public repos via /api/github). No real writes,
   no personal keys on the public site.
   ========================================================================== */

/** Kushagra's GitHub handle. Public repos show here automatically once published. */
export const GITHUB_USER = "thekushagraa-collab";

export interface GithubRepo {
  name: string; description: string; stars: number; language: string; url: string; updated: string;
}
export interface GithubReply { user: string; repos: GithubRepo[]; fallback: boolean; reason: string }

export async function fetchGithub(user: string, signal?: AbortSignal): Promise<GithubReply> {
  try {
    const res = await fetch("/api/github", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ user }),
      signal,
    });
    const ct = res.headers.get("content-type") ?? "";
    if (!res.ok || !ct.includes("application/json")) throw new Error("bad response");
    const data = (await res.json()) as Partial<GithubReply>;
    if (!Array.isArray(data.repos)) throw new Error("no repos");
    return { user: data.user ?? user, repos: data.repos, fallback: Boolean(data.fallback), reason: data.reason ?? "ok" };
  } catch {
    return { user, repos: [], fallback: true, reason: "network" };
  }
}

/* ---- Simulated data (demo environment) ---------------------------------- */
export interface DemoEmail { from: string; subject: string; preview: string; time: string; unread: boolean }
export const DEMO_GMAIL: ReadonlyArray<DemoEmail> = [
  { from: "Acme Skincare", subject: "Re: Automation proposal", preview: "This looks great — can we start with lead-gen and add outreach in month two?", time: "9:14 AM", unread: true },
  { from: "Stripe", subject: "You received a payment", preview: "A payment of $2,400.00 was successfully processed for KushagraOS — Retainer.", time: "8:02 AM", unread: true },
  { from: "Cal.com", subject: "New booking: Fit call", preview: "Priya from Loomstack booked Thursday 3:00 PM. Agenda attached.", time: "Yesterday", unread: false },
  { from: "GitHub", subject: "[atlas] CI passed on main", preview: "All checks have passed. Deploy to production is ready.", time: "Yesterday", unread: false },
];

export interface DemoEvent { time: string; title: string; kind: "call" | "build" | "focus" }
export const DEMO_CALENDAR: ReadonlyArray<DemoEvent> = [
  { time: "10:00", title: "Fit call — DTC skincare brand", kind: "call" },
  { time: "12:30", title: "Ship: Atlas reply-rate model v2", kind: "build" },
  { time: "14:00", title: "Deep work — Forge clip scoring", kind: "focus" },
  { time: "16:30", title: "Client handover — Loomstack", kind: "call" },
];

export interface DemoPage { title: string; kind: string; edited: string }
export const DEMO_NOTION: ReadonlyArray<DemoPage> = [
  { title: "Client pipeline", kind: "Database", edited: "2h ago" },
  { title: "Atlas — eval results", kind: "Page", edited: "today" },
  { title: "Proposals / Q2", kind: "Database", edited: "yesterday" },
  { title: "Prompt library", kind: "Page", edited: "3d ago" },
];

export interface DemoMessage { user: string; text: string; time: string }
export const DEMO_SLACK: ReadonlyArray<DemoMessage> = [
  { user: "AYRA", text: "Mission complete: 42 leads scouted, ranked, and queued for outreach. 🛰️", time: "9:05" },
  { user: "Kushagra", text: "Nice. Push the top 12 to Atlas and draft openers.", time: "9:06" },
  { user: "AYRA", text: "Done. Drafts in #outbound for review — predicted reply rate 31–44%.", time: "9:07" },
];

export type IntegrationId = "gmail" | "calendar" | "notion" | "slack" | "github";
export interface IntegrationMeta { id: IntegrationId; name: string; glyph: string; real: boolean; accent: string }
export const INTEGRATIONS: ReadonlyArray<IntegrationMeta> = [
  { id: "github", name: "GitHub", glyph: "GH", real: true, accent: "#9FD8FF" },
  { id: "gmail", name: "Gmail", glyph: "GM", real: false, accent: "#E0795F" },
  { id: "calendar", name: "Calendar", glyph: "CA", real: false, accent: "#7FC8B0" },
  { id: "notion", name: "Notion", glyph: "NO", real: false, accent: "#C8A86B" },
  { id: "slack", name: "Slack", glyph: "SL", real: false, accent: "#8FA0E0" },
];
