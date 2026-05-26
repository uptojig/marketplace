/**
 * Credit top-up lifecycle.
 *
 * Two functions: `createTopupIntent` (called from POST /api/credit/topup)
 * and `markTopupPaid` (called from the AnyPay webhook when it receives
 * a "topup:<id>" order_id).
 *
 * Webhook routing happens in app/api/webhook/anypay/route.ts: the
 * dispatcher splits `order_id` on the `topup:` prefix. Order payments
 * keep the bare cuid; top-ups carry the prefix so we can route without
 * a join.
 */
import { randomBytes } from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createPayment } from "@/lib/anypay/client";

export interface CreateTopupInput {
  userId: string;
  storeId: string;
  storeSlug: string;
  amountTHB: number;
  customerEmail?: string;
  /** Chargeback-defense evidence captured at intent creation time. */
  ipAddress?: string;
  userAgent?: string;
  /** Version of the Terms of Service the buyer just accepted. The
   *  client MUST pass this — POST /api/credit/topup rejects requests
   *  without it. */
  tosVersion: string;
}

export interface CreateTopupResult {
  topupId: string;
  referenceNumber: string;
  paymentUrl: string;
}

/** The "order_id" we hand to AnyPay for top-ups. The webhook keys off
 *  the `topup:` prefix to decide whether the incoming PAID is for a
 *  CreditTopup or an Order. Public so the webhook can re-derive. */
export const TOPUP_ORDER_ID_PREFIX = "topup:";

/** Human-readable reference number for receipts + chargeback packs.
 *  Format: TOP-YYYYMMDD-XXXXXX (6-char base32 suffix). Unique-ish on
 *  its own; the DB @unique index is the real guarantee. */
function newReferenceNumber(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  // Crockford base32 alphabet — no ambiguous chars (no 0/O, 1/I/L).
  const alphabet = "23456789ABCDEFGHJKMNPQRSTVWXYZ";
  const bytes = randomBytes(6);
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += alphabet[bytes[i]! % alphabet.length];
  }
  return `TOP-${y}${m}${d}-${suffix}`;
}

/**
 * Creates a CreditTopup row + AnyPay intent. Returns the paymentUrl
 * the buyer should be redirected to. Idempotency is per-call (every
 * call creates a new row) — the caller is expected to rate-limit at
 * the route layer.
 */
export async function createTopupIntent(
  input: CreateTopupInput,
): Promise<CreateTopupResult> {
  if (!Number.isFinite(input.amountTHB) || input.amountTHB <= 0) {
    throw new Error("amountTHB must be positive");
  }

  const topup = await prisma.creditTopup.create({
    data: {
      userId: input.userId,
      storeId: input.storeId,
      amountTHB: new Prisma.Decimal(input.amountTHB),
      referenceNumber: newReferenceNumber(),
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
      tosVersion: input.tosVersion,
      tosAcceptedAt: new Date(),
    },
    select: { id: true, referenceNumber: true },
  });

  const payment = await createPayment({
    orderId: `${TOPUP_ORDER_ID_PREFIX}${topup.id}`,
    amountTHB: input.amountTHB,
    customerEmail: input.customerEmail,
    description: `Credit top-up · ${input.storeSlug} · ${input.amountTHB} THB`,
    storeSlug: input.storeSlug,
    returnPath: `/stores/${input.storeSlug}/account/credit?topup=${topup.id}`,
  });

  await prisma.creditTopup.update({
    where: { id: topup.id },
    data: {
      anypayTransactionId: payment.transactionId,
      paymentUrl: payment.paymentUrl,
      rawCreateResponse: payment.raw as never,
    },
  });

  return {
    topupId: topup.id,
    referenceNumber: topup.referenceNumber!,
    paymentUrl: payment.paymentUrl,
  };
}

export interface MarkTopupPaidInput {
  topupId: string;
  transactionId: string;
  rawPayload: unknown;
}

/**
 * Idempotent: returns { applied: false } on replay. Flips the topup
 * to PAID, upserts CreditBalance, writes a CreditLedger TOPUP entry.
 * The three writes happen inside one transaction so a partial failure
 * never leaves balance and ledger out of sync.
 */
export async function markTopupPaid(
  input: MarkTopupPaidInput,
): Promise<{ applied: boolean }> {
  const result = await applyTopupPaid(input);
  if (result.applied) {
    // Fire-and-forget receipt email. Failures get logged inside the
    // hook; we never throw out of markTopupPaid because the balance
    // is already credited and the webhook ack matters more.
    const { sendCreditTopupReceiptEmail } = await import(
      "@/lib/transactional-email"
    );
    await sendCreditTopupReceiptEmail({ topupId: input.topupId });
  }
  return { applied: result.applied };
}

async function applyTopupPaid(
  input: MarkTopupPaidInput,
): Promise<{ applied: boolean }> {
  return prisma.$transaction(async (tx) => {
    const result = await tx.creditTopup.updateMany({
      where: { id: input.topupId, status: "PENDING" },
      data: {
        status: "PAID",
        paidAt: new Date(),
        anypayTransactionId: input.transactionId,
        rawWebhookPayload: input.rawPayload as never,
      },
    });
    if (result.count === 0) return { applied: false };

    const topup = await tx.creditTopup.findUniqueOrThrow({
      where: { id: input.topupId },
      select: { userId: true, storeId: true, amountTHB: true },
    });

    // Upsert the (userId, storeId) balance — first top-up creates the
    // row, subsequent ones increment.
    const balance = await tx.creditBalance.upsert({
      where: {
        userId_storeId: { userId: topup.userId, storeId: topup.storeId },
      },
      update: { balanceTHB: { increment: topup.amountTHB } },
      create: {
        userId: topup.userId,
        storeId: topup.storeId,
        balanceTHB: topup.amountTHB,
      },
      select: { id: true, balanceTHB: true },
    });

    await tx.creditLedger.create({
      data: {
        balanceId: balance.id,
        type: "TOPUP",
        amountTHB: topup.amountTHB,
        balanceAfter: balance.balanceTHB,
        topupId: input.topupId,
        note: `Top-up via AnyPay (${input.transactionId})`,
      },
    });

    return { applied: true };
  });
}
