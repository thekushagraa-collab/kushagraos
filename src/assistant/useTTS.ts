/* ============================================================================
   useTTS — voice out. Tries the server's Gemini TTS (/api/tts) for a natural
   voice; on any failure falls back to the browser's speechSynthesis so the twin
   always speaks. Respects the in-app Motion toggle (silent when motion is off,
   treating voice as motion-class ambient output).
   ========================================================================== */

import { useCallback, useEffect, useRef, useState } from "react";

function base64ToBlob(b64: string, mime: string): Blob {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export interface TTS {
  speaking: boolean;
  speak: (text: string) => Promise<void>;
  cancel: () => void;
}

export function useTTS(enabled: boolean): TTS {
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const cancel = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  useEffect(() => cancel, [cancel]);

  const speakBrowser = useCallback((text: string) => {
    if (typeof speechSynthesis === "undefined") return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.02;
    u.pitch = 1;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }, []);

  const speak = useCallback(
    async (text: string) => {
      if (!enabled || !text.trim()) return;
      cancel();
      setSpeaking(true);
      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ text }),
        });
        const ct = res.headers.get("content-type") ?? "";
        if (res.ok && ct.includes("application/json")) {
          const data = (await res.json()) as { audio?: string; mime?: string };
          if (data.audio) {
            const url = URL.createObjectURL(base64ToBlob(data.audio, data.mime ?? "audio/wav"));
            const audio = new Audio(url);
            audioRef.current = audio;
            audio.onended = () => {
              setSpeaking(false);
              URL.revokeObjectURL(url);
            };
            await audio.play();
            return;
          }
        }
        throw new Error("tts fallback");
      } catch {
        speakBrowser(text); // graceful fallback to browser voice
      }
    },
    [enabled, cancel, speakBrowser],
  );

  return { speaking, speak, cancel };
}
