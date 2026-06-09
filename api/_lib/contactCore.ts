/* ============================================================================
   Contact submit core. Posts to Web3Forms (free) when WEB3FORMS_ACCESS_KEY is
   set; otherwise returns a graceful "noted" fallback so the Contact app's
   success toast still makes sense in demo / no-key mode.
   ========================================================================== */

import { capInput, checkRate } from "./guards";

export interface ContactResult {
  status: number;
  json: Record<string, unknown>;
}

interface ContactBody {
  name?: unknown;
  intent?: unknown;
  message?: unknown;
}

const str = (v: unknown) => (typeof v === "string" ? v : "");

export async function runContact(body: ContactBody, rateKey: string): Promise<ContactResult> {
  const name = str(body?.name).trim().slice(0, 120);
  const intent = str(body?.intent).trim().slice(0, 40);
  const message = capInput(str(body?.message));

  if (!name || !message) return { status: 400, json: { error: "name and message required" } };

  const rate = checkRate(`contact:${rateKey}`);
  if (!rate.ok) return { status: 429, json: { error: "rate_limited", retryAfterMs: rate.retryAfterMs } };

  const key = process.env.WEB3FORMS_ACCESS_KEY?.trim();
  if (!key) return { status: 200, json: { ok: true, delivered: false, reason: "no_key" } };

  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        access_key: key,
        subject: `KushagraOS · ${intent || "contact"} · ${name}`,
        from_name: name,
        message: `Intent: ${intent}\n\n${message}`,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { success?: boolean };
    return { status: 200, json: { ok: true, delivered: Boolean(data.success) } };
  } catch (err) {
    const reason = err instanceof Error ? err.message : "contact_error";
    return { status: 200, json: { ok: true, delivered: false, reason } };
  }
}
