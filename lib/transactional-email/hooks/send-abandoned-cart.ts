// Composes the AbandonedCartEmail template and sends it.
//
// No automated trigger in this PR — exposed for a future cron / Inngest
// job that iterates over inactive carts and calls this fn. The job is
// responsible for:
//   - identifying anonymous vs authenticated carts (skip anon)
//   - throttling per-user (max 1 reminder per cart per 24h)
//   - respecting unsubscribe preferences (Phase 4)

import * as React from "react";
import { prisma } from "@/lib/prisma";
import { sendEmail, type SendEmailResult } from "../send";
import AbandonedCartEmail from "../templates/abandoned-cart";
import type {
  EmailCartItemDTO,
  EmailStoreDTO,
} from "../templates/types";

export interface SendAbandonedCartInput {
  userId: string;
  storeId: string;
  cartItems: EmailCartItemDTO[];
}

export async function sendAbandonedCartEmail(
  input: SendAbandonedCartInput,
): Promise<SendEmailResult> {
  try {
    if (!input.cartItems.length) {
      return { ok: false, reason: "empty_cart" };
    }

    const [user, store] = await Promise.all([
      prisma.user.findUnique({
        where: { id: input.userId },
        select: { email: true, name: true },
      }),
      prisma.store.findUnique({
        where: { id: input.storeId },
        select: {
          slug: true,
          name: true,
          logoUrl: true,
          primaryColor: true,
          contactEmail: true,
          customDomain: true,
        },
      }),
    ]);

    if (!user?.email) return { ok: false, reason: "user_has_no_email" };
    if (!store) return { ok: false, reason: "store_not_found" };

    const storeDto: EmailStoreDTO = {
      slug: store.slug,
      name: store.name,
      logoUrl: store.logoUrl,
      brandColor: store.primaryColor,
      contactEmail: store.contactEmail,
      customDomain: store.customDomain,
    };

    return await sendEmail({
      to: user.email,
      replyTo: store.contactEmail || undefined,
      from: `${store.name} <${process.env.EMAIL_FROM?.trim() || "orders@basketplace.co"}>`,
      subject: `[${store.name}] คุณลืมของในตะกร้า`,
      react: React.createElement(AbandonedCartEmail, {
        buyer: { email: user.email, name: user.name },
        store: storeDto,
        cartItems: input.cartItems,
      }),
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.warn("[send-abandoned-cart] failed:", reason);
    return { ok: false, reason };
  }
}
