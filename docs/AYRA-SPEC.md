# AYRA — the Operating Intelligence of KushagraOS (JARVIS-style AI twin)

> Extends `KUSHAGRAOS-SPEC.md`. We DON'T throw away the existing OS — we give it a soul. AYRA is the
> omnipresent AI that runs the OS and speaks for Kushagra, the way JARVIS runs Stark's world.
> Relationship: **Kushagra = Tony Stark · AYRA = JARVIS.** Hero still shows **KUSHAGRA** (his name,
> non-negotiable). AYRA is the intelligence that greets you, answers everything, and operates the apps.

## 0. Aesthetic guardrail (READ FIRST)
**"Luxury AI Founder."** Reference: Apple · Linear · Vercel · Notion · Arc browser · with *subtle* Iron-Man
HUD restraint. Keep the existing system: cool-graphite base, Fraunces serif, Signal Field background,
gold as a RARE accent. AYRA's visual signature = a refined **presence orb / soft waveform** (calm light,
micro-motion), NOT a glowing arc-reactor.
**BANNED:** neon green, matrix rain, glow spam, scanlines, cyberpunk/hacker/gamer, arc-reactor cliché,
"AI" purple gradients. Tools: framer-motion + 21st.dev Magic MCP + `ui-ux-pro-max` + `frontend-design`.

## 1. AYRA persona
- **Character:** calm, precise, quietly witty, concierge-grade. A luxury operator, never a gimmick chatbot.
  Speaks in short, confident lines. Think a high-end butler crossed with a systems engineer.
- **Omnipresent greeting** (contextual, time + visit aware): "Welcome." / "Welcome back." / "Working late."
  / "Welcome to Kushagra's portfolio. I'm AYRA — ask me anything." Reuses the existing time/returning-visitor logic.
- **Always reachable:** menubar + dock + ⌘K + a persistent AYRA presence indicator. Voice + text.
- **Narrates the OS:** when you open an app, AYRA can introduce it in one line. Subtle, skippable, never spammy.

## 2. AYRA as the AI twin (the Q&A brain) — FEASIBLE NOW
Answers anything a client/recruiter asks — about Kushagra, the projects, the services, the portfolio, and
about AYRA itself ("how would Kushagra approach X?", "what services does he offer?", "is he good at voice AI?").
- **Engine:** Gemini via server-side `/api/ask` (key in env, never client). Persona-consistent system prompt.
- **Knowledge sources (a curated knowledge base in `content/`):** profile, services, case studies, projects,
  journey, blogs, docs — stuffed into a prompt-cached knowledge block (RAG-lite). Optional light web lookup later.
- **Guards:** prompt-injection defense, scope limit (politely declines off-topic), input caps, rate limit,
  spend cap, graceful canned fallback if quota/key fails. (Same safeguards as the voice twin in Phase 4.)

## 3. App suite (evolved IA) — keep existing + ADD these
Existing apps stay: About/Hero (KUSHAGRA), Capabilities, Work, Origin, Telemetry, Vision, Contact.
New AYRA-era apps:

### AI Lab — "the R&D wing" (frontier credibility → inbound authority)
NOT product demos — explorations that prove Kushagra builds at the edge. Each = concept + a small
interactive/visualization + a "what I learned" note. Positions him as a builder-researcher, not a freelancer.
- **Self-correcting agents** — an agent that critiques and revises its own output, live (draft → critique →
  improved draft). Shows engineering maturity, ties to his eval mindset.
- **Multi-agent orchestration** — visualize a team of agents handing off / debating to solve one task
  (the "watch the team think" exhibit).
- **Prompt architecture playground** — naive prompt vs engineered prompt, side by side, with the measurable
  quality delta. Proves prompt engineering is a discipline, not vibes.
- **Knowledge grounding (RAG)** — grounded vs ungrounded answer about Kushagra; how AYRA stays factual.
- **Voice-first agents** — AYRA herself is the live exhibit.
- **Agent eval harness** — "I test agents like software" (ties to `docs/VERIFICATION.md`); pass/fail on agent outputs.
- **Future experiments** — a roadmap board (browser-use agents, autonomous research, on-device, etc.).

