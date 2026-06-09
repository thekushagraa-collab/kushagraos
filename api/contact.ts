/* POST /api/contact — contact submit via Web3Forms (best-effort). Vercel (Node). */

import type { IncomingMessage, ServerResponse } from "node:http";
import { runContact } from "./_lib/contactCore.js";
import { readJson, callerKey, sendJson } from "./_lib/node.js";

export default async function handler(req: IncomingMessage & { method?: string }, res: ServerResponse) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "method_not_allowed" });
  const body = await readJson(req);
  const result = await runContact(body, callerKey(req));
  return sendJson(res, result.status, result.json);
}
