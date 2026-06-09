# KushagraOS — Deploy to Vercel (free tier)

The app is a Vite SPA (`dist/`) plus serverless functions in `api/` (`/api/ask`,
`/api/run`, `/api/tts`, `/api/contact`). All keys stay **server-side** — they are
read from environment variables inside the functions and never reach the browser
bundle. `vercel.json` wires the build, the function runtime, and the SPA rewrite.

> ⚠️ You must do the deploy yourself — it authenticates with **your** Vercel
> account, and the API key must be entered into **your** Vercel project settings
> (never paste keys into chat). Steps below are copy-paste exact.

## What's already set up
- `vercel.json` — framework `vite`, build `npm run build`, output `dist`,
  `api/*.ts` functions with `maxDuration: 30`, and a rewrite so every non-`/api`
  route serves `index.html` (the OS is a single page).
- `.vercelignore` — skips `tests/`, `docs/`, build artifacts from the upload.
- The functions are `@vercel/node` compatible (Node `(req, res)` handlers, ESM,
  global `fetch`). The provider call has a 12s timeout, so it fits `maxDuration`.

## One thing to know about the project root
The app lives in the **`portfolio/`** subfolder. Deploy from inside it (CLI), or
set **Root Directory = `portfolio`** in the Vercel project settings (Git import).

---

## Option A — Vercel CLI (fastest)

```bash
# 1. Install the CLI (once)
npm i -g vercel

# 2. From the app folder
cd portfolio

# 3. Log in (opens browser)
vercel login

# 4. First deploy → creates the project (accept the prompts; framework auto-detects as Vite)
vercel

# 5. Add the brain key to the project (server-side, all environments).
#    Paste the gsk_… key when prompted — it is stored encrypted in Vercel, not in git.
vercel env add GROQ_API_KEY
#    (optional overrides / extras — only if you use them)
# vercel env add GROQ_MODEL            # e.g. llama-3.3-70b-versatile
# vercel env add WEB3FORMS_ACCESS_KEY  # real contact-form email

# 6. Ship to production (re-deploys with the env vars baked in)
vercel --prod
```

## Option B — Git import (dashboard)
1. Push this repo to GitHub/GitLab/Bitbucket.
2. vercel.com → **Add New… → Project** → import the repo.
3. **Root Directory → `portfolio`**. Framework preset auto-detects **Vite**.
4. **Settings → Environment Variables** → add `GROQ_API_KEY` = your `gsk_…` key
   (Production + Preview). Optionally `GROQ_MODEL`, `WEB3FORMS_ACCESS_KEY`.
5. **Deploy.** Future pushes auto-deploy.

---

## Required / optional environment variables
| Variable | Required | Purpose |
|---|---|---|
| `GROQ_API_KEY` | **Yes** | The brain for `/api/ask` + `/api/run` (Groq, `gsk_…`). Without it everything still works via graceful demo fallback. |
| `GROQ_MODEL` | No | Override the model (default `llama-3.3-70b-versatile`). |
| `GEMINI_API_KEY` | No | Fallback provider + powers `/api/tts` voice-out if set. |
| `WEB3FORMS_ACCESS_KEY` | No | Real contact-form email; otherwise the form shows its success toast only. |

## Verify after deploy
```bash
# replace with your deployment URL
curl -s -X POST https://<your-app>.vercel.app/api/ask \
  -H 'content-type: application/json' \
  -d '{"query":"Who is Kushagra?"}'
# → JSON with "fallback": false and "provider": "groq:…" means the key is live.
```
Then open the site, boot in, and run **Flow / Atlas / Forge** and the **voice
twin** — the status should read "ran live", not the demo fallback.

## Notes
- **Rate limit is per-instance** (in-memory). Fine for a portfolio; for hard
  cross-instance limits, back `api/_lib/guards.ts` with Upstash/Vercel KV later.
- Rotate the key if it was ever exposed; it lives only in `.env.local` (gitignored)
  locally and in Vercel's encrypted env store in production.