### Automation Center — "AYRA's autonomous growth studio" (the centerpiece)
Reframe: NOT a pile of generic tools — a cohesive **autonomous agency** a visitor can run. Six named agents,
each solves a real business pain, each returns a tangible artifact in seconds, each has a "deploy for your
business" CTA. Sandboxed Gemini, capped, fallback samples.
1. **Scout — Lead Discovery & Qualification** (generalizes his real CreatorScout). Input an ICP ("vegan
   skincare brands 10–50k followers" / "fintech SaaS founders"). Output: a scored lead table — handle/link,
   **fit score + WHY**, plus a tailored opening line per lead. Artifact: a qualified lead sheet.
2. **Closer — Outreach & Follow-up.** Paste a prospect's bio/site → a hyper-personalized cold email + a
   3-step follow-up sequence + predicted reply likelihood **with the hooks/reasoning it used.** Artifact: a sequence.
3. **Muse — Content Engine.** One idea (or pasted transcript/URL) → a **cross-channel pack**: LinkedIn post,
   X thread, short-form video hook+script, carousel outline — one consistent voice. Artifact: a content pack.
4. **Strategist — Campaign Planner.** Product + goal + budget → a 2-week launch plan: channels, angles,
   content calendar, KPIs — reasoned to the specific product. Artifact: a mini campaign brief.
5. **Concierge — Inbox & CRM Copilot.** Paste an incoming email → intent triage (hot lead / support / spam) +
   an on-brand drafted reply + suggested CRM tag & next action. Artifact: a triaged, drafted reply.
6. **Analyst — Deal Intelligence.** A company/person → a one-page brief: what they do, recent signals, likely
   pain points, and a **tailored pitch angle** (research → sales angle, not just facts). Artifact: a deal brief.
Each shows its architecture ("Trigger → Research → Score → Draft → Output") so it reads as a real system.

### ⭐ Mission Mode — the JARVIS centerpiece (single biggest wow)
A natural-language front door. A visitor types a real goal — *"I run a skincare brand, get me customers."*
AYRA **orchestrates the team live**: dispatches Scout → Analyst → Closer → Muse → Strategist; you WATCH the
agents hand off (streamed, choreographed); AYRA assembles a **mini growth plan** from their combined output.
"Watch AYRA run a whole growth team for you" is the differentiator no template can fake. This is the hero demo.

### Agent Marketplace — productize the same engines (his actual offer)
The six agents as **deployable products** ("AYRA Agents — your autonomous growth team"). Each card: what it
does · inputs/outputs · a believable stack · a metric ("drafts 50 personalized emails in 2 min") · **▶ Try**
(opens its demo) · **Deploy for your business** (→ Client Mode / contact). Turns the portfolio into a **live
storefront**: clients try the product, then buy. Every demo is a lead magnet with a built-in CTA.

### Files / Finder (RECOMMENDED, but purposeful)
A tasteful "Files" app holding **real** assets: résumé, case-study PDFs, project docs, one-pagers. Reinforces
the OS metaphor with substance, not fake empty folders. Open in an in-OS document viewer (Resume.app idea).

### Client Mode (audience routing, elevated)
For visitors who pick "Client": **book a call · request a proposal · submit requirements · view services ·
request pricing.** Booking = free **Cal.com** embed (or a form → email). All capture → `/api/contact`
(Web3Forms free) + AYRA confirms with an OS toast. Recruiter & Explorer modes stay as-is.

## 4. Multi-agent execution engine — HONEST, safe design + baked-in growth
Mission Mode and each agent run on the real engine: AYRA orchestrates Gemini agents (research → build →
content → marketing → sales) and returns a **generated deliverable inside the OS** (lead sheet, email
sequence, content pack, campaign brief, deal brief, report, task list, a sample landing-section preview).
The visitor sees the multi-step "agents working" choreography (real calls, streamed), then the artifact.
- **No real external actions** on the public site (no real emails sent, no CRM writes) — safe, cheap, truthful.
  Frame clearly: "Live demo — AYRA generated this for you just now."
- **Growth hooks baked in:** every artifact carries a subtle "Built by Kushagra with AYRA — want this live for
  your business?"; the visitor's typed inputs (their niche/product) become a **warm lead signal**; artifacts are
  downloadable/shareable (a viral surface). AI Lab builds authority → inbound; storefront demos → outbound capture.
- Caps everywhere: token caps per request, per-session rate limit, global spend cap, graceful fallback to pre-baked samples.

## 5. Productivity integrations (Gmail/Calendar/Notion/GitHub/Slack) — REALITY CHECK
This is the one part that's a trap if taken literally. On a **public** portfolio:
- A random visitor **cannot** connect *their* Gmail/Slack to your site, and you must **never** wire *your*
  real Gmail/Slack/Notion with write-access to a public AI agent — that's a severe security + abuse risk
  (a public bot that can send mail from your account = disaster) and a cost risk.
- **Public approach = SIMULATED integrations:** beautiful, realistic mock Gmail/Calendar/Notion/GitHub/Slack
  panels showing *how* AYRA operates across tools (demo data). Clearly an in-OS demo environment. Looks 100%
  like the real thing, zero risk. GitHub is the one safe *read-only* real one (public repos via API).
- **Founder Mode (private, later):** a key/password-gated mode only Kushagra can enter — there we MAY wire
  *your* real accounts (read-mostly) for your own use. Big scope + security surface → **deferred**, not now,
  and never with destructive actions on a public deploy. Founder is removed from the public mode chooser.

## 6. Modes
Public chooser: **Client · Recruiter · Just exploring** (no Founder shown). **Founder Mode** is private,
reached via a secret route + key, for Kushagra only. Each mode re-orders apps and tailors AYRA's tone/CTAs.

## 7. Security & cost (non-negotiable)
- All AI calls server-side (`/api/*`); keys in env only; never client, never in chat.
- Rate limits + input caps + per-provider spend caps + Turnstile/abuse check on public endpoints.
- Sandboxed demos only on public site; no real third-party writes; graceful fallback everywhere.
- Provider-agnostic seam (Gemini now; swap/add later).

## 8. Phasing (folds into existing build order)
- **P4 (in progress):** AYRA voice + text twin end-to-end (Gemini) + real contact submit. Establishes AYRA.
- **P5:** Automation Center live demos (Flow/Atlas/Forge become AYRA demos) + Agent Marketplace + AI Lab + Client Mode + Files. All sandboxed, capped, tested.
- **P6:** Simulated productivity-integration panels + polish + a11y/perf + deploy.
- **P7 (optional/later):** private Founder Mode with real (read-mostly) integrations for Kushagra's own use.

## 9. Verification (extend `docs/VERIFICATION.md`)
Add checks: AYRA presence reachable everywhere; twin answers a scoped question (real or fallback); each
Automation Center demo returns an artifact within caps; `/api/*` guard tests (empty/oversize/rate-limit);
simulated integration panels render; Founder route is gated; persona stays on-scope (declines off-topic).

## 10. Naming (FINAL)
OS = **KushagraOS** — final, NOT "AYRA OS". Kushagra's name stays prominent; hero = **KUSHAGRA**.
AYRA is the operating intelligence *inside* KushagraOS (Kushagra = Stark, AYRA = JARVIS). Tagline:
"KushagraOS — operated by AYRA."

## 11. ARTIFACT STYLE LOCK (every generated output is on-brand — non-negotiable)
The model NEVER renders the final visual. The model returns **structured JSON only**; the app renders it
through **branded React artifact templates** using KushagraOS design tokens. This guarantees every mini
growth plan / lead sheet / email / content pack / brief looks like it came from the same premium system.
- **Locked typefaces (self-hosted, embedded):** Fraunces (artifact titles) · General Sans (body) · Geist
  Mono (labels, data, scores). No system fonts, no model-chosen fonts, ever.
- **Locked palette:** KushagraOS tokens (cool-graphite surfaces, hairlines, gold as RARE accent). Each agent
  gets ONE subtle signature accent *within* the cool system (e.g. Scout=signal-blue, Muse=gold, Analyst=cool-teal)
  — never off-system colors.
- **Artifact letterhead + footer:** every artifact has a consistent header (AYRA mark · "Generated by
  KushagraOS · AYRA" · timestamp) and a footer CTA ("Built by Kushagra with AYRA — want this live for your
  business?"). This is the style lock visual signature.
- **Structured-output contract:** each agent has a JSON schema (e.g. `{ leads:[{handle,link,fitScore,why,opener}] }`,
  `{ email, followups:[], replyOdds }`, `{ plan:{ channels, calendar, kpis } }`). The model is constrained to it;
  the React template owns ALL styling. Raw model text is NEVER dumped into a `<pre>`.
- **Branded export:** artifacts download/share as a branded PDF/PNG rendered from the SAME templates, so shared
  outputs carry KushagraOS branding (viral surface). 
- **Enforced by tests:** artifact component renders with `font-family` = Fraunces/General Sans/Geist Mono and
  uses token CSS vars (not hardcoded hex). Add to `docs/VERIFICATION.md`.

## 12. AI PROVIDER DECISION (key-prefix decoder + free stack)
**Identify a key by its prefix (avoids the Groq/Grok/Gemini confusion):**
- `AIza…` = **Google Gemini** — free tier + native TTS (best voice).
- `gsk_…` = **Groq** (groq.com) — FREE, very fast inference of open models (Llama 3.3 / Qwen) + Whisper STT.
  A DIFFERENT company from xAI. ← Kushagra has this one.
- `xai-…` = **Grok (xAI)** — paid, no free tier, no API TTS.

**DECISION — Primary = Groq (`gsk_`), because Kushagra already has a working free Groq key.**
Provider-agnostic seam (`lib/ai/provider`) supports both; Groq uses the OpenAI-compatible endpoint
(`https://api.groq.com/openai/v1`).
- **Brain + all six agents + Mission Mode** → Groq (Llama 3.3 70B / Qwen). Free, fast, strong structured JSON
  (works with the §11 Style Lock).
- **Voice IN (STT)** → Groq **Whisper-large-v3** (free, accurate).
- **Voice OUT (TTS)** → browser `speechSynthesis` (free, no key) now; optionally Groq PlayAI TTS or a Gemini
  `AIza` key later for premium voice. Voice quality is the ONLY thing Groq gives up vs Gemini.
- **Gemini (`AIza`) optional later** purely to upgrade the voice; xAI Grok optional/paid for Analyst's live-X data.
- **Prefix is a hint, not proof — the build chat MUST make one real test call to confirm the key authenticates.**
- All keys server-side (`/api/*`), env only, never client, never in chat. Caps + spend caps + graceful fallback apply.
