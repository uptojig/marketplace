import { OrderStatus, PaymentProvider, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { placeExternalOrder } from "./automate";
import { getNotifier } from "@/lib/notify";
import {
  sendOrderPaidEmail,
  sendDigitalUnlockReadyEmail,
  sendGiftUnlockReadyEmails,
} from "@/lib/transactional-email";
import { createDigitalUnlocksForOrder } from "@/lib/digital/create-unlocks";

export interface MarkPaidInput {
  orderId: string;
  transactionId: string;
  rawPayload: unknown;
}

/**
 * Idempotent: returns { applied: false } if the payment was already PAID.
 * Used by the AnyPay webhook for gateway-settled orders. Credit-paid
 * orders flow through `markOrderPaidByCredit` instead — same post-paid
 * hooks, different prerequisites.
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

  await runPostPaidHooks(input.orderId, { transactionId: input.transactionId });
  return { applied: true };
}

/**
 * Flip an Order to PAID after the buyer's credit balance has already
 * been decremented (see `spendCredit` in `@/lib/credit/spend`). MUST be
 * called from within the same `$transaction` as the credit spend, so a
 * failure here rolls back the burn and the buyer doesn't lose credit
 * without an order.
 *
 * The post-paid fan-out (digital unlocks, email, automate) runs OUTSIDE
 * the transaction — it's fire-and-forget and shouldn't roll back the
 * paid order if a downstream service is flaky.
 */
export async function markOrderPaidByCredit(input: {
  orderId: string;
}): Promise<{ applied: boolean }> {
  const result = await prisma.payment.updateMany({
    where: { orderId: input.orderId, status: PaymentStatus.PENDING },
    data: {
      status: PaymentStatus.PAID,
      paidAt: new Date(),
      provider: PaymentProvider.CREDIT,
    },
  });
  if (result.count === 0) return { applied: false };

  await prisma.order.update({
    where: { id: input.orderId },
    data: { status: OrderStatus.PAID },
  });

  await runPostPaidHooks(input.orderId, { via: "credit" });
  return { applied: true };
}

/**
 * Shared post-paid fan-out — digital unlocks, fulfillment emails,
 * supplier hand-off. Failures here log + notify but never throw, so an
 * already-PAID order is never rolled back.
 *
 * Exported so the credit-payment checkout path can flip Payment/Order
 * itself (inside its own transaction with `spendCredit`) and then
 * trigger the hooks AFTER the transaction commits.
 */
export async function runPostPaidHooks(
  orderId: string,
  ctx: { transactionId?: string; via?: "credit" } = {},
): Promise<void> {
  const notifier = getNotifier();
  await notifier.info("order.paid", {
    orderId,
    ...(ctx.transactionId ? { transactionId: ctx.transactionId } : {}),
    ...(ctx.via ? { via: ctx.via } : {}),
  });

  // Digital fulfillment — create one DigitalUnlock per DIGITAL line item
  // so /account/downloads + PromptViewer can serve the unlocked content.
  // Idempotent: orderItemId is @unique so a webhook replay is a no-op.
  // Failures here never roll back PAID — buyer can still re-fetch via
  // the support flow if the unlock didn't create for any reason.
  let createdUnlocks = 0;
  try {
    const { created, alreadyExisted } = await createDigitalUnlocksForOrder(orderId);
    createdUnlocks = created;
    if (created + alreadyExisted > 0) {
      await notifier.info("order.digital.unlocks_created", {
        orderId,
        created,
        alreadyExisted,
      });
    }
  } catch (err) {
    await notifier.error("order.digital.unlock_failed", {
      orderId,
      message: err instanceof Error ? err.message : String(err),
    });
  }

  // Fire the digital-fulfillment email only when we actually created
  // new unlocks. On a webhook replay (createdUnlocks === 0 because rows
  // already existed) we stay silent so the buyer doesn't get a second
  // "your files are ready" email for the same order.
  if (createdUnlocks > 0) {
    const digitalEmailResult = await sendDigitalUnlockReadyEmail({ orderId });
    if (!digitalEmailResult.ok) {
      await notifier.info("order.digital.email_skipped", {
        orderId,
        reason: digitalEmailResult.reason,
      });
    }
    // Gift recipients get their own magic-link email. Hook is idempotent
    // on its own because it only emails unlocks with recipientEmail
    // set; replays still match zero rows on the second pass.
    const giftResult = await sendGiftUnlockReadyEmails({ orderId });
    if (giftResult.sent + giftResult.failed > 0) {
      await notifier.info("order.gift.emails", {
        orderId,
        sent: giftResult.sent,
        failed: giftResult.failed,
      });
    }
  }

  // Synchronous fan-out for MVP. Failures inside placeExternalOrder are caught and notified
  // — they do not roll back the PAID state because the customer's money has already moved.
  try {
    await placeExternalOrder(orderId);
  } catch (err) {
    await notifier.error("order.automate.failed", {
      orderId,
      message: err instanceof Error ? err.message : String(err),
    });
  }

  // Buyer confirmation email. Never throws — failures are logged inside
  // sendOrderPaidEmail and never roll back the PAID transition.
  const emailResult = await sendOrderPaidEmail({ orderId });
  if (!emailResult.ok) {
    // Non-fatal: log but don't fail the order. (The notifier interface
    // only exposes info/error — use info to avoid loud-paging on
    // common dev-mode "no API key" skips.)
    await notifier.info("order.paid.email_skipped", {
      orderId,
      reason: emailResult.reason,
    });
  }
}
