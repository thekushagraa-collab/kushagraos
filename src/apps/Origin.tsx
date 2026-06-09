/* ============================================================================
   Origin — the journey as a system changelog. Editorial, not "about me" prose.
   ========================================================================== */

import { JOURNEY } from "../content/content";
import "./origin.css";

export function Origin() {
  return (
    <div className="origin">
      <header className="origin__head">
        <p className="origin__label mono">ORIGIN · /CHANGELOG</p>
        <h2 className="origin__title">How the operator got here.</h2>
        <p className="origin__sub">
          Annotated history. The dates are real; the prose is sparse on purpose.
        </p>
      </header>

      <ol className="origin__timeline" data-testid="origin-timeline" aria-label="Journey changelog">
        {JOURNEY.map((e, i) => (
          <li key={`${e.date}-${i}`} className="origin__entry" data-tag={e.tag}>
            <span className="origin__bead" aria-hidden="true" />
            <span className="origin__date mono">{e.date}</span>
            <span className="origin__tag mono">{e.tag}</span>
            <h3 className="origin__entry-title">{e.title}</h3>
            <p className="origin__note">{e.note}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
