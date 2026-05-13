"use client";

// Client-side helpers for polling Anypay intent state on the checkout
// processing page. Order creation itself happens via the placeOrder
// server action — this is only for the post-create lifecycle UX.

import type { AnypayIntentResponse } from "./intent-server";

export async function fetchIntentStatus(
  intentId: string,
): Promise<AnypayIntentResponse> {
  const res = await fetch(`/api/anypay/intents/${intentId}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`fetchIntentStatus failed: ${res.status}`);
  }
  return res.json();
}

export async function pollIntentUntilTerminal(
  intentId: string,
  onUpdate: (intent: AnypayIntentResponse) => void,
  opts?: { timeoutMs?: number; intervalMs?: number },
): Promise<AnypayIntentResponse> {
  const timeoutMs = opts?.timeoutMs ?? 5 * 60 * 1000;
  const intervalMs = opts?.intervalMs ?? 2000;
  const startedAt = Date.now();

  while (true) {
    const intent = await fetchIntentStatus(intentId);
    onUpdate(intent);

    if (
      intent.status === "succeeded" ||
      intent.status === "failed" ||
      intent.status === "expired"
    ) {
      return intent;
    }

    if (Date.now() - startedAt > timeoutMs) {
      throw new Error("poll_timeout");
    }

    await new Promise((r) => setTimeout(r, intervalMs));
  }
}
