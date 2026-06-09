/* ============================================================================
   Speech-to-text core (Phase I). Transcribes a short audio clip via Groq
   Whisper (whisper-large-v3, OpenAI-compatible /audio/transcriptions). The
   client records with MediaRecorder and sends base64 audio as JSON, so this
   reuses the same JSON middleware as every other endpoint (no multipart parsing).

   Graceful by design: no key / error / oversized → { text: "", reason } so the
   voice UI silently falls back to the browser Web Speech API or typed input.
   ========================================================================== */

import { checkRate } from "./guards";

export interface SttResult {
  status: number;
  json: { text: string; reason?: string };
}

interface SttBody {
  audio?: unknown; // base64 (no data: prefix)
  mime?: unknown;
}

const str = (v: unknown) => (typeof v === "string" ? v : "");

/** Cap base64 audio under node.ts's 1MB request-body guard (which destroys the
    socket past 1_000_000 bytes). ~950KB base64 ≈ 700KB Opus ≈ a long push-to-talk
    clip — more than enough for a spoken question. */
const MAX_AUDIO_B64 = 950_000;
const STT_MODEL = "whisper-large-v3";

export async function runStt(body: SttBody, rateKey: string): Promise<SttResult> {
  const rate = checkRate(`stt:${rateKey}`);
  if (!rate.ok) return { status: 429, json: { text: "", reason: "rate_limited" } };

  const audioB64 = str(body?.audio).replace(/^data:[^,]*,/, "");
  const mime = str(body?.mime) || "audio/webm";
  if (!audioB64) return { status: 400, json: { text: "", reason: "no_audio" } };
  if (audioB64.length > MAX_AUDIO_B64) return { status: 413, json: { text: "", reason: "too_large" } };

  const key = process.env.GROQ_API_KEY?.trim();
  if (!key) return { status: 200, json: { text: "", reason: "no_key" } };

  try {
    const bytes = Buffer.from(audioB64, "base64");
    const ext = mime.includes("ogg") ? "ogg" : mime.includes("mp4") ? "mp4" : "webm";
    const form = new FormData();
    form.append("file", new Blob([bytes], { type: mime }), `clip.${ext}`);
    form.append("model", STT_MODEL);
    form.append("response_format", "json");
    form.append("temperature", "0");

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15_000);
    try {
      const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
        method: "POST",
        headers: { authorization: `Bearer ${key}`, connection: "close" },
        body: form,
        signal: ctrl.signal,
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        return { status: 200, json: { text: "", reason: `stt_${res.status}: ${detail.slice(0, 120)}` } };
      }
      const data = (await res.json().catch(() => ({}))) as { text?: string };
      return { status: 200, json: { text: (data.text ?? "").trim() } };
    } finally {
      clearTimeout(timer);
    }
  } catch (err) {
    const reason = err instanceof Error ? err.message : "stt_error";
    return { status: 200, json: { text: "", reason } };
  }
}
