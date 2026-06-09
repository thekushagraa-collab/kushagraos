/* ============================================================================
   Files (Phase F) — an in-OS document viewer. A left index of documents (résumé
   + case studies, built from real content) and a right reading pane. The résumé
   is a live-rendered document with a "Save as PDF" (browser print) action; case
   studies reuse the Work content. Keeps everything inside the OS — no downloads
   dead-ends, no broken links.
   ========================================================================== */

import { useState } from "react";
import { WORK, SERVICES, JOURNEY, CONTACT_LINKS } from "../content/content";
import "./files.css";

type DocId = "resume" | string;

interface DocEntry { id: DocId; title: string; kind: string; }

const DOCS: DocEntry[] = [
  { id: "resume", title: "Résumé", kind: "PDF" },
  ...WORK.map((w) => ({ id: `case-${w.id}`, title: w.title, kind: "CASE" })),
];

function ResumeDoc() {
  const live = WORK.filter((w) => w.status === "live");
  return (
    <article className="doc" data-testid="doc-resume">
      <header className="doc__masthead">
        <div>
          <h1 className="doc__name">Kushagra</h1>
          <p className="doc__role mono">AI AUTOMATION OPERATOR</p>
        </div>
        <button type="button" className="doc__download mono" data-testid="files-download" onClick={() => window.print()}>
          ⤓ Save as PDF
        </button>
      </header>

      <p className="doc__summary">
        I build the 0.1% of the system that quietly runs the other 99.9% — Claude/Gemini agents wired
        into real operations, with spend caps, evals, and a clean handover. This portfolio is one of them,
        running.
      </p>

      <section className="doc__section">
        <h2 className="doc__h2">What I do</h2>
        <ul className="doc__grid2">
          {SERVICES.map((s) => (
            <li key={s.id} className="doc__line">
              <span className="doc__line-key">{s.label}</span>
              <span className="doc__line-val">{s.note}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="doc__section">
        <h2 className="doc__h2">Selected work</h2>
        {live.map((w) => (
          <div key={w.id} className="doc__work">
            <span className="doc__work-title">{w.title}</span>
            <span className="doc__work-tag">{w.tagline}</span>
            <span className="doc__work-out">{w.outcome}</span>
          </div>
        ))}
      </section>

      <section className="doc__section">
        <h2 className="doc__h2">Trajectory</h2>
        <ul className="doc__timeline">
          {JOURNEY.map((j) => (
            <li key={j.date} className="doc__entry">
              <span className="doc__entry-date mono">{j.date}</span>
              <span className="doc__entry-title">{j.title}</span>
              <span className="doc__entry-note">{j.note}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="doc__section">
        <h2 className="doc__h2">Contact</h2>
        <ul className="doc__contacts">
          {CONTACT_LINKS.map((l) => (
            <li key={l.label}>
              <a className="doc__contact mono" href={l.href} target={l.href.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer">
                {l.label} ›
              </a>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}

function CaseDoc({ caseId }: { caseId: string }) {
  const w = WORK.find((x) => x.id === caseId);
  if (!w) return <p className="doc__empty">Document not found.</p>;
  return (
    <article className="doc" data-testid={`doc-case-${w.id}`}>
      <header className="doc__masthead">
        <div>
          <h1 className="doc__name doc__name--case">{w.title}</h1>
          <p className="doc__role mono">{w.status === "live" ? "LIVE BUILD" : "CASE STUDY"} · {w.tagline}</p>
        </div>
      </header>
      <section className="doc__section"><h2 className="doc__h2">Problem</h2><p className="doc__prose">{w.problem}</p></section>
      <section className="doc__section"><h2 className="doc__h2">Build</h2><p className="doc__prose">{w.build}</p></section>
      <section className="doc__section"><h2 className="doc__h2">Outcome</h2><p className="doc__prose doc__prose--em">{w.outcome}</p></section>
      <section className="doc__section">
        <h2 className="doc__h2">Stack</h2>
        <ul className="doc__stack">{w.stack.map((s) => <li key={s} className="doc__chip">{s}</li>)}</ul>
      </section>
    </article>
  );
}

export function FilesApp() {
  const [active, setActive] = useState<DocId>("resume");

  return (
    <div className="files" data-testid="files-app">
      <aside className="files__index" data-testid="files-list">
        <p className="files__index-label mono">DOCUMENTS</p>
        <ul className="files__list">
          {DOCS.map((d) => (
            <li key={d.id}>
              <button
                type="button"
                className="files__item"
                data-active={d.id === active}
                data-testid={`file-item-${d.id}`}
                onClick={() => setActive(d.id)}
              >
                <span className="files__item-glyph mono" aria-hidden="true">{d.kind === "PDF" ? "▤" : "▦"}</span>
                <span className="files__item-title">{d.title}</span>
                <span className="files__item-kind mono">{d.kind}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <main className="files__viewer" data-testid="file-viewer">
        {active === "resume"
          ? <ResumeDoc />
          : <CaseDoc caseId={active.replace(/^case-/, "")} />}
      </main>
    </div>
  );
}
