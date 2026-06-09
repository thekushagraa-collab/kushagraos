/* ============================================================================
   Automation Center — AYRA's autonomous growth studio (Phase C surface).
   Pick an agent → run it on real input → see the branded Style-Lock artifact.
   Reuses the live agent engine (/api/agent) with graceful fallback. A minimum
   visible run keeps the "agent working" state readable + sampleable.
   ========================================================================== */

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { AGENTS, getAgent, runAgentClient, type AgentId, type AgentReply } from "./agents";
import { ArtifactFrame } from "./ArtifactFrame";
import { AgentArtifact } from "./AgentArtifact";
import { MissionMode } from "./MissionMode";
import "./automation-center.css";

const MIN_RUN_MS = 1200;

export function AutomationCenter() {
  const [mission, setMission] = useState(false);
  const [selected, setSelected] = useState<AgentId | null>(null);
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const [reply, setReply] = useState<AgentReply<AgentId> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const open = useCallback((id: AgentId) => {
    setSelected(id);
    setInput("");
    setReply(null);
    setRunning(false);
  }, []);

  const run = useCallback((id: AgentId, value: string) => {
    if (!value.trim()) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setRunning(true);
    setReply(null);
    const started = Date.now();
    runAgentClient(id, value, ctrl.signal)
      .then(async (r) => {
        const elapsed = Date.now() - started;
        if (elapsed < MIN_RUN_MS) await new Promise((res) => setTimeout(res, MIN_RUN_MS - elapsed));
        if (ctrl.signal.aborted) return;
        setReply(r);
        setRunning(false);
      })
      .catch(() => { if (!ctrl.signal.aborted) setRunning(false); });
  }, []);

  if (mission) {
    return (
      <div className="studio" data-testid="automation-center">
        <MissionMode onBack={() => setMission(false)} />
      </div>
    );
  }

  if (!selected) {
    return (
      <div className="studio" data-testid="automation-center">
        <header className="studio__head">
          <p className="studio__kicker mono">AUTOMATION CENTER</p>
          <h2 className="studio__title">AYRA&rsquo;s autonomous growth studio</h2>
          <p className="studio__sub">Six agents you can run right now. Each returns a real artifact — try one.</p>
        </header>

        <button
          type="button"
          className="mission-hero"
          data-testid="mission-open"
          onClick={() => setMission(true)}
        >
          <span className="mission-hero__glow" aria-hidden="true" />
          <span className="mission-hero__kicker mono">MISSION MODE</span>
          <span className="mission-hero__title">Give AYRA one goal. Watch the whole team run.</span>
          <span className="mission-hero__sub">
            One prompt orchestrates all six agents end to end into a single growth plan.
          </span>
          <span className="mission-hero__cta">Run a mission →</span>
        </button>

        <div className="studio__grid">
          {AGENTS.map((a) => (
            <button
              type="button"
              key={a.id}
              className="agent-card"
              data-testid={`agent-card-${a.id}`}
              style={{ "--agent-accent": a.accent } as CSSProperties}
              onClick={() => open(a.id)}
            >
              <span className="agent-card__dot" aria-hidden="true" />
              <span className="agent-card__name">{a.name}</span>
              <span className="agent-card__role mono">{a.role}</span>
              <span className="agent-card__blurb">{a.blurb}</span>
              <span className="agent-card__metric">{a.metric}</span>
              <span className="agent-card__cta">Try {a.name} →</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const agent = getAgent(selected);
  return (
    <div className="studio" data-testid="automation-center" style={{ "--agent-accent": agent.accent } as CSSProperties}>
      <button type="button" className="studio__back" onClick={() => setSelected(null)} data-testid="studio-back">
        ‹ All agents
      </button>

      <header className="studio__runhead">
        <span className="agent-card__dot" aria-hidden="true" />
        <div>
          <h2 className="studio__title">{agent.name}</h2>
          <p className="studio__sub">{agent.role} — {agent.blurb}</p>
        </div>
      </header>

      <form
        className="studio__form"
        onSubmit={(e) => { e.preventDefault(); run(selected, input); }}
      >
        <label className="studio__label mono" htmlFor="agent-input">{agent.inputLabel}</label>
        <div className="studio__inputrow">
          <input
            id="agent-input"
            className="studio__input"
            data-testid="agent-input"
            value={input}
            placeholder={agent.placeholder}
            onChange={(e) => setInput(e.target.value)}
            disabled={running}
          />
          <button type="submit" className="studio__run" data-testid="agent-run" disabled={running || !input.trim()}>
            {running ? "Running…" : "Run"}
          </button>
        </div>
        <div className="studio__examples">
          {agent.examples.map((ex) => (
            <button type="button" key={ex} className="studio__chip" disabled={running}
              onClick={() => { setInput(ex); run(selected, ex); }}>
              {ex}
            </button>
          ))}
        </div>
      </form>

      {running && (
        <div className="studio__working" data-testid="agent-working" aria-live="polite">
          <span className="studio__pulse" data-testid="agent-working-pulse" aria-hidden="true" />
          <span className="mono">{agent.name} is working — researching, reasoning, drafting…</span>
        </div>
      )}

      {reply && !running && (
        <div className="studio__result" data-testid="agent-result">
          <ArtifactFrame agent={agent} fallback={reply.fallback}>
            <AgentArtifact agentId={selected} result={reply.result as Record<string, unknown>} />
          </ArtifactFrame>
        </div>
      )}
    </div>
  );
}
