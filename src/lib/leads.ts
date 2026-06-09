/* ============================================================================
   Lead signals (Phase I growth hook). Every real intent a visitor types — an
   agent prompt, a mission goal, a client request — is a warm signal. We capture
   them locally (privacy-preserving: stays in the visitor's own browser) and
   surface them in Founder Mode so Kushagra can see what people actually want.
   No PII is solicited; this is intent text the visitor chose to enter.
   ========================================================================== */

const LEADS_KEY = "kos-leads";
const MAX_LEADS = 40;
const MAX_TEXT = 240;

export type LeadSource = "agent" | "mission" | "client" | "lab" | "run" | "ask";

export interface LeadSignal {
  source: LeadSource;
  text: string;
  at: number; // epoch ms
}

/** Read captured signals, newest first. Degrades to [] on any storage failure. */
export function getLeads(): LeadSignal[] {
  try {
    const raw = localStorage.getItem(LEADS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (l): l is LeadSignal =>
          !!l && typeof l === "object" && typeof (l as LeadSignal).text === "string",
      )
      .slice(0, MAX_LEADS);
  } catch {
    return [];
  }
}

/** Record one warm signal. Trims, caps length + list size, and skips immediate
    duplicates. Best-effort — never throws into the UI. */
export function recordLead(source: LeadSource, rawText: string): void {
  const text = rawText.trim().slice(0, MAX_TEXT);
  if (!text) return;
  try {
    const existing = getLeads();
    if (existing[0]?.text === text && existing[0]?.source === source) return;
    const next: LeadSignal[] = [{ source, text, at: Date.now() }, ...existing].slice(0, MAX_LEADS);
    localStorage.setItem(LEADS_KEY, JSON.stringify(next));
  } catch {
    /* non-fatal */
  }
}
