/* ============================================================================
   POST /api/mission — Mission Mode. AYRA orchestrates her growth team
   (Scout → Analyst → Closer → Muse → Strategist) into one growth plan from a
   single natural-language goal. Vercel serverless function (Node); the same core
   runs in the Vite dev/preview middleware. Keys read server-side only.
   ========================================================================== */

import type { IncomingMessage, ServerResponse } from "node:http";
import { runMission } from "./_lib/missionCore.js";
import { readJson, callerKey, sendJson } from "./_lib/node.js";

export default async function handler(req: IncomingMessage & { method?: string }, res: ServerResponse) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "method_not_allowed" });
  }
  const body = await readJson(req);
  const result = await runMission(body, callerKey(req));
  return sendJson(res, result.status, result.json);
}
