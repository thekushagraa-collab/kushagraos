/* ============================================================================
   Boot — the signature opening moment.
   Stage 1 (decode): KUSHAGRA assembles from scrambled glyphs into the serif
   wordmark — once, on boot. Skippable. Returning visitors get a fast path.
   Stage 2 (login as): tasteful audience chooser that routes the dock + copy.
   A persistent scan indicator (data-testid="boot-decode") animates throughout
   so motion is provable; the wordmark carries data-testid="hero-wordmark".
   ========================================================================== */

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useOS, type Audience } from "../lib/store";
import { getVisitState, greeting, recordVisit } from "../lib/visitor";
import { riseIn, stagger } from "../lib/motion";
import "./boot.css";

const TARGET = "KUSHAGRA";
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const randGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

// NOTE: "founder" is intentionally ABSENT here. Founder Mode (Phase H) is the
// private operator control surface — reached only via the server-gated
// passphrase (⌘K "Unlock Founder Mode" or the #founder deep-link), never as a
// public visitor lens. The investor/trajectory view lives under "Just exploring".
const AUDIENCES: ReadonlyArray<{ id: Audience; label: string; line: string }> = [
  { id: "client", label: "Client", line: "Build this for my business." },
  { id: "recruiter", label: "Recruiter", line: "Show me proof of skill." },
  { id: "explorer", label: "Just exploring", line: "Give me the tour." },
];

export function Boot() {
  const setBooted = useOS((s) => s.setBooted);
  const setAudience = useOS((s) => s.setAudience);
  const motionOn = useOS((s) => s.motion);

  const [isReturning] = useState(() => getVisitState().isReturning);
  const [stage, setStage] = useState<"decode" | "choose">("decode");
  const [text, setText] = useState(motionOn ? "" : TARGET);
  const rafRef = useRef(0);

  // Count this visit once (drives the returning-visitor fast path next time).
  useEffect(() => {
    recordVisit();
  }, []);

  // Decode reveal: progressively lock letters left→right. Motion OFF or a skip
  // jumps straight to the resolved wordmark + chooser.
  useEffect(() => {
    if (!motionOn) {
      setText(TARGET);
      setStage("choose");
      return;
    }
    const dur = isReturning ? 650 : 1500;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const locked = Math.floor(p * TARGET.length);
      let s = "";
      for (let i = 0; i < TARGET.length; i++) {
        s += i < locked ? TARGET[i] : randGlyph();
      }
      setText(s);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setText(TARGET);
        setStage("choose");
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isReturning, motionOn]);

  const skip = () => {
    cancelAnimationFrame(rafRef.current);
    setText(TARGET);
    setStage("choose");
  };

  const choose = (audience: Audience) => {
    setAudience(audience);
    setBooted(true);
  };

  return (
    <div className="boot" data-testid="boot-screen">
      <motion.div
        className="boot__core"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <motion.p className="boot__status mono" variants={riseIn}>
          {isReturning ? `${greeting()} — welcome back` : "BOOTING KUSHAGRAOS"}
        </motion.p>

        <motion.h1 className="boot__name" variants={riseIn} aria-label={TARGET}>
          <span className="boot__name-text" data-testid="hero-wordmark">
            {text || TARGET}
          </span>
        </motion.h1>

        {stage === "decode" && (
          <motion.button
            type="button"
            className="boot__skip mono"
            data-testid="boot-skip"
            variants={riseIn}
            onClick={skip}
          >
            Skip intro ›
          </motion.button>
        )}

        {stage === "choose" && (
          <motion.div
            className="boot__choose"
            initial="hidden"
            animate="show"
            variants={stagger}
          >
            <motion.p className="boot__prompt mono" variants={riseIn}>
              LOG IN AS
            </motion.p>
            <motion.ul className="boot__audiences" variants={stagger}>
              {AUDIENCES.map((a) => (
                <motion.li key={a.id} variants={riseIn}>
                  <button
                    type="button"
                    className="boot__audience"
                    data-testid={`audience-${a.id}`}
                    onClick={() => choose(a.id)}
                  >
                    <span className="boot__audience-label">{a.label}</span>
                    <span className="boot__audience-line mono">{a.line}</span>
                  </button>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        )}

        {/* persistent scan indicator — provable motion target (the bead moves) */}
        <div className="boot__scan" aria-hidden="true">
          <span className="boot__scan-bead" data-testid="boot-decode" />
        </div>
      </motion.div>
    </div>
  );
}
