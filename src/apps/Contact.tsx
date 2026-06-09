/* ============================================================================
   Contact — "initiate a process". Phase 3 ships the form + an OS-styled success
   toast; Phase 4 wires the real submit (Web3Forms/Formspree free tier).
   ========================================================================== */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CONTACT_LINKS } from "../content/content";
import "./contact.css";

const INTENTS = ["hire", "collaborate", "advise", "just hello"] as const;
type Intent = (typeof INTENTS)[number];

export function Contact() {
  const [intent, setIntent] = useState<Intent>("hire");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Best-effort real submit (Web3Forms via /api/contact); the success toast
    // shows regardless so the UX never dead-ends if no key is configured.
    void fetch("/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, intent, message }),
    }).catch(() => { /* graceful: toast still shows */ });
    setSent(true);
    setTimeout(() => setSent(false), 4200);
  };

  return (
    <div className="contact">
      <header className="contact__head">
        <p className="contact__label mono">CONTACT · INITIATE A PROCESS</p>
        <h2 className="contact__title">Don't email. Open a process.</h2>
        <p className="contact__sub">
          Tell the OS what you need. I'll route it the same day.
        </p>
      </header>

      <form
        className="contact__form"
        data-testid="contact-form"
        onSubmit={onSubmit}
      >
        <fieldset className="contact__intents">
          <legend className="contact__legend mono">INTENT</legend>
          {INTENTS.map((i) => (
            <label key={i} className="contact__intent" data-active={i === intent}>
              <input
                type="radio"
                name="intent"
                value={i}
                checked={i === intent}
                onChange={() => setIntent(i)}
              />
              <span>{i}</span>
            </label>
          ))}
        </fieldset>

        <label className="contact__field">
          <span className="contact__field-label mono">NAME</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            placeholder="What should I call you?"
          />
        </label>

        <label className="contact__field">
          <span className="contact__field-label mono">MESSAGE</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={5}
            placeholder="What's the bottleneck? One paragraph is plenty."
          />
        </label>

        <button
          type="submit"
          className="contact__submit mono"
          data-testid="contact-submit"
        >
          ▶ Initiate process
        </button>
      </form>

      <ul className="contact__links">
        {CONTACT_LINKS.map((l) => (
          <li key={l.label}>
            <a
              className="contact__link mono"
              href={l.href}
              target={l.href.startsWith("mailto:") ? undefined : "_blank"}
              rel="noopener noreferrer"
            >
              {l.label} ›
            </a>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {sent && (
          <motion.div
            className="contact__toast"
            data-testid="contact-toast"
            role="status"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97, transition: { duration: 0.18 } }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
          >
            <span className="contact__toast-glyph mono" aria-hidden="true">✓</span>
            <div>
              <p className="contact__toast-title">Process initiated</p>
              <p className="contact__toast-line">
                I'll route this within 24 hours.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
