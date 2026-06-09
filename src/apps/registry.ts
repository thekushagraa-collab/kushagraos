/* ============================================================================
   KushagraOS — app registry
   Single source of truth for the apps that live in the dock / ⌘K / mobile home.
   Each app carries its own glyph monogram (our own system language — NOT Apple
   icon mimicry, per the differentiation mandate). Audience routing reorders the
   dock so each visitor sees what matters to them first.
   ========================================================================== */

import type { AppId, Audience } from "../lib/store";

export interface AppMeta {
  id: AppId;
  /** Window / full-screen title. */
  title: string;
  /** Dock + launcher label. */
  short: string;
  /** Two-glyph monogram shown as the icon. */
  abbr: string;
  /** One-line, point-of-view micro-copy (Craft Doctrine: never filler). */
  blurb: string;
  group: "system" | "work";
}

export const APPS: Record<AppId, AppMeta> = {
  about: { id: "about", title: "About", short: "About", abbr: "K", blurb: "Who is running this system.", group: "system" },
  capabilities: { id: "capabilities", title: "Capabilities", short: "Capabilities", abbr: "CP", blurb: "Services as automation nodes.", group: "system" },
  work: { id: "work", title: "Work", short: "Work", abbr: "WK", blurb: "Four builds that run for real.", group: "system" },
  origin: { id: "origin", title: "Origin", short: "Origin", abbr: "OR", blurb: "The journey, as a changelog.", group: "system" },
  telemetry: { id: "telemetry", title: "Telemetry", short: "Telemetry", abbr: "TL", blurb: "The numbers, counting up.", group: "system" },
  vision: { id: "vision", title: "Vision", short: "Vision", abbr: "VS", blurb: "Millionaire → billionaire trajectory.", group: "system" },
  contact: { id: "contact", title: "Contact", short: "Contact", abbr: "CT", blurb: "Initiate a process.", group: "system" },
  studio: { id: "studio", title: "Automation Center", short: "Studio", abbr: "AC", blurb: "AYRA's six-agent growth studio.", group: "work" },
  lab: { id: "lab", title: "AI Lab", short: "AI Lab", abbr: "LB", blurb: "The R&D wing — explorations at the edge.", group: "work" },
  market: { id: "market", title: "Agent Marketplace", short: "Market", abbr: "MK", blurb: "The six agents, as buyable products.", group: "work" },
  client: { id: "client", title: "Client Mode", short: "Client", abbr: "CL", blurb: "Book, scope, and deploy an agent.", group: "work" },
  files: { id: "files", title: "Files", short: "Files", abbr: "FS", blurb: "Résumé + case studies, in-OS.", group: "system" },
  integrations: { id: "integrations", title: "Integrations", short: "Integrations", abbr: "IN", blurb: "Runs across your tools — GitHub live.", group: "work" },
  flow: { id: "flow", title: "Flow", short: "Flow", abbr: "FL", blurb: "Visual automation builder that executes.", group: "work" },
  atlas: { id: "atlas", title: "Atlas", short: "Atlas", abbr: "AT", blurb: "Autonomous outbound engine.", group: "work" },
  forge: { id: "forge", title: "Forge", short: "Forge", abbr: "FG", blurb: "AI content engine.", group: "work" },
  assistant: { id: "assistant", title: "AYRA", short: "AYRA", abbr: "AY", blurb: "Kushagra's AI twin. Ask anything.", group: "work" },
};

/** AYRA's one-line intro when an app comes to focus (Persona Layer — Phase A).
    Her voice: precise, concierge-grade, never filler. */
export const NARRATION: Record<AppId, string> = {
  about: "The operator behind the system.",
  capabilities: "What Kushagra automates — as live nodes.",
  work: "Four builds that run for real. Try them.",
  origin: "The story, as a changelog.",
  telemetry: "The numbers — counting up.",
  vision: "The path to the billion-dollar boring middle.",
  contact: "Let's initiate a process.",
  studio: "My growth team — pick an agent and run it.",
  lab: "The R&D wing — two exhibits run live.",
  market: "Pick an agent — try it, then deploy it.",
  client: "Tell me what you need — I'll route it today.",
  files: "Résumé and case studies — read or save them.",
  integrations: "I plug into your stack — GitHub is live.",
  flow: "Describe a trigger — I'll run the pipeline.",
  atlas: "Give me an ICP — I'll find and rank the leads.",
  forge: "Hand me a topic — I'll spin up the content.",
  assistant: "I'm listening.",
};

/** Default dock order — identity first, then system, then live builds. */
export const DEFAULT_ORDER: AppId[] = [
  "about", "capabilities", "work", "studio", "market", "lab", "integrations", "flow", "atlas", "forge",
  "origin", "telemetry", "vision", "files", "client", "contact", "assistant",
];

/** Audience routing: reorder so the right proof leads. */
export const ORDER_BY_AUDIENCE: Record<Audience, AppId[]> = {
  // clients want outcomes + a way to buy — marketplace + client mode lead
  client: ["market", "studio", "client", "work", "integrations", "flow", "atlas", "forge", "lab", "telemetry", "contact", "files", "capabilities", "about", "origin", "vision", "assistant"],
  // recruiters want proof-of-skill + the résumé first
  recruiter: ["work", "studio", "lab", "files", "integrations", "capabilities", "market", "flow", "forge", "atlas", "origin", "telemetry", "about", "vision", "client", "contact", "assistant"],
  // founders want the trajectory + traction, then the productized agents
  founder: ["vision", "telemetry", "work", "studio", "market", "lab", "integrations", "flow", "atlas", "forge", "capabilities", "origin", "files", "about", "client", "contact", "assistant"],
  // just exploring → the curated default
  explorer: DEFAULT_ORDER,
};

export function getApp(id: AppId): AppMeta {
  return APPS[id];
}

/** Ordered app metadata for the current audience (null → default). */
export function appsForAudience(audience: Audience | null): AppMeta[] {
  const order = audience ? ORDER_BY_AUDIENCE[audience] : DEFAULT_ORDER;
  return order.map((id) => APPS[id]);
}
