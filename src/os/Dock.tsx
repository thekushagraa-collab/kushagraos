/* ============================================================================
   Dock — app launchers with macOS-style cursor magnification, built on spring
   physics (Craft Doctrine: physics, not transitions). Magnify uses transform
   `scale` only (never width/layout). Icons are our own glyph monograms, not
   Apple icon clones (differentiation mandate). Audience routing orders them.
   ========================================================================== */

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useOS } from "../lib/store";
import { appsForAudience, type AppMeta } from "../apps/registry";
import "./dock.css";

const MAGNIFY_RANGE = 130; // px of cursor influence on each side
const MAX_SCALE = 1.62;

function DockIcon({ app, mouseX }: { app: AppMeta; mouseX: MotionValue<number> }) {
  const ref = useRef<HTMLButtonElement>(null);
  const openApp = useOS((s) => s.openApp);

  // Horizontal distance from cursor to this icon's center.
  const distance = useTransform(mouseX, (x) => {
    const b = ref.current?.getBoundingClientRect();
    if (!b) return MAGNIFY_RANGE * 2;
    return x - (b.x + b.width / 2);
  });
  const scaleTarget = useTransform(
    distance,
    [-MAGNIFY_RANGE, 0, MAGNIFY_RANGE],
    [1, MAX_SCALE, 1],
  );
  const scale = useSpring(scaleTarget, { stiffness: 320, damping: 22, mass: 0.25 });

  return (
    <button
      ref={ref}
      type="button"
      className="dock__icon-btn"
      data-testid={`app-launcher-${app.id}`}
      aria-label={`Open ${app.title}`}
      onClick={() => openApp(app.id, app.title)}
    >
      <span className="dock__tooltip mono" aria-hidden="true">{app.short}</span>
      <motion.span
        className="dock__icon"
        data-group={app.group}
        style={{ scale }}
      >
        <span className="dock__glyph mono">{app.abbr}</span>
      </motion.span>
    </button>
  );
}

export function Dock() {
  const audience = useOS((s) => s.audience);
  const apps = appsForAudience(audience);
  const mouseX = useMotionValue(Number.POSITIVE_INFINITY);

  return (
    <nav
      className="dock"
      data-testid="dock"
      aria-label="Application dock"
      onMouseMove={(e) => mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(Number.POSITIVE_INFINITY)}
    >
      <div className="dock__inner">
        {apps.map((app) => (
          <DockIcon key={app.id} app={app} mouseX={mouseX} />
        ))}
      </div>
    </nav>
  );
}
