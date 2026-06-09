import { test, expect } from "@playwright/test";
import { boot, isMobile, settleEntrance } from "./helpers";

/** Open an app on either form factor and return a locator for its body. */
async function openApp(page: import("@playwright/test").Page, id: string) {
  await page.getByTestId(`app-launcher-${id}`).click();
  if (isMobile(page)) {
    await settleEntrance(page, "mobile-app"); // entrance settles before interaction
    return page.getByTestId("mobile-app");
  }
  return page.locator(`[data-testid="window"][data-app="${id}"]`);
}

test.describe("Phase 3 — app content", () => {
  test("Capabilities renders the blueprint graph", async ({ page }) => {
    await boot(page);
    const body = await openApp(page, "capabilities");
    await expect(body).toBeVisible();
    await expect(body.getByTestId("capabilities-graph")).toBeVisible();
    // service list contains real copy from content.ts
    await expect(body).toContainText(/Automation design/);
  });

  test("Work cards open the corresponding app", async ({ page }) => {
    await boot(page);
    const work = await openApp(page, "work");
    await expect(work).toBeVisible();
    await work.getByTestId("work-card-flow").click();
    const flow = isMobile(page)
      ? page.getByTestId("mobile-app")
      : page.locator('[data-testid="window"][data-app="flow"]');
    await expect(flow).toBeVisible();
  });

  test("Origin renders a timeline with multiple entries", async ({ page }) => {
    await boot(page);
    const body = await openApp(page, "origin");
    const entries = body.getByTestId("origin-timeline").locator(".origin__entry");
    expect(await entries.count()).toBeGreaterThanOrEqual(4);
  });

  test("Telemetry counters actually count up", async ({ page }) => {
    await boot(page);
    // Sample text content RIGHT after open — easeOutCubic settles in ~1.6s, so
    // mid-ramp the rendered number must keep changing. assertAnimating only
    // watches CSS, but the counter mutates text — so we poll textContent here.
    await page.getByTestId("app-launcher-telemetry").click();
    const counter = (isMobile(page)
      ? page.getByTestId("mobile-app")
      : page.locator('[data-testid="window"][data-app="telemetry"]')
    ).getByTestId("telemetry-metric").first();
    const samples: string[] = [];
    const deadline = Date.now() + 1800;
    while (Date.now() < deadline) {
      samples.push((await counter.textContent()) ?? "");
      await page.waitForTimeout(120);
    }
    const unique = new Set(samples);
    expect(
      unique.size,
      `counter text should change mid-ramp, saw: ${[...unique].join(" → ")}`,
    ).toBeGreaterThan(1);
  });

  test("Vision shows four trajectory steps", async ({ page }) => {
    await boot(page);
    const body = await openApp(page, "vision");
    await expect(body.getByTestId("vision-steps")).toBeVisible();
    const steps = body.getByTestId("vision-steps").locator(".vision__step");
    expect(await steps.count()).toBe(4);
  });

  test("Contact form submits and surfaces the OS toast", async ({ page }) => {
    await boot(page);
    const body = await openApp(page, "contact");
    const form = body.getByTestId("contact-form");
    await form.locator('input[name=intent][value=hire]').check({ force: true });
    await form.locator('input[type=text]').fill("Jane Operator");
    await form.locator("textarea").fill("Need a Flow for our intake pipeline.");
    await body.getByTestId("contact-submit").click();
    await expect(page.getByTestId("contact-toast")).toBeVisible();
  });
});
