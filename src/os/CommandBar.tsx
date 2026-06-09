/* ============================================================================
   CommandBar (⌘K) — the real launcher. Fuzzy search across apps + actions, and
   it EXECUTES (switch theme, toggle motion, email) — not just navigation.
   Keyboard-first: ↑/↓ to move, Enter to run, Esc to close. A tiny easter egg
   rewards the curious (Craft Doctrine: depth rewards).
   ========================================================================== */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOS } from "../lib/store";
import { appsForAudience } from "../apps/registry";
import { cn } from "../lib/cn";
import "./command-bar.css";

interface Command {
  id: string;
  label: string;
  hint: string;
  keywords?: string;
  /** Hidden from the empty-query browse list — only surfaces when searched. */
  hidden?: boolean;
  run: () => void;
}

/** Subsequence fuzzy match → score (lower = better), or null if no match. */
function fuzzyScore(query: string, text: string): number | null {
  if (!query) return 0;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  let ti = 0;
  let score = 0;
  let streak = 0;
  for (let qi = 0; qi < q.length; qi++) {
    const found = t.indexOf(q[qi], ti);
    if (found === -1) return null;
    score += found - ti; // gaps cost
    streak = found === ti ? streak + 1 : 0;
    score -= streak; // reward contiguous runs
    ti = found + 1;
  }
  return score;
}

export function CommandBar() {
  const isOpen = useOS((s) => s.isCmdkOpen);
  const setCmdkOpen = useOS((s) => s.setCmdkOpen);
  const openApp = useOS((s) => s.openApp);
  const setTheme = useOS((s) => s.setTheme);
  const toggleMotion = useOS((s) => s.toggleMotion);
  const openFounderGate = useOS((s) => s.openFounderGate);
  const theme = useOS((s) => s.theme);
  const motionOn = useOS((s) => s.motion);
  const audience = useOS((s) => s.audience);

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = useMemo<Command[]>(() => {
    const close = () => setCmdkOpen(false);
    const apps = appsForAudience(audience).map((app) => ({
      id: `open-${app.id}`,
      label: `Open ${app.title}`,
      hint: app.blurb,
      keywords: app.id,
      run: () => {
        openApp(app.id, app.title);
        close();
      },
    }));
    const actions: Command[] = [
      {
        id: "theme",
        label: theme === "day" ? "Switch to Night (Nocturne)" : "Switch to Day (Atelier)",
        hint: "Theme",
        keywords: "theme dark light day night",
        run: () => {
          setTheme(theme === "day" ? "night" : "day");
          close();
        },
      },
      {
        id: "motion",
        label: motionOn ? "Motion: turn Off" : "Motion: turn On",
        hint: "Flatten or restore animation",
        keywords: "motion animate reduce",
        run: () => {
          toggleMotion();
          close();
        },
      },
      {
        id: "email",
        label: "Email Kushagra",
        hint: "Initiate a process",
        keywords: "contact hire email reach",
        run: () => {
          openApp("contact", "Contact");
          close();
        },
      },
      {
        id: "sudo",
        label: "sudo hire kushagra",
        hint: "↵ to proceed",
        keywords: "easter egg terminal hire",
        run: () => {
          openApp("contact", "Contact");
          close();
        },
      },
      {
        // Founder Mode entry — hidden from browse, surfaces only on search, and
        // grants nothing itself: it just raises the server-gated passphrase.
        id: "founder",
        label: "Unlock Founder Mode",
        hint: "Operator only · passphrase",
        keywords: "founder sudo admin private control",
        hidden: true,
        run: () => {
          openFounderGate();
          close();
        },
      },
    ];
    return [...apps, ...actions];
  }, [audience, theme, motionOn, openApp, setTheme, toggleMotion, openFounderGate, setCmdkOpen]);

  const results = useMemo(() => {
    const hasQuery = query.trim() !== "";
    return commands
      .filter((c) => hasQuery || !c.hidden)
      .map((c) => ({ c, s: fuzzyScore(query, `${c.label} ${c.keywords ?? ""}`) }))
      .filter((r): r is { c: Command; s: number } => r.s !== null)
      .sort((a, b) => a.s - b.s)
      .map((r) => r.c);
  }, [commands, query]);

  // Reset + focus when opening.
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelected(0);
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelected((s) => Math.min(s, Math.max(0, results.length - 1)));
  }, [results.length]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setCmdkOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => (s + 1) % Math.max(1, results.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => (s - 1 + results.length) % Math.max(1, results.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      results[selected]?.run();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="cmdk-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onPointerDown={() => setCmdkOpen(false)}
        >
          <motion.div
            className="cmdk"
            data-testid="cmdk"
            role="dialog"
            aria-label="Command bar"
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -6, transition: { duration: 0.12 } }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            onPointerDown={(e) => e.stopPropagation()}
            onKeyDown={onKeyDown}
          >
            <input
              ref={inputRef}
              className="cmdk__input"
              data-testid="cmdk-input"
              type="text"
              placeholder="Search apps, or type a command…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Command search"
              autoComplete="off"
              spellCheck={false}
            />
            <ul className="cmdk__list" role="listbox">
              {results.length === 0 && (
                <li className="cmdk__empty mono">No matches — try “open”, “theme”, “motion”.</li>
              )}
              {results.map((c, i) => (
                <li key={c.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={i === selected}
                    className={cn("cmdk__row", i === selected && "cmdk__row--active")}
                    data-testid={`cmdk-item-${c.id}`}
                    onPointerEnter={() => setSelected(i)}
                    onClick={() => c.run()}
                  >
                    <span className="cmdk__label">{c.label}</span>
                    <span className="cmdk__hint mono">{c.hint}</span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
