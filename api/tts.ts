/* POST /api/tts — Gemini speech (best-effort). Vercel serverless (Node). */

import type { IncomingMessage, ServerResponse } from "node:http";
import { runTts } from "./_lib/ttsCore.js";
import { readJson, callerKey, sendJson } from "./_lib/node.js";

export default async function handler(req: IncomingMessage & { method?: string }, res: ServerResponse) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "method_not_allowed" });
  const body = await readJson(req);
  const result = await runTts(body, callerKey(req));
  return sendJson(res, result.status, result.json);
}
