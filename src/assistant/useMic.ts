/* ============================================================================
   useMic — push-to-talk speech recognition via the browser Web Speech API
   (free, no key). Reports interim + final transcripts and a `supported` flag so
   the UI can fall back to typed input where SpeechRecognition is unavailable
   (Firefox, some mobile). No audio leaves the device for STT.
   ========================================================================== */

import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }>;
}

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export interface MicState {
  supported: boolean;
  listening: boolean;
  interim: string;
  start: () => void;
  stop: () => void;
}

/** @param onFinal called with the final transcript when a phrase completes. */
export function useMic(onFinal: (text: string) => void): MicState {
  const Ctor = getRecognitionCtor();
  const [supported] = useState(() => Boolean(Ctor));
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal;

  useEffect(() => {
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e) => {
      let final = "";
      let live = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) final += r[0].transcript;
        else live += r[0].transcript;
      }
      setInterim(live);
      if (final.trim()) {
        setInterim("");
        onFinalRef.current(final.trim());
      }
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recRef.current = rec;
    return () => {
      rec.onresult = null;
      rec.onerror = null;
      rec.onend = null;
      try { rec.abort(); } catch { /* already stopped */ }
    };
  }, [Ctor]);

  const start = useCallback(() => {
    if (!recRef.current || listening) return;
    setInterim("");
    try {
      recRef.current.start();
      setListening(true);
    } catch { /* start while already starting — ignore */ }
  }, [listening]);

  const stop = useCallback(() => {
    if (!recRef.current) return;
    try { recRef.current.stop(); } catch { /* noop */ }
    setListening(false);
  }, []);

  return { supported, listening, interim, start, stop };
}
