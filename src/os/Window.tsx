/* ============================================================================
   Window — a draggable, focusable OS window with weight (spring physics).
   - Opens with a spring scale from 0.92 (genie-lite); closes on exit.
   - Dragged by its titlebar only (dragControls); commits position on drop.
   - Edge-snap: drop near a side → snaps to that half (tiling).
   - Double-click titlebar → maximize. Own glyph controls (NOT Apple lights).
   - Background windows dim + blur (depth-of-field) — applied by WindowManager.
   ========================================================================== */

import { useRef } from "react";
import {
  motion,
  useDragControls,
  useMotionValue,
  type PanInfo,
} from "framer-motion";
import { useOS, type OSWindow } from "../lib/store";
import { windowSpring } from "../lib/motion";
import { cn } from "../lib/cn";
import { AppContent } from "../apps/AppContent";
import "./window.css";

const SNAP_EDGE = 36; // px from a side that triggers edge-snap
const MENUBAR_H = 38;

export function Window({ win, isFocused }: { win: OSWindow; isFocused: boolean }) {
  const focusWindow = useOS((s) => s.focusWindow);
  const closeWindow = useOS((s) => s.closeWindow);
  const minimizeWindow = useOS((s) => s.minimizeWindow);
  const toggleMaximize = useOS((s) => s.toggleMaximize);
  const moveWindow = useOS((s) => s.moveWindow);
  const resizeWindow = useOS((s) => s.resizeWindow);

  const dragControls = useDragControls();
  const x = useMotionValue(win.x);
  const y = useMotionValue(win.y);
  const lastClick = useRef(0);

  const onDragEnd = (_e: unknown, info: PanInfo) => {
    void info;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let nx = x.get();
    let ny = y.get();

    // Edge-snap tiling: left/right half.
    if (nx <= SNAP_EDGE) {
      nx = 0;
      ny = MENUBAR_H;
      x.set(nx);
      y.set(ny);
      resizeWindow(win.id, Math.round(vw / 2), vh - MENUBAR_H - 96);
    } else if (nx + win.w >= vw - SNAP_EDGE) {
      nx = Math.round(vw / 2);
      ny = MENUBAR_H;
      x.set(nx);
      y.set(ny);
      resizeWindow(win.id, Math.round(vw / 2), vh - MENUBAR_H - 96);
    }
    moveWindow(win.id, nx, ny);
  };

  const onTitlePointerDown = (e: React.PointerEvent) => {
    focusWindow(win.id);
    // double-click → maximize
    const now = Date.now();
    if (now - lastClick.current < 320) {
      toggleMaximize(win.id);
    }
    lastClick.current = now;
    if (!win.isMaximized) dragControls.start(e);
  };

  return (
    <motion.section
      className={cn("window", isFocused && "window--focused", win.isMaximized && "window--max")}
      data-testid="window"
      data-app={win.appId}
      role="dialog"
      aria-label={win.title}
      style={win.isMaximized ? undefined : { x, y, width: win.w, height: win.h, zIndex: win.z }}
      drag={!win.isMaximized}
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      dragConstraints={{ left: 0, top: MENUBAR_H, right: 0, bottom: 0 }}
      dragElastic={0.04}
      onDragEnd={onDragEnd}
      onPointerDownCapture={() => focusWindow(win.id)}
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.94, opacity: 0, transition: { duration: 0.16 } }}
      transition={windowSpring}
    >
      <header
        className="window__bar"
        onPointerDown={onTitlePointerDown}
        onDoubleClick={() => toggleMaximize(win.id)}
      >
        <div className="window__controls" aria-hidden={false}>
          <button
            type="button"
            className="window__ctl window__ctl--close"
            aria-label="Close window"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => closeWindow(win.id)}
          />
          <button
            type="button"
            className="window__ctl window__ctl--min"
            aria-label="Minimize window"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => minimizeWindow(win.id)}
          />
          <button
            type="button"
            className="window__ctl window__ctl--max"
            aria-label="Maximize window"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => toggleMaximize(win.id)}
          />
        </div>
        <span className="window__title mono">{win.title}</span>
        <span className="window__spacer" aria-hidden="true" />
      </header>

      <div className="window__body">
        <AppContent id={win.appId} />
      </div>
    </motion.section>
  );
}
