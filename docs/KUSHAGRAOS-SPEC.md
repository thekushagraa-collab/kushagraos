# KushagraOS — Portfolio (an AI Operating System) — Design & Build Plan

> **Companion spec: `docs/AYRA-SPEC.md`** — KushagraOS is operated by **AYRA**, a JARVIS-style AI twin
> (omnipresent assistant, AI Lab, Automation Center, Agent Marketplace, Client Mode, sandboxed multi-agent
> execution engine, simulated productivity integrations, private Founder Mode). Read it alongside this file.

## Context
Kushagra (19, AI-automation builder; goal: millionaire by 25) wants a portfolio that is
*unique, classy, unforgettable* — a visitor should instantly "get" who he is and feel he's
someone to follow. Locked concept: **KushagraOS** — not a website *about* him but a living AI
**operating system that IS him**. Principle: **form = function** (he builds AI automation, so
the site behaves like a refined, self-running system). Steer: **classy, not funky** — precision
instrument (Linear / Vercel / Family.co / Teenage Engineering / macOS-elegant), never neon/gamer.

Scaffolded at `PORTFOLIO/portfolio/` (Vite + React + TS + framer-motion). Rules in
`portfolio/CLAUDE.md`. Skills: `frontend-design`, `ui-ux-pro-max`, `claude-api`. MCPs: `magic` (21st.dev).

## Locked decisions
- **Real OS, adaptive:** Desktop = true environment (boot → desktop, top **menubar**, **dock**,
  draggable/resizable **app windows**, ⌘K, always-present voice). Mobile = **phone-OS** metaphor
  (home screen of app icons → full-screen apps, swipe to switch). One design language, two form factors.
