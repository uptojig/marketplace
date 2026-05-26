// Fires N emails after a PAID gift order — one per recipient — with
// a magic link to /unlock/<accessToken>.
//
// Called from markPaid's post-paid fan-out via runPostPaidHooks. Like
// the other transactional hooks, this never throws — failures are
// logged and the PAID transition still commits.

import * as React from "react";
import { prisma } from "@/lib/prisma";
import { sendEmail, type SendEmailResult } from "../send";
import GiftUnlockReadyEmail from "../templates/gift-unlock-ready";
import type { EmailStoreDTO } from "../templates/types";

export interface SendGiftUnlockReadyInput {
  orderId: string;
}

function publicBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "")
    || process.env.NEXTAUTH_URL?.replace(/\/$/, "")
    || "https://basketplace.co"
  );
}

export async function sendGiftUnlockReadyEmails(
  input: SendGiftUnlockReadyInput,
): Promise<{ sent: number; failed: number }> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: input.orderId },
      include: {
        store: true,
        user: { select: { name: true, email: true } },
        items: {
          include: {
            product: { select: { title: true, titleTh: true, imageUrl: true } },
            unlocks: {
              select: {
                accessToken: true,
                recipientEmail: true,
                recipientName: true,
                giftMessage: true,
              },
            },
          },
        },
      },
    });
    if (!order || !order.store) return { sent: 0, failed: 0 };

    const storeDto: EmailStoreDTO = {
      slug: order.store.slug,
      name: order.store.name,
      logoUrl: order.store.logoUrl,
      brandColor: order.store.primaryColor,
      contactEmail: order.store.contactEmail,
      customDomain: order.store.customDomain,
    };

    const gifterName = order.user?.name || "เพื่อน";
    const base = publicBaseUrl();

    let sent = 0;
    let failed = 0;

    for (const item of order.items) {
      for (const unlock of item.unlocks) {
        // Skip self-purchase unlocks — they have no recipientEmail.
        if (!unlock.recipientEmail || !unlock.accessToken) continue;
        const productTitle =
          item.product?.titleTh
          || item.product?.title
          || item.title
          || "สินค้าดิจิทัล";
        const unlockUrl = `${base}/unlock/${unlock.accessToken}`;

        const result: SendEmailResult = await sendEmail({
          to: unlock.recipientEmail,
          replyTo: order.store.contactEmail || undefined,
          from: `${order.store.name} <${process.env.EMAIL_FROM?.trim() || "orders@basketplace.co"}>`,
          subject: `🎁 ${gifterName} ส่งของขวัญดิจิทัลให้คุณ — ${productTitle}`,
          react: React.createElement(GiftUnlockReadyEmail, {
            store: storeDto,
            gifterName,
            recipientName: unlock.recipientName || "เพื่อน",
            productTitle,
            productImage: item.product?.imageUrl ?? null,
            giftMessage: unlock.giftMessage,
            unlockUrl,
          }),
        });
        if (result.ok) sent += 1;
        else failed += 1;
      }
    }

    return { sent, failed };
  } catch (err) {
    console.warn("[send-gift-unlock-ready] failed:", err);
    return { sent: 0, failed: 0 };
  }
}
