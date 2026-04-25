import { NextResponse } from "next/server";
import { WebhookSource } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifySignature } from "@/lib/anypay/signature";
import { isMockMode } from "@/lib/anypay/client";
import { markOrderPaid } from "@/lib/orders/markPaid";
import type { AnyPayWebhookBody } from "@/lib/anypay/types";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature");
  const headers: Record<string, string> = {};
  req.headers.forEach((v, k) => {
    headers[k] = v;
  });

  let body: AnyPayWebhookBody;
  try {
    body = JSON.parse(rawBody) as AnyPayWebhookBody;
  } catch {
    await prisma.webhookLog.create({
      data: {
        source: WebhookSource.ANYPAY,
        endpoint: "/api/webhook/anypay",
        headersJson: headers,
        bodyJson: { rawBody },
        signatureValid: false,
        processed: false,
        processingError: "Invalid JSON",
      },
    });
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  let signatureValid = false;
  if (isMockMode()) {
    signatureValid = true;
  } else {
    const secret = process.env.ANYPAY_SECRET;
    signatureValid = !!secret && verifySignature(rawBody, signature, secret);
  }

  const log = await prisma.webhookLog.create({
    data: {
      source: WebhookSource.ANYPAY,
      endpoint: "/api/webhook/anypay",
      headersJson: headers,
      bodyJson: body as never,
      signatureValid,
      processed: false,
    },
  });

  if (!signatureValid) {
    return NextResponse.json({ ok: true });
  }

  try {
    if (body.status === "PAID" && body.order_id && body.transaction_id) {
      const result = await markOrderPaid({
        orderId: body.order_id,
        transactionId: body.transaction_id,
        rawPayload: body,
      });
      await prisma.webhookLog.update({
        where: { id: log.id },
        data: { processed: true, processingError: result.applied ? null : "Already paid (idempotent)" },
      });
    } else {
      await prisma.webhookLog.update({
        where: { id: log.id },
        data: { processed: true, processingError: `Status=${body.status} skipped` },
      });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[webhook/anypay]", err);
    await prisma.webhookLog.update({
      where: { id: log.id },
      data: { processingError: err instanceof Error ? err.message : String(err) },
    });
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