- **Voice assistant (premium), site-wide:** push-to-talk. Visitor speaks → STT → Claude (answers
  as Kushagra's assistant, scoped to his knowledge) → **ElevenLabs natural voice** out + live
  on-screen transcript. Always reachable (menubar/dock + ⌘K).
- **Hero:** name unmistakable — huge **KUSHAGRA** on open, role "AI automation operator", the
  "0.1% of the system" line.
- **Work = 4 live apps** (fully live, real APIs), each a case study.
- **Theme:** Day/Night duality (Atelier ivory / Nocturne graphite), tokens below.
- **Type:** Fraunces (display serif) · Geist Mono (system labels) · General Sans (body).

## Design System
Dual-theme CSS variables in `src/styles/tokens.css` (switch via `data-theme`):
- Nocturne: `--bg:#0B0B0F` `--surface:#141419` `--surface-2:#1C1C22` `--text:#EDE8DF`
  `--muted:#9A958C` `--hairline:rgba(237,232,223,.08)` `--accent:#C8A86B` `--accent-strong:#E3C68A`
- Atelier: `--bg:#F4F1EA` `--surface:#FBFAF6` `--text:#15140F` `--muted:#5C584F`
  `--hairline:rgba(21,20,15,.10)` `--accent:#9A6B2F` `--accent-strong:#7A521F`

Texture/motion: film grain, 1px hairline grid, subtle cursor glow, custom cursor → node-connector
near graphs, magnetic CTAs, ONE hero text-decode reveal, window open/close spring physics. Lenis
smooth scroll. framer-motion: **transform/opacity only**, never `transition-all`/layout props.
**MOTION POLICY (Kushagra's decision — OVERRIDES default a11y behavior):** KushagraOS ALWAYS animates
by default, regardless of the visitor's OS `prefers-reduced-motion` setting. Do NOT auto-disable motion
from the OS media query. Instead, the OS owns motion via an **in-app "Motion" toggle in the menubar
(default ON)**; only that toggle (set by the visitor inside the site) flattens animation. Rationale:
the live, animated OS *is* the product. AA contrast still required both themes.

## OS Shell + IA (apps, not pages)
- **Boot** (brief, skippable) → assembles KUSHAGRA → **Desktop**.
- **Menubar:** `KushagraOS · Ask (voice) · Apps · Theme · Contact`. **Dock:** app launchers.
- **⌘K command bar:** open apps, ask the assistant, jump anywhere.
- **Apps (windows on desktop / full-screen on mobile):**
  1. **About / Hero** — name, role, 0.1% line, voice CTA.
  2. **Capabilities** — services as automation nodes.
  3. **Work** — launches the 4 live apps below + case studies.
  4. **Origin** — journey as an editorial changelog timeline.
  5. **Telemetry** — count-up metrics.
  6. **Vision** — millionaire→billionaire trajectory.
  7. **Contact** — "initiate a process" (Resend email) + socials + resume.
- **Assistant** — persistent voice/text twin overlay.

## Work = 4 live apps (fully live) + case studies
1. **Flow** — visual automation builder that *runs for real*: drag Trigger → AI → Action and
   execute (e.g., URL/text → Claude → email/Slack/webhook). Flagship proof he automates.
2. **Atlas** — autonomous outbound engine: enter niche/ICP → research + hyper-personalized
   outreach + live pipeline with predicted reply rates.
3. **Forge** — AI content engine: long video/podcast → transcribe → extract moments →
   clips/threads/captions in an interactive editor.
4. **Voice assistant** — premium voice twin (counts as the 4th live build).
Each ships a case study (problem → build → outcome metric → stack). Kushagra's 1 existing
project is added as a 5th once he shares details.

## Architecture
**Front-end** (`src/`): `os/` (Boot, Desktop, WindowManager, Window, Dock, MenuBar, MobileHome),
`apps/` (About, Capabilities, Work, Origin, Telemetry, Vision, Contact, Flow, Atlas, Forge),
`assistant/` (VoiceAssistant, Transcript, useMic, useTTS), `components/ui/`, `components/graph/`
(BlueprintGraph), `lib/` (theme, lenis, motion, cn, store), `hooks/`, `content/*.json`
(profile, services, projects, journey, metrics, twin-knowledge — Kushagra edits these).
State via a small store (Zustand) for window/app/theme/assistant state.

**Back-end** (Vercel serverless `api/`): `ask.ts` (Claude, prompt-cached knowledge block, scope
+ prompt-injection guardrails), `stt.ts` (speech→text), `tts.ts` (ElevenLabs), `flow-run.ts`
(executes Flow actions: Claude + email/Slack/webhook), `atlas.ts` (research+draft),
`forge.ts` (transcribe+generate), `contact.ts` (Resend). **All API keys server-side only.**
**Public-site safeguards (critical):** per-session rate limits + quotas, input size caps,
Turnstile/abuse check, spend caps per provider, graceful fallback to canned/demo output if a
key is missing or a quota is hit.

## Build order (phased; build in a FRESH chat, hooks tamed)
1. Foundation: tokens + day/night + fonts + Lenis + grain/cursor + store.
2. OS shell: Boot → Desktop → WindowManager/Dock/MenuBar + mobile phone-OS adaptation + ⌘K.
3. Hero/About + Capabilities + Origin + Telemetry + Vision + Contact (static content first).
4. Voice assistant end-to-end (STT → ask.ts → ElevenLabs TTS + transcript) with safeguards.
5. Live apps: **Flow** → **Atlas** → **Forge**, each + case study.
6. Polish: audience routing, magnetics/decode, a11y + perf, deploy to Vercel.

## Inputs / keys needed from Kushagra
- Details of your 1 existing project (name, what it does, outcome, link) → becomes a case study.
- Socials (X, GitHub, LinkedIn, email), optional resume PDF, optional photo, domain + brand spelling.
- For "fully live": **Anthropic key** (Claude), **ElevenLabs key** (voice), **STT key**
  (Deepgram or OpenAI Whisper), **Resend key** (contact), plus per-app keys (Slack webhook for
  Flow; a search/enrichment API for Atlas). **Vercel** account for deploy. Accept per-use API
  costs; we add spend caps + rate limits because the site is public.

## Verification
- **Automated feature checker — see `docs/VERIFICATION.md` (REQUIRED).** Playwright harness that PROVES
  each feature works (incl. `assertAnimating` which samples an element over time so "motion not actually
  moving" fails the build). Every phase has a Definition-of-Done gate: `npx playwright test` must be green
  before a phase is called done. Build must add the required `data-testid` hooks. Never claim a motion
  feature works without a passing `assertAnimating` test.
- Dev via **Claude Preview MCP** (`preview_start`) to bypass ECC's `npm run dev` block;
  `preview_screenshot` at **320/768/1024/1440** in **both themes**; ≥2 refine rounds per major
  surface (per `portfolio/CLAUDE.md`).
- OS: window open/move/resize/focus; mobile home → app → back; ⌘K.
- Voice: mic permission, push-to-talk, STT→answer→TTS, transcript, fallback path.
- Live apps: real round-trip per app + safeguards (rate limit, quota, fallback).
- a11y (focus, contrast, reduced-motion, landmarks) + Lighthouse/CWV.

## Process / cost note
Session cost is very high (~$130) and context is heavy. **Strong recommendation:** disable the
noisy ECC cost/fact-gate hooks and execute this multi-phase build in a **fresh chat** that reads
this spec. Build phase-by-phase, review screenshots each phase, wire live keys in Phase 4–5.

---

## Kushagra's existing project (Work case study #5 — real)
**CreatorScout — lead-gen tool for Instagram influencer-marketing agencies.**
Finds creator/influencer leads for a given campaign.
- Input: campaign details.
- Output per creator: username, Instagram profile link, follower count, eligibility for that
  campaign, and related signals.
- Lets agencies search creators/followers who fit a campaign.
- Data source: an Instagram/creator data API (so this project, like the live demos, needs a key).
- Socials/live link: TBD (Kushagra to provide).
Present as a polished case study (problem → build → outcome metric → stack). Decide later whether
to embed a live mini-demo or show screenshots + link.

---

## Runtime AI stack (REVISED — free-tier, Gemini-first)
Kushagra has Claude Pro + Gemini Advanced *subscriptions* (the consumer chat apps), but NOT API
keys. A public website cannot use a personal subscription — it needs an **API key** (separate
thing). Good news: Google AI Studio gives a **free Gemini API key** (no card, free tier) that can
power almost everything:
- Assistant brain, Flow AI step, Atlas drafting, Forge generation → **Gemini API (free tier)**.
- Voice OUT → **Gemini TTS** (free tier, natural) with browser `speechSynthesis` fallback.
- Voice IN → browser `SpeechRecognition` (free) or Gemini audio input.
- Contact email → **Web3Forms/Formspree free** (or mailto) — no Resend needed.
- Atlas / CreatorScout real Instagram creator data = the only genuinely paid/hard part →
  ship with **realistic demo data** now; wire a real source later if desired.
- Deploy → **Vercel free tier**.
Keep a thin provider abstraction so Claude can be swapped in later if an Anthropic API key is added.
All keys stay server-side; rate limits + spend caps still apply.

---

## CRAFT DOCTRINE — "looks like enormous effort went into it" (READ FIRST, applies everywhere)
The goal is the **"wait — *one person* built this?"** reaction. That feeling does NOT come from more
effects; it comes from **finishing every edge most sites skip**. When nothing is left at a default,
the brain reads obsessive effort. Apply these as non-negotiable across every surface:

1. **Nothing is ever default.** Custom cursor, custom scrollbar, custom text-selection color, custom
   focus rings, custom context menu (right-click → an OS-style menu), custom tooltips. Zero browser defaults visible.
2. **Every state is designed.** Each interactive element has hover + focus-visible + active +
   disabled. Every async surface has loading (skeleton/shimmer), empty, error, and success states —
   all on-brand, never a bare spinner.
3. **Physics, not transitions.** Motion uses spring inertia, momentum, and easing that feels physical
   (windows have weight; the dock has bounce-settle; drag has friction). Never linear/`transition-all`.
4. **Rhythm system.** One 8px spacing scale and a strict type scale used everywhere — consistency at
   this level is itself a craft signal. No random pixel values.
5. **Speed is a feature.** Instant response, no jank, 60fps. Paradoxically, *fast* reads as
   *high-effort*. Keep within CWV budgets (see performance rules).
6. **Micro-copy with a point of view.** System-flavored, confident, a little wry — never lorem/filler.
   Labels like "booting…", "process initiated", "0.1% of the system".
7. **Depth rewards.** A few discoverable details: a tiny easter egg in ⌘K, a Konami-style flourish,
   a hidden line in the menubar. Reward the curious — signals love for the craft.
8. **Keyboard-first.** ⌘K everywhere, real shortcuts (open apps, switch theme, toggle voice), visible
   shortcut hints. Power-user finish.
9. **Real, not faked.** The live apps actually run. Working > screenshots. This is the ultimate effort signal.
10. **Accessibility done properly.** Focus order, landmarks, reduced-motion, AA contrast both themes,
    keyboard traps avoided. Craft includes the people you can't see.

**Taboo (tips into "funky"/try-hard):** glitch/RGB-split text, neon glow, scanlines, typewriter
effect, more than ~2 simultaneous "hero" animations on one screen, gratuitous parallax. Restraint is the flex.

---

## PALETTE UPDATE — cool base (supersedes the warm tokens above)
Feedback: the warm champagne+ivory read as "ancient/parchment." Fix: **cool graphite base, gold as a
RARE accent only, cool signal-light for motion.** This is what separates "modern OS" from "antique schematic".
- **Nocturne (dark):** `--bg:#08080C` `--surface:#101015` `--surface-2:#16161D` `--text:#ECEEF2`
  `--muted:#8B8F99` `--hairline:rgba(236,238,242,.07)` `--signal:#BFE9FF` (cool cyan-white, used for
  rail pulses/glow) `--accent:#C8A86B` (gold — reserved for active app / primary CTA only) `--accent-strong:#E3C68A`.
- **Atelier (light):** `--bg:#F4F2EC` `--surface:#FCFBF8` `--text:#14151A` `--muted:#5B5F69`
  `--hairline:rgba(20,21,26,.10)` `--signal:#2D7FB8` `--accent:#9A6B2F` `--accent-strong:#7A521F`.
Rule of thumb: **cool light moving over a cool-neutral base; warm gold appears only where attention must go.**

---

## BACKGROUND — "Signal Field" (3 layers, all `position:fixed; pointer-events:none`, GPU only)
The background behaves like the OS is quietly alive and processing. Not wallpaper — ambient system life.
- **Layer 1 — Vertical light rails.** Faint vertical hairlines (NON-uniform spacing). Only ~3–4 at a
  time carry a slow `--signal` light pulse drifting top→bottom over 6–10s, staggered so they never
  sync; the rest stay dim/still. The contrast (mostly still, few "carrying signal") is what makes it
  intentional, not patterned.
- **Layer 2 — Aurora drift.** One very large, very soft radial/conic gradient blob (~8% opacity,
  `--signal`/`--accent` tinted) slowly drifting + breathing behind everything. Kills the "flat" feeling, adds depth.
- **Layer 3 — Cursor spotlight + film grain.** Low-opacity radial glow follows the cursor (surface
  feels responsive to you); existing film grain on top ties it together. Biggest "alive/premium" win per cost.
- **Reserve (use only if still empty):** sparse dot-field with slight cursor parallax.
- **Parallax on window drag:** dragging a window shifts rails+aurora a few px the opposite direction (real depth, ~0 cost).
- Layers flatten ONLY when the in-app **Motion toggle** is set to OFF (default ON) — NOT from the OS
  `prefers-reduced-motion` query (see Motion Policy). Cycles slow (6–10s) + low opacity — if you can "watch" it, it's too much.

---

## MOTION SYSTEM — curated "build" set (the rest are held/banned)
**Depth/3D:** parallax-on-drag (above); icon/card **tilt-on-hover** toward cursor (max ~6°, soft
specular sweep). *(Held for Phase 6: optional Three.js/R3F slow-rotating glass/wireframe artifact behind the hero.)*

**Text:** hero **decode reveal** (KUSHAGRA assembles from scrambled mono glyphs into the serif
wordmark, once, on boot — signature moment); subtle **variable-weight breathing** as aurora passes
behind the wordmark; periodic **light-sweep** across KUSHAGRA every ~12s (the "signal" touches the
name); **per-line clip-path mask reveals** for section copy.

**Transitions:** **boot** = rails draw in top→down, aurora fades up, dock/menubar slide in last
(~1.2s, skippable); **window open/close** = spring scale from the dock icon's origin (genie-lite) +
quick backdrop-blur pulse; **mobile app↔app** = shared-element morph (icon → app header); **theme
switch** = soft radial light-sweep crosses screen, palette transitions through it (~600ms, never a hard cut).

**Ambient life:** live **menubar telemetry** (clock + faint 1px equalizer / "uptime" tick); **idle
behavior** — after ~15s no input, aurora drifts a touch more and a soft "Ask me anything ⌘K" hint
pulses (the OS *notices* you); **cursor-as-connector** near the BlueprintGraph (cursor sprouts a faint node line).

**Micro-interactions:** **magnetic CTAs** (primary buttons pull gently toward cursor in range);
**optional sound** (barely-there tick on window open / ⌘K) — **off by default, menubar toggle**.

**Banned (see Craft Doctrine taboo list):** glitch text, neon, scanlines, typewriter, >2 simultaneous hero animations.

---

## SIGNATURE ENHANCEMENTS — the "1% built this" features (curated; CORE vs STRETCH marked)
These are the rare, high-effort touches that make a viewer feel a real OS, not a portfolio. Build the
CORE set; STRETCH items are gravy once core is solid. All obey the Craft Doctrine + perf budgets.

### A. The OS feels genuinely *alive & aware*
- **[CORE] Returning-visitor memory** (`localStorage`): first visit = full boot sequence; returning =
  fast "Welcome back" boot. The OS *remembers* you — a top-tier effort signal for near-zero cost.
- **[CORE] Time/timezone-aware**: greet by local time ("Good evening") and auto-pick day/night theme
  from the visitor's clock (still user-overridable in menubar).
- **[CORE] OS notification toasts**: subtle, OS-styled toasts for system events — e.g. after a live app
  finishes, "Flow · process completed in 1.4s". Sells the "real system" illusion.
- **[STRETCH] Sleep / screensaver**: after long idle, the Signal Field blooms into a beautiful
  generative screensaver (classic OS metaphor); any input wakes it. Gorgeous + on-brand.

### B. Signature "wow" moments (memorable, screenshot-worthy)
- **[CORE] Audience routing at boot** ("login as"): a tasteful chooser — *Client · Recruiter · Founder ·
  Just exploring* — reorders the dock/apps and tailors hero copy to that visitor. This IS the "0.1%
  personalization" flex; recruiters see proof-of-skill first, clients see outcomes/CTA first.
- **[CORE] Live BlueprintGraph**: on Capabilities, data visibly *flows* through the automation nodes
  (animated packets along edges), not a static diagram. Form = function, literally.
- **[STRETCH] Terminal.app easter egg**: a real mini-terminal app — `whoami` → bio, `ls projects`,
  `run flow`, `sudo hire kushagra` → opens Contact. Power-user delight that screams craft. Discoverable via ⌘K.

### C. Native-grade window & system polish
- **[CORE] Real window management**: traffic-light controls with true states, minimize-to-dock animation,
  double-click titlebar to maximize, **edge-snap tiling** (drag to screen edge → snaps half/quarter),
  focused window casts a deeper shadow while background windows **dim + slightly blur** (depth-of-field).
- **[CORE] ⌘K as a real launcher**: fuzzy search across apps + content + "ask"; shows **recents**; can
  **execute actions** ("switch to night", "open Flow", "email Kushagra"), not just navigate.
- **[CORE] Dock magnification**: macOS-style hover scaling/ripple on dock icons (spring physics).
- **[STRETCH] View Transitions API** for app/window morphs where supported (native-feeling), with a
  framer-motion fallback.

### D. Convert the wow into business (he wants clients + recruiters)
- **[CORE] Contextual CTA inside each live app**: after a visitor runs Flow/Atlas/Forge, a quiet
  "Want one of these for your business? → Initiate a process" prompt. The demo *sells itself*.
- **[CORE] Resume.app**: résumé presented as an OS document-viewer window (download + view), not a bare PDF link.

### Scope guard (so a solo builder can actually ship this)
Build priority: **CORE items ship with their phase**; **STRETCH items are Phase 6/7 polish** and may be
cut without hurting the core experience. Never let an unfinished STRETCH feature block a shippable phase.
The win is *every shipped surface feels finished* — better 12 perfect things than 20 half-done ones.

---

## RESEARCH-BACKED DIFFERENTIATION (June 2026 trend scan — CRITICAL)
**#1 finding — the "macOS-clone portfolio" is now a CLICHÉ.** There are dozens of public macOS-style
portfolio repos/templates (Finder, dock, traffic-lights) and even Awwwards entries. If KushagraOS reads
as "another Mac desktop clone," it FAILS the unique test. **Mandate: KushagraOS is its OWN AI-native OS,
not a skeuomorphic Apple copy.** Differentiators to enforce:
- **Own visual language**, not Apple mimicry: our Signal Field + cool-graphite + Fraunces serif wordmark
  + blueprint-grid is deliberately un-Mac. Window controls are our own glyphs, not Apple traffic-lights clones.
- **AI-native, not file-native**: the "OS" is organized around *live automations & a voice twin*, not
  Finder folders. The apps DO things (Flow/Atlas/Forge run real work). That's what no template can fake.
- **Personalization** (audience routing, returning-visitor memory) — templates are static; ours adapts.

**Validated by the trend scan (fold into execution):**
- **"Details Matter" (Linear, Jan 2026):** judges/peers reward optical alignment per breakpoint, bespoke
  animation curves, a real keyboard-shortcut model, and **memorable empty states**. → Make every empty/
  loading/error state a *designed* moment, not a spinner. This is explicitly in the Craft Doctrine — enforce it.
- **Vercel "blueprint grid" aesthetic** (subtle grid/dots, mono-influenced type, restraint) is the
  current premium-startup signal — our Signal Field rails + Geist Mono labels already align; keep it disciplined.
- **2026 = emotive / human / editorial**, with intentional organic imperfection and asymmetry. → Avoid a
  sterile, perfectly-symmetrical grid everywhere; allow editorial asymmetry + a little warmth (the rare gold accent).
- **Conversational/voice UI is now a BASELINE expectation**, not a novelty. → The voice twin must be
  *excellent* (low latency, natural, graceful fallback) to stand out, not just present.
- **Sound design** trend = subtle, optional, accessibility-tied. → Matches our opt-in menubar sound toggle.
- **Speed is itself the premium signal.** → Hold CWV budgets as a feature, not an afterthought.

Net: keep the OS metaphor, but win on **AI-native function + bespoke craft + adaptivity** — the three
things the cliché clones can't copy.
