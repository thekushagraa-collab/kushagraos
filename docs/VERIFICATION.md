# KushagraOS — Verification Harness ("is it actually working?")

> Purpose: stop features from being marked "done" when they only *look* done (e.g. the Signal Field
> rails that were static, not animating). Every spec feature gets a concrete, automated acceptance
> check. A phase is NOT complete until its checks pass — this is the **Definition of Done (DoD) gate**.

## Core principle
**Nothing is "done" until a test proves it.** Three layers:
1. **Existence** — the element/behavior is in the DOM.
2. **Behavior** — it actually *does the thing* (motion moves, theme flips, memory persists).
3. **Quality** — both themes, motion policy honored (see below), no console errors, within perf budget.

> **Motion policy (KUSHAGRAOS-SPEC):** KushagraOS ALWAYS animates by default, regardless of the OS
> `prefers-reduced-motion` setting. The OS media query does NOT gate animation. The ONLY thing that
> flattens motion is the in-app **Motion** control in the menubar (default ON), reflected as
> `data-motion="on" | "off"` on `<html>`. Tests therefore assert: (a) motion is ON by default *even when
> the browser reports reduced-motion*, and (b) toggling the Motion control OFF flattens motion.

The hard one is **motion**, because a screenshot can't show it. We solve that by **sampling an element
twice over time and asserting it changed** (see `assertAnimating` below). This is the single most
important check — it's what catches "the rails aren't moving" automatically.

## Tooling
- **Playwright** (`@playwright/test`) — drives the live build, samples computed styles over time,
  checks `localStorage`, toggles theme, toggles the in-app Motion control, takes screenshots.
