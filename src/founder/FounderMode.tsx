/* ============================================================================
   FounderMode — the private control surface (Phase H).
   Renders only after the server gate unlocks. Strictly read-only: it surfaces
   integration health (server-reported booleans), visitor traffic, live system
   state, and the build timeline. No destructive actions, no public exposure —
   it is never registered as a dock app and never appears in ⌘K's app list.
   ========================================================================== */

import { motion } from "framer-motion";
import { useOS } from "../lib/store";
import { getVisitState } from "../lib/visitor";
import { BUILD_PHASES } from "./founder";
import { riseIn, stagger } from "../lib/motion";
import "./founder.css";

interface IntegrationRow {
  key: "groq" | "gemini" | "web3forms" | "github";
  label: string;
  note: string;
}

const INTEGRATIONS: ReadonlyArray<IntegrationRow> = [
  { key: "groq", label: "Groq", note: "AYRA's brain" },
  { key: "gemini", label: "Gemini", note: "voice / TTS" },
  { key: "web3forms", label: "Web3Forms", note: "contact delivery" },
  { key: "github", label: "GitHub token", note: "higher API limits" },
];

export function FounderMode() {
  const isUnlocked = useOS((s) => s.isFounderUnlocked);
  const status = useOS((s) => s.founderStatus);
  const lockFounder = useOS((s) => s.lockFounder);
  const theme = useOS((s) => s.theme);
  const motionOn = useOS((s) => s.motion);

  if (!isUnlocked) return null;

  const visit = getVisitState();
  const live = INTEGRATIONS.filter((i) => status?.[i.key]).length;

  return (
    <motion.div
      className="founder"
      data-testid="founder-mode"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="founder__inner"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <motion.header className="founder__head" variants={riseIn}>
          <div>
            <span className="founder__eyebrow mono">FOUNDER MODE · PRIVATE</span>
            <h1 className="founder__title">Control surface</h1>
            <p className="founder__sub">
              Operator-only. Everything here is read-only — a calm cockpit, not a
              kill switch.
            </p>
          </div>
          <button
            type="button"
            className="founder__exit mono"
            data-testid="founder-exit"
            onClick={() => lockFounder()}
          >
            Lock & exit ›
          </button>
        </motion.header>

        <div className="founder__grid">
          {/* Integration health -------------------------------------------- */}
          <motion.section
            className="founder__card founder__card--wide"
            data-testid="founder-status"
            variants={riseIn}
          >
            <div className="founder__card-head">
              <h2 className="founder__card-title">Integrations</h2>
              <span className="founder__count mono">{live}/{INTEGRATIONS.length} live</span>
            </div>
            <ul className="founder__pills">
              {INTEGRATIONS.map((i) => {
                const on = Boolean(status?.[i.key]);
                return (
                  <li
                    key={i.key}
                    className="founder__pill"
                    data-state={on ? "on" : "off"}
                    data-testid={`founder-intg-${i.key}`}
                  >
                    <span className="founder__pill-dot" aria-hidden="true" />
                    <span className="founder__pill-label">{i.label}</span>
                    <span className="founder__pill-note mono">{i.note}</span>
                    <span className="founder__pill-state mono">{on ? "LIVE" : "OFF"}</span>
                  </li>
                );
              })}
            </ul>
          </motion.section>

          {/* Traffic ------------------------------------------------------- */}
          <motion.section className="founder__card" data-testid="founder-traffic" variants={riseIn}>
            <h2 className="founder__card-title">Traffic (this device)</h2>
            <p className="founder__metric">{visit.visits}</p>
            <p className="founder__metric-label mono">
              {visit.visits === 1 ? "VISIT" : "VISITS"} · {visit.isReturning ? "RETURNING" : "FIRST TIME"}
            </p>
          </motion.section>

          {/* System ------------------------------------------------------- */}
          <motion.section className="founder__card" data-testid="founder-system" variants={riseIn}>
            <h2 className="founder__card-title">System</h2>
            <dl className="founder__kv">
              <div><dt className="mono">THEME</dt><dd>{theme === "day" ? "Atelier" : "Nocturne"}</dd></div>
              <div><dt className="mono">MOTION</dt><dd>{motionOn ? "On" : "Off"}</dd></div>
              <div><dt className="mono">BUILD</dt><dd>{import.meta.env.MODE}</dd></div>
            </dl>
          </motion.section>

          {/* Build timeline ----------------------------------------------- */}
          <motion.section
            className="founder__card founder__card--wide"
            data-testid="founder-build"
            variants={riseIn}
          >
            <h2 className="founder__card-title">Build timeline</h2>
            <ol className="founder__phases">
              {BUILD_PHASES.map((p) => (
                <li key={p.id} className="founder__phase" data-state={p.state}>
                  <span className="founder__phase-id mono">{p.id}</span>
                  <span className="founder__phase-label">{p.label}</span>
                  <span className="founder__phase-state mono">
                    {p.state === "shipped" ? "SHIPPED" : "ACTIVE"}
                  </span>
                </li>
              ))}
            </ol>
          </motion.section>
        </div>

        {/* persistent scan indicator — provable motion target */}
        <div className="founder__scan" aria-hidden="true">
          <span className="founder__scan-bead" data-testid="founder-pulse" />
        </div>
      </motion.div>
    </motion.div>
  );
}
