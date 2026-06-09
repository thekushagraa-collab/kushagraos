import { test, expect, type Page } from "@playwright/test";
import { boot, assertAnimating, isMobile, settleEntrance } from "./helpers";

// These tests drive the live provider seam (/api/run → Groq). Under
// `fullyParallel`, all of them fan across every worker and hammer the single
// preview server with concurrent live calls at once — which leaves one worker's
// connection dangling at teardown (force-killed at the 300s grace → exit 1,
// despite every assertion passing). Running this file serially in one worker
// keeps the live load sequential (proven clean) without slowing the pure-UI
// phases, which keep full parallelism.
test.describe.configure({ mode: "serial" });

type WorkApp = "flow" | "atlas" | "forge";

/** Open a work app (window on desktop, full-screen on mobile) by its launcher. */
async function openWork(page: Page, app: WorkApp) {
  await page.getByTestId(`app-launcher-${app}`).click();
  if (isMobile(page)) await settleEntrance(page, "mobile-app"); // entrance settles before run
  await expect(page.getByTestId(`${app}-input`)).toBeVisible();
}

const SEED: Record<WorkApp, string> = {
  flow: "A lead fills out the pricing form on my site",
  atlas: "Seed-stage B2B SaaS founders doing their own sales",
  forge: "A 40-min podcast on why most automations fail",
};

test.describe("Phase 5 — Flow / Atlas / Forge run for real", () => {
  for (const app of ["flow", "atlas", "forge"] as WorkApp[]) {
    test(`${app}: opens, executes (animated pipeline), and produces a result`, async ({ page }) => {
      await boot(page);
      await openWork(page, app);

      await page.getByTestId(`${app}-input`).fill(SEED[app]);
      await page.getByTestId(`${app}-run`).click();

      // The pipeline must actually execute — prove the sweep animates (DoD).
      await assertAnimating(page, page.getByTestId(`${app}-packet`));

      // A structured result lands (real provider answer or graceful fallback).
      await expect(page.getByTestId(`${app}-result`)).toBeVisible({ timeout: 15000 });
    });
  }

  test("an example chip fills the input and runs", async ({ page }) => {
    await boot(page);
    await openWork(page, "flow");
    await page.getByText("A customer emails asking for a refund").click();
    await expect(page.getByTestId("flow-input")).toHaveValue(/refund/i);
    await page.getByTestId("flow-run").click();
    await expect(page.getByTestId("flow-result")).toBeVisible({ timeout: 15000 });
  });

  test("/api/run returns a structured result (real or fallback)", async ({ request }) => {
    const res = await request.post("/api/run", {
      headers: { "x-forwarded-for": `run-ok-${Date.now()}-${Math.random()}` },
      data: { app: "flow", input: "A lead fills out the pricing form" },
    });
    expect(res.ok()).toBeTruthy();
    expect(res.headers()["content-type"]).toContain("application/json");
    const body = await res.json();
    expect(body.app).toBe("flow");
    expect(body.result).toBeTruthy();
    expect(Array.isArray(body.result.steps)).toBe(true);
    expect(body.result.steps.length).toBeGreaterThan(0);
  });

  test("/api/run rejects an unknown app", async ({ request }) => {
    const res = await request.post("/api/run", {
      headers: { "x-forwarded-for": `run-bad-${Date.now()}-${Math.random()}` },
      data: { app: "nope", input: "anything" },
    });
    expect(res.status()).toBe(400);
  });

  test("/api/run rejects empty input", async ({ request }) => {
    const res = await request.post("/api/run", {
      headers: { "x-forwarded-for": `run-empty-${Date.now()}-${Math.random()}` },
      data: { app: "atlas", input: "   " },
    });
    expect(res.status()).toBe(400);
  });

  test("/api/run caps oversized input and still answers", async ({ request }) => {
    const res = await request.post("/api/run", {
      headers: { "x-forwarded-for": `run-cap-${Date.now()}-${Math.random()}` },
      data: { app: "forge", input: "x".repeat(5000) },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.result).toBeTruthy();
  });

  test("/api/run rate-limits a hot caller", async ({ request }) => {
    const key = `run-rate-${Date.now()}-${Math.random()}`;
    let saw429 = false;
    // RATE_MAX = 8 / 60s; the 9th within the window must be limited.
    for (let i = 0; i < 10; i++) {
      const res = await request.post("/api/run", {
        headers: { "x-forwarded-for": key },
        data: { app: "flow", input: `ping ${i}` },
      });
      if (res.status() === 429) {
        saw429 = true;
        break;
      }
    }
    expect(saw429).toBe(true);
  });
});
