import { defineConfig, devices } from "@playwright/test";

/**
 * KushagraOS verification harness (see docs/VERIFICATION.md).
 * Runs against the PREVIEW build (npm run dev is blocked by ECC's Bash hook).
 * Default reducedMotion is "no-preference" so motion runs and assertAnimating
 * can prove it; the reduced-motion test overrides per-test via emulateMedia.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  // Concurrency note (Windows + live-LLM suite): desktop + mobile (emulated
  // WebKit) running heavy framer-motion surfaces AND live `/api` calls saturate
  // this machine's CPU under high parallelism — animations then never settle
  // inside Playwright's actionability check ("element is not stable") and a
  // worker can hang at teardown (force-killed at the 300s grace → exit 1 with
  // every assertion still passing). Single-worker is deterministically green in
  // every bisection, so that's the committed setting for a reliable DoD gate.
  // On CI (Linux, no contention) parallelism is fine — let Playwright decide.
  workers: process.env.CI ? undefined : 1,
  forbidOnly: !!process.env.CI,
  retries: 1,
  reporter: [["list"]],
  webServer: {
    command: "npm run build && npm run preview -- --port 4173",
    url: "http://localhost:4173",
    reuseExistingServer: true,
    timeout: 180_000,
  },
  use: {
    baseURL: "http://localhost:4173",
    reducedMotion: "no-preference",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"] },
    },
  ],
});
