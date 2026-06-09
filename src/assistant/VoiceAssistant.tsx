/* ============================================================================
   VoiceAssistant — the persistent voice twin overlay. Push-to-talk (Web Speech)
   or type; the brain answers server-side (Gemini via /api/ask) with a graceful
   local fallback; replies are spoken (Gemini TTS → speechSynthesis fallback) and
   shown as a live transcript. Reachable from the menubar "Ask" + ⌘K.
   ========================================================================== */

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOS } from "../lib/store";
import { cn } from "../lib/cn";
import { askAssistant } from "./askAssistant";
import { useMic } from "./useMic";
import { useTTS } from "./useTTS";
import "./voice-assistant.css";

interface Turn {
  id: number;
  role: "user" | "twin";
  text: string;
}

const SUGGESTIONS = ["Who is Kushagra?", "What has he built?", "Can I hire him?"];

export function VoiceAssistant() {
  const isOpen = useOS((s) => s.isAssistantOpen);
  const toggleAssistant = useOS((s) => s.toggleAssistant);
  const motionOn = useOS((s) => s.motion);

  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const idRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const { speak, speaking, cancel } = useTTS(motionOn);

  const ask = useCallback(
    async (text: string) => {
      const q = text.trim();
      if (!q || thinking) return;
      const userTurn: Turn = { id: ++idRef.current, role: "user", text: q };
      setTurns((t) => [...t, userTurn]);
      setDraft("");
      setThinking(true);
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      const { answer } = await askAssistant(q, ctrl.signal);
      const twinTurn: Turn = { id: ++idRef.current, role: "twin", text: answer };
      setTurns((t) => [...t, twinTurn]);
      setThinking(false);
      void speak(answer);
    },
    [thinking, speak],
  );

  const mic = useMic(ask);

  const status = mic.listening
    ? "Listening…"
    : thinking
      ? "Thinking…"
      : speaking
        ? "Speaking…"
        : "Ask me anything";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          className="assistant"
          data-testid="assistant"
          role="dialog"
          aria-label="Voice assistant"
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98, transition: { duration: 0.16 } }}
          transition={{ type: "spring", stiffness: 360, damping: 30 }}
        >
          <header className="assistant__head">
            <span className="assistant__title mono">
              <span className={cn("assistant__orb", (mic.listening || speaking) && "assistant__orb--live")} aria-hidden="true" />
              VOICE TWIN
            </span>
            <span className="assistant__status mono">{status}</span>
            <button type="button" className="assistant__close" aria-label="Close assistant" onClick={() => { cancel(); toggleAssistant(); }} />
          </header>

          <div className="assistant__transcript" data-testid="assistant-transcript">
            {turns.length === 0 && (
              <div className="assistant__empty">
                <p className="assistant__empty-line">
                  I'm Kushagra's voice twin. Ask about his work, his stack, or how to hire him.
                </p>
                <ul className="assistant__suggest">
                  {SUGGESTIONS.map((s) => (
                    <li key={s}>
                      <button type="button" className="assistant__chip mono" onClick={() => ask(s)}>
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {turns.map((t) => (
              <p key={t.id} className={cn("assistant__turn", `assistant__turn--${t.role}`)} data-role={t.role}>
                {t.text}
              </p>
            ))}
            {mic.interim && <p className="assistant__turn assistant__turn--user assistant__turn--interim">{mic.interim}</p>}
          </div>

          <form
            className="assistant__input-row"
            onSubmit={(e) => { e.preventDefault(); ask(draft); }}
          >
            {mic.supported && (
              <button
                type="button"
                className={cn("assistant__mic", mic.listening && "assistant__mic--on")}
                data-testid="assistant-mic"
                aria-pressed={mic.listening}
                aria-label={mic.listening ? "Stop listening" : "Push to talk"}
                onClick={() => (mic.listening ? mic.stop() : mic.start())}
              >
                {mic.listening ? "■" : "🎙"}
              </button>
            )}
            <input
              className="assistant__input"
              data-testid="assistant-input"
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={mic.supported ? "Hold the mic or type…" : "Type your question…"}
              maxLength={600}
              aria-label="Ask the voice twin"
            />
            <button type="submit" className="assistant__send mono" data-testid="assistant-send" disabled={thinking || !draft.trim()}>
              Ask
            </button>
          </form>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
