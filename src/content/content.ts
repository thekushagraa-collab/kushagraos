/* ============================================================================
   KushagraOS — editable content. Kushagra owns the copy here; the UI is
   structural. Keep micro-copy system-flavored, confident, a little wry — never
   filler. Numbers use realistic placeholders until live data lands.
   ========================================================================== */

import type { AppId } from "../lib/store";

/* ---------------- Capabilities — services as automation nodes -------------- */

export interface ServiceNode {
  id: string;
  /** Layer column (0 = inputs, 3 = outputs). Drives the graph layout. */
  col: 0 | 1 | 2 | 3;
  /** Row within column. */
  row: number;
  label: string;
  kind: "trigger" | "ai" | "action" | "loop";
  note: string;
}

export const SERVICES: ReadonlyArray<ServiceNode> = [
  { id: "intake", col: 0, row: 0, kind: "trigger", label: "Business intake", note: "What's the actual bottleneck." },
  { id: "audit", col: 0, row: 1, kind: "trigger", label: "Process audit", note: "Map the work humans do now." },
  { id: "plan", col: 1, row: 0, kind: "ai", label: "Automation design", note: "Where AI replaces vs. assists." },
  { id: "build", col: 1, row: 1, kind: "ai", label: "Agent build", note: "Claude/Gemini agents, tuned." },
  { id: "wire", col: 2, row: 0, kind: "action", label: "System wiring", note: "Webhooks, queues, retries." },
  { id: "deploy", col: 2, row: 1, kind: "action", label: "Deploy + monitor", note: "Spend caps, dashboards, alerts." },
  { id: "loop", col: 3, row: 0, kind: "loop", label: "Continuous tune", note: "Eval, prompt drift, cost." },
  { id: "handoff", col: 3, row: 1, kind: "loop", label: "Handover", note: "Your team owns it, not me." },
];

export const SERVICE_EDGES: ReadonlyArray<[string, string]> = [
  ["intake", "plan"],
  ["audit", "plan"],
  ["audit", "build"],
  ["plan", "build"],
  ["build", "wire"],
  ["build", "deploy"],
  ["wire", "deploy"],
  ["wire", "loop"],
  ["deploy", "loop"],
  ["deploy", "handoff"],
  ["loop", "handoff"],
];

/* ---------------- Work — case studies -------------------------------------- */

export interface CaseStudy {
  id: string;
  /** App opened when the card is clicked. */
  app: AppId;
  title: string;
  tagline: string;
  problem: string;
  build: string;
  outcome: string;
  stack: ReadonlyArray<string>;
  /** "live" reads "▶ run for real" CTA; "case" reads "view case study". */
  status: "live" | "case";
}

export const WORK: ReadonlyArray<CaseStudy> = [
  {
    id: "flow",
    app: "flow",
    title: "Flow",
    tagline: "Visual automation builder that executes.",
    problem: "Founders see no-code as a toy and code as overkill. Neither runs their real ops.",
    build: "Drag Trigger → AI → Action; the canvas calls Claude/Gemini and ships to email, Slack, or webhook in one click.",
    outcome: "Demos go from slide to running pipeline in under 90 seconds.",
    stack: ["React", "Gemini API", "Vercel functions", "Resend", "Slack webhooks"],
    status: "live",
  },
  {
    id: "atlas",
    app: "atlas",
    title: "Atlas",
    tagline: "Autonomous outbound engine.",
    problem: "Personalized outbound at any volume turns into a sweatshop. The good leads are buried.",
    build: "Type the ICP. Atlas researches, drafts hyper-personal sends, and predicts reply rates per lead.",
    outcome: "Predicted reply-rate ranking matches sent-reply rate within ±4 pts on a 200-lead pilot.",
    stack: ["React", "Gemini API", "Postgres", "Cron", "Resend"],
    status: "live",
  },
  {
    id: "forge",
    app: "forge",
    title: "Forge",
    tagline: "AI content engine.",
    problem: "Hours of footage become one Tweet. The other 19 ideas die on the cutting-room floor.",
    build: "Upload a video or podcast. Forge transcribes, scores moments, and exports clips + threads + captions.",
    outcome: "20× the surface area from a single recording, with editable drafts, not slop.",
    stack: ["React", "Whisper", "Gemini API", "ffmpeg.wasm"],
    status: "live",
  },
  {
    id: "assistant",
    app: "assistant",
    title: "Voice twin",
    tagline: "Talk to the operator.",
    problem: "Portfolios tell. The voice twin answers — about my work, my stack, my rates — in my voice.",
    build: "Push-to-talk → STT → Claude scoped to my knowledge → ElevenLabs natural voice + live transcript.",
    outcome: "Visitor asks; the OS answers. The site closes itself.",
    stack: ["Web Speech API", "Claude / Gemini", "ElevenLabs", "WebAudio"],
    status: "live",
  },
  {
    id: "creatorscout",
    app: "atlas",
    title: "CreatorScout",
    tagline: "Lead-gen for influencer-marketing agencies.",
    problem: "Agencies waste days picking creators who don't match the campaign brief.",
    build: "Type the campaign. CreatorScout returns ranked creators (followers, niche fit, eligibility) with the IG link inline.",
    outcome: "Used by a working agency; first 1,000 leads sourced in a weekend.",
    stack: ["React", "Instagram data API", "Postgres"],
    status: "case",
  },
];

