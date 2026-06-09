/* ============================================================================
   Work — case studies, one card each. Clicking opens the live app (or, for
   CreatorScout, the closest live app). Phase 5 makes the live ones actually
   run; the structure is ready now so nothing has to move.
   ========================================================================== */

import { useOS } from "../lib/store";
import { WORK } from "../content/content";
import { getApp } from "./registry";
import "./work.css";

export function Work() {
  const openApp = useOS((s) => s.openApp);

  return (
    <div className="work">
      <header className="work__head">
        <p className="work__label mono">WORK · FIVE BUILDS THAT RUN FOR REAL</p>
        <h2 className="work__title">Working software beats screenshots.</h2>
        <p className="work__sub">
          Four live ones inside this OS, plus the project that already pays:
          CreatorScout. Every card opens the build — not a slide.
        </p>
      </header>

      <ul className="work__list">
        {WORK.map((c) => {
          const target = getApp(c.app);
          return (
            <li key={c.id}>
              <button
                type="button"
                className="work__card"
                data-status={c.status}
                data-testid={`work-card-${c.id}`}
                onClick={() => openApp(c.app, target.title)}
              >
                <header className="work__card-head">
                  <span className="work__glyph mono" aria-hidden="true">{target.abbr}</span>
                  <div>
                    <h3 className="work__card-title">{c.title}</h3>
                    <p className="work__card-tag">{c.tagline}</p>
                  </div>
                  <span className="work__card-status mono">
                    {c.status === "live" ? "▶ RUN" : "VIEW"}
                  </span>
                </header>

                <dl className="work__case">
                  <div>
                    <dt className="mono">Problem</dt>
                    <dd>{c.problem}</dd>
                  </div>
                  <div>
                    <dt className="mono">Build</dt>
                    <dd>{c.build}</dd>
                  </div>
                  <div>
                    <dt className="mono">Outcome</dt>
                    <dd>{c.outcome}</dd>
                  </div>
                </dl>

                <ul className="work__stack" aria-label="Stack">
                  {c.stack.map((s) => (
                    <li key={s} className="work__chip mono">{s}</li>
                  ))}
                </ul>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
