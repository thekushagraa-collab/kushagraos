/* ============================================================================
   Vision — the trajectory. Editorial, not a hustle deck. Years + targets +
   one-line thesis per stage so a recruiter reads it without rolling their eyes.
   ========================================================================== */

import { VISION } from "../content/content";
import "./vision.css";

export function Vision() {
  return (
    <div className="vision">
      <header className="vision__head">
        <p className="vision__label mono">VISION · TRAJECTORY</p>
        <h2 className="vision__title">Where this is going.</h2>
        <p className="vision__sub">
          Four steps. Each one earned by shipping the previous. Not a vision
          board — a build order.
        </p>
      </header>

      <ol className="vision__steps" data-testid="vision-steps">
        {VISION.map((m, i) => (
          <li key={m.year} className="vision__step" data-rank={i}>
            <span className="vision__year mono">{m.year}</span>
            <h3 className="vision__target">{m.target}</h3>
            <p className="vision__thesis">{m.thesis}</p>
            <span className="vision__index mono" aria-hidden="true">
              {String(i + 1).padStart(2, "0")} / {String(VISION.length).padStart(2, "0")}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
