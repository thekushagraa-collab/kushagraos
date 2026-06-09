/* ============================================================================
   Gemini TTS core. Returns base64 WAV the browser can play. The client treats
   this as best-effort and falls back to the browser's speechSynthesis if it
   fails (no key, quota, unsupported) — so voice-out always works.
   ========================================================================== */

import { capInput, checkRate } from "./guards";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export interface TtsResult {
  status: number;
  json: Record<string, unknown>;
}

/** Wrap raw little-endian PCM16 mono into a minimal WAV container (base64). */
function pcm16ToWavBase64(pcmBase64: string, sampleRate: number): string {
  const pcm = Buffer.from(pcmBase64, "base64");
  const header = Buffer.alloc(44);
  const dataLen = pcm.length;
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataLen, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // fmt chunk size
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28); // byte rate (mono, 16-bit)
  header.writeUInt16LE(2, 32); // block align
  header.writeUInt16LE(16, 34); // bits per sample
  header.write("data", 36);
  header.writeUInt32LE(dataLen, 40);
  return Buffer.concat([header, pcm]).toString("base64");
}

function rateFromMime(mime: string | undefined): number {
  const m = /rate=(\d+)/.exec(mime ?? "");
  return m ? Number(m[1]) : 24000;
}

interface TtsBody {
  text?: unknown;
}

export async function runTts(body: TtsBody, rateKey: string): Promise<TtsResult> {
  const text = capInput(typeof body?.text === "string" ? body.text : "");
  if (!text) return { status: 400, json: { error: "empty text" } };

  const rate = checkRate(`tts:${rateKey}`);
  if (!rate.ok) return { status: 429, json: { error: "rate_limited", retryAfterMs: rate.retryAfterMs } };

  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) return { status: 200, json: { fallback: true, reason: "no_key" } };

  const model = process.env.GEMINI_TTS_MODEL || "gemini-2.5-flash-preview-tts";
  try {
    const res = await fetch(`${GEMINI_BASE}/${model}:generateContent?key=${key}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Charon" } },
          },
        },
      }),
    });
    if (!res.ok) throw new Error(`tts ${res.status}`);
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { inlineData?: { data?: string; mimeType?: string } }[] } }[];
    };
    const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
    const inline = part?.inlineData;
    if (!inline?.data) throw new Error("tts: no audio");
    const wav = pcm16ToWavBase64(inline.data, rateFromMime(inline.mimeType));
    return { status: 200, json: { audio: wav, mime: "audio/wav" } };
  } catch (err) {
    const reason = err instanceof Error ? err.message : "tts_error";
    return { status: 200, json: { fallback: true, reason } };
  }
}
