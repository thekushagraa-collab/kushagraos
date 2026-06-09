/* ============================================================================
   ThemeToggle — Day/Night duality switch. A segmented pill that slides a
   thumb between Atelier (day) and Nocturne (night). Drives the Zustand store.
   ========================================================================== */

import { motion } from "framer-motion";
import { useOS } from "../../lib/store";
import "./theme-toggle.css";

export function ThemeToggle() {
  const theme = useOS((s) => s.theme);
  const setTheme = useOS((s) => s.setTheme);
  const isDay = theme === "day";

  return (
    <div
      className="theme-toggle"
      role="group"
      aria-label="Theme: Atelier day or Nocturne night"
    >
      <motion.span
        className="theme-toggle__thumb"
        aria-hidden="true"
        animate={{ x: isDay ? 0 : "100%" }}
        transition={{ type: "spring", stiffness: 420, damping: 34 }}
      />
      <button
        type="button"
        className="theme-toggle__opt"
        data-active={isDay}
        aria-pressed={isDay}
        data-testid={!isDay ? "theme-toggle" : undefined}
        onClick={() => setTheme("day")}
      >
        Atelier
      </button>
      <button
        type="button"
        className="theme-toggle__opt"
        data-active={!isDay}
        aria-pressed={!isDay}
        data-testid={isDay ? "theme-toggle" : undefined}
        onClick={() => setTheme("night")}
      >
        Nocturne
      </button>
    </div>
  );
}
