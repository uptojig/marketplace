// Fires after `markTopupPaid` settles a CreditTopup. Sends the
// receipt email to the buyer with the human-readable reference number
// and a link to the full receipt page. Never throws — credit balance
// already credited; email failure is non-fatal.

import * as React from "react";
import { prisma } from "@/lib/prisma";
import { sendEmail, type SendEmailResult } from "../send";
import CreditTopupReceiptEmail from "../templates/credit-topup-receipt";
import type { EmailStoreDTO } from "../templates/types";

export interface SendCreditTopupReceiptInput {
  topupId: string;
}

function publicBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "")
    || process.env.NEXTAUTH_URL?.replace(/\/$/, "")
    || "https://basketplace.co"
  );
}

export async function sendCreditTopupReceiptEmail(
  input: SendCreditTopupReceiptInput,
): Promise<SendEmailResult> {
  try {
    const topup = await prisma.creditTopup.findUnique({
      where: { id: input.topupId },
      include: {
        user: { select: { email: true, name: true } },
        store: true,
      },
    });
    if (!topup) return { ok: false, reason: "topup_not_found" };
    if (!topup.user?.email) return { ok: false, reason: "buyer_has_no_email" };
    if (!topup.store) return { ok: false, reason: "topup_has_no_store" };
    if (!topup.referenceNumber) {
      // Legacy row without a ref number — shouldn't happen for fresh
      // top-ups; fall back silently so we don't email garbage.
      return { ok: false, reason: "topup_has_no_reference" };
    }

    const storeDto: EmailStoreDTO = {
      slug: topup.store.slug,
      name: topup.store.name,
      logoUrl: topup.store.logoUrl,
      brandColor: topup.store.primaryColor,
      contactEmail: topup.store.contactEmail,
      customDomain: topup.store.customDomain,
    };

    const receiptUrl = `${publicBaseUrl()}/stores/${topup.store.slug}/account/credit/receipts/${topup.referenceNumber}`;

    return await sendEmail({
      to: topup.user.email,
      replyTo: topup.store.contactEmail || undefined,
      from: `${topup.store.name} <${process.env.EMAIL_FROM?.trim() || "orders@basketplace.co"}>`,
      subject: `ยืนยันการเติมเครดิต — ${topup.referenceNumber}`,
      react: React.createElement(CreditTopupReceiptEmail, {
        store: storeDto,
        buyer: { email: topup.user.email, name: topup.user.name },
        referenceNumber: topup.referenceNumber,
        amountTHB: Number(topup.amountTHB),
        paidAtIso: (topup.paidAt ?? topup.updatedAt).toISOString(),
        anypayTransactionId: topup.anypayTransactionId,
        receiptUrl,
      }),
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.warn("[send-credit-topup-receipt] failed:", reason);
    return { ok: false, reason };
  }
}
