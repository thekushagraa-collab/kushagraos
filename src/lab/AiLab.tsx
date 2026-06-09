/* ============================================================================
   AI Lab — the R&D wing (Phase E). Not product demos: explorations that prove
   Kushagra builds at the edge. Two exhibits run LIVE through /api/lab (real Groq
   + graceful fallback); the rest are designed concept cards with a "what I
   learned" note. Positions him as a builder-researcher, not a freelancer.
   Motion is gated by the OS Motion policy via CSS.
   ========================================================================== */

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { useOS } from "../lib/store";
import { useIsMobile } from "../hooks/useIsMobile";
import {
  runLabClient, type LabMode, type LabReply,
  type SelfCorrectResult, type PromptResult,
} from "./lab";
import "./lab.css";

const MIN_RUN_MS = 1000;

function useLabExhibit<M extends LabMode>(mode: M) {
  const [running, setRunning] = useState(false);
  const [reply, setReply] = useState<LabReply<M> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const run = useCallback((value: string) => {
    if (!value.trim()) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setRunning(true);
    setReply(null);
    const started = Date.now();
    runLabClient(mode, value, ctrl.signal)
      .then(async (r) => {
        const elapsed = Date.now() - started;
        if (elapsed < MIN_RUN_MS) await new Promise((res) => setTimeout(res, MIN_RUN_MS - elapsed));
        if (ctrl.signal.aborted) return;
        setReply(r);
        setRunning(false);
      })
      .catch(() => { if (!ctrl.signal.aborted) setRunning(false); });
  }, [mode]);

  return { running, reply, run };
}

/* ---- Exhibit 1: self-correcting agent ------------------------------------ */
function SelfCorrectExhibit() {
  const [input, setInput] = useState("");
  const { running, reply, run } = useLabExhibit("selfcorrect");
  const result = reply?.result as SelfCorrectResult | undefined;
  const hasResult = !!result?.improved && !running;

  return (
    <section className="lab-card lab-card--live" data-testid="lab-selfcorrect" style={{ "--lab-accent": "#7FC8B0" } as CSSProperties}>
      <header className="lab-card__head">
        <span className="lab-card__tag mono">LIVE EXHIBIT · 01</span>
        <h3 className="lab-card__title">Self-correcting agent</h3>
        <p className="lab-card__concept">
          An agent that critiques and revises its own output — draft → honest critique → improved draft.
          The eval mindset, running live.
        </p>
      </header>

      <form className="lab-run" onSubmit={(e) => { e.preventDefault(); run(input); }}>
        <input
          className="lab-input"
          data-testid="lab-selfcorrect-input"
          value={input}
          placeholder='Give it a topic — e.g. "why automation matters for small teams"'
          onChange={(e) => setInput(e.target.value)}
          disabled={running}
        />
        <button type="submit" className="lab-go" data-testid="lab-selfcorrect-run" disabled={running || !input.trim()}>
          {running ? "Thinking…" : "Run"}
        </button>
      </form>

      {running && (
        <div className="lab-working" data-testid="lab-selfcorrect-working">
          <span className="lab-working__pulse" aria-hidden="true" />
          <span className="mono">Drafting → critiquing itself → revising…</span>
        </div>
      )}

      {hasResult && (
        <div className="lab-stages" data-testid="lab-selfcorrect-result">
          <div className="lab-stage" data-stage="draft">
            <span className="lab-stage__label mono">DRAFT</span>
            <p className="lab-stage__text lab-stage__text--weak">{result!.draft}</p>
          </div>
          <div className="lab-stage" data-stage="critique">
            <span className="lab-stage__label mono">SELF-CRITIQUE</span>
            <ul className="lab-critique">
              {result!.critique.map((c) => <li key={c}>{c}</li>)}
            </ul>
          </div>
          <div className="lab-stage" data-stage="improved">
            <span className="lab-stage__label mono">IMPROVED</span>
            <p className="lab-stage__text">{result!.improved}</p>
          </div>
        </div>
      )}

      <p className="lab-card__learned">
        <span className="mono">WHAT I LEARNED —</span> the gain isn't a bigger model, it's a feedback loop:
        a cheap critique pass beats a single confident answer almost every time.
      </p>
    </section>
  );
}

