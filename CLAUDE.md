# CLAUDE.md — Portfolio Frontend Rules

> Adapted from "Frontend Website Rules" for THIS project's stack and machine.
> Stack: **Vite + React + TypeScript + framer-motion** (not single-file HTML/Tailwind-CDN).
> Machine paths from the original (`C:\Users\nateh\...`) do not apply here.

## Always Do First
- **Invoke the `frontend-design` skill** before writing any frontend code, every session, no exceptions.
- Also lean on **`ui-ux-pro-max`** (palettes, font pairings, UX guidelines, per-stack rules) and the **21st.dev Magic MCP** (`magic`) for component inspiration/generation.

## Reference Images
- If a reference image is provided: match layout, spacing, typography, and color exactly. Swap in placeholder content (images via `https://placehold.co/`, generic copy). Do not improve or add to the design.
- If no reference image: design from scratch with high craft (see guardrails below).
- Screenshot your output, compare against reference, fix mismatches, re-screenshot. Do at least **2 comparison rounds**. Stop only when no visible differences remain or the user says so.

## Local Server (Vite)
- The app is a Vite project. Dev server: `npm run dev` → defaults to **http://localhost:5173**.
- **Heads-up (ECC hook conflict):** ECC's dev-server PreToolUse hook BLOCKS `npm run dev` run through the Bash tool. To get a running server for screenshots, do ONE of:
  1. **Preferred:** start it via the **Claude Preview MCP** (`preview_start`) — it runs outside the Bash hook path.
  2. Temporarily allow it: run the session with `ECC_DISABLED_HOOKS` including the dev-server hook id, or `ECC_GATEGUARD=off`.
  3. Build + preview: `npm run build` then `npm run preview` (port 4173).
- If a server is already running, do not start a second instance.

## Screenshot Workflow (MCP, not puppeteer scripts)
- This machine has **no `serve.mjs`/`screenshot.mjs`/puppeteer** setup. Use the MCP browser tools instead:
  - **Claude Preview MCP**: `preview_start` → `preview_screenshot` (and `preview_resize` for breakpoints).
  - **chrome-devtools MCP**: `take_screenshot` against the running localhost URL.
- **Never screenshot a `file:///` URL** — always the localhost dev/preview URL.
- After capturing, **Read the PNG** with the Read tool — Claude can see and analyze the image directly.
- When comparing, be specific: "heading is 32px but reference shows ~24px", "card gap is 16px but should be 24px".
- Check: spacing/padding, font size/weight/line-height, colors (exact hex), alignment, border-radius, shadows, image sizing.
- Test breakpoints: **320 / 768 / 1024 / 1440**.

## Output Defaults (this project)
- **React function components** in `src/`, TypeScript, one component per file; co-locate component CSS.
- **Animation: framer-motion** (`motion` / `AnimatePresence`). Animate **`transform` and `opacity` only** — never `transition-all`, never layout-bound props (width/height/top/left/margin). Use spring-style easing.
- **Styling:** CSS with design tokens in CSS variables (`:root`). Tailwind is NOT installed — add it deliberately only if needed; if added, the anti-generic rules below still apply.
- Placeholder images: `https://placehold.co/WIDTHxHEIGHT`.
- Mobile-first responsive. Respect `prefers-reduced-motion`.

## Brand Assets
- Always check a `brand_assets/` folder (create at project root if the user supplies assets) before designing. It may contain logos, color guides, style guides, or images.
- If assets exist there, use them — no placeholders where real assets are available. If a logo is present, use it. If a palette is defined, use those exact values — do not invent brand colors.

## Anti-Generic Guardrails
- **Colors:** Never use default Tailwind palette (indigo-500, blue-600, etc.). Pick a custom brand color and derive a scale from it.
- **Shadows:** Never use flat `shadow-md`. Use layered, color-tinted shadows with low opacity.
- **Typography:** Never use the same font for headings and body, and avoid Inter/Roboto/Arial/system defaults. Pair a distinctive display/serif with a clean sans. Tight tracking (`-0.03em`) on large headings, generous line-height (`1.7`) on body.
- **Gradients:** Layer multiple radial gradients. Add grain/texture via an SVG noise filter for depth.
- **Animations:** Only `transform` and `opacity`. Never `transition-all`. Spring-style easing. Prefer one orchestrated, staggered page-load reveal over scattered micro-interactions.
- **Interactive states:** Every clickable element needs hover, focus-visible, and active states. No exceptions.
- **Images:** Add a gradient overlay (e.g. top→`black/60`) and a color treatment layer with `mix-blend-multiply`.
- **Spacing:** Use intentional, consistent spacing tokens — not random steps.
- **Depth:** Surfaces use a layering system (base → elevated → floating), not all on the same z-plane.

## Hard Rules
- Do not add sections, features, or content not in the reference (when matching one).
- Do not "improve" a reference design — match it.
- Do not stop after one screenshot pass — at least 2 comparison rounds.
- Do not use `transition-all`.
- Do not use default Tailwind blue/indigo as primary color.
- Do not converge on the same fonts/aesthetic across iterations — vary deliberately.

## Scroll-Driven / Video Sections
- For a video-driven scroll experience, use the **`video-to-website`** skill (GSAP + Lenis + canvas frames). Requires `ffmpeg`/`ffprobe` on PATH (not installed yet — `winget install Gyan.FFmpeg`).
- That skill outputs a standalone vanilla bundle; serve it from `public/` rather than reimplementing GSAP scroll internals inside React state.
