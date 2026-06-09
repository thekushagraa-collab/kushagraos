/* ============================================================================
   Telemetry — count-up metrics. Every counter ramps from 0 to its value over a
   shared window using RAF + an ease-out cubic. data-testid="telemetry-metric"
   on the numeric span so assertAnimating proves it actually counted.
   ========================================================================== */

import { useEffect, useRef, useState } from "react";
import { METRICS, type Metric } from "../content/content";
import { useOS } from "../lib/store";
import "./telemetry.css";

const DURATION = 1600;
const ease = (t: number) => 1 - Math.pow(1 - t, 3); // easeOutCubic

function format(value: number, decimals = 0) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function MetricCard({ metric }: { metric: Metric }) {
  const motionOn = useOS((s) => s.motion);
  const [n, setN] = useState(motionOn ? 0 : metric.value);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!motionOn) {
      setN(metric.value);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / DURATION);
      setN(ease(p) * metric.value);
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [metric.value, motionOn]);

  return (
    <article className="metric">
      <p className="metric__label mono">{metric.label}</p>
      <p className="metric__value">
        {metric.prefix && <span className="metric__affix">{metric.prefix}</span>}
        <span ref={ref} className="metric__num" data-testid="telemetry-metric">
          {format(n, metric.decimals)}
        </span>
        {metric.suffix && <span className="metric__affix">{metric.suffix}</span>}
      </p>
      <p className="metric__caption">{metric.caption}</p>
    </article>
  );
}

export function Telemetry() {
  return (
    <div className="telemetry">
      <header className="telemetry__head">
        <p className="telemetry__label mono">TELEMETRY · LIVE NUMBERS</p>
        <h2 className="telemetry__title">What the system is doing right now.</h2>
        <p className="telemetry__sub">
          Real metrics from running automations. Refreshes on every visit.
        </p>
      </header>

      <div className="telemetry__grid">
        {METRICS.map((m) => (
          <MetricCard key={m.id} metric={m} />
        ))}
      </div>
    </div>
  );
}
