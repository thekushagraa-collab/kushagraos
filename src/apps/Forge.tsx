/* ============================================================================
   Forge — the AI content engine. Give it a source (a video topic, a podcast, a
   recording); Forge scores the moments and exports clips + a thread + captions.
   20× the surface area from one recording. Runs through the seam (/api/run).
   ========================================================================== */

import { RunConsole } from "./RunConsole";
import { useRunner } from "./useRunner";
import type { ForgeResult } from "./runApp";

const EXAMPLES = [
  "A 40-min podcast on why most automations fail",
  "A founder demo of our new pricing engine",
  "A talk: 'the boring middle of the economy'",
];

export function Forge() {
  const { running, reply, run } = useRunner("forge");
  const r = reply?.result as ForgeResult | undefined;

  return (
    <RunConsole
      app="forge"
      label="WORK · LIVE BUILD"
      title="Forge"
      blurb="Hours of footage become one tweet — and 19 ideas die on the floor. Forge transcribes, scores the moments, and ships clips, a thread, and captions."
      stages={["Source", "Transcribe + score", "Export"]}
      inputLabel="Describe the source"
      placeholder={'e.g. "A 40-min podcast on why most automations fail"'}
      examples={EXAMPLES}
      running={running}
      hasResult={!!r}
      fallback={reply?.fallback ?? false}
      onRun={run}
    >
      {r && (
        <>
          {r.clips.length > 0 && (
            <div className="res__row">
              <span className="res__kicker">Clips · {r.clips.length}</span>
              <div className="res__grid res__grid--clips">
                {r.clips.map((c, i) => (
                  <div className="res__card" key={`${c.title}-${i}`}>
                    <div className="res__card-head">
                      <span className="res__title">{c.title}</span>
                      <span className="res__meta">{c.durationSec}s</span>
                    </div>
                    <p className="res__text">{c.hook}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {r.thread.length > 0 && (
            <div className="res__row">
              <span className="res__kicker">Thread · {r.thread.length}</span>
              <ul className="res__list">
                {r.thread.map((t, i) => (
                  <li className="res__card" key={i}>
                    <p className="res__text">
                      <span className="res__meta">{i + 1}/{r.thread.length}</span> {t}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {r.captions.length > 0 && (
            <div className="res__row">
              <span className="res__kicker">Captions</span>
              <ul className="res__list">
                {r.captions.map((c, i) => (
                  <li className="res__muted" key={i}>“{c}”</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </RunConsole>
  );
}
