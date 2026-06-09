/* ============================================================================
   POST /api/agent — AYRA's growth-studio agents (Scout/Closer/Muse/Strategist/
   Concierge/Analyst). Vercel serverless function (Node); the same core runs in
   the Vite dev/preview middleware. Keys read server-side only.
   ========================================================================== */

import type { IncomingMessage, ServerResponse } from "node:http";
import { runAgent } from "./_lib/agentsCore.js";
import { readJson, callerKey, sendJson } from "./_lib/node.js";

export default async function handler(req: IncomingMessage & { method?: string }, res: ServerResponse) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "method_not_allowed" });
  }
  const body = await readJson(req);
  const result = await runAgent(body, callerKey(req));
  return sendJson(res, result.status, result.json);
}
