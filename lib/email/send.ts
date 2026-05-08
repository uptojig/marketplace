/**
 * Outbound email via Resend.
 *
 * Required env:
 *   RESEND_API_KEY  — re_... secret from resend.com/api-keys
 *   RESEND_FROM     — verified sender, e.g. "Basketplace <noreply@basketplace.co>"
 *
 * Resend's free tier (100/day, 3000/month) covers magic-link sign-in
 * and transactional emails for an early-stage marketplace. The SDK
 * handles retries on transient 5xx automatically.
 *
 * Usage:
 *   await sendEmail({
 *     to: "user@example.com",
 *     subject: "Reset your password",
 *     html: "<p>Click <a href=...>here</a></p>",
 *     text: "Click here: ...",  // fallback for plain-text clients
 *   });
 */

import { Resend } from "resend";

let client: Resend | null = null;

export class EmailNotConfiguredError extends Error {
  constructor() {
    super("RESEND_API_KEY is not set");
    this.name = "EmailNotConfiguredError";
  }
}

export function isEmailConfigured() {
  return !!(process.env.RESEND_API_KEY && process.env.RESEND_FROM);
}

function getClient(): Resend {
  if (!process.env.RESEND_API_KEY) throw new EmailNotConfiguredError();
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

export interface SendEmailArgs {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  /** Override the default RESEND_FROM for one-off transactional sends. */
  from?: string;
  replyTo?: string;
}

export async function sendEmail(args: SendEmailArgs): Promise<{ id: string }> {
  const c = getClient();
  const from = args.from ?? process.env.RESEND_FROM;
  if (!from) throw new EmailNotConfiguredError();

  const { data, error } = await c.emails.send({
    from,
    to: args.to,
    subject: args.subject,
    html: args.html,
    text: args.text,
    replyTo: args.replyTo,
  });

  if (error) {
    throw new Error(`resend_send_failed: ${error.name} — ${error.message}`);
  }
  if (!data?.id) {
    throw new Error("resend_send_failed: missing message id");
  }
  return { id: data.id };
}
