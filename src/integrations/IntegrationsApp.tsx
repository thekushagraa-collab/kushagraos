/* ============================================================================
   Integrations (Phase G) — a left rail of connected tools + a panel. Gmail /
   Calendar / Notion / Slack render simulated demo data behind a clear "DEMO
   ENVIRONMENT" banner. GitHub is the real, read-only exhibit (public repos via
   /api/github). Motion is transform/opacity only, gated by the OS Motion policy.
   ========================================================================== */

import { useEffect, useRef, useState, type CSSProperties, type ReactElement } from "react";
import {
  INTEGRATIONS, GITHUB_USER, fetchGithub,
  DEMO_GMAIL, DEMO_CALENDAR, DEMO_NOTION, DEMO_SLACK,
  type IntegrationId, type GithubReply,
} from "./integrations";
import "./integrations.css";

function DemoBanner() {
  return (
    <p className="intg__banner" data-testid="demo-banner">
      <span className="intg__banner-dot" aria-hidden="true" />
      DEMO ENVIRONMENT — simulated data inside KushagraOS, not a live account.
    </p>
  );
}

function GmailPanel() {
  return (
    <div className="intg__panel" data-testid="panel-gmail">
      <DemoBanner />
      <ul className="intg__mail">
        {DEMO_GMAIL.map((m) => (
          <li key={m.subject} className="intg__mail-row" data-unread={m.unread}>
            <span className="intg__mail-from">{m.from}</span>
            <span className="intg__mail-subject">{m.subject}</span>
            <span className="intg__mail-preview">{m.preview}</span>
            <span className="intg__mail-time mono">{m.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CalendarPanel() {
  return (
    <div className="intg__panel" data-testid="panel-calendar">
      <DemoBanner />
      <ul className="intg__agenda">
        {DEMO_CALENDAR.map((e) => (
          <li key={e.title} className="intg__event" data-kind={e.kind}>
            <span className="intg__event-time mono">{e.time}</span>
            <span className="intg__event-title">{e.title}</span>
            <span className="intg__event-kind mono">{e.kind}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NotionPanel() {
  return (
    <div className="intg__panel" data-testid="panel-notion">
      <DemoBanner />
      <ul className="intg__pages">
        {DEMO_NOTION.map((p) => (
          <li key={p.title} className="intg__page">
            <span className="intg__page-glyph mono" aria-hidden="true">{p.kind === "Database" ? "▦" : "▤"}</span>
            <span className="intg__page-title">{p.title}</span>
            <span className="intg__page-kind mono">{p.kind}</span>
            <span className="intg__page-edited">{p.edited}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SlackPanel() {
  return (
    <div className="intg__panel" data-testid="panel-slack">
      <DemoBanner />
      <div className="intg__channel mono"># growth-ops</div>
      <ul className="intg__messages">
        {DEMO_SLACK.map((m, i) => (
          <li key={i} className="intg__msg">
            <span className="intg__msg-user">{m.user}</span>
            <span className="intg__msg-time mono">{m.time}</span>
            <p className="intg__msg-text">{m.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GithubPanel() {
  const [reply, setReply] = useState<GithubReply | null>(null);
  const [loading, setLoading] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    fetchGithub(GITHUB_USER, ctrl.signal)
      .then((r) => { if (!ctrl.signal.aborted) { setReply(r); setLoading(false); } })
      .catch(() => { if (!ctrl.signal.aborted) setLoading(false); });
    return () => ctrl.abort();
  }, []);

  return (
    <div className="intg__panel" data-testid="panel-github">
      <p className="intg__banner intg__banner--live" data-testid="live-banner">
        <span className="intg__banner-dot" aria-hidden="true" />
        LIVE · READ-ONLY — public repositories for @{GITHUB_USER}, fetched in real time.
      </p>

      {loading && (
        <div className="intg__loading" data-testid="github-loading">
          <span className="intg__loading-pulse" aria-hidden="true" />
          <span className="mono">Reaching GitHub…</span>
        </div>
      )}

      {!loading && reply && reply.repos.length > 0 && (
        <ul className="intg__repos" data-testid="github-repos">
          {reply.repos.map((r) => (
            <li key={r.name} className="intg__repo">
              <a className="intg__repo-name" href={r.url} target="_blank" rel="noopener noreferrer">{r.name}</a>
              <p className="intg__repo-desc">{r.description}</p>
              <div className="intg__repo-meta mono">
                <span>{r.language}</span>
                <span>★ {r.stars}</span>
                <span>{r.updated}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!loading && reply && reply.repos.length === 0 && (
        <div className="intg__empty" data-testid="github-empty">
          <p className="intg__empty-title">
            {reply.fallback ? "Couldn’t reach GitHub right now." : "No public repositories yet."}
          </p>
          <p className="intg__empty-sub">
            {reply.fallback
              ? "The live read-only connection is in place — try again shortly."
              : "New public work shows up here automatically, fetched live from GitHub."}
          </p>
          <a className="intg__empty-link" href={`https://github.com/${reply.user}`} target="_blank" rel="noopener noreferrer">
            View @{reply.user} on GitHub →
          </a>
        </div>
      )}
    </div>
  );
}

const PANELS: Record<IntegrationId, () => ReactElement> = {
  github: GithubPanel,
  gmail: GmailPanel,
  calendar: CalendarPanel,
  notion: NotionPanel,
  slack: SlackPanel,
};

export function IntegrationsApp() {
  const [active, setActive] = useState<IntegrationId>("github");
  const Panel = PANELS[active];

  return (
    <div className="intg" data-testid="integrations-app">
      <header className="intg__head">
        <p className="intg__kicker mono">INTEGRATIONS · RUNS ACROSS YOUR TOOLS</p>
        <h2 className="intg__title">AYRA plugs into the stack you already use.</h2>
        <p className="intg__sub">
          GitHub is live and read-only. The rest are a safe in-OS demo of how AYRA reads and acts across
          your tools — clearly labeled, never touching a real account on this public site.
        </p>
      </header>

      <div className="intg__body">
        <nav className="intg__rail" role="tablist" aria-label="Integrations">
          {INTEGRATIONS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={t.id === active}
              className="intg__tab"
              data-active={t.id === active}
              data-testid={`intg-tab-${t.id}`}
              style={{ "--intg-accent": t.accent } as CSSProperties}
              onClick={() => setActive(t.id)}
            >
              <span className="intg__tab-glyph mono" aria-hidden="true">{t.glyph}</span>
              <span className="intg__tab-name">{t.name}</span>
              <span className="intg__tab-badge mono">{t.real ? "LIVE" : "DEMO"}</span>
            </button>
          ))}
        </nav>

        <div className="intg__stage" style={{ "--intg-accent": INTEGRATIONS.find((i) => i.id === active)!.accent } as CSSProperties}>
          <Panel />
        </div>
      </div>
    </div>
  );
}
