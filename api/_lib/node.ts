/* ============================================================================
   Tiny Node http helpers shared by the Vercel functions and the Vite dev
   middleware (both receive Node IncomingMessage/ServerResponse).
   ========================================================================== */

import type { IncomingMessage, ServerResponse } from "node:http";

/** Read + JSON-parse a request body (best-effort). Returns {} on any failure. */
export async function readJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  // Vercel may have already parsed it.
  const pre = (req as IncomingMessage & { body?: unknown }).body;
  if (pre && typeof pre === "object") return pre as Record<string, unknown>;
  if (typeof pre === "string") {
    try { return JSON.parse(pre); } catch { return {}; }
  }
  return await new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => {
      data += c;
      if (data.length > 1_000_000) req.destroy(); // body bomb guard
    });
    req.on("end", () => {
      try { resolve(data ? JSON.parse(data) : {}); } catch { resolve({}); }
    });
    req.on("error", () => resolve({}));
  });
}

/** Derive a best-effort caller key for rate limiting. */
export function callerKey(req: IncomingMessage): string {
  const fwd = req.headers["x-forwarded-for"];
  const ip = Array.isArray(fwd) ? fwd[0] : (fwd ?? "").split(",")[0].trim();
  return ip || req.socket?.remoteAddress || "anon";
}

/** Write a JSON response. We close the connection (no keep-alive) so the dev/
    preview server doesn't hold idle sockets open — those linger at test teardown
    and keep a Playwright worker from exiting (force-killed at the 300s grace).
    Harmless in production (Vercel manages connections per-invocation). */
export function sendJson(res: ServerResponse, status: number, json: unknown): void {
  res.statusCode = status;
  res.setHeader("content-type", "application/json");
  res.setHeader("connection", "close");
  res.end(JSON.stringify(json));
}
