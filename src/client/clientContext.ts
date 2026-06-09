/* ============================================================================
   A tiny in-OS handoff: when a visitor hits "Deploy" in the Marketplace we want
   Client Mode to open pre-filled with what they're deploying. Apps open by id
   (no prop channel), so this module-singleton carries the context across that
   navigation within the same JS context. Read-once (take) so it doesn't leak
   into a later, unrelated Client Mode open.
   ========================================================================== */

let pending: string | null = null;

export function setClientContext(value: string | null): void {
  pending = value;
}

/** Read and clear the pending context. */
export function takeClientContext(): string | null {
  const value = pending;
  pending = null;
  return value;
}
