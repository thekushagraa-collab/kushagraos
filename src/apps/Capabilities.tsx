/* ============================================================================
   Capabilities — services rendered as a blueprint graph. Form = function.
   Phase 3 ships the structure + a faint pulse so it reads as a live diagram.
   Phase 4 turns this into the BlueprintGraph with packets flowing along edges.
   ========================================================================== */

import { SERVICES, SERVICE_EDGES, type ServiceNode } from "../content/content";
import "./capabilities.css";

const COL_X = [80, 280, 480, 680];
const ROW_Y = [80, 200];
const W = 760;
const H = 280;

const NODE_BY_ID = Object.fromEntries(SERVICES.map((n) => [n.id, n]));

function nodePos(n: ServiceNode) {
  return { x: COL_X[n.col], y: ROW_Y[n.row] };
}

export function Capabilities() {
  return (
    <div className="cap">
      <header className="cap__head">
        <p className="cap__label mono">SERVICES · AS AUTOMATION NODES</p>
        <h2 className="cap__title">What I actually do.</h2>
        <p className="cap__sub">
          Not a list of skills — the pipeline a business gets when they hire me.
          Each node is a deliverable; the wiring between them is the work.
        </p>
      </header>

      <figure
        className="cap__figure"
        role="group"
        aria-label="Service pipeline diagram"
        data-testid="capabilities-graph"
      >
        <svg
          className="cap__svg"
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          {/* edges */}
          <g className="cap__edges">
            {SERVICE_EDGES.map(([fromId, toId]) => {
              const a = nodePos(NODE_BY_ID[fromId]);
              const b = nodePos(NODE_BY_ID[toId]);
              const mx = (a.x + b.x) / 2;
              return (
                <path
                  key={`${fromId}-${toId}`}
                  className="cap__edge"
                  d={`M${a.x + 60},${a.y} C${mx},${a.y} ${mx},${b.y} ${b.x - 60},${b.y}`}
                  fill="none"
                />
              );
            })}
          </g>

          {/* nodes */}
          <g className="cap__nodes">
            {SERVICES.map((n) => {
              const { x, y } = nodePos(n);
              return (
                <g key={n.id} className="cap__node" data-kind={n.kind}
                   transform={`translate(${x - 60}, ${y - 22})`}>
                  <rect width="120" height="44" rx="10" className="cap__node-box" />
                  <text x="60" y="20" textAnchor="middle" className="cap__node-kind mono">
                    {n.kind.toUpperCase()}
                  </text>
                  <text x="60" y="34" textAnchor="middle" className="cap__node-label">
                    {n.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </figure>

      <ul className="cap__list">
        {SERVICES.map((n) => (
          <li className="cap__row" key={n.id}>
            <span className="cap__row-kind mono" data-kind={n.kind}>{n.kind}</span>
            <span className="cap__row-label">{n.label}</span>
            <span className="cap__row-note">{n.note}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
