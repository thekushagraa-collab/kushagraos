/* ============================================================================
   Foundation — the Phase 1 verification surface.
   Not the final OS shell (that is Phase 2). This is a deliberately composed
   "foundation layer" readout that exercises the whole design system: the
   KUSHAGRA wordmark, both type families, the live palette, the hairline grid,
   grain, custom cursor, and one orchestrated staggered reveal.
   ========================================================================== */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useOS } from "../../lib/store";
import { riseIn, scaleIn, stagger } from "../../lib/motion";
import { getVisitState, greeting, recordVisit } from "../../lib/visitor";
import { ThemeToggle } from "../ui/ThemeToggle";
import { MotionToggle } from "../ui/MotionToggle";
import "./foundation.css";

const PALETTE_TOKENS = [
  "--bg",
  "--surface",
  "--surface-2",
  "--text",
  "--accent",
  "--accent-strong",
] as const;

const MODULES = [
  "Design tokens",
  "Day / Night theme",
  "Type system",
  "Lenis smooth scroll",
  "Film grain",
  "Custom cursor",
  "OS state store",
] as const;

const TYPE_SPECIMENS = [
  { face: "Fraunces", role: "Display serif", cls: "spec--display", sample: "Operator" },
  { face: "General Sans", role: "Body", cls: "spec--body", sample: "Automation" },
  { face: "Geist Mono", role: "System labels", cls: "spec--mono", sample: "STATUS_OK" },
] as const;

/** Resolve the current value of each palette token from the live cascade. */
function usePaletteHexes(theme: string) {
  const [hexes, setHexes] = useState<Record<string, string>>({});
  useEffect(() => {
    const cs = getComputedStyle(document.documentElement);
    const next: Record<string, string> = {};
    for (const token of PALETTE_TOKENS) {
      next[token] = cs.getPropertyValue(token).trim().toUpperCase();
    }
    setHexes(next);
  }, [theme]);
  return hexes;
}

export function Foundation() {
  const theme = useOS((s) => s.theme);
  const hexes = usePaletteHexes(theme);
  const [isReturning, setIsReturning] = useState(false);

  useEffect(() => {
    setIsReturning(getVisitState().isReturning);
    recordVisit();
  }, []);

  const status = isReturning ? "WELCOME BACK" : "SYSTEM ONLINE";

  return (
    <div className="foundation">
      {/* proto status bar — a hint of the OS menubar to come */}
      <header className="foundation__bar">
        <span className="foundation__brand mono">
          <span className="foundation__pulse" aria-hidden="true" />
          KushagraOS
        </span>
        <span className="foundation__bar-mid mono">FOUNDATION&nbsp;·&nbsp;PHASE 01</span>
        <div className="foundation__bar-controls">
          <MotionToggle />
          <ThemeToggle />
        </div>
      </header>

      <motion.main
        className="foundation__main"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* hero */}
        <section className="hero" aria-labelledby="kos-name">
          <motion.p className="hero__label mono" variants={riseIn}>
            {greeting()} · {status}
          </motion.p>
          <motion.h1 id="kos-name" className="hero__name" variants={riseIn}>
            <span className="hero__name-text" data-testid="hero-wordmark">
              KUSHAGRA
            </span>
          </motion.h1>
          <motion.p className="hero__role mono" variants={riseIn}>
            AI&nbsp;AUTOMATION&nbsp;OPERATOR
          </motion.p>
          <motion.p className="hero__line" variants={riseIn}>
            I build the <em>0.1%</em> of the system that quietly runs the
            other&nbsp;99.9%.
          </motion.p>
        </section>

        {/* design-system readout */}
        <motion.section className="grid" variants={stagger} aria-label="Design system">
          {/* palette */}
          <motion.article className="panel panel--palette" variants={scaleIn}>
            <h2 className="panel__title mono">PALETTE</h2>
            <ul className="swatches">
              {PALETTE_TOKENS.map((token) => (
                <li className="swatch" key={token}>
                  <span
                    className="swatch__chip"
                    style={{ background: `var(${token})` }}
                  />
                  <span className="swatch__meta mono">
                    <span className="swatch__token">{token}</span>
                    <span className="swatch__hex">{hexes[token] ?? "—"}</span>
                  </span>
                </li>
              ))}
            </ul>
          </motion.article>

          {/* typography */}
          <motion.article className="panel panel--type" variants={scaleIn}>
            <h2 className="panel__title mono">TYPEFACES</h2>
            <ul className="specimens">
              {TYPE_SPECIMENS.map((s) => (
                <li className="specimen" key={s.face}>
                  <span className={`specimen__sample ${s.cls}`}>{s.sample}</span>
                  <span className="specimen__meta mono">
                    <span className="specimen__face">{s.face}</span>
                    <span className="specimen__role">{s.role}</span>
                  </span>
                </li>
              ))}
            </ul>
          </motion.article>

          {/* boot checklist */}
          <motion.article className="panel panel--modules" variants={scaleIn}>
            <h2 className="panel__title mono">FOUNDATION MODULES</h2>
            <ul className="modules">
              {MODULES.map((m, i) => (
                <li className="module mono" key={m}>
                  <span className="module__idx">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="module__name">{m}</span>
                  <span className="module__state">READY</span>
                </li>
              ))}
            </ul>
          </motion.article>
        </motion.section>
      </motion.main>

      <footer className="foundation__foot mono">
        <span>PHASE 01 / 06 · FOUNDATION</span>
        <span className="foundation__foot-hint">scroll · ⌘K coming in phase 02</span>
        <span>© 2026 KUSHAGRA</span>
      </footer>
    </div>
  );
}
