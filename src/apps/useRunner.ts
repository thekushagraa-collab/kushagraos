/* ============================================================================
   useRunner — shared run-state for the WORK apps. Calls /api/run (via runApp),
   tracks the in-flight "executing" state, and enforces a minimum visible run so
   the pipeline animation reads as real (and is deterministically sampleable by
   the DoD assertAnimating test) even when the server answers instantly.
   ========================================================================== */

import { useCallback, useEffect, useRef, useState } from "react";
import { runApp, type RunApp, type RunReply } from "./runApp";

/** Keep the executing pipeline on-screen at least this long. */
const MIN_RUN_MS = 1100;

export function useRunner<K extends RunApp>(app: K) {
  const [running, setRunning] = useState(false);
  const [reply, setReply] = useState<RunReply<K> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const run = useCallback(
    (input: string) => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setRunning(true);
      const started = Date.now();

      runApp(app, input, ctrl.signal)
        .then(async (r) => {
          const elapsed = Date.now() - started;
          if (elapsed < MIN_RUN_MS) {
            await new Promise((res) => setTimeout(res, MIN_RUN_MS - elapsed));
          }
          if (ctrl.signal.aborted) return;
          setReply(r);
          setRunning(false);
        })
        .catch(() => {
          if (!ctrl.signal.aborted) setRunning(false);
        });
    },
    [app],
  );

  return { running, reply, run };
}
