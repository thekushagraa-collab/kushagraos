/* ============================================================================
   GitHub (Phase G) — the ONLY real integration on the public site, and it's
   strictly READ-ONLY: public repositories via the unauthenticated GitHub API.
   No personal keys are required; an optional GITHUB_TOKEN (env, server-side only)
   raises the rate limit but is never needed. No writes, ever.

   Honesty over filler: we NEVER fabricate repositories. The panel shows real
   repos when they exist, a clean "no public repos yet" state when the account
   has none, and a clear "couldn't reach GitHub" state on error — each via a
   `reason`, with an empty `repos` array. So the live site never displays repos
   that don't actually exist.
   ========================================================================== */

import { checkRate } from "./guards";

export interface GithubRepo {
  name: string;
  description: string;
  stars: number;
  language: string;
  url: string;
  updated: string;
}

export interface GithubResult {
  status: number;
  json: Record<string, unknown>;
}

const USER_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,38})$/; // GitHub username rules

function str(v: unknown): string { return typeof v === "string" ? v : ""; }

interface GithubBody { user?: unknown }

export async function runGithub(body: GithubBody, rateKey: string): Promise<GithubResult> {
  const user = str(body?.user).trim().slice(0, 39);
  if (!user || !USER_RE.test(user)) return { status: 400, json: { error: "invalid_user" } };

  const rate = checkRate(`github:${rateKey}`);
  if (!rate.ok) return { status: 429, json: { error: "rate_limited", retryAfterMs: rate.retryAfterMs } };

  const token = process.env.GITHUB_TOKEN?.trim();
  const headers: Record<string, string> = {
    accept: "application/vnd.github+json",
    "user-agent": "KushagraOS",
  };
  if (token) headers.authorization = `Bearer ${token}`;

  try {
    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(user)}/repos?sort=updated&per_page=6&type=owner`,
      { headers },
    );
    if (!res.ok) {
      // 404 = no such account; 403 = rate limited; etc. Never fabricate repos.
      return { status: 200, json: { user, repos: [], fallback: true, reason: `github_${res.status}` } };
    }
    const data = (await res.json()) as unknown;
    if (!Array.isArray(data)) {
      return { status: 200, json: { user, repos: [], fallback: true, reason: "bad_shape" } };
    }
    const repos: GithubRepo[] = data.slice(0, 6).map((r) => {
      const o = (r ?? {}) as Record<string, unknown>;
      return {
        name: str(o.name),
        description: str(o.description) || "—",
        stars: typeof o.stargazers_count === "number" ? o.stargazers_count : 0,
        language: str(o.language) || "—",
        url: str(o.html_url),
        updated: str(o.pushed_at).slice(0, 10) || "—",
      };
    }).filter((r) => r.name);
    // Account exists but has no public repos yet — honest empty state, not fallback.
    return { status: 200, json: { user, repos, fallback: false, reason: repos.length ? "ok" : "no_public_repos" } };
  } catch (err) {
    const reason = err instanceof Error ? err.message : "github_error";
    return { status: 200, json: { user, repos: [], fallback: true, reason } };
  }
}
