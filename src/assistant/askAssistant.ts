/* ============================================================================
   Client → /api/ask. Robust: any failure (offline, no endpoint in a static
   preview, non-JSON) degrades to a local keyword answer so the twin always
   responds. The real brain (Gemini) runs server-side behind the endpoint.
   ========================================================================== */

export interface AskReply {
  answer: string;
  fallback: boolean;
}

const MAX_CHARS = 600;

function localFallback(query: string): string {
  const q = query.toLowerCase();
  if (/hire|work with|available|rate|cost|price/.test(q))
    return "Kushagra takes on automation builds and select roles — open the Contact app or email him to start a process.";
  if (/flow|atlas|forge|build|project|work/.test(q))
    return "He's shipped Flow, Atlas, Forge, this voice twin, and CreatorScout. Open the Work app to dig in.";
  if (/vision|goal|future|billion|million/.test(q))
    return "The plan: ~$10K MRR in 2026, $1M ARR by 2028 with Atlas and Forge, then automating the boring middle of the economy.";
  if (/who|about|kushagra|you/.test(q))
    return "I'm Kushagra's voice twin — he's a 19-year-old AI automation operator who builds the 0.1% that runs the other 99.9%.";
  return "I'm here to talk about Kushagra and his work — ask about his builds, how to hire him, or where he's headed.";
}

export async function askAssistant(query: string, signal?: AbortSignal): Promise<AskReply> {
  const trimmed = query.trim().slice(0, MAX_CHARS);
  if (!trimmed) return { answer: "Ask me something about Kushagra.", fallback: true };

  try {
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: trimmed }),
      signal,
    });
    const ct = res.headers.get("content-type") ?? "";
    if (!res.ok || !ct.includes("application/json")) throw new Error("bad response");
    const data = (await res.json()) as { answer?: string; fallback?: boolean };
    if (!data.answer) throw new Error("no answer");
    return { answer: data.answer, fallback: Boolean(data.fallback) };
  } catch {
    return { answer: localFallback(trimmed), fallback: true };
  }
}
