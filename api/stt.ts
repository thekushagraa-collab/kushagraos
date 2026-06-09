/* POST /api/stt — speech-to-text via Groq Whisper (best-effort). Vercel (Node). */

import type { IncomingMessage, ServerResponse } from "node:http";
import { runStt } from "./_lib/sttCore.js";
import { readJson, callerKey, sendJson } from "./_lib/node.js";

export default async function handler(req: IncomingMessage & { method?: string }, res: ServerResponse) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "method_not_allowed" });
  const body = await readJson(req);
  const result = await runStt(body, callerKey(req));
  return sendJson(res, result.status, result.json);
}
