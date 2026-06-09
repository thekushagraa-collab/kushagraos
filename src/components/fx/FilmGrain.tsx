/* ============================================================================
   FilmGrain — fixed full-viewport SVG noise overlay for depth/atmosphere.
   Theme controls opacity + blend mode via tokens (--grain-opacity/-blend).
   Pure decoration: pointer-events none, aria-hidden, sits above bg below UI.
   ========================================================================== */

import "./film-grain.css";

export function FilmGrain() {
  return (
    <div className="film-grain" aria-hidden="true">
      <svg className="film-grain__svg" xmlns="http://www.w3.org/2000/svg">
        <filter id="kos-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.82"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#kos-grain)" />
      </svg>
    </div>
  );
}
