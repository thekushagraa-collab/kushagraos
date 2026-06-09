/* ============================================================================
   MobileHome — the phone-OS form factor (one design language, two form
   factors). Home screen = grid of app icons; tap → full-screen app with a
   header + back. App open/close morphs with a spring. Audience order applies.
   ========================================================================== */

import { AnimatePresence, motion } from "framer-motion";
import { useOS } from "../lib/store";
import { appsForAudience, getApp } from "../apps/registry";
import { AppContent } from "../apps/AppContent";
import { AppIcon } from "../apps/AppIcon";
import { greeting } from "../lib/visitor";
import { MotionToggle } from "../components/ui/MotionToggle";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import "./mobile-home.css";

export function MobileHome() {
  const audience = useOS((s) => s.audience);
  const mobileAppId = useOS((s) => s.mobileAppId);
  const openMobileApp = useOS((s) => s.openMobileApp);
  const closeMobileApp = useOS((s) => s.closeMobileApp);
  const toggleCmdk = useOS((s) => s.toggleCmdk);
  const apps = appsForAudience(audience);

  return (
    <div className="mhome">
      <header className="mhome__bar">
        <span className="mhome__greet mono">{greeting()}</span>
        <button type="button" className="mhome__search mono" onClick={toggleCmdk}>
          Search
        </button>
      </header>

      <div className="mhome__controls">
        <MotionToggle />
        <ThemeToggle />
      </div>

      <ul className="mhome__grid" aria-label="Apps">
        {apps.map((app) => (
          <li key={app.id}>
            <button
              type="button"
              className="mhome__app"
              data-testid={`app-launcher-${app.id}`}
              aria-label={`Open ${app.title}`}
              onClick={() => openMobileApp(app.id)}
            >
              <span className="mhome__icon" data-group={app.group}>
                <AppIcon id={app.id} className="mhome__icon-svg" />
              </span>
              <span className="mhome__label">{app.short}</span>
            </button>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {mobileAppId && (
          <motion.section
            className="mapp"
            data-testid="mobile-app"
            data-app={mobileAppId}
            role="dialog"
            aria-label={getApp(mobileAppId).title}
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12, transition: { duration: 0.16 } }}
            // Deterministic tween (not a spring): a spring's long low-amplitude
            // settling tail reads as "element is not stable" to Playwright's
            // actionability check, making interactions on this panel flaky. A
            // fixed-duration eased tween settles predictably and feels the same.
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <header className="mapp__bar">
              <button
                type="button"
                className="mapp__back mono"
                data-testid="mobile-back"
                onClick={closeMobileApp}
              >
                ‹ Home
              </button>
              <span className="mapp__title mono">{getApp(mobileAppId).title}</span>
              <span className="mapp__spacer" aria-hidden="true" />
            </header>
            <div className="mapp__body">
              <AppContent id={mobileAppId} />
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
