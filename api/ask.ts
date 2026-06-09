/* ============================================================================
   POST /api/ask — the voice twin's brain. Vercel serverless function (Node).
   Locally, the same logic is served by the Vite dev middleware (see vite.config).
   Reads GEMINI_API_KEY from the environment; never exposes it to the client.
   ========================================================================== */

import type { IncomingMessage, ServerResponse } from "node:http";
import { runAsk } from "./_lib/askCore.js";
import { readJson, callerKey, sendJson } from "./_lib/node.js";

export default async function handler(req: IncomingMessage & { method?: string }, res: ServerResponse) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "method_not_allowed" });
  }
  const body = await readJson(req);
  const result = await runAsk(body, callerKey(req));
  return sendJson(res, result.status, result.json);
}
