// Server-only Anypay intent operations.
// NEVER import this from client code — it uses ANYPAY_SECRET_KEY.
//
// This is the vendor-template "intent" model where one PaymentIntent
// covers a multi-store cart and we mirror Anypay's state on our side
// via the webhook below. Distinct from the older lib/anypay/client.ts
// which used the per-order create-payment model; both can coexist
// while call sites migrate.

import { createHmac, timingSafeEqual } from "crypto";

const API_BASE = process.env.ANYPAY_API_BASE ?? "";
const SECRET_KEY = process.env.ANYPAY_SECRET_KEY ?? "";
const WEBHOOK_SECRET = process.env.ANYPAY_WEBHOOK_SECRET ?? "";
const RETURN_URL = process.env.ANYPAY_RETURN_URL ?? "";
const WEBHOOK_URL = process.env.ANYPAY_WEBHOOK_URL ?? "";

if (typeof window !== "undefined") {
  throw new Error(
    "lib/anypay/intent-server.ts must not be imported from client code",
  );
}

export interface CreateIntentArgs {
  cartId: string;
  amount: number;
  paymentMethod: "promptpay" | "card" | "wallet" | "bnpl" | "cod";
  merchantOrderRefs: string[];
  userId: string;
  metadata?: Record<string, unknown>;
}

export interface AnypayIntentResponse {
  intentId: string;
  status: "pending" | "processing" | "succeeded" | "failed" | "expired";
  amount: number;
  paymentMethod: string;
  qrCode?: string;
  redirectUrl?: string;
  expiresAt?: string;
  paidAt?: string;
  failureReason?: string;
  metadata?: Record<string, unknown>;
}

export interface AnypayWebhookPayload {
  intentId: string;
  eventType:
    | "intent.succeeded"
    | "intent.failed"
    | "intent.expired"
    | "intent.processing";
  status: "pending" | "processing" | "succeeded" | "failed" | "expired";
  paidAt?: string;
  amount: number;
  paymentMethod: string;
  failureReason?: string;
  metadata?: Record<string, unknown>;
}

export async function createIntent(
  args: CreateIntentArgs,
): Promise<AnypayIntentResponse> {
  const res = await fetch(`${API_BASE}/intents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SECRET_KEY}`,
      // Anypay returns the same intent for the same cart until the
      // first expires — the cart-id-as-idempotency-key keeps double
      // submits from creating duplicate intents.
      "Idempotency-Key": args.cartId,
    },
    body: JSON.stringify({
      amount: Math.round(args.amount * 100), // satang
      currency: "THB",
      paymentMethod: args.paymentMethod,
      merchantOrderRefs: args.merchantOrderRefs,
      returnUrl: RETURN_URL,
      webhookUrl: WEBHOOK_URL,
      customer: { id: args.userId },
      metadata: args.metadata,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new AnypayError(
      `createIntent failed: ${res.status} ${errBody}`,
      res.status,
    );
  }

  const data = (await res.json()) as Record<string, unknown>;
  return normalizeIntent(data);
}

export async function getIntent(
  intentId: string,
): Promise<AnypayIntentResponse> {
  const res = await fetch(`${API_BASE}/intents/${intentId}`, {
    headers: { Authorization: `Bearer ${SECRET_KEY}` },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new AnypayError(`getIntent failed: ${res.status}`, res.status);
  }

  const data = (await res.json()) as Record<string, unknown>;
  return normalizeIntent(data);
}

export async function cancelIntent(intentId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/intents/${intentId}/cancel`, {
    method: "POST",
    headers: { Authorization: `Bearer ${SECRET_KEY}` },
  });
  if (!res.ok) {
    throw new AnypayError(`cancelIntent failed: ${res.status}`, res.status);
  }
}

// Verify webhook HMAC + 5-min anti-replay window.
// Anypay sends:
//   X-Anypay-Signature: hex(HMAC-SHA256(`${ts}.${rawBody}`, ANYPAY_WEBHOOK_SECRET))
//   X-Anypay-Timestamp: unix seconds
export function verifyWebhook(
  rawBody: string,
  signatureHeader: string | null,
  timestampHeader: string | null,
):
  | { ok: true; payload: AnypayWebhookPayload }
  | { ok: false; reason: string } {
  if (!signatureHeader) return { ok: false, reason: "missing_signature" };
  if (!timestampHeader) return { ok: false, reason: "missing_timestamp" };

  const ts = parseInt(timestampHeader, 10);
  if (isNaN(ts)) return { ok: false, reason: "invalid_timestamp" };

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > 300) {
    return { ok: false, reason: "timestamp_too_old" };
  }

  const expected = createHmac("sha256", WEBHOOK_SECRET)
    .update(`${ts}.${rawBody}`)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "hex");
  let actualBuf: Buffer;
  try {
    actualBuf = Buffer.from(signatureHeader, "hex");
  } catch {
    return { ok: false, reason: "signature_invalid_hex" };
  }

  if (expectedBuf.length !== actualBuf.length) {
    return { ok: false, reason: "signature_length_mismatch" };
  }

  if (!timingSafeEqual(expectedBuf, actualBuf)) {
    return { ok: false, reason: "signature_mismatch" };
  }

  try {
    const payload = JSON.parse(rawBody) as AnypayWebhookPayload;
    return { ok: true, payload };
  } catch {
    return { ok: false, reason: "invalid_json" };
  }
}

function normalizeIntent(raw: Record<string, unknown>): AnypayIntentResponse {
  return {
    intentId: String(raw.intentId ?? raw.id),
    status: raw.status as AnypayIntentResponse["status"],
    amount: Number(raw.amount) / 100,
    paymentMethod: String(raw.paymentMethod),
    qrCode: raw.qrCode as string | undefined,
    redirectUrl: raw.redirectUrl as string | undefined,
    expiresAt: raw.expiresAt as string | undefined,
    paidAt: raw.paidAt as string | undefined,
    failureReason: raw.failureReason as string | undefined,
    metadata: raw.metadata as Record<string, unknown> | undefined,
  };
}

export class AnypayError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = "AnypayError";
  }
}
