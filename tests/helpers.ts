import { type Page, type Locator, expect } from "@playwright/test";

/**
 * Drives the Boot screen to the live OS: loads "/", picks an audience at the
 * "log in as" step, and waits for a post-boot control to appear. Works on both
 * form factors (Desktop menubar / MobileHome controls both expose theme-toggle).
 */
export async function boot(page: Page, audience = "explorer") {
  await page.goto("/");
  await page.getByTestId(`audience-${audience}`).click();
  await page.getByTestId("theme-toggle").waitFor({ state: "visible" });
}

/** True when the current project is the phone-OS form factor. */
export function isMobile(page: Page): boolean {
  return (page.viewportSize()?.width ?? 1440) <= 760;
}

/**
 * Wait for an entering panel's transform to settle before interacting with it.
 * Mobile full-screen apps + the voice overlay animate in (scale/translate); a
 * click dispatched mid-entrance can fail to register on the handler (the
 * panel is still transforming), which made those tests flaky. This polls the
 * computed transform via rAF and resolves once it's unchanged for a few frames
 * (works for tween OR spring), capped so it never hangs. No magic timeout.
 */
export async function settleEntrance(page: Page, testId: string): Promise<void> {
  const loc = page.getByTestId(testId);
  if ((await loc.count()) === 0) return;
  await loc.first().evaluate(
    (el) =>
      new Promise<void>((resolve) => {
        const start = performance.now();
        let last = "";
        let stable = 0;
        const tick = () => {
          if (performance.now() - start > 2500) return resolve(); // safety cap
          const t = getComputedStyle(el).transform;
          if (t === last) {
            if (++stable >= 3) return resolve();
          } else {
            stable = 0;
            last = t;
          }
          requestAnimationFrame(tick);
        };
        tick();
      }),
  );
}

interface MotionSample {
  /** Computed value of the watched property (e.g. the transform matrix). */
  prop: string;
  /** currentTime (ms) of a running Web Animation on the element, if any. */
  time: number | null;
}

/**
 * Fails if the element is NOT animating. Polls within a window and passes as
 * soon as it observes motion, where "motion" is EITHER:
 *   (a) the computed property changed, OR
 *   (b) a running Web Animation's `currentTime` advanced.
 *
 * Why both: transform/opacity animations with `will-change` run on the
 * compositor thread, and WebKit's `getComputedStyle()` returns the *base* value
 * rather than the live composited value — so (a) alone yields false negatives on
 * mobile Safari even while the element is visibly moving. `currentTime` is
 * exposed on the main thread by the Web Animations API for those same
 * compositor animations, so (b) is genuine, engine-agnostic proof of playback.
 * Polling (vs. a single two-sample compare) also avoids false negatives when a
 * sample lands on an eased animation's near-zero-velocity endpoint or loop-wrap.
 * A truly static element (motion OFF → `animation: none`) has no running
 * animation and an unchanging property, so this still fails for it.
 */
export async function assertAnimating(
  page: Page,
  locator: Locator,
  { property = "transform", settleMs = 2000 }: { property?: string; settleMs?: number } = {},
) {
  const read = (): Promise<MotionSample> =>
    locator.evaluate((el, p) => {
      const prop = getComputedStyle(el).getPropertyValue(p);
      const anims = typeof el.getAnimations === "function" ? el.getAnimations() : [];
      const running = anims.find((a) => a.playState === "running");
      const ct = running ? running.currentTime : null;
      const time = typeof ct === "number" ? ct : null;
      return { prop, time };
    }, property);

  const first = await read();
  const deadline = Date.now() + settleMs;
  let last = first;
  while (Date.now() < deadline) {
    await page.waitForTimeout(120);
    last = await read();
    const propMoved = last.prop !== first.prop;
    const timeMoved = first.time !== null && last.time !== null && last.time !== first.time;
    if (propMoved || timeMoved) return; // observed motion → animating
  }
  expect(
    last.prop !== first.prop || (first.time !== null && last.time !== first.time),
    `expected ${property} or a running animation's currentTime to change ` +
      `(element should be animating) but ${property} stayed "${first.prop}" and ` +
      `currentTime stayed ${String(first.time)}`,
  ).toBe(true);
}

/** Inverse: fails if the element IS still moving (used after the in-app Motion control is OFF). */
export async function assertNotAnimating(
  page: Page,
  locator: Locator,
  opts: { property?: string; settleMs?: number } = {},
) {
  const prop = opts.property ?? "transform";
  const read = () =>
    locator.evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop);
  const a = await read();
  await page.waitForTimeout(opts.settleMs ?? 800);
  const b = await read();
  expect(a, `expected ${prop} to stay static under reduced-motion`).toBe(b);
}
