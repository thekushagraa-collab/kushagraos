import { test, expect } from "@playwright/test";
import { assertAnimating, boot, isMobile, settleEntrance } from "./helpers";

test.describe("Phase 2 — OS shell", () => {
  test("boot screen shows and the decode indicator animates", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("boot-screen")).toBeVisible();
    await assertAnimating(page, page.getByTestId("boot-decode"));
  });

  test("the KUSHAGRA wordmark resolves during boot", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("hero-wordmark")).toContainText(/KUSHAGRA/, {
      timeout: 6000,
    });
  });

  test("audience routing reorders the dock / home", async ({ page }) => {
    await boot(page, "recruiter");
    const sel = isMobile(page)
      ? '.mhome__grid [data-testid^="app-launcher-"]'
      : '.dock [data-testid^="app-launcher-"]';
    const order = await page
      .locator(sel)
      .evaluateAll((els) => els.map((e) => e.getAttribute("data-testid")));
    // recruiters see proof-of-skill (Work) first
    expect(order[0]).toBe("app-launcher-work");
  });

  test("returning visitor gets the fast path then chooser", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("kos-visits", "3"));
    await page.goto("/");
    await expect(page.getByTestId("boot-screen")).toContainText(/welcome back/i);
    await page.getByTestId("audience-explorer").click();
    await expect(page.getByTestId("theme-toggle")).toBeVisible();
  });

  test("⌘K opens, filters, and opens an app", async ({ page }) => {
    await boot(page);
    await page.keyboard.press("Control+k");
    await expect(page.getByTestId("cmdk")).toBeVisible();
    await page.getByTestId("cmdk-input").fill("flow");
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("cmdk")).toHaveCount(0);
    if (!isMobile(page)) {
      await expect(page.locator('[data-testid="window"][data-app="flow"]')).toBeVisible();
    }
  });

  test("⌘K executes an action (switch theme)", async ({ page }) => {
    await boot(page);
    const before = await page.locator("html").getAttribute("data-theme");
    await page.keyboard.press("Control+k");
    await page.getByTestId("cmdk-input").fill("switch to");
    // Wait for the filtered results to settle on the theme command before
    // triggering it — pressing Enter before the async list update lands raced
    // against a stale selection under CPU load.
    await expect(page.getByTestId("cmdk-item-theme")).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page.locator("html")).not.toHaveAttribute("data-theme", before ?? "");
  });

  /* -------------------------------- desktop -------------------------------- */
  test("desktop: menubar + dock present; dock magnifies on hover", async ({ page }) => {
    test.skip(isMobile(page), "desktop only");
    await boot(page);
    await expect(page.getByTestId("menubar")).toBeVisible();
    await expect(page.getByTestId("dock")).toBeVisible();

    // Magnification animates the icon's WIDTH (reflow), so neighbours push
    // apart instead of overlapping — assert the hovered icon grows wider.
    const icon = page.locator('[data-testid="app-launcher-about"] .dock__icon');
    const before = (await icon.boundingBox())!.width;
    const box = await page.getByTestId("app-launcher-about").boundingBox();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.waitForTimeout(280);
    const after = (await icon.boundingBox())!.width;
    expect(after, "icon should magnify toward the cursor").toBeGreaterThan(before + 4);
  });

  test("desktop: opening an app springs a window in", async ({ page }) => {
    test.skip(isMobile(page), "desktop only");
    await boot(page);
    const win = page.locator('[data-testid="window"][data-app="about"]');
    await page.getByTestId("app-launcher-about").click();
    // sample immediately — the open spring must still be in flight
    await assertAnimating(page, win); // open spring scale
    await expect(win).toBeVisible();
  });

  test("desktop: a window can be dragged", async ({ page }) => {
    test.skip(isMobile(page), "desktop only");
    await boot(page);
    await page.getByTestId("app-launcher-capabilities").click();
    const win = page.locator('[data-testid="window"][data-app="capabilities"]');
    const a = await win.boundingBox();
    const bar = win.locator(".window__bar");
    const bb = await bar.boundingBox();
    await page.mouse.move(bb!.x + bb!.width / 2, bb!.y + bb!.height / 2);
    await page.mouse.down();
    await page.mouse.move(bb!.x + 240, bb!.y + 180, { steps: 8 });
    await page.mouse.up();
    const b = await win.boundingBox();
    expect(Math.abs(b!.x - a!.x) + Math.abs(b!.y - a!.y)).toBeGreaterThan(40);
  });

  test("desktop: maximize + close controls work", async ({ page }) => {
    test.skip(isMobile(page), "desktop only");
    await boot(page);
    await page.getByTestId("app-launcher-origin").click();
    const win = page.locator('[data-testid="window"][data-app="origin"]');
    await win.getByRole("button", { name: "Maximize window" }).click();
    await expect(win).toHaveClass(/window--max/);
    await win.getByRole("button", { name: "Close window" }).click();
    await expect(win).toHaveCount(0);
  });

  /* -------------------------------- mobile --------------------------------- */
  test("mobile: tap app → full-screen → back", async ({ page }) => {
    test.skip(!isMobile(page), "mobile only");
    await boot(page);
    await page.getByTestId("app-launcher-about").click();
    await expect(page.getByTestId("mobile-app")).toBeVisible();
    await settleEntrance(page, "mobile-app"); // let the entrance finish before tapping back
    await page.getByTestId("mobile-back").click();
    await expect(page.getByTestId("mobile-app")).toHaveCount(0);
  });

  test("no console errors through boot + open app", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await boot(page);
    await page.getByTestId("app-launcher-about").click();
    await page.waitForTimeout(600);
    expect(errors, errors.join("\n")).toHaveLength(0);
  });
});
