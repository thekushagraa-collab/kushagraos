/* ============================================================================
   App — KushagraOS root (Phase 2: OS shell)
   Mounts the smooth-scroll engine and the global FX layer (Signal Field + film
   grain + custom cursor), then the OS Shell: Boot → Desktop / MobileHome, with
   the ⌘K command bar. The Signal Field shows through the whole OS.
   ========================================================================== */

import { useLenis } from "./hooks/useLenis";
import { SignalField } from "./components/fx/SignalField";
import { FilmGrain } from "./components/fx/FilmGrain";
import { CustomCursor } from "./components/fx/CustomCursor";
import { ContextMenu } from "./components/ui/ContextMenu";
import { Shell } from "./os/Shell";

function App() {
  useLenis();

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
