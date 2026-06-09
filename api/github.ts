/* ============================================================================
   GET/POST /api/github — real read-only public-repo fetch (Phase G). Vercel
   serverless function (Node); the same core runs in the Vite dev/preview
   middleware. No personal keys required; optional GITHUB_TOKEN raises the limit.
   ========================================================================== */

import type { IncomingMessage, ServerResponse } from "node:http";
import { runGithub } from "./_lib/githubCore.js";
import { readJson, callerKey, sendJson } from "./_lib/node.js";

export default async function handler(req: IncomingMessage & { method?: string }, res: ServerResponse) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "method_not_allowed" });
  }
  const body = await readJson(req);
  const result = await runGithub(body, callerKey(req));
  return sendJson(res, result.status, result.json);
}
