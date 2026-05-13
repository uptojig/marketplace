// Generic transactional-email send helper. Wraps Resend and adds:
//   - a dev fallback (RESEND_API_KEY unset OR NODE_ENV !== "production")
//     that renders to HTML and logs the first 200 chars to console
//   - never-throw semantics: emails failing must NEVER fail an order
//     transition. All errors return `{ ok: false, reason }` instead.
//
// Templates are React Email components (server-rendered React).

import type React from "react";
import { render } from "@react-email/components";
import { getResendClient } from "./client";

export interface SendEmailOptions {
  to: string;
  /** Defaults to EMAIL_FROM env or "orders@basketplace.co". */
  from?: string;
  /** Optional Reply-To header — usually the store's contact email. */
  replyTo?: string;
  subject: string;
  /** React Email component instance — render-to-HTML happens here. */
  react: React.ReactElement;
  /** Optional plaintext fallback. Resend will auto-strip from HTML if omitted. */
  text?: string;
}

export type SendEmailResult =
  | { ok: true; id?: string }
  | { ok: false; reason: string };

const DEFAULT_FROM =
  process.env.EMAIL_FROM?.trim() || "orders@basketplace.co";

/**
 * Sends a transactional email via Resend, OR logs it to the console
 * when running in dev / without an API key.
 *
 * Guarantees:
 *   - Never throws. Order-flow callers can `await sendEmail(...)`
 *     without a try/catch.
 *   - Returns a typed result so callers can audit-log failures
 *     without affecting the parent transaction.
 */
export async function sendEmail(
  opts: SendEmailOptions,
): Promise<SendEmailResult> {
  const { to, from = DEFAULT_FROM, replyTo, subject, react, text } = opts;

  if (!to || !to.includes("@")) {
    return { ok: false, reason: "invalid_to_address" };
  }

  let html: string;
  try {
    html = await render(react);
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.warn("[transactional-email] render failed:", reason);
    return { ok: false, reason: `render_failed: ${reason}` };
  }

  const client = getResendClient();
  const isProd = process.env.NODE_ENV === "production";

  // Dev fallback: log + skip the network call. Lets local devs iterate
  // on templates without needing a Resend account.
  if (!client || !isProd) {
    console.log("[email:dev] would send:", {
      to,
      from,
      subject,
      preview: html.slice(0, 200),
    });
    return { ok: true, id: "dev-stub" };
  }

  try {
    const result = await client.emails.send({
      from,
      to,
      subject,
      html,
      text,
      replyTo,
    });

    // resend v6 returns { data, error } shape.
    if ("error" in result && result.error) {
      const reason =
        typeof result.error === "object" && result.error !== null && "message" in result.error
          ? String((result.error as { message: unknown }).message)
          : JSON.stringify(result.error);
      console.warn("[transactional-email] resend rejected:", reason);
      return { ok: false, reason };
    }

    const id =
      "data" in result && result.data && typeof result.data === "object" && "id" in result.data
        ? String((result.data as { id: unknown }).id)
        : undefined;
    return { ok: true, id };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.warn("[transactional-email] send threw:", reason);
    return { ok: false, reason };
  }
}