/* ---- Exhibit 2: prompt architecture playground --------------------------- */
function PromptExhibit() {
  const [input, setInput] = useState("");
  const { running, reply, run } = useLabExhibit("prompt");
  const result = reply?.result as PromptResult | undefined;
  const hasResult = !!result?.rewritten && !running;

  return (
    <section className="lab-card lab-card--live" data-testid="lab-prompt" style={{ "--lab-accent": "#C8A86B" } as CSSProperties}>
      <header className="lab-card__head">
        <span className="lab-card__tag mono">LIVE EXHIBIT · 02</span>
        <h3 className="lab-card__title">Prompt architecture playground</h3>
        <p className="lab-card__concept">
          A naive prompt vs an engineered one, side by side, with the measurable quality delta.
          Prompt engineering is a discipline, not vibes.
        </p>
      </header>

      <form className="lab-run" onSubmit={(e) => { e.preventDefault(); run(input); }}>
        <input
          className="lab-input"
          data-testid="lab-prompt-input"
          value={input}
          placeholder='Paste a rough prompt — e.g. "write me a marketing email"'
          onChange={(e) => setInput(e.target.value)}
          disabled={running}
        />
        <button type="submit" className="lab-go" data-testid="lab-prompt-run" disabled={running || !input.trim()}>
          {running ? "Rewriting…" : "Upgrade"}
        </button>
      </form>

      {running && (
        <div className="lab-working" data-testid="lab-prompt-working">
          <span className="lab-working__pulse" aria-hidden="true" />
          <span className="mono">Adding role, context, constraints, format…</span>
        </div>
      )}

      {hasResult && (
        <div className="lab-prompt-grid" data-testid="lab-prompt-result">
          <div className="lab-prompt-col" data-kind="before">
            <span className="lab-stage__label mono">NAIVE · {result!.scoreBefore}/10</span>
            <p className="lab-stage__text lab-stage__text--weak">{result!.original}</p>
            <ScoreBar score={result!.scoreBefore} kind="before" />
          </div>
          <div className="lab-prompt-col" data-kind="after">
            <span className="lab-stage__label mono">ENGINEERED · {result!.scoreAfter}/10</span>
            <p className="lab-stage__text">{result!.rewritten}</p>
            <ScoreBar score={result!.scoreAfter} kind="after" />
          </div>
          <div className="lab-upgrades">
            <span className="lab-stage__label mono">UPGRADES</span>
            <ul className="lab-critique">
              {result!.upgrades.map((u) => <li key={u}>{u}</li>)}
            </ul>
            <p className="lab-delta mono" data-testid="lab-prompt-delta">
              +{Math.max(0, result!.scoreAfter - result!.scoreBefore)} quality points
            </p>
          </div>
        </div>
      )}

      <p className="lab-card__learned">
        <span className="mono">WHAT I LEARNED —</span> most "the AI is bad" problems are prompt problems.
        Role + context + constraints + format turns a coin-flip into a reliable tool.
      </p>
    </section>
  );
}

function ScoreBar({ score, kind }: { score: number; kind: "before" | "after" }) {
  return (
    <div className="lab-bar" data-kind={kind} aria-hidden="true">
      <span className="lab-bar__fill" style={{ "--pct": `${score * 10}%` } as CSSProperties} />
    </div>
  );
}

/* ---- Designed concept cards (non-interactive exhibits) ------------------- */
interface ConceptCard {
  tag: string;
  title: string;
  concept: string;
  learned: string;
  accent: string;
  cta?: { label: string; appId: "studio" | "assistant" };
}

const CONCEPTS: ConceptCard[] = [
  {
    tag: "EXHIBIT · 03", title: "Multi-agent orchestration", accent: "#6FB1E8",
    concept: "A team of agents hand off to solve one goal — find, research, reach out, create, plan. Watch the team think.",
    learned: "Orchestration beats one giant prompt: specialized agents with narrow jobs are easier to test, debug, and trust.",
    cta: { label: "See it in Mission Mode →", appId: "studio" },
  },
  {
    tag: "EXHIBIT · 04", title: "Knowledge grounding (RAG)", accent: "#8FA0E0",
    concept: "Grounded vs ungrounded answers about Kushagra — AYRA cites a curated knowledge base instead of guessing.",
    learned: "Grounding is how you trade hallucinations for trust: retrieve first, then answer only from what you retrieved.",
    cta: { label: "Ask AYRA anything →", appId: "assistant" },
  },
  {
    tag: "EXHIBIT · 05", title: "Agent eval harness", accent: "#6FD0C8",
    concept: "\"I test agents like software.\" Every feature ships against a Playwright acceptance map — including proof that motion actually animates.",
    learned: "If you can't measure an agent's output, you can't improve it. Evals turn vibes into a regression suite.",
  },
  {
    tag: "ROADMAP", title: "Future experiments", accent: "#C8A86B",
    concept: "Browser-use agents · autonomous research loops · on-device inference · long-horizon memory. The lab never closes.",
    learned: "The edge moves monthly. Staying a builder-researcher means always shipping the next experiment.",
  },
];

function ConceptExhibit({ card }: { card: ConceptCard }) {
  const openApp = useOS((s) => s.openApp);
  const openMobileApp = useOS((s) => s.openMobileApp);
  const isMobile = useIsMobile();
  const go = () => {
    if (!card.cta) return;
    const title = card.cta.appId === "studio" ? "Automation Center" : "AYRA";
    isMobile ? openMobileApp(card.cta.appId) : openApp(card.cta.appId, title);
  };
  return (
    <section className="lab-card" data-testid={`lab-concept-${card.title.split(" ")[0].toLowerCase()}`} style={{ "--lab-accent": card.accent } as CSSProperties}>
      <header className="lab-card__head">
        <span className="lab-card__tag mono">{card.tag}</span>
        <h3 className="lab-card__title">{card.title}</h3>
        <p className="lab-card__concept">{card.concept}</p>
      </header>
      <p className="lab-card__learned">
        <span className="mono">WHAT I LEARNED —</span> {card.learned}
      </p>
      {card.cta && (
        <button type="button" className="lab-link" onClick={go}>{card.cta.label}</button>
      )}
    </section>
  );
}

export function AiLab() {
  return (
    <div className="lab" data-testid="ai-lab">
      <header className="lab__head">
        <p className="lab__kicker mono">AI LAB · THE R&amp;D WING</p>
        <h2 className="lab__title">Explorations at the edge — not a brag list.</h2>
        <p className="lab__sub">
          Each exhibit is a concept, a small live experiment, and what I learned. Two run on real models
          right now; the rest are designed studies. This is the builder-researcher, working in the open.
        </p>
      </header>

      <div className="lab__grid">
        <SelfCorrectExhibit />
        <PromptExhibit />
        {CONCEPTS.map((c) => <ConceptExhibit key={c.title} card={c} />)}
      </div>
    </div>
  );
}
