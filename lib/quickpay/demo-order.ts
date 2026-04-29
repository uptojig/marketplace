import { OrderStatus, PaymentProvider, PaymentStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getNotifier } from "@/lib/notify";
import type { QuickPayWebhookBody, DemoOrderResult } from "./types";

/**
 * Create a Demo/Test Order from a QuickPay deposit webhook.
 *
 * This creates a fully formed order record matching the actual deposit amount,
 * so the AnyPay team can verify that the system correctly:
 *   1. Receives the webhook
 *   2. Creates an order matching the deposit amount
 *   3. Links the payment to the transaction
 *   4. Updates the order status
 *
 * Idempotent: if a demo order for this transaction_id already exists, it returns it.
 */
export async function createDemoOrderFromDeposit(
  webhookBody: QuickPayWebhookBody,
  domain: string,
): Promise<DemoOrderResult> {
  const { transaction_id, amount, channel, customer_name, customer_email } = webhookBody;

  // Check for existing demo order with this transaction (idempotency)
  const existingPayment = await prisma.payment.findUnique({
    where: { anypayTransactionId: transaction_id },
    include: { order: true },
  });

  if (existingPayment) {
    return {
      orderId: existingPayment.orderId,
      status: "ALREADY_EXISTS",
      amountTHB: Number(existingPayment.amountTHB),
      transactionId: transaction_id,
      domain,
    };
  }

  // Get or create the demo user
  const demoUser = await prisma.user.upsert({
    where: { email: "demo-quickpay@marketplace.local" },
    update: {},
    create: {
      email: "demo-quickpay@marketplace.local",
      name: "QuickPay Demo User",
    },
  });

  const amountDecimal = new Prisma.Decimal(amount);
  const now = new Date();

  // Create the demo order with payment in a transaction
  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId: demoUser.id,
        status: OrderStatus.PAID,
        subtotalTHB: amountDecimal,
        shippingTHB: new Prisma.Decimal(0),
        totalTHB: amountDecimal,
        shippingAddressJson: {
          type: "DEMO_ORDER",
          recipientName: customer_name ?? "QuickPay Demo",
          phone: "-",
          line1: `Demo deposit via ${channel ?? "unknown"}`,
          line2: `Domain: ${domain}`,
          subdistrict: "-",
          district: "-",
          province: "กรุงเทพมหานคร",
          postalCode: "10100",
          country: "TH",
          _metadata: {
            isDemoOrder: true,
            source: "quickpay_webhook",
            domain,
            channel: channel ?? "unknown",
            customerEmail: customer_email ?? null,
            webhookTimestamp: webhookBody.timestamp,
          },
        },
        payment: {
          create: {
            provider: PaymentProvider.ANYPAY,
            status: PaymentStatus.PAID,
            amountTHB: amountDecimal,
            anypayTransactionId: transaction_id,
            paidAt: now,
            rawWebhookPayload: webhookBody as unknown as Prisma.InputJsonValue,
            rawCreateResponse: {
              type: "DEMO_ORDER",
              source: "quickpay_deposit_webhook",
              domain,
              createdAt: now.toISOString(),
            },
          },
        },
      },
      include: { payment: true },
    });
    return created;
  });

  // Notify
  const notifier = getNotifier();
  await notifier.info("demo.order.created", {
    orderId: order.id,
    amountTHB: amount,
    transactionId: transaction_id,
    domain,
    channel: channel ?? "unknown",
  });

  return {
    orderId: order.id,
    status: "CREATED",
    amountTHB: amount,
    transactionId: transaction_id,
    domain,
  };
}

/**
 * List recent demo orders for admin verification.
 */
export async function listDemoOrders(options?: { limit?: number; domain?: string }) {
  const limit = options?.limit ?? 50;

  const orders = await prisma.order.findMany({
    where: {
      user: { email: "demo-quickpay@marketplace.local" },
      payment: { provider: PaymentProvider.ANYPAY },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      payment: true,
      user: { select: { email: true, name: true } },
    },
  });

  // Filter by domain if specified
  if (options?.domain) {
    return orders.filter((o) => {
      const addr = o.shippingAddressJson as Record<string, unknown>;
      const meta = addr?._metadata as Record<string, unknown> | undefined;
      return meta?.domain === options.domain;
    });
  }

  return orders;
}
