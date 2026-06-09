/* ============================================================================
   AppContent — the body rendered inside a window (desktop) or full-screen
   (mobile) for each app. Phase 3 ships real bodies for the static apps; the
   live work apps (Flow/Atlas/Forge/Assistant) stay as on-brand staged stubs
   until Phase 4–5 wires their backends.
   ========================================================================== */

import type { AppId } from "../lib/store";
import { getApp } from "./registry";
import { Capabilities } from "./Capabilities";
import { Work } from "./Work";
import { Origin } from "./Origin";
import { Telemetry } from "./Telemetry";
import { Vision } from "./Vision";
import { Contact } from "./Contact";
import { Flow } from "./Flow";
import { Atlas } from "./Atlas";
import { Forge } from "./Forge";
import { AutomationCenter } from "../agents/AutomationCenter";
import { AiLab } from "../lab/AiLab";
import { Marketplace } from "../market/Marketplace";
import { ClientMode } from "../client/ClientMode";
import { FilesApp } from "../files/FilesApp";
import { IntegrationsApp } from "../integrations/IntegrationsApp";
import "./app-content.css";

function AboutBody() {
  return (
    <div className="about">
      <p className="about__label mono">AI AUTOMATION OPERATOR</p>
      <h1 className="about__name">
        <span className="about__name-text" data-testid="hero-wordmark">
          KUSHAGRA
        </span>
      </h1>
      <p className="about__line">
        I build the <em>0.1%</em> of the system that quietly runs the
        other&nbsp;99.9%.
      </p>
      <p className="about__body">
        KushagraOS is not a page about me — it is the system, running. Open the
        live builds from the dock, or press <kbd className="mono">⌘K</kbd> to go
        anywhere.
      </p>
    </div>
  );
}

function StubBody({ id }: { id: AppId }) {
  const app = getApp(id);
  return (
    <div className="stub">
      <header className="stub__head">
        <span className="stub__glyph mono" aria-hidden="true">{app.abbr}</span>
        <div>
          <h2 className="stub__title">{app.title}</h2>
          <p className="stub__blurb">{app.blurb}</p>
        </div>
      </header>
      <div className="stub__panel" role="note">
        <span className="stub__status mono">MODULE STAGED</span>
        <p className="stub__note">
          Wires to a live API in Phase 4–5 — it will run for real, not
          screenshots. The shell, windowing, and routing are live now.
        </p>
      </div>
    </div>
  );
}

export function AppContent({ id }: { id: AppId }) {
  switch (id) {
    case "about": return <AboutBody />;
    case "capabilities": return <Capabilities />;
    case "work": return <Work />;
    case "origin": return <Origin />;
    case "telemetry": return <Telemetry />;
    case "vision": return <Vision />;
    case "contact": return <Contact />;
    // AYRA's growth studio — six agents, live through the agent engine
    case "studio": return <AutomationCenter />;
    // AI Lab — the R&D wing; two exhibits run live through /api/lab
    case "lab": return <AiLab />;
    // Phase F — marketplace → client mode → files
    case "market": return <Marketplace />;
    case "client": return <ClientMode />;
    case "files": return <FilesApp />;
    // Phase G — simulated integrations + real read-only GitHub
    case "integrations": return <IntegrationsApp />;
    // live builds — Phase 5: run for real through the provider seam
    case "flow": return <Flow />;
    case "atlas": return <Atlas />;
    case "forge": return <Forge />;
    // assistant is an overlay (routed in the store) — unreachable here
    case "assistant":
      return <StubBody id={id} />;
  }
}
