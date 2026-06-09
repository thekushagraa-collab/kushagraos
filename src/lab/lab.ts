/* ============================================================================
   AI Lab — client transport + types (Phase E). Two live exhibits run through
   /api/lab with graceful fallback; result shapes mirror api/_lib/labCore.ts.
   ========================================================================== */

export type LabMode = "selfcorrect" | "prompt";

export interface SelfCorrectResult {
  topic: string;
  draft: string;
  critique: string[];
  improved: string;
}

export interface PromptResult {
  original: string;
  rewritten: string;
  upgrades: string[];
  scoreBefore: number;
  scoreAfter: number;
}

export interface LabResultMap {
  selfcorrect: SelfCorrectResult;
  prompt: PromptResult;
}

export interface LabReply<M extends LabMode> {
  result: LabResultMap[M];
  fallback: boolean;
}

const MAX_CHARS = 600;

export async function runLabClient<M extends LabMode>(
  mode: M,
  input: string,
  signal?: AbortSignal,
): Promise<LabReply<M>> {
  const trimmed = input.trim().slice(0, MAX_CHARS);
  try {
    const res = await fetch("/api/lab", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mode, input: trimmed }),
      signal,
    });
    const ct = res.headers.get("content-type") ?? "";
    if (!res.ok || !ct.includes("application/json")) throw new Error("bad response");
    const data = (await res.json()) as { result?: LabResultMap[M]; fallback?: boolean };
    if (!data.result) throw new Error("no result");
    return { result: data.result, fallback: Boolean(data.fallback) };
  } catch {
    return { result: {} as LabResultMap[M], fallback: true };
  }
}
