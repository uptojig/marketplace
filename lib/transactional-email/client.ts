// Resend client wrapper. Lazy-singleton so we don't pay construction
// cost during cold-start unless an email is actually being sent. Returns
// `null` when no API key is set — callers MUST handle that (see send.ts
// for the dev-fallback path).
//
// This file is intentionally separate from `lib/email/` (which is
// Cloudflare Email Routing / identity aliasing — a different concern).
//
// NOTE: This file is for transactional email ONLY. Marketing / drip
// campaigns belong in a separate pipeline (audit + unsub gating).

import { Resend } from "resend";

let _client: Resend | null = null;

/**
 * Returns a memoized Resend client, or `null` if `RESEND_API_KEY`
 * is not configured (dev environments, CI, etc).
 *
 * Callers should NOT assume a client exists — `send.ts` handles the
 * null path by logging to the console instead.
 */
export function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!_client) _client = new Resend(key);
  return _client;
}
