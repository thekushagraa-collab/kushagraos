/* ============================================================================
   Atlas — the autonomous outbound engine. Type an ICP; Atlas researches, drafts
   hyper-personal openers, and predicts a reply rate per lead — ranked best-fit
   first. Runs through the provider seam (/api/run).
   ========================================================================== */

import { RunConsole } from "./RunConsole";
import { useRunner } from "./useRunner";
import type { AtlasResult } from "./runApp";

const EXAMPLES = [
  "Seed-stage B2B SaaS founders doing their own sales",
  "Agencies running paid social for e-commerce",
  "Heads of Growth at 20-50 person fintechs",
];

export function Atlas() {
  const { running, reply, run } = useRunner("atlas");
  const r = reply?.result as AtlasResult | undefined;

  return (
    <RunConsole
      app="atlas"
      label="WORK · LIVE BUILD"
      title="Atlas"
      blurb="Personalized outbound at volume turns into a sweatshop. Type the ideal customer — Atlas researches, drafts the opener, and predicts who actually replies."
      stages={["ICP", "Research", "Rank + draft"]}
      inputLabel="Describe your ideal customer (ICP)"
      placeholder={'e.g. "Seed-stage B2B SaaS founders doing their own sales"'}
      examples={EXAMPLES}
      running={running}
      hasResult={!!r}
      fallback={reply?.fallback ?? false}
      onRun={run}
    >
      {r && (
        <>
          <div className="res__row">
            <span className="res__kicker">Targeting</span>
            <p className="res__text">{r.icp}</p>
          </div>

          <div className="res__row">
            <span className="res__kicker">Ranked leads · {r.leads.length}</span>
            <ul className="res__list">
              {r.leads.map((l, i) => (
                <li className="res__card" key={`${l.name}-${i}`}>
                  <div className="res__card-head">
                    <span className="res__title">
                      {l.name} <span className="res__muted">· {l.role}, {l.company}</span>
                    </span>
                    <span className="res__meta">{l.predictedReply} reply</span>
                  </div>
                  <div className="res__fit" aria-label={`Fit ${l.fit} of 100`}>
                    <span className="res__fit-fill" style={{ width: `${l.fit}%` }} />
                  </div>
                  <p className="res__text">{l.opener}</p>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </RunConsole>
  );
}
