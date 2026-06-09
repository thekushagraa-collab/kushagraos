/* ============================================================================
   AgentArtifact — renders each agent's structured result into a branded layout
   (inside ArtifactFrame). Reads defensively from the parsed result so partial /
   fallback data never crashes the UI. Styling is owned here (artifacts.css) —
   the model only supplies data (Style Lock).
   ========================================================================== */

import type { AgentId } from "./agents";

type Data = Record<string, unknown>;
const str = (v: unknown, fb = ""): string => (typeof v === "string" && v.trim() ? v : fb);
const num = (v: unknown, fb = 0): number => (typeof v === "number" && Number.isFinite(v) ? v : fb);
const list = (v: unknown): Data[] => (Array.isArray(v) ? (v as Data[]) : []);
const lines = (v: unknown): string[] => (Array.isArray(v) ? v.map((x) => str(x)).filter(Boolean) : []);

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="af-row">
      <span className="af-label mono">{label}</span>
      {children}
    </section>
  );
}

export function AgentArtifact({ agentId, result }: { agentId: AgentId; result: Data }) {
  switch (agentId) {
    case "scout": {
      const leads = list(result.leads);
      return (
        <>
          <Section label="ICP"><p className="af-lead-in">{str(result.icp, "—")}</p></Section>
          <Section label={`Qualified leads · ${leads.length}`}>
            <ul className="af-stack">
              {leads.map((l, i) => (
                <li className="af-card" key={i}>
                  <div className="af-card__top">
                    <span className="af-name">{str(l.name, "Lead")}</span>
                    <span className="af-handle mono">{str(l.handle)}</span>
                    <span className="af-score" data-strong={num(l.fitScore) >= 85 || undefined}>
                      {num(l.fitScore)}<i>fit</i>
                    </span>
                  </div>
                  <p className="af-meta mono">{str(l.followers)} · {str(l.link)}</p>
                  <p className="af-why">{str(l.why)}</p>
                  <p className="af-opener">“{str(l.opener)}”</p>
                </li>
              ))}
            </ul>
          </Section>
        </>
      );
    }
    case "closer": {
      const email = (result.email ?? {}) as Data;
      const fu = list(result.followups);
      return (
        <>
          <div className="af-headline">
            <span className="af-badge">Reply odds · {str(result.replyOdds, "—")}</span>
            <div className="af-chips">{lines(result.hooks).map((h, i) => <span className="af-chip" key={i}>{h}</span>)}</div>
          </div>
          <Section label="Cold email">
            <div className="af-card">
              <p className="af-subject mono">{str(email.subject, "(subject)")}</p>
              <p className="af-prose">{str(email.body)}</p>
            </div>
          </Section>
          <Section label="Follow-up sequence">
            <ul className="af-stack">
              {fu.map((f, i) => (
                <li className="af-card af-card--row" key={i}>
                  <span className="af-day mono">Day {num(f.day)}</span>
                  <p className="af-prose">{str(f.message)}</p>
                </li>
              ))}
            </ul>
          </Section>
        </>
      );
    }
    case "muse": {
      const video = (result.video ?? {}) as Data;
      return (
        <>
          <Section label="LinkedIn"><p className="af-prose af-card">{str(result.linkedin)}</p></Section>
          <Section label="X thread">
            <ol className="af-stack af-thread">
              {lines(result.tweetThread).map((t, i) => <li className="af-card af-prose" key={i}>{t}</li>)}
            </ol>
          </Section>
          <Section label="Short-form video">
            <div className="af-card">
              <p className="af-subject">{str(video.hook)}</p>
              <p className="af-prose">{str(video.script)}</p>
            </div>
          </Section>
          <Section label="Carousel">
            <div className="af-chips af-chips--wrap">{lines(result.carousel).map((c, i) => <span className="af-chip" key={i}>{i + 1}. {c}</span>)}</div>
          </Section>
        </>
      );
    }
    case "strategist": {
      const channels = list(result.channels);
      const cal = list(result.calendar);
      return (
        <>
          <Section label="Brief"><p className="af-lead-in">{str(result.product)} — <em>{str(result.goal)}</em></p></Section>
          <Section label="Channels">
            <ul className="af-stack">
              {channels.map((c, i) => (
                <li className="af-card af-card--row" key={i}>
                  <span className="af-name">{str(c.name)}</span>
                  <p className="af-prose">{str(c.why)}</p>
                </li>
              ))}
            </ul>
          </Section>
          <Section label="2-week calendar">
            <div className="af-grid2">
              {cal.map((w, i) => (
                <div className="af-card" key={i}>
                  <span className="af-day mono">Week {num(w.week, i + 1)} · {num(w.posts)} posts</span>
                  <p className="af-prose">{str(w.focus)}</p>
                </div>
              ))}
            </div>
          </Section>
          <Section label="KPIs">
            <div className="af-chips af-chips--wrap">{lines(result.kpis).map((k, i) => <span className="af-chip" key={i}>{k}</span>)}</div>
          </Section>
        </>
      );
    }
    case "concierge": {
      const intent = str(result.intent, "warm");
      return (
        <>
          <div className="af-headline">
            <span className="af-badge" data-intent={intent}>Intent · {intent}</span>
            <span className="af-chip">{str(result.crmTag)}</span>
          </div>
          <Section label="Incoming"><p className="af-prose af-card af-muted">{str(result.incoming)}</p></Section>
          <Section label="Drafted reply"><p className="af-prose af-card">{str(result.reply)}</p></Section>
          <Section label="Next action"><p className="af-opener">{str(result.nextAction)}</p></Section>
        </>
      );
    }
    case "analyst":
    default: {
      return (
        <>
          <Section label="Target"><p className="af-lead-in">{str(result.target, "—")}</p></Section>
          <Section label="Summary"><p className="af-prose af-card">{str(result.summary)}</p></Section>
          <Section label="Signals">
            <ul className="af-bullets">{lines(result.signals).map((s, i) => <li key={i}>{s}</li>)}</ul>
          </Section>
          <Section label="Pain points">
            <ul className="af-bullets">{lines(result.painPoints).map((p, i) => <li key={i}>{p}</li>)}</ul>
          </Section>
          <Section label="Pitch angle"><p className="af-opener">{str(result.pitchAngle)}</p></Section>
        </>
      );
    }
  }
}
