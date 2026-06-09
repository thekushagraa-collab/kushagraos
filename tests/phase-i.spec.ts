import { test, expect, type Page } from "@playwright/test";
import { boot, isMobile, settleEntrance } from "./helpers";

/* ============================================================================
   Phase I — Voice (Whisper STT) · Growth hooks (lead capture + branded share
   card) · a11y · perf/deploy. DoD: full suite green; the new surfaces work.
   ========================================================================== */

async function openApp(page: Page, id: string) {
  await page.getByTestId(`app-launcher-${id}`).click();
  if (isMobile(page)) {
    await settleEntrance(page, "mobile-app");
    return page.getByTestId("mobile-app");
  }
  return page.locator(`[data-testid="window"][data-app="${id}"]`);
}

test.describe("Phase I — accessibility", () => {
  test("a skip link targets #main and reveals on focus", async ({ page }) => {
    await boot(page, "explorer");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toHaveAttribute("href", "#main");
    await skip.focus();
    await expect(skip).toBeFocused();
    await expect(page.locator("#main")).toHaveCount(1);
  });
});

test.describe("Phase I — voice", () => {
  test("/api/stt rejects empty audio gracefully", async ({ request }) => {
    const res = await request.post("/api/stt", { data: {} });
    expect(res.status()).toBe(400);
    const json = await res.json();
    expect(json).toHaveProperty("text", "");
  });

  test("the voice twin opens with a usable input (and a mic on desktop)", async ({ page }) => {
    await boot(page, "explorer");
    if (isMobile(page)) {
      await page.getByTestId("app-launcher-assistant").click();
    } else {
      await page.getByTestId("voice-button").click();
    }
    await expect(page.getByTestId("assistant")).toBeVisible();
    await settleEntrance(page, "assistant");
    await expect(page.getByTestId("assistant-input")).toBeVisible();
    if (!isMobile(page)) {
      // Chromium has MediaRecorder + getUserMedia → Whisper push-to-talk shows.
      await expect(page.getByTestId("assistant-mic")).toBeVisible();
    }
  });
});

test.describe("Phase I — growth hooks", () => {
  // Live /api/agent calls → run serially in one worker (see phase-4/5 notes).
  test.describe.configure({ mode: "serial" });

  async function runFirstAgent(page: Page) {
    const studio = await openApp(page, "studio");
    await studio.getByTestId(/^agent-card-/).first().click();
    await page.getByTestId("agent-input").fill("We sell an AI onboarding tool to fintech startups.");
    await page.getByTestId("agent-run").click();
    await expect(page.getByTestId("agent-result")).toBeVisible({ timeout: 30_000 });
  }

  test("every artifact offers a branded image download", async ({ page }) => {
    await boot(page, "client");
    await runFirstAgent(page);
    const share = page.getByTestId("artifact-share");
    await expect(share).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 15_000 }),
      share.click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/^kushagraos-.*\.png$/);
  });

  test("typed intent is captured as a lead signal in Founder Mode", async ({ page }) => {
    const key = process.env.FOUNDER_KEY;
    test.skip(!key, "FOUNDER_KEY not provided to the test process — leads view skipped.");
    await boot(page, "client");
    await runFirstAgent(page); // records a lead signal

    await page.evaluate(() => {
      window.location.hash = "founder";
    });
    await page.getByTestId("founder-gate-input").fill(key!);
    await page.getByTestId("founder-gate-submit").click();
    await expect(page.getByTestId("founder-mode")).toBeVisible();

    const leads = page.getByTestId("founder-leads");
    await expect(leads).toBeVisible();
    await expect(leads.getByText("AGENT", { exact: true })).toBeVisible();
  });
});
