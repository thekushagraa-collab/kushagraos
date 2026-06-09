/* Reports whether the viewport is in the phone-OS form factor. Concurrent-safe
   via useSyncExternalStore (the supported way to read an external/browser store). */

import { useSyncExternalStore } from "react";

const QUERY = "(max-width: 760px)";

function subscribe(callback: () => void): () => void {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

const getSnapshot = () => window.matchMedia(QUERY).matches;

export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
