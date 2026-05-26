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

  // Use the customer info from the webhook to build/find a User row.
  // For chargeback evidence the tester wants a real-looking buyer
  // identity (name + email + phone) attached to each demo order — not
  // a single shared `demo-quickpay@marketplace.local` bucket. Falls
  // back to that legacy bucket when the webhook didn't carry contact.
  const buyerEmail =
    (customer_email && String(customer_email).trim())
    || "demo-quickpay@marketplace.local";
  const buyerName =
    (customer_name && String(customer_name).trim())
    || "QuickPay Demo User";
  const buyerPhone = webhookBody.customer_phone
    ? String(webhookBody.customer_phone).trim()
    : null;

  const demoUser = await prisma.user.upsert({
    where: { email: buyerEmail },
    update: {
      name: buyerName,
      ...(buyerPhone ? { phone: buyerPhone } : {}),
    },
    create: {
      email: buyerEmail,
      name: buyerName,
      ...(buyerPhone ? { phone: buyerPhone } : {}),
    },
  });

  const amountDecimal = new Prisma.Decimal(amount);
  const now = new Date();

  // Resolve the target store from the incoming domain. Tries an exact
  // customDomain match first (production setup); falls back to parsing
  // the first segment as a store slug (e.g. "sheetlab-th.basketplace.co"
  // → "sheetlab-th"). The order needs at least one OrderItem with a
  // storeId to show up in that store's order history; without this
  // demo orders were orphan rows that never appeared in
  // /admin/stores/[id]/orders.
  let targetStore = await prisma.store.findFirst({
    where: { customDomain: domain },
    select: { id: true },
  });
  if (!targetStore) {
    const slugCandidate = domain.split(".")[0];
    if (slugCandidate) {
      targetStore = await prisma.store.findUnique({
        where: { slug: slugCandidate },
        select: { id: true },
      });
    }
  }
  // Pick any active product to peg the OrderItem to. If the store has
  // no products yet we fall back to creating an orderless row (legacy
  // behavior) so the test still works for empty stores.
  const demoProduct = targetStore
    ? await prisma.product.findFirst({
        where: { storeId: targetStore.id, active: true },
        select: { id: true, supplier: true },
        orderBy: { createdAt: "asc" },
      })
    : null;

  // Create the demo order with payment in a transaction
  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId: demoUser.id,
        status: OrderStatus.PAID,
        subtotalTHB: amountDecimal,
        shippingTHB: new Prisma.Decimal(0),
        totalTHB: amountDecimal,
        ...(demoProduct && targetStore
          ? {
              items: {
                create: [
                  {
                    productId: demoProduct.id,
                    storeId: targetStore.id,
                    qty: 1,
                    unitPriceTHB: amountDecimal,
                    supplier: demoProduct.supplier,
                  },
                ],
              },
            }
          : {}),
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

  // Demo orders are identified by the address payload's _metadata.isDemoOrder
  // flag (set in createDemoOrderFromDeposit) — NOT by buyer email anymore,
  // since each test can now register a unique customer name + email.
  const orders = await prisma.order.findMany({
    where: {
      shippingAddressJson: {
        path: ["_metadata", "isDemoOrder"],
        equals: true,
      },
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
