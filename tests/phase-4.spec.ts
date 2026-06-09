import { test, expect, type Page } from "@playwright/test";
import { boot, isMobile, settleEntrance } from "./helpers";

// Live provider seam (/api/ask → Groq). Run serially in one worker so the live
// calls don't pile onto the shared preview server concurrently with phase-5's —
// see the note in phase-5.spec.ts. Pure-UI phases keep full parallelism.
test.describe.configure({ mode: "serial" });

async function openAssistant(page: Page) {
  if (isMobile(page)) {
    await page.getByTestId("app-launcher-assistant").click();
  } else {
    await page.getByTestId("voice-button").click();
  }
  await expect(page.getByTestId("assistant")).toBeVisible();
  await settleEntrance(page, "assistant"); // overlay entrance settles before typing/sending
}

test.describe("Phase 4 — voice twin", () => {
  test("Ask opens the voice twin overlay", async ({ page }) => {
    await boot(page);
    await openAssistant(page);
    await expect(page.getByTestId("assistant-transcript")).toBeVisible();
  });

  test("a typed question gets an answer in the transcript", async ({ page }) => {
    await boot(page);
    await openAssistant(page);
    await page.getByTestId("assistant-input").fill("Who is Kushagra?");
    await page.getByTestId("assistant-send").click();
    // /api/ask returns a (real or fallback) answer → a twin turn appears
    await expect(
      page.getByTestId("assistant-transcript").locator('[data-role="twin"]'),
    ).toBeVisible({ timeout: 8000 });
  });

  test("a suggestion chip asks for me", async ({ page }) => {
    await boot(page);
    await openAssistant(page);
    await page.getByText("What has he built?").click();
    await expect(
      page.getByTestId("assistant-transcript").locator('[data-role="user"]'),
    ).toContainText(/built/i);
    await expect(
      page.getByTestId("assistant-transcript").locator('[data-role="twin"]'),
    ).toBeVisible({ timeout: 8000 });
  });

  test("⌘K can open the assistant", async ({ page }) => {
    await boot(page);
    await page.keyboard.press("Control+k");
    await page.getByTestId("cmdk-input").fill("assistant");
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("assistant")).toBeVisible();
  });

  test("the /api/ask endpoint enforces the input cap + returns JSON", async ({ request }) => {
    // 600-char cap: a 5000-char query must still return a clean JSON answer.
    // Unique forwarded-for → own rate bucket (deterministic under parallel runs).
    const res = await request.post("/api/ask", {
      headers: { "x-forwarded-for": `cap-${Date.now()}-${Math.random()}` },
      data: { query: "x".repeat(5000) },
    });
    expect(res.ok()).toBeTruthy();
    expect(res.headers()["content-type"]).toContain("application/json");
    const body = await res.json();
    expect(typeof body.answer).toBe("string");
    expect(body.answer.length).toBeGreaterThan(0);
  });

  test("the /api/ask endpoint rejects empty queries", async ({ request }) => {
    const res = await request.post("/api/ask", {
      headers: { "x-forwarded-for": `empty-${Date.now()}-${Math.random()}` },
      data: { query: "   " },
    });
    expect(res.status()).toBe(400);
  });
});
