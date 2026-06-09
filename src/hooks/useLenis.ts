/* ============================================================================
   useLenis — mount a single Lenis instance for the app lifetime.
   Call once near the root. Cleans up its RAF loop + instance on unmount.
   ========================================================================== */

import { useEffect } from "react";
import { startLenis } from "../lib/lenis";

export function useLenis(): void {
  useEffect(() => {
    const handle = startLenis();
    return () => handle.destroy();
  }, []);
}
