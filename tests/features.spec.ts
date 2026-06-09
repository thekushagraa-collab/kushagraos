import { test, expect } from "@playwright/test";
import { assertAnimating, assertNotAnimating, boot } from "./helpers";

test.describe("Phase 1 — foundation", () => {
  test("hero wordmark renders in Fraunces", async ({ page }) => {
    await page.goto("/");
    const hero = page.getByTestId("hero-wordmark");
    await expect(hero).toContainText(/KUSHAGRA/i);
    const family = await hero.evaluate((el) => getComputedStyle(el).fontFamily);
    expect(family.toLowerCase()).toContain("fraunces");
  });

  test("signal rails are actually animating", async ({ page }) => {
    await page.goto("/");
    await assertAnimating(page, page.getByTestId("signal-rail-pulse").first());
  });

  test("aurora drifts", async ({ page }) => {
    await page.goto("/");
    await assertAnimating(page, page.getByTestId("aurora"), { settleMs: 4000 });
  });

  test("theme toggle flips palette", async ({ page }) => {
    await boot(page);
    const bgBefore = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--bg"),
    );
    await page.getByTestId("theme-toggle").click();
    const bgAfter = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--bg"),
    );
    expect(bgAfter).not.toBe(bgBefore);
  });

  test("motion is ON by default even when the OS reports reduced-motion", async ({
    page,
  }) => {
    // Policy: KushagraOS ignores the OS prefers-reduced-motion setting and
    // animates by default. So even under emulated reduce, the rails must move.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-motion", "on");
    await assertAnimating(page, page.getByTestId("signal-rail-pulse").first());
  });

  test("Motion control OFF flattens motion (the only off-ramp)", async ({ page }) => {
    await boot(page);
    await page.getByTestId("motion-toggle").click();
    await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
    await assertNotAnimating(page, page.getByTestId("signal-rail-pulse").first());
  });

  test("no console errors on load", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await page.goto("/");
    await page.waitForTimeout(1000);
    expect(errors, errors.join("\n")).toHaveLength(0);
  });
});