/* ---------------- Origin — editorial changelog ----------------------------- */

export interface JourneyEntry {
  date: string;
  title: string;
  note: string;
  tag: "build" | "ship" | "learn" | "milestone";
}

export const JOURNEY: ReadonlyArray<JourneyEntry> = [
  { date: "2022", title: "First script", tag: "learn",
    note: "Wrote a Python scraper to skip lecture attendance. Discovered automation pays compounding interest." },
  { date: "2023", title: "Agency ops", tag: "build",
    note: "Built internal tools for a small agency — invoicing, reporting, lead intake. They paid me. Surprising." },
  { date: "2024", title: "CreatorScout", tag: "ship",
    note: "Shipped the first product an agency actually paid for. Lesson: charge before you build the rest." },
  { date: "2025 · Q1", title: "Claude + Gemini", tag: "learn",
    note: "Went from prompt-fiddling to agent-building. The work shifted from screenshots to systems that run." },
  { date: "2025 · Q3", title: "Operator", tag: "milestone",
    note: "Stopped saying 'developer'. Started saying 'AI automation operator'. The bookings changed accordingly." },
  { date: "2026 · now", title: "KushagraOS", tag: "ship",
    note: "Portfolio rebuilt as the system. Form = function. The site IS the pitch." },
];

/* ---------------- Telemetry — metrics that count up ------------------------ */

export interface Metric {
  id: string;
  label: string;
  /** Final value the counter animates to. */
  value: number;
  /** Optional unit suffix (×, %, M, h). */
  suffix?: string;
  prefix?: string;
  /** Sub-label / context. */
  caption: string;
  /** Decimal places for the running display. */
  decimals?: number;
}

export const METRICS: ReadonlyArray<Metric> = [
  { id: "automations", label: "Automations shipped", value: 47, caption: "Production pipelines running this morning." },
  { id: "hours", label: "Hours back per week", value: 312, suffix: "h", caption: "Sum across active clients." },
  { id: "uptime", label: "System uptime", value: 99.6, suffix: "%", decimals: 1, caption: "Last 90 days, all live agents." },
  { id: "tokens", label: "Tokens processed", value: 8.4, suffix: "M", decimals: 1, caption: "This month, paying customers only." },
];

/* ---------------- Vision — trajectory ------------------------------------- */

export interface Milestone {
  year: string;
  target: string;
  thesis: string;
}

export const VISION: ReadonlyArray<Milestone> = [
  { year: "2026", target: "$10K MRR — services + Flow",
    thesis: "Productize the highest-leverage automation I keep rebuilding for clients." },
  { year: "2028", target: "$1M ARR — Atlas + Forge as SaaS",
    thesis: "Move from custom builds to two SaaS products that compound. Atlas first." },
  { year: "2031", target: "$10M ARR — operator platform",
    thesis: "The shared substrate underneath every automation, not another tool." },
  { year: "2035", target: "$1B — the boring trillion-dollar middle",
    thesis: "Most economic activity is still humans typing. Automate the typing." },
];

/* ---------------- Contact ------------------------------------------------- */

export const CONTACT_LINKS: ReadonlyArray<{ label: string; href: string }> = [
  { label: "Email", href: "mailto:thekushagraa@gmail.com" },
  { label: "GitHub", href: "https://github.com/" }, // TODO Kushagra: real handles
  { label: "X / Twitter", href: "https://x.com/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/" },
];
