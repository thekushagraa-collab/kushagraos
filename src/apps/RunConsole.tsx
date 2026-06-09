/* ============================================================================
   RunConsole — shared chrome for the WORK apps (Flow / Atlas / Forge). One
   design language: a kicker + title, an input row with example chips, a Run
   button, an animated pipeline track that "executes" while a request is in
   flight, and a slot for the structured result. Each app supplies its stages,
   copy, and result renderer; the run mechanics + motion live here (DRY).

   The animated sweep (`data-testid={app}-packet`) moves via transform only and
   loops while running — this is what the DoD `assertAnimating` test samples.
   Motion is flattened globally by `data-motion="off"`, per the motion policy.
   ========================================================================== */

import { useId, useRef, useState, type ReactNode } from "react";
import "./run-console.css";

interface RunConsoleProps {
  app: "flow" | "atlas" | "forge";
  label: string;
  title: string;
  blurb: string;
  /** Pipeline stage names, left → right. */
  stages: string[];
  inputLabel: string;
  placeholder: string;
  examples: string[];
  running: boolean;
  /** True once a result exists (controls the result slot + run-button copy). */
  hasResult: boolean;
  fallback: boolean;
  onRun: (input: string) => void;
  children?: ReactNode;
}

const MIN_RUN_HINT = "Executing pipeline…";

export function RunConsole({
  app,
  label,
  title,
  blurb,
  stages,
  inputLabel,
  placeholder,
  examples,
  running,
  hasResult,
  fallback,
  onRun,
  children,
}: RunConsoleProps) {
  const [value, setValue] = useState("");
  const inputId = useId();
  const taRef = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    const v = value.trim();
    if (!v || running) return;
    onRun(v);
  };

  return (
    <div className="run" data-app={app}>
      <header className="run__head">
        <p className="run__label mono">{label}</p>
        <h2 className="run__title">{title}</h2>
        <p className="run__blurb">{blurb}</p>
      </header>

      {/* Pipeline track — stages + a sweep that loops while executing. */}
      <div
        className="run__track"
        data-testid={`${app}-pipeline`}
        data-running={running ? "true" : "false"}
        role="img"
        aria-label={`${title} pipeline${running ? ", executing" : ""}`}
      >
        <span className="run__sweep" data-testid={`${app}-packet`} aria-hidden="true" />
        {stages.map((s, i) => (
          <div className="run__stage" key={s} style={{ ["--i" as string]: i }}>
            <span className="run__dot" aria-hidden="true" />
            <span className="run__stage-label mono">{s}</span>
          </div>
        ))}
      </div>

      <form
        className="run__form"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <label className="run__input-label mono" htmlFor={inputId}>
          {inputLabel}
        </label>
        <textarea
          id={inputId}
          ref={taRef}
          className="run__input"
          data-testid={`${app}-input`}
          rows={2}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
          }}
        />

        <div className="run__chips">
          {examples.map((ex) => (
            <button
              key={ex}
              type="button"
              className="run__chip mono"
              onClick={() => {
                setValue(ex);
                taRef.current?.focus();
              }}
            >
              {ex}
            </button>
          ))}
        </div>

        <div className="run__bar">
          <button
            type="submit"
            className="run__go"
            data-testid={`${app}-run`}
            disabled={running || !value.trim()}
          >
            {running ? MIN_RUN_HINT : hasResult ? "Run again" : "▶ Run"}
          </button>
          {running && <span className="run__status mono">working…</span>}
          {!running && hasResult && (
            <span className="run__status mono" data-fallback={fallback ? "true" : "false"}>
              {fallback ? "demo result (offline / no key)" : "ran live"}
            </span>
          )}
        </div>
      </form>

      {hasResult && (
        <section className="run__result" data-testid={`${app}-result`} aria-live="polite">
          {children}
        </section>
      )}
    </div>
  );
}
