/* ============================================================================
   useWhisper — push-to-talk capture via MediaRecorder, transcribed server-side
   by Groq Whisper (/api/stt). Works cross-browser (Firefox/Safari included)
   where the Web Speech API does not. Audio is sent once, on stop, as base64 —
   nothing streams continuously. Falls back silently (empty transcript) so the
   caller can defer to useMic (Web Speech) or typed input.
   ========================================================================== */

import { useCallback, useEffect, useRef, useState } from "react";

export interface WhisperState {
  supported: boolean;
  recording: boolean;
  transcribing: boolean;
  start: () => void;
  stop: () => void;
}

function whisperSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.MediaRecorder !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia)
  );
}

/** Read a Blob as base64 (strips the data: URL prefix). */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("read_failed"));
    reader.onloadend = () => {
      const result = String(reader.result ?? "");
      resolve(result.replace(/^data:[^,]*,/, ""));
    };
    reader.readAsDataURL(blob);
  });
}

/** @param onFinal called with the transcript once Whisper returns (skipped if empty). */
export function useWhisper(onFinal: (text: string) => void): WhisperState {
  const [supported] = useState(whisperSupported);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal;

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => cleanupStream, [cleanupStream]);

  const start = useCallback(async () => {
    if (!supported || recording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "";
      const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = async () => {
        cleanupStream();
        const type = rec.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        chunksRef.current = [];
        if (blob.size === 0) return;
        setTranscribing(true);
        try {
          const audio = await blobToBase64(blob);
          const res = await fetch("/api/stt", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ audio, mime: type }),
          });
          const data = (await res.json().catch(() => ({}))) as { text?: string };
          const text = (data.text ?? "").trim();
          if (text) onFinalRef.current(text);
        } catch {
          /* network/parse failure → silent; caller keeps typed input */
        } finally {
          setTranscribing(false);
        }
      };
      recorderRef.current = rec;
      rec.start();
      setRecording(true);
    } catch {
      // permission denied / no device → mark not recording; caller falls back
      cleanupStream();
      setRecording(false);
    }
  }, [supported, recording, cleanupStream]);

  const stop = useCallback(() => {
    const rec = recorderRef.current;
    if (!rec) return;
    setRecording(false);
    try {
      if (rec.state !== "inactive") rec.stop();
    } catch {
      /* already stopped */
    }
  }, []);

  return { supported, recording, transcribing, start, stop };
}
