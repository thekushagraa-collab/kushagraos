/* ============================================================================
   ContextMenu — right-click anywhere gets an OS-styled menu, never the
   browser default (Craft Doctrine: nothing is ever default). Real actions:
   switch theme, copy link, jump to top. Spring-in from the click origin,
   keyboard-dismissable, viewport-clamped.
   ========================================================================== */

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOS } from "../../lib/store";
import "./context-menu.css";

interface MenuPos {
  x: number;
  y: number;
}

const MENU_W = 232;
const MENU_H = 188;

export function ContextMenu() {
  const [pos, setPos] = useState<MenuPos | null>(null);
  const [copied, setCopied] = useState(false);
  const theme = useOS((s) => s.theme);
  const toggleTheme = useOS((s) => s.toggleTheme);
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setPos(null), []);

  useEffect(() => {
    const onContext = (e: MouseEvent) => {
      e.preventDefault();
      const x = Math.min(e.clientX, window.innerWidth - MENU_W - 12);
      const y = Math.min(e.clientY, window.innerHeight - MENU_H - 12);
      setCopied(false);
      setPos({ x: Math.max(12, x), y: Math.max(12, y) });
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onScroll = () => close();

    window.addEventListener("contextmenu", onContext);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("contextmenu", onContext);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
    };
  }, [close]);

  // Focus the menu when it opens so keyboard dismissal works immediately.
  useEffect(() => {
    if (pos) ref.current?.focus();
  }, [pos]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(close, 700);
    } catch {
      close();
    }
  };

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    close();
  };

  const otherTheme = theme === "night" ? "Atelier · day" : "Nocturne · night";

  return (
    <AnimatePresence>
      {pos && (
        <>
          <div className="ctx-scrim" onClick={close} aria-hidden="true" />
          <motion.div
            ref={ref}
            className="ctx-menu"
            role="menu"
            tabIndex={-1}
            aria-label="System menu"
            style={{ left: pos.x, top: pos.y, transformOrigin: "top left" }}
            initial={{ opacity: 0, scale: 0.94, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -2 }}
            transition={{ type: "spring", stiffness: 520, damping: 32 }}
          >
            <div className="ctx-head mono">KushagraOS</div>
            <button type="button" className="ctx-item" role="menuitem" onClick={() => { toggleTheme(); close(); }}>
              <span className="ctx-item__label">Switch to {otherTheme}</span>
              <span className="ctx-item__key mono">⌥T</span>
            </button>
            <button type="button" className="ctx-item" role="menuitem" onClick={copyLink}>
              <span className="ctx-item__label">{copied ? "Link copied" : "Copy page link"}</span>
              <span className="ctx-item__key mono">⌘C</span>
            </button>
            <button type="button" className="ctx-item" role="menuitem" onClick={scrollTop}>
              <span className="ctx-item__label">Back to top</span>
              <span className="ctx-item__key mono">⇧↑</span>
            </button>
            <div className="ctx-sep" role="separator" />
            <div className="ctx-foot mono">⌘K launcher · phase 02</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
