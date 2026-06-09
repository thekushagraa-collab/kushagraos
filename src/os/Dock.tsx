/* ============================================================================
   Dock — app launchers with macOS-style cursor magnification, built on spring
   physics (Craft Doctrine: physics, not transitions). Magnify animates the
   icon's WIDTH/HEIGHT (not scale): the flex row reflows so neighbours push
   apart instead of overlapping. Icons are our own line marks (AppIcon), not OS
   icon clones (differentiation mandate). Audience routing orders them.
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
import { AppIcon } from "../apps/AppIcon";
import "./dock.css";

const MAGNIFY_RANGE = 120; // px of cursor influence on each side
const BASE_SIZE = 44;
const MAX_SIZE = 64;

function DockIcon({ app, mouseX }: { app: AppMeta; mouseX: MotionValue<number> }) {
  const ref = useRef<HTMLButtonElement>(null);
  const openApp = useOS((s) => s.openApp);

  // Horizontal distance from cursor to this icon's center.
  const distance = useTransform(mouseX, (x) => {
    const b = ref.current?.getBoundingClientRect();
    if (!b) return MAGNIFY_RANGE * 2;
    return x - (b.x + b.width / 2);
  });
  // Drive SIZE (not scale) so the flex layout reserves real space and neighbours
  // slide outward — eliminating the overlap that pure-scale magnification caused.
  const sizeTarget = useTransform(
    distance,
    [-MAGNIFY_RANGE, 0, MAGNIFY_RANGE],
    [BASE_SIZE, MAX_SIZE, BASE_SIZE],
  );
  const size = useSpring(sizeTarget, { stiffness: 300, damping: 24, mass: 0.22 });

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
        style={{ width: size, height: size }}
      >
        <AppIcon id={app.id} className="dock__icon-svg" />
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
