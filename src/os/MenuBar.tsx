/* ============================================================================
   MenuBar — the always-present top system bar.
   Left: KushagraOS brand + live pulse, Apps (opens ⌘K — the real launcher).
   Center: live telemetry (clock + faint equalizer "uptime tick").
   Right: Ask (voice twin), Motion toggle, Theme toggle.
   ========================================================================== */

import { useEffect, useState } from "react";
import { useOS } from "../lib/store";
import { MotionToggle } from "../components/ui/MotionToggle";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import "./menubar.css";

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

const pad = (n: number) => String(n).padStart(2, "0");

export function MenuBar() {
  const now = useClock();
  const toggleCmdk = useOS((s) => s.toggleCmdk);
  const toggleAssistant = useOS((s) => s.toggleAssistant);
  const isAssistantOpen = useOS((s) => s.isAssistantOpen);

  const clock = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  return (
    <header className="menubar" data-testid="menubar">
      <div className="menubar__group">
        <span className="menubar__brand mono">
          <span className="menubar__pulse" aria-hidden="true" />
          KushagraOS
        </span>
        <button type="button" className="menubar__item mono" onClick={toggleCmdk}>
          Apps
        </button>
        <button
          type="button"
          className="menubar__item mono menubar__kbd"
          onClick={toggleCmdk}
          aria-label="Open command bar"
        >
          ⌘K
        </button>
      </div>

      <div className="menubar__telemetry" data-testid="telemetry-metric">
        <span className="menubar__eq" aria-hidden="true">
          <i /><i /><i /><i />
        </span>
        <span className="menubar__clock mono">{clock}</span>
      </div>

      <div className="menubar__group">
        <button
          type="button"
          className="menubar__ask mono"
          data-testid="voice-button"
          aria-pressed={isAssistantOpen}
          onClick={toggleAssistant}
        >
          <span className="menubar__ask-dot" aria-hidden="true" />
          Ask
        </button>
        <MotionToggle />
        <ThemeToggle />
      </div>
    </header>
  );
}
