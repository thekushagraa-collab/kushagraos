/* ============================================================================
   Flow — the visual automation builder that actually executes. Describe a
   trigger; Flow designs a Trigger → AI → Action pipeline and runs it once
   through the provider seam (/api/run), then shows the message it would send.
   ========================================================================== */

import { RunConsole } from "./RunConsole";
import { useRunner } from "./useRunner";
import type { FlowResult } from "./runApp";

const EXAMPLES = [
  "A lead fills out the pricing form on my site",
  "A customer emails asking for a refund",
  "A new 5-star review lands on Google",
];

export function Flow() {
  const { running, reply, run } = useRunner("flow");
  const r = reply?.result as FlowResult | undefined;

  return (
    <RunConsole
      app="flow"
      label="WORK · LIVE BUILD"
      title="Flow"
      blurb="No-code is a toy; code is overkill. Flow is the middle that runs your real ops. Describe a trigger — it designs the pipeline and executes it."
      stages={["Trigger", "AI reason", "Action"]}
      inputLabel="Describe the trigger"
      placeholder={'e.g. "A lead fills out the pricing form on my site"'}
      examples={EXAMPLES}
      running={running}
      hasResult={!!r}
      fallback={reply?.fallback ?? false}
      onRun={run}
    >
      {r && (
        <>
          <div className="res__row">
            <span className="res__kicker">Trigger</span>
            <p className="res__text">{r.trigger}</p>
          </div>

          <div className="res__row">
            <span className="res__kicker">Pipeline</span>
            <ul className="res__list">
              {r.steps.map((s, i) => (
                <li className="res__card" key={`${s.node}-${i}`} data-node={s.node}>
                  <div className="res__card-head">
                    <span className="res__title">{s.label}</span>
                    <span className="res__meta">{s.node.toUpperCase()}</span>
                  </div>
                  <p className="res__text">{s.detail}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="res__row">
            <span className="res__kicker">Action sent</span>
            <div className="res__card">
              <span className="res__channel">{r.action.channel}</span>
              <span className="res__title">{r.action.title}</span>
              <p className="res__text">{r.action.body}</p>
            </div>
          </div>
        </>
      )}
    </RunConsole>
  );
}
