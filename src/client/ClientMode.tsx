/* ============================================================================
   Client Mode (Phase F) — the conversion surface. A visitor who's seen the wow
   can now: book a call, request a proposal, submit requirements, request
   pricing, or view services. The three form intents post to /api/contact
   (Web3Forms when keyed, graceful "noted" otherwise) and always confirm with an
   AYRA-OS toast. Arriving from a Marketplace "Deploy" pre-fills the proposal.
   ========================================================================== */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SERVICES } from "../content/content";
import { takeClientContext } from "./clientContext";
import "./client.css";

/* Replace with the real scheduling link when live. Opens in a new tab. */
const CAL_URL = "https://cal.com/kushagra";

type Tab = "call" | "proposal" | "requirements" | "pricing" | "services";

const TABS: { id: Tab; label: string }[] = [
  { id: "call", label: "Book a call" },
  { id: "proposal", label: "Request a proposal" },
  { id: "requirements", label: "Submit requirements" },
  { id: "pricing", label: "Request pricing" },
  { id: "services", label: "View services" },
];

const FORM_COPY: Record<"proposal" | "requirements" | "pricing", { heading: string; placeholder: string; cta: string }> = {
  proposal: {
    heading: "Tell me the outcome you want — I'll send a scoped proposal.",
    placeholder: "What should be running that isn't? e.g. \"qualify + reach 200 leads/week on autopilot.\"",
    cta: "▶ Request proposal",
  },
  requirements: {
    heading: "Drop your requirements — stack, volume, must-haves.",
    placeholder: "Tools you use, data sources, volume, deadlines, anything non-negotiable…",
    cta: "▶ Submit requirements",
  },
  pricing: {
    heading: "Tell me the scope — I'll come back with pricing.",
    placeholder: "Which agent(s), roughly what volume, and your timeline?",
    cta: "▶ Request pricing",
  },
};

export function ClientMode() {
  const [tab, setTab] = useState<Tab>("call");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  // Arriving from Marketplace "Deploy" → jump to the proposal, pre-filled.
  useEffect(() => {
    const ctx = takeClientContext();
    if (ctx) {
      setTab("proposal");
      setMessage(`${ctx}.\n\nMy business: `);
    }
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const intent = tab; // proposal | requirements | pricing
    const body = email ? `${message}\n\nReach me at: ${email}` : message;
    void fetch("/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, intent, message: body }),
    }).catch(() => { /* graceful: toast still shows */ });
    setSent(true);
    setMessage("");
    setTimeout(() => setSent(false), 4200);
  };

  const isForm = tab === "proposal" || tab === "requirements" || tab === "pricing";

  return (
    <div className="client" data-testid="client-mode">
      <header className="client__head">
        <p className="client__kicker mono">CLIENT MODE</p>
        <h2 className="client__title">Let&rsquo;s put an agent to work for you.</h2>
        <p className="client__sub">Pick how you want to start. I route everything within 24 hours.</p>
      </header>

      <nav className="client__tabs" role="tablist" aria-label="Client actions">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={t.id === tab}
            className="client__tab"
            data-active={t.id === tab}
            data-testid={`client-tab-${t.id}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "call" && (
        <section className="client__panel" data-testid="client-panel-call">
          <div className="client__booking">
            <span className="client__booking-glyph mono" aria-hidden="true">◷</span>
            <div>
              <h3 className="client__panel-title">Book a 20-minute fit call</h3>
              <p className="client__panel-sub">
                We'll find the highest-leverage thing to automate first. No slides, no pitch — just the plan.
              </p>
            </div>
            <a
              className="client__book-btn"
              href={CAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="client-book-link"
            >
              Open calendar →
            </a>
          </div>
        </section>
      )}

      {isForm && (
        <section className="client__panel" data-testid={`client-panel-${tab}`}>
          <h3 className="client__panel-title">{FORM_COPY[tab].heading}</h3>
          <form className="client__form" data-testid="client-form" onSubmit={onSubmit}>
            <div className="client__row">
              <label className="client__field">
                <span className="client__field-label mono">NAME</span>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" placeholder="What should I call you?" data-testid="client-name" />
              </label>
              <label className="client__field">
                <span className="client__field-label mono">EMAIL</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@company.com" data-testid="client-email" />
              </label>
            </div>
            <label className="client__field">
              <span className="client__field-label mono">{tab.toUpperCase()}</span>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={5} placeholder={FORM_COPY[tab].placeholder} data-testid="client-message" />
            </label>
            <button type="submit" className="client__submit mono" data-testid="client-submit">
              {FORM_COPY[tab].cta}
            </button>
          </form>
        </section>
      )}

      {tab === "services" && (
        <section className="client__panel" data-testid="client-panel-services">
          <h3 className="client__panel-title">What I build</h3>
          <ul className="client__services">
            {SERVICES.map((s) => (
              <li key={s.id} className="client__service" data-kind={s.kind}>
                <span className="client__service-name">{s.label}</span>
                <span className="client__service-note">{s.note}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <AnimatePresence>
        {sent && (
          <motion.div
            className="client__toast"
            data-testid="client-toast"
            role="status"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97, transition: { duration: 0.18 } }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
          >
            <span className="client__toast-glyph mono" aria-hidden="true">✓</span>
            <div>
              <p className="client__toast-title">Process initiated</p>
              <p className="client__toast-line">I&rsquo;ll route this within 24 hours.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
