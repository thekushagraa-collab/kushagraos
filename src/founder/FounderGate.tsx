/* ============================================================================
   FounderGate — the passphrase challenge for Founder Mode (Phase H).
   A restrained, high-security moment: one field, server-verified. The key is
   checked by /api/founder; the browser only ever sends a candidate and learns
   yes/no. Wrong/empty → denied. Esc closes. No client-side secret, ever.
   ========================================================================== */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOS } from "../lib/store";
import { unlockFounderClient } from "./founder";
import "./founder.css";

type Phase = "idle" | "checking" | "denied";

export function FounderGate() {
  const isOpen = useOS((s) => s.isFounderGateOpen);
  const closeFounderGate = useOS((s) => s.closeFounderGate);
  const unlockFounder = useOS((s) => s.unlockFounder);

  const [pass, setPass] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset + focus on open.
  useEffect(() => {
    if (!isOpen) return;
    setPass("");
    setPhase("idle");
    setMessage("");
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [isOpen]);

  // Esc to dismiss.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeFounderGate();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeFounderGate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phase === "checking") return;
    setPhase("checking");
    setMessage("");
    try {
      const res = await unlockFounderClient(pass);
      if (res.ok && res.status) {
        unlockFounder(res.status);
        return;
      }
      setPhase("denied");
      setMessage(
        res.error === "rate_limited"
          ? "Too many attempts. Wait a moment."
          : res.error === "network_error"
            ? "Couldn't reach the gate. Try again."
            : "Access denied.",
      );
      setPass("");
      requestAnimationFrame(() => inputRef.current?.focus());
    } catch {
      setPhase("denied");
      setMessage("Couldn't reach the gate. Try again.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="founder-gate"
          data-testid="founder-gate"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onPointerDown={() => closeFounderGate()}
        >
          <motion.form
            className="founder-gate__card"
            role="dialog"
            aria-label="Founder Mode passphrase"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 6, transition: { duration: 0.12 } }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            onPointerDown={(e) => e.stopPropagation()}
            onSubmit={submit}
          >
            <span className="founder-gate__eyebrow mono">RESTRICTED · OPERATOR ONLY</span>
            <h2 className="founder-gate__title">Founder Mode</h2>
            <p className="founder-gate__sub">
              The private control surface. Verified server-side — there's no key
              in this page to find.
            </p>

            <label className="founder-gate__field">
              <span className="founder-gate__label mono">PASSPHRASE</span>
              <input
                ref={inputRef}
                className="founder-gate__input"
                data-testid="founder-gate-input"
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="off"
                spellCheck={false}
                aria-invalid={phase === "denied"}
              />
            </label>

            {message && (
              <p className="founder-gate__error mono" data-testid="founder-gate-error" role="alert">
                {message}
              </p>
            )}

            <div className="founder-gate__actions">
              <button
                type="button"
                className="founder-gate__ghost mono"
                data-testid="founder-gate-cancel"
                onClick={() => closeFounderGate()}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="founder-gate__submit"
                data-testid="founder-gate-submit"
                disabled={phase === "checking"}
              >
                {phase === "checking" ? "Verifying…" : "Unlock"}
              </button>
            </div>

            {/* persistent scan indicator — provable motion target */}
            <div className="founder-gate__scan" aria-hidden="true">
              <span className="founder-gate__scan-bead" data-testid="founder-gate-scan" />
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
