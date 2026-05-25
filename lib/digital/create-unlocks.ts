/**
 * Post-payment digital-unlock creator.
 *
 * Called from `lib/orders/markPaid.ts` AFTER an order transitions
 * to PAID. Walks the order's items and, for any line whose Product
 * is DIGITAL, creates a DigitalUnlock row keyed by (userId, productId,
 * orderItemId). One row per OrderItem so refunds can revoke a specific
 * line without affecting the buyer's other purchases.
 *
 * Idempotent: re-running on an already-unlocked order is a no-op
 * because `orderItemId` is @unique — a second insert raises P2002 and
 * we swallow it (same buyer, same line, already created).
 */
import { prisma } from '@/lib/prisma';

export async function createDigitalUnlocksForOrder(
  orderId: string,
): Promise<{ created: number; alreadyExisted: number }> {
  // Pull the order with items + their products. We only need productType
  // + buyer's userId to decide which items need an unlock.
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      userId: true,
      items: {
        select: {
          id: true,
          productId: true,
          product: {
            select: {
              id: true,
              productType: true,
            },
          },
        },
      },
    },
  });
  if (!order) return { created: 0, alreadyExisted: 0 };

  const digitalLines = order.items.filter(
    (line) => line.product?.productType === 'DIGITAL',
  );
  if (digitalLines.length === 0) {
    return { created: 0, alreadyExisted: 0 };
  }

  let created = 0;
  let alreadyExisted = 0;

  for (const line of digitalLines) {
    try {
      await prisma.digitalUnlock.create({
        data: {
          userId: order.userId,
          productId: line.productId,
          orderItemId: line.id,
          // licenseKey defaults via @default(cuid()) in schema
        },
      });
      created += 1;
    } catch (err: unknown) {
      // P2002 = unique constraint violation on orderItemId — buyer already
      // has an unlock for this line (replay-safe). Anything else bubbles.
      const code = (err as { code?: string }).code;
      if (code === 'P2002') {
        alreadyExisted += 1;
      } else {
        throw err;
      }
    }
  }

  return { created, alreadyExisted };
}
