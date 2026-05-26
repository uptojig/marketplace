/**
 * Post-payment digital-unlock creator.
 *
 * Called from `lib/orders/markPaid.ts` AFTER an order transitions
 * to PAID. Walks the order's items and, for any line whose Product
 * is DIGITAL, creates the right number of DigitalUnlock rows:
 *
 *   - Self-purchase (no giftRecipientsJson): 1 unlock, attached to
 *     the buyer's User.id, accessToken NULL (buyer authenticates
 *     via session at /account/downloads).
 *   - Gift purchase (giftRecipientsJson set):  one unlock per
 *     recipient, each with recipientEmail/Name/giftMessage + a
 *     unique accessToken. Recipients access via /unlock/<token>
 *     without signing up.
 *
 * Idempotent: re-running on an already-unlocked order is a no-op.
 * We count existing unlocks for each OrderItem; if the count already
 * matches what we'd create, we skip.
 */
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

interface GiftRecipient {
  email: string;
  name: string;
  message?: string;
}

function newAccessToken(): string {
  // 24-byte = 192-bit token, base64url-encoded. Long enough to be
  // impossible to brute-force; the @unique index also rejects the
  // ~zero collision probability case.
  return randomBytes(24).toString("base64url");
}

export async function createDigitalUnlocksForOrder(
  orderId: string,
): Promise<{ created: number; alreadyExisted: number }> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      userId: true,
      items: {
        select: {
          id: true,
          productId: true,
          giftRecipientsJson: true,
          product: {
            select: { id: true, productType: true },
          },
        },
      },
    },
  });
  if (!order) return { created: 0, alreadyExisted: 0 };

  const digitalLines = order.items.filter(
    (line) => line.product?.productType === "DIGITAL",
  );
  if (digitalLines.length === 0) {
    return { created: 0, alreadyExisted: 0 };
  }

  let created = 0;
  let alreadyExisted = 0;

  for (const line of digitalLines) {
    // Idempotency: count what's already there. Gift orders have N
    // unlocks; self orders have 1. If the existing count is non-zero
    // we treat the line as fully unlocked already.
    const existingCount = await prisma.digitalUnlock.count({
      where: { orderItemId: line.id },
    });
    if (existingCount > 0) {
      alreadyExisted += existingCount;
      continue;
    }

    const recipients =
      (line.giftRecipientsJson as unknown as GiftRecipient[] | null)
      ?? null;

    if (recipients && recipients.length > 0) {
      // Gift mode — one unlock per recipient. userId stays the
      // buyer's so admin tools can trace gifts back to the gifter.
      for (const r of recipients) {
        await prisma.digitalUnlock.create({
          data: {
            userId: order.userId,
            productId: line.productId,
            orderItemId: line.id,
            recipientEmail: r.email,
            recipientName: r.name,
            giftMessage: r.message ?? null,
            accessToken: newAccessToken(),
          },
        });
        created += 1;
      }
    } else {
      // Self-purchase — single unlock, no recipient fields.
      await prisma.digitalUnlock.create({
        data: {
          userId: order.userId,
          productId: line.productId,
          orderItemId: line.id,
        },
      });
      created += 1;
    }
  }

  return { created, alreadyExisted };
}
