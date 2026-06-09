/* ============================================================================
   Mission Mode — the JARVIS centerpiece (Phase D). Type ONE goal and watch AYRA
   run her whole growth team: a live Scout → Analyst → Closer → Muse → Strategist
   hand-off, then an assembled growth-plan artifact (Style-Lock framed). One
   orchestration call returns the plan; the front-end choreographs the reveal so
   it FEELS like five agents working in sequence. Degrades gracefully (no key →
   rich fallback). Motion is gated by the OS Motion policy via CSS.
   ========================================================================== */

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { ArtifactFrame } from "./ArtifactFrame";
import { recordLead } from "../lib/leads";
import {
  MISSION_ORDER, MISSION_EXAMPLES, MISSION_IDENTITY, missionAgentMeta,
  runMissionClient, type MissionPlan, type MissionReply,
} from "./mission";
import "./mission.css";

type Phase = "idle" | "running" | "done";

/** Minimum visible "assembling" window so the live hand-off reads even when the
    model responds fast. */
const MIN_ASSEMBLE_MS = 1100;
/** Cadence of the staged step reveal (ms between agents landing). */
const REVEAL_MS = 720;

export function MissionMode({ onBack }: { onBack: () => void }) {
  const [goal, setGoal] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [reply, setReply] = useState<MissionReply | null>(null);
  const [revealed, setRevealed] = useState(0);

  const abortRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<number | null>(null);

  const clearReveal = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => () => { abortRef.current?.abort(); clearReveal(); }, [clearReveal]);

  const startReveal = useCallback((plan: MissionPlan) => {
    clearReveal();
    setRevealed(1);
    if (plan.steps.length <= 1) { setPhase("done"); return; }
    intervalRef.current = window.setInterval(() => {
      setRevealed((r) => {
        const next = Math.min(r + 1, plan.steps.length);
        if (next >= plan.steps.length) { clearReveal(); setPhase("done"); }
        return next;
      });
    }, REVEAL_MS);
  }, [clearReveal]);

  const run = useCallback((value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    recordLead("mission", trimmed);
    abortRef.current?.abort();
    clearReveal();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setPhase("running");
    setReply(null);
    setRevealed(0);
    const started = Date.now();
    runMissionClient(trimmed, ctrl.signal)
      .then(async (r) => {
        const elapsed = Date.now() - started;
        if (elapsed < MIN_ASSEMBLE_MS) {
          await new Promise((res) => setTimeout(res, MIN_ASSEMBLE_MS - elapsed));
        }
        if (ctrl.signal.aborted) return;
        setReply(r);
        startReveal(r.plan);
      })
      .catch(() => { if (!ctrl.signal.aborted) setPhase("idle"); });
  }, [clearReveal, startReveal]);

  const assembling = phase === "running" && !reply;
  const plan = reply?.plan ?? null;
  const isBusy = phase === "running";

  return (
    <div className="mission" data-testid="mission-mode" data-phase={phase}>
      <button type="button" className="studio__back" onClick={onBack} data-testid="mission-back">
        ‹ All agents
      </button>

      <header className="mission__head">
        <p className="mission__kicker mono">MISSION MODE</p>
        <h2 className="mission__title">Give AYRA one goal. Watch the whole team run.</h2>
        <p className="mission__sub">
          AYRA orchestrates five agents end to end — finds your people, studies them,
          reaches out, pulls inbound, and hands you a 2-week plan.
        </p>
      </header>

      <form
        className="mission__form"
        onSubmit={(e) => { e.preventDefault(); run(goal); }}
      >
        <label className="studio__label mono" htmlFor="mission-input">YOUR GOAL</label>
        <div className="mission__inputrow">
          <input
            id="mission-input"
            className="mission__input"
            data-testid="mission-input"
            value={goal}
            placeholder='e.g. "I run a skincare brand — get me customers"'
            onChange={(e) => setGoal(e.target.value)}
            disabled={isBusy}
          />
          <button type="submit" className="mission__run" data-testid="mission-run" disabled={isBusy || !goal.trim()}>
            {isBusy ? "Running…" : "Run mission"}
          </button>
        </div>
        <div className="studio__examples">
          {MISSION_EXAMPLES.map((ex) => (
            <button
              type="button" key={ex} className="studio__chip" disabled={isBusy}
              onClick={() => { setGoal(ex); run(ex); }}
            >
              {ex}
            </button>
          ))}
        </div>
      </form>

      {phase !== "idle" && (
        <ol className="mission__pipeline" data-testid="mission-pipeline" data-assembling={assembling}>
          {MISSION_ORDER.map((agent, i) => {
            const meta = missionAgentMeta(agent);
            const state = i < revealed ? "done" : (assembling || i === revealed) && isBusy ? "active" : "pending";
            return (
              <li
                key={agent}
                className="mission__node"
                data-testid={`mission-node-${agent}`}
                data-state={state}
                style={{ "--agent-accent": meta.accent } as CSSProperties}
              >
                <span className="mission__node-dot" aria-hidden="true" />
                <span className="mission__node-name">{meta.name}</span>
              </li>
            );
          })}
        </ol>
      )}

      {assembling && (
        <div className="mission__assembling" data-testid="mission-assembling" aria-live="polite">
          <span className="mission__assembling-pulse" data-testid="mission-assembling-pulse" aria-hidden="true" />
          <span className="mono">AYRA is running the team — scouting, researching, drafting, planning…</span>
        </div>
      )}

      {plan && (
        <div className="mission__result" data-testid="mission-result">
          <ArtifactFrame agent={MISSION_IDENTITY} fallback={reply!.fallback}>
            <p className="mission__readout af-lead-in">{plan.readout}</p>

            <ol className="mission__steps">
              {plan.steps.slice(0, revealed).map((step, i) => {
                const meta = missionAgentMeta(step.agent);
                return (
                  <li
                    key={step.agent}
                    className="mission__step"
                    data-testid={`mission-step-${step.agent}`}
                    style={{ "--agent-accent": meta.accent } as CSSProperties}
                  >
                    <div className="mission__step-head">
                      <span className="mission__step-dot" aria-hidden="true" />
                      <span className="mission__step-index mono">{String(i + 1).padStart(2, "0")}</span>
                      <span className="mission__step-title">{step.title}</span>
                    </div>
                    <p className="mission__step-headline">{step.headline}</p>
                    {step.detail.length > 0 && (
                      <ul className="af-bullets">
                        {step.detail.map((d) => <li key={d}>{d}</li>)}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ol>

            {phase === "done" && (
              <div className="mission__summary" data-testid="mission-summary">
                <span className="af-label">The outcome</span>
                <p className="af-prose">{plan.summary}</p>
              </div>
            )}
          </ArtifactFrame>
        </div>
      )}
    </div>
  );
}
