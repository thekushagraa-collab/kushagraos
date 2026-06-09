/* ============================================================================
   WindowManager — renders the open windows (minimized ones drop out and live
   in the dock until reopened). AnimatePresence drives open/close springs.
   When the desktop is empty, a quiet, designed hint invites ⌘K (never blank).
   ========================================================================== */

import { AnimatePresence, motion } from "framer-motion";
import { useOS } from "../lib/store";
import { Window } from "./Window";
import "./window-manager.css";

export function WindowManager() {
  const windows = useOS((s) => s.windows);
  const focusedId = useOS((s) => s.focusedId);
  const toggleCmdk = useOS((s) => s.toggleCmdk);

  const open = windows.filter((w) => !w.isMinimized);

  return (
    <div className="window-manager">
      <AnimatePresence>
        {open.map((win) => (
          <Window key={win.id} win={win} isFocused={win.id === focusedId} />
        ))}
      </AnimatePresence>

      {open.length === 0 && (
        <motion.button
          type="button"
          className="desktop-hint"
          onClick={toggleCmdk}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <span className="desktop-hint__line mono">SYSTEM READY</span>
          <span className="desktop-hint__hint">
            Open an app from the dock, or press{" "}
            <kbd className="mono">⌘K</kbd> to go anywhere.
          </span>
        </motion.button>
      )}
    </div>
  );
}
