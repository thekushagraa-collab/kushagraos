/* ============================================================================
   App — KushagraOS root (Phase 2: OS shell)
   Mounts the global FX layer (Signal Field + film grain + custom cursor), then
   the OS Shell: Boot → Desktop / MobileHome, with the ⌘K command bar. The
   Signal Field shows through the whole OS.

   NOTE: no global smooth-scroll engine. KushagraOS is an OS shell — content
   lives in fixed windows / full-screen panels that own their internal scroll.
   A document-level wheel hijacker (Lenis) intercepts the wheel before it
   reaches those inner scrollers, so native per-panel scrolling is used instead.
   ========================================================================== */

import { SignalField } from "./components/fx/SignalField";
import { FilmGrain } from "./components/fx/FilmGrain";
import { CustomCursor } from "./components/fx/CustomCursor";
import { ContextMenu } from "./components/ui/ContextMenu";
import { Shell } from "./os/Shell";

function App() {
  return (
    <>
      <SignalField />
      <Shell />
      <FilmGrain />
      <CustomCursor />
      <ContextMenu />
    </>
  );
}

export default App;