- Run against the **preview build** (not `npm run dev`, which ECC's Bash hook blocks):
  Playwright's `webServer` runs `npm run build && npm run preview` (port 4173).

### Setup (build chat runs these)
```bash
npm i -D @playwright/test
npx playwright install chromium
```

`playwright.config.ts`:
```ts
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  use: { baseURL: 'http://localhost:4173' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile',  use: { ...devices['iPhone 13'] } },
  ],
});
```

## The key helper — prove motion is REAL
```ts
// tests/helpers.ts
import { Page, Locator, expect } from '@playwright/test';

/** Fails if the element is NOT animating (its computed property doesn't change over time). */
export async function assertAnimating(
  page: Page, locator: Locator,
  { property = 'transform', settleMs = 700 }: { property?: string; settleMs?: number } = {},
) {
  const read = () => locator.evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), property);
  const a = await read();
  await page.waitForTimeout(settleMs);
  const b = await read();
  expect(a, `expected ${property} to change (element should be animating) but it stayed "${a}"`).not.toBe(b);
}

/** Inverse: fails if the element IS still moving (used after the in-app Motion control is OFF). */
export async function assertNotAnimating(
  page: Page, locator: Locator, opts: { property?: string; settleMs?: number } = {},
) {
  const prop = opts.property ?? 'transform';
  const read = () => locator.evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop);
  const a = await read(); await page.waitForTimeout(opts.settleMs ?? 700); const b = await read();
  expect(a, `expected ${prop} to stay static under reduced-motion`).toBe(b);
}
```

> Every animated element MUST expose a stable hook: `data-testid="..."` (e.g. `data-testid="signal-rail-pulse"`,
> `data-testid="aurora"`, `data-testid="hero-wordmark"`). This is a build requirement, not optional.

## Required `data-testid` hooks (build must add these)
`hero-wordmark`, `signal-rail-pulse` (on the animated pulse, not the static rail), `aurora`,
`cursor-spotlight`, `theme-toggle`, `motion-toggle`, `boot-screen`, `dock`, `menubar`, `window` (each app window),
`cmdk` (command bar), `voice-button`, `app-launcher-<id>`, `telemetry-metric`.

## Feature acceptance map (extend as phases land)
| Feature (from spec) | Automated check |
|---|---|
| Signal Field rails **move** | `assertAnimating(page, railPulse)` — transform/opacity changes over time |
| Aurora drift | `assertAnimating(page, aurora, { settleMs: 1500 })` |
| Cursor spotlight follows mouse | move mouse to 2 points, assert spotlight's `transform`/position differs |
| Theme switch flips palette | click `theme-toggle`; assert `<html data-theme>` flips AND `--bg` computed value changes |
| Returning-visitor memory | load once → assert boot full; reload → assert localStorage key set + "welcome back" copy |
| Time-aware greeting | mock `Date`/timezone via `page.clock`/`addInitScript`; assert greeting text matches band |
| Hero wordmark visible & correct font | assert `KUSHAGRA` text + computed `font-family` contains `Fraunces` |
| Boot decode reveal | `assertAnimating(page, boot-decode)` — the scan bead's transform loops while booting |
| Audience routing | pick `audience-recruiter`; assert dock/home first launcher is `app-launcher-work` |
| Returning-visitor fast path | `addInitScript` set `kos-visits`; assert boot shows "welcome back" |
| Window open from dock | click `app-launcher-x`; assert a `window[data-app=x]` appears; sample open spring immediately (assertAnimating) |
| Window drag moves it | drag `.window__bar`; assert bounding box `x/y` changed |
| Maximize / close | click "Maximize window" → `.window--max`; "Close window" → window count 0 |
| Dock magnification | hover an `app-launcher-x`; assert its `.dock__icon` transform (scale) changes |
| Mobile app open/back | (mobile project) tap `app-launcher-x` → `mobile-app` visible → `mobile-back` → count 0 |
| ⌘K opens + executes | press `Control+K`; assert `cmdk` visible; type → `cmdk-input`; Enter opens app / runs action (theme) |
| Magnetic CTA | hover near button; assert its `transform` shifts toward cursor |
| Voice button reachable | assert `voice-button` present in menubar/dock and focusable |
| Voice twin opens (menubar/⌘K/mobile) | click `voice-button` (or `app-launcher-assistant` on mobile) → `assistant` visible |
| Twin answers a question | type in `assistant-input` → send → a `[data-role="twin"]` turn appears (real Gemini or graceful fallback) |
| /api/ask guards | POST `/api/ask`: empty → 400; 5000-char → 200 JSON capped answer; rate limit → 429 |
| Contact real submit | Contact form → POST `/api/contact` (Web3Forms when keyed, else graceful) + success toast |
| Motion ON by default under OS reduced-motion | `page.emulateMedia({ reducedMotion: 'reduce' })`; assert `<html data-motion="on">` AND `assertAnimating` on rails |
| Motion control OFF flattens motion | click `motion-toggle`; assert `<html data-motion="off">` AND `assertNotAnimating` on rails/aurora |
| Both themes intentional | screenshot `data-theme=atelier` and `nocturne` at 320/768/1024/1440 |
| No console errors | collect `page.on('console')` errors → assert none (excluding known-allowed) |
| Perf budget | optional Lighthouse/CWV pass on the hero route |

## Example test file
```ts
// tests/features.spec.ts
import { test, expect } from '@playwright/test';
import { assertAnimating, assertNotAnimating } from './helpers';

test.describe('Phase 1 — foundation', () => {
  test('hero wordmark renders in Fraunces', async ({ page }) => {
    await page.goto('/');
    const hero = page.getByTestId('hero-wordmark');
    await expect(hero).toContainText(/KUSHAGRA/i);
    const family = await hero.evaluate(el => getComputedStyle(el).fontFamily);
    expect(family.toLowerCase()).toContain('fraunces');
  });

  test('signal rails are actually animating', async ({ page }) => {
    await page.goto('/');
    await assertAnimating(page, page.getByTestId('signal-rail-pulse').first());
  });

  test('aurora drifts', async ({ page }) => {
    await page.goto('/');
    await assertAnimating(page, page.getByTestId('aurora'), { settleMs: 1500 });
  });

  test('theme toggle flips palette', async ({ page }) => {
    await page.goto('/');
    const bgBefore = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--bg'));
    await page.getByTestId('theme-toggle').click();
    const bgAfter = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--bg'));
    expect(bgAfter).not.toBe(bgBefore);
  });

  test('motion is ON by default even when the OS reports reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'on');
    await assertAnimating(page, page.getByTestId('signal-rail-pulse').first());
  });

  test('Motion control OFF flattens motion (the only off-ramp)', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('motion-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'off');
    await assertNotAnimating(page, page.getByTestId('signal-rail-pulse').first());
  });

  test('no console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto('/');
    await page.waitForTimeout(1000);
    expect(errors, errors.join('\n')).toHaveLength(0);
  });
});
```

## Definition of Done (DoD) gate — per phase
A phase is complete ONLY when:
- [ ] Every feature added this phase has a passing test in `tests/`.
- [ ] All motion features pass `assertAnimating` (and `assertNotAnimating` under reduced-motion).
- [ ] Both themes screenshotted at 320/768/1024/1440.
- [ ] Zero unexpected console errors.
- [ ] `npx playwright test` is green.

**Build-chat rule:** before claiming a phase done, RUN `npx playwright test` and paste the result.
Do not say "the rails animate" — prove it with the passing `assertAnimating` test. If a test can't be
written for a feature, say so explicitly and provide a manual verification step instead.

## How to use each phase
1. Build the feature + add its `data-testid`.
2. Add/extend its test in `tests/features.spec.ts` (Phase 1) / `tests/phase-N.spec.ts`.
3. Run `npx playwright test`. Red = not done. Green = done.
4. Screenshot both themes for the human review.
