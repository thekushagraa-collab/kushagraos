import { test, expect } from "@playwright/test";
import { assertAnimating, boot } from "./helpers";

/* ============================================================================
   Phase H — Founder Mode (private, server-key-gated).
   DoD: founder route gated (no key → denied); absent from public "login as";
   tests green.
   ========================================================================== */

test.describe("Phase H — Founder Mode", () => {
  test("founder is ABSENT from the public 'log in as' chooser", async ({ page }) => {
    await page.goto("/");
    // The three public lenses exist…
    await expect(page.getByTestId("audience-client")).toBeVisible();
    await expect(page.getByTestId("audience-recruiter")).toBeVisible();
    await expect(page.getByTestId("audience-explorer")).toBeVisible();
    // …and the private founder lens does not.
    await expect(page.getByTestId("audience-founder")).toHaveCount(0);
  });

  test("#founder deep-link raises the passphrase gate", async ({ page }) => {
    await boot(page, "explorer");
    await page.evaluate(() => {
      window.location.hash = "founder";
    });
    await expect(page.getByTestId("founder-gate")).toBeVisible();
    await expect(page.getByTestId("founder-gate-input")).toBeVisible();
  });

  test("wrong passphrase is DENIED server-side (no surface unlocked)", async ({ page }) => {
    await boot(page, "explorer");
    await page.evaluate(() => {
      window.location.hash = "founder";
    });
    await page.getByTestId("founder-gate-input").fill("definitely-not-the-key");
    await page.getByTestId("founder-gate-submit").click();
    await expect(page.getByTestId("founder-gate-error")).toBeVisible();
    // The control surface must NOT have mounted.
    await expect(page.getByTestId("founder-mode")).toHaveCount(0);
  });

  test("empty passphrase is denied", async ({ page }) => {
    await boot(page, "explorer");
    await page.evaluate(() => {
      window.location.hash = "founder";
    });
    await page.getByTestId("founder-gate-submit").click();
    await expect(page.getByTestId("founder-gate-error")).toBeVisible();
    await expect(page.getByTestId("founder-mode")).toHaveCount(0);
  });

  test("the gate scan indicator is actually animating", async ({ page }) => {
    await boot(page, "explorer");
    await page.evaluate(() => {
      window.location.hash = "founder";
    });
    await assertAnimating(page, page.getByTestId("founder-gate-scan"));
  });

  test("the correct passphrase unlocks the control surface, and Lock exits", async ({ page }) => {
    const key = process.env.FOUNDER_KEY;
    test.skip(!key, "FOUNDER_KEY not provided to the test process — unlock path skipped.");
    await boot(page, "explorer");
    await page.evaluate(() => {
      window.location.hash = "founder";
    });
    await page.getByTestId("founder-gate-input").fill(key!);
    await page.getByTestId("founder-gate-submit").click();

    const surface = page.getByTestId("founder-mode");
    await expect(surface).toBeVisible();
    // Read-only control surface renders its cards.
    await expect(page.getByTestId("founder-status")).toBeVisible();
    await expect(page.getByTestId("founder-build")).toBeVisible();

    // Lock & exit returns to the OS.
    await page.getByTestId("founder-exit").click();
    await expect(surface).toHaveCount(0);
  });
});

test.describe("Phase H — ⌘K Founder entry (desktop)", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) <= 760, "desktop-only keyboard path");

  test("Founder command is hidden from browse but searchable, and opens the gate", async ({
    page,
  }) => {
    await boot(page, "explorer");
    await page.keyboard.press("Control+k");
    await expect(page.getByTestId("cmdk")).toBeVisible();

    // Hidden from the empty-query browse list…
    await expect(page.getByTestId("cmdk-item-founder")).toHaveCount(0);

    // …but surfaces once searched.
    await page.getByTestId("cmdk-input").fill("founder");
    const item = page.getByTestId("cmdk-item-founder");
    await expect(item).toBeVisible();
    await item.click();

    await expect(page.getByTestId("founder-gate")).toBeVisible();
  });
});
