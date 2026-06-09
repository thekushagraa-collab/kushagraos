/* ============================================================================
   Client → /api/run for the WORK apps (Flow / Atlas / Forge). Robust: any
   failure (offline, no endpoint in a static preview, non-JSON) degrades to a
   local demo result so the OS always "runs". The real engine (provider seam)
   runs server-side behind the endpoint. Result shapes mirror api/_lib/runCore.
   ========================================================================== */

export interface FlowResult {
  trigger: string;
  steps: { node: "trigger" | "ai" | "action"; label: string; detail: string }[];
  action: { channel: "email" | "slack" | "webhook"; title: string; body: string };
}
export interface AtlasResult {
  icp: string;
  leads: { name: string; company: string; role: string; fit: number; predictedReply: string; opener: string }[];
}
export interface ForgeResult {
  source: string;
  clips: { title: string; hook: string; durationSec: number }[];
  thread: string[];
  captions: string[];
}

export interface RunResultMap {
  flow: FlowResult;
  atlas: AtlasResult;
  forge: ForgeResult;
}
export type RunApp = keyof RunResultMap;

export interface RunReply<K extends RunApp> {
  result: RunResultMap[K];
  fallback: boolean;
}

const MAX_CHARS = 600;

function localFallback<K extends RunApp>(app: K, input: string): RunResultMap[K] {
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
        body: `Got it — Flow caught "${subject}" and handled it end to end. This is the offline demo; with the live engine it drafts and sends for real to email, Slack, or a webhook.`,
      },
    } as RunResultMap[K];
  }
  if (app === "atlas") {
    return {
      icp: subject,
      leads: [
        { name: "Priya Nair", company: "Loomstack", role: "Head of Growth", fit: 92, predictedReply: "41%", opener: `Saw Loomstack is scaling outbound for "${subject}" — personalization at volume is where teams burn out. Atlas fixes exactly that.` },
        { name: "Marcus Reed", company: "Caldera Labs", role: "Founder", fit: 84, predictedReply: "33%", opener: `You're hiring SDRs to do what one agent can. Worth 10 minutes on "${subject}"?` },
        { name: "Dana Whitfield", company: "Northpace", role: "VP Sales", fit: 76, predictedReply: "27%", opener: `Northpace's motion fits "${subject}" — the predicted reply lift is the part teams underestimate.` },
      ],
    } as RunResultMap[K];
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
    captions: [`${subject} — the 0.1% that runs the other 99.9%.`, `Built with Forge. Editable drafts, not slop.`],
  } as RunResultMap[K];
}

export async function runApp<K extends RunApp>(
  app: K,
  input: string,
  signal?: AbortSignal,
): Promise<RunReply<K>> {
  const trimmed = input.trim().slice(0, MAX_CHARS);
  if (!trimmed) return { result: localFallback(app, "your input"), fallback: true };

  try {
    const res = await fetch("/api/run", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ app, input: trimmed }),
      signal,
    });
    const ct = res.headers.get("content-type") ?? "";
    if (!res.ok || !ct.includes("application/json")) throw new Error("bad response");
    const data = (await res.json()) as { result?: RunResultMap[K]; fallback?: boolean };
    if (!data.result) throw new Error("no result");
    return { result: data.result, fallback: Boolean(data.fallback) };
  } catch {
    return { result: localFallback(app, trimmed), fallback: true };
  }
}
