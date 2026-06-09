/* ============================================================================
   MotionToggle — the ONE control that flattens KushagraOS motion.
   The OS prefers-reduced-motion setting is intentionally ignored; the system
   animates by default. This menubar switch (default ON) is the only off-ramp.
   A labelled track whose thumb slides between OFF and ON, driving the store.
   ========================================================================== */

import { motion as fm } from "framer-motion";
import { useOS } from "../../lib/store";
import "./motion-toggle.css";

export function MotionToggle() {
  const motion = useOS((s) => s.motion);
  const toggleMotion = useOS((s) => s.toggleMotion);

  return (
    <button
      type="button"
      className="motion-toggle"
      data-testid="motion-toggle"
      data-on={motion}
      role="switch"
      aria-checked={motion}
      aria-label="Motion"
      onClick={toggleMotion}
    >
      <span className="motion-toggle__label mono">MOTION</span>
      <span className="motion-toggle__track" aria-hidden="true">
        <fm.span
          className="motion-toggle__thumb"
          animate={{ x: motion ? "100%" : "0%" }}
          transition={{ type: "spring", stiffness: 460, damping: 36 }}
        />
      </span>
    </button>
  );
}
