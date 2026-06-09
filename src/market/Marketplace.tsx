/* ============================================================================
   Agent Marketplace (Phase F) — the six agents as buyable products. Each card
   leads with its value metric and offers two paths: ▶ Try (run it live in the
   Automation Center) and Deploy (hand off to Client Mode to scope + price it for
   the visitor's business). This is where the "wow" turns into a booked process.
   ========================================================================== */

import { type CSSProperties } from "react";
import { useOS } from "../lib/store";
import { useIsMobile } from "../hooks/useIsMobile";
import { AGENTS } from "../agents/agents";
import { setClientContext } from "../client/clientContext";
import "./market.css";

export function Marketplace() {
  const openApp = useOS((s) => s.openApp);
  const openMobileApp = useOS((s) => s.openMobileApp);
  const isMobile = useIsMobile();

  const open = (id: "studio" | "client", title: string) =>
    isMobile ? openMobileApp(id) : openApp(id, title);

  const onTry = () => open("studio", "Automation Center");
  const onDeploy = (name: string, role: string) => {
    setClientContext(`Deploy “${name}” — ${role}`);
    open("client", "Client Mode");
  };

  return (
    <div className="market" data-testid="marketplace">
      <header className="market__head">
        <p className="market__kicker mono">AGENT MARKETPLACE</p>
        <h2 className="market__title">Hire an agent. Deploy it to your business.</h2>
        <p className="market__sub">
          Every agent is productized and ready. Try one live, then deploy it — I&rsquo;ll scope it to
          your stack, wire it in, and hand it over running.
        </p>
      </header>

      <div className="market__grid">
        {AGENTS.map((a) => (
          <article
            key={a.id}
            className="product"
            data-testid={`product-${a.id}`}
            style={{ "--agent-accent": a.accent } as CSSProperties}
          >
            <header className="product__head">
              <span className="product__dot" aria-hidden="true" />
              <div>
                <h3 className="product__name">{a.name}</h3>
                <span className="product__role mono">{a.role}</span>
              </div>
            </header>

            <p className="product__metric">{a.metric}</p>
            <p className="product__blurb">{a.blurb}</p>

            <div className="product__price">
              <span className="product__price-tag mono">DEPLOY</span>
              <span className="product__price-note">scoped &amp; priced to your business</span>
            </div>

            <div className="product__actions">
              <button type="button" className="product__try" data-testid={`product-try-${a.id}`} onClick={onTry}>
                ▶ Try live
              </button>
              <button type="button" className="product__deploy" data-testid={`product-deploy-${a.id}`} onClick={() => onDeploy(a.name, a.role)}>
                Deploy →
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
