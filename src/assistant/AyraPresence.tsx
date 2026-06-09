/* ============================================================================
   AyraPresence — AYRA's always-on signature. A small waveform orb anchored to
   the desktop that greets the visitor (time/return aware), breathes while idle,
   reacts while listening, and opens the AYRA twin on click. This is what makes
   the OS feel inhabited (Phase A — Persona Layer). Pure CSS motion (transform/
   opacity only); flattens under the in-app Motion control (html[data-motion=off]).
   ========================================================================== */

import { useOS } from "../lib/store";
import { getVisitState, greeting } from "../lib/visitor";
import "./ayra-presence.css";

export function AyraPresence() {
  const toggleAssistant = useOS((s) => s.toggleAssistant);
  const isOpen = useOS((s) => s.isAssistantOpen);
  const isListening = useOS((s) => s.isListening);

  const hello = getVisitState().isReturning ? "Welcome back" : greeting();

  return (
    <button
      type="button"
      className="ayra-orb"
      data-testid="ayra-orb"
      data-open={isOpen || undefined}
      data-listening={isListening || undefined}
      aria-label="Open AYRA — Kushagra's AI twin"
      onClick={toggleAssistant}
    >
      <span className="ayra-orb__label" aria-hidden="true">
        <span className="ayra-orb__hello mono">{hello}</span>
        <span className="ayra-orb__cta">
          I&rsquo;m <strong>AYRA</strong> — ask me anything
        </span>
      </span>

      <span className="ayra-orb__disc">
        <span className="ayra-orb__aura" data-testid="ayra-orb-pulse" aria-hidden="true" />
        <span className="ayra-orb__core" aria-hidden="true">
          <i className="ayra-orb__bar" />
          <i className="ayra-orb__bar" />
          <i className="ayra-orb__bar" />
          <i className="ayra-orb__bar" />
        </span>
      </span>
    </button>
  );
}
