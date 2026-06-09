/* ============================================================================
   AyraNarration — when an app comes to focus, AYRA drops a single, skippable
   one-line intro (Phase A — Persona Layer). Derives the "active app" from the
   focused desktop window or the full-screen mobile app, narrates on change,
   auto-dismisses. Transient + non-blocking (pointer-events: none).
   ========================================================================== */

import { useEffect, useRef, useState } from "react";
import { useOS } from "../lib/store";
import { NARRATION } from "../apps/registry";
import "./ayra-narration.css";

const DWELL_MS = 4200;

export function AyraNarration() {
  const focusedId = useOS((s) => s.focusedId);
  const windows = useOS((s) => s.windows);
  const mobileAppId = useOS((s) => s.mobileAppId);

  const [text, setText] = useState("");
  const [show, setShow] = useState(false);
  const lastApp = useRef<string | null>(null);
  const timer = useRef<number | null>(null);

  // Active app = full-screen mobile app, else the focused desktop window's app.
  const activeApp = mobileAppId ?? windows.find((w) => w.id === focusedId)?.appId ?? null;

  useEffect(() => {
    if (!activeApp) {
      lastApp.current = null;
      return;
    }
    if (activeApp === lastApp.current) return;
    lastApp.current = activeApp;

    setText(NARRATION[activeApp]);
    setShow(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setShow(false), DWELL_MS);
  }, [activeApp]);

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  return (
    <div
      className="ayra-narration"
      data-testid="ayra-narration"
      data-show={show ? "1" : undefined}
      aria-live="polite"
    >
      <div className="ayra-narration__pill">
        <span className="ayra-narration__tag mono">AYRA</span>
        <span className="ayra-narration__text">{text}</span>
      </div>
    </div>
  );
}
