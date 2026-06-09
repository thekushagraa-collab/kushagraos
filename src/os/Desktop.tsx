/* ============================================================================
   Desktop — the true desktop environment: top MenuBar, draggable app windows,
   and the magnifying Dock. The Signal Field shows through behind everything.
   ========================================================================== */

import { MenuBar } from "./MenuBar";
import { WindowManager } from "./WindowManager";
import { Dock } from "./Dock";

export function Desktop() {
  return (
    <>
      <MenuBar />
      <WindowManager />
      <Dock />
    </>
  );
}
