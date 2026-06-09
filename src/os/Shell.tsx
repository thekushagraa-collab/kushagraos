/* ============================================================================
   Shell — top-level OS router. Boot → (Desktop | MobileHome by form factor).
   Owns the global ⌘K / Ctrl+K shortcut once booted; the command bar is mounted
   alongside so it can open over either form factor.
   ========================================================================== */

import { useEffect } from "react";
import { useOS } from "../lib/store";
import { useIsMobile } from "../hooks/useIsMobile";
import { Boot } from "./Boot";
import { Desktop } from "./Desktop";
import { MobileHome } from "./MobileHome";
import { CommandBar } from "./CommandBar";
import { VoiceAssistant } from "../assistant/VoiceAssistant";
import { AyraPresence } from "../assistant/AyraPresence";
import { AyraNarration } from "../assistant/AyraNarration";

export function Shell() {
  const isBooted = useOS((s) => s.isBooted);
  const toggleCmdk = useOS((s) => s.toggleCmdk);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isBooted) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggleCmdk();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isBooted, toggleCmdk]);

  if (!isBooted) return <Boot />;

  return (
    <>
      {/* Landmark only — `display: contents` generates no box, so the OS layout
          (fixed menubar/dock, full-height mobile panels) is unaffected. */}
      <main aria-label="KushagraOS" style={{ display: "contents" }}>
        {isMobile ? <MobileHome /> : <Desktop />}
      </main>
      <CommandBar />
      <AyraNarration />
      <AyraPresence />
      <VoiceAssistant />
    </>
  );
}
