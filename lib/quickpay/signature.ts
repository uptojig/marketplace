import crypto from "crypto";

/**
 * Verify QuickPay webhook signature (HMAC-SHA256).
 * QuickPay sends the signature in the `x-quickpay-signature` header.
 */
export function verifyQuickPaySignature(
  rawBody: string,
  signature: string | null | undefined,
  secret: string,
): boolean {
  if (!signature) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(signature, "hex");
  if (a.length !== b.length) return false;

  return crypto.timingSafeEqual(a, b);
}

/**
 * Generate a QuickPay-compatible signature for outbound requests.
 */
export function signQuickPayPayload(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}
