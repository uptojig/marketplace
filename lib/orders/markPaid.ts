import { OrderStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { placeExternalOrder } from "./automate";
import { getNotifier } from "@/lib/notify";

export interface MarkPaidInput {
  orderId: string;
  transactionId: string;
  rawPayload: unknown;
}

/**
 * Idempotent: returns { applied: false } if the payment was already PAID.
 */
export async function markOrderPaid(input: MarkPaidInput): Promise<{ applied: boolean }> {
  // Use updateMany with a status filter so a duplicate webhook is a no-op.
  const result = await prisma.payment.updateMany({
    where: { orderId: input.orderId, status: PaymentStatus.PENDING },
    data: {
      status: PaymentStatus.PAID,
      paidAt: new Date(),
      anypayTransactionId: input.transactionId,
      rawWebhookPayload: input.rawPayload as never,
    },
  });

  if (result.count === 0) {
    return { applied: false };
  }

  await prisma.order.update({
    where: { id: input.orderId },
    data: { status: OrderStatus.PAID },
  });

  const notifier = getNotifier();
  await notifier.info("order.paid", { orderId: input.orderId, transactionId: input.transactionId });

  // Synchronous fan-out for MVP. Failures inside placeExternalOrder are caught and notified
  // — they do not roll back the PAID state because the customer's money has already moved.
  try {
    await placeExternalOrder(input.orderId);
  } catch (err) {
    await notifier.error("order.automate.failed", {
      orderId: input.orderId,
      message: err instanceof Error ? err.message : String(err),
    });
  }

  return { applied: true };
}
