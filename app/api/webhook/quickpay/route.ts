import { NextResponse } from "next/server";
import { WebhookSource } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyQuickPaySignature } from "@/lib/quickpay/signature";
import { isWhitelistedIP, getClientIP } from "@/lib/quickpay/ip-whitelist";
import { createDemoOrderFromDeposit } from "@/lib/quickpay/demo-order";
import { markOrderPaid } from "@/lib/orders/markPaid";
import type { QuickPayWebhookBody } from "@/lib/quickpay/types";

/**
 * POST /api/webhook/quickpay
 *
 * Receives webhooks from QuickPay Payment Hub (including AnyPay).
 * Flow:
 *   1. IP Whitelist check (defense-in-depth; Nginx already does this)
 *   2. Parse body + log raw webhook
 *   3. Verify HMAC-SHA256 signature
 *   4. Handle event:
 *      - DEPOSIT → Create Demo Order from deposit amount
 *      - PAYMENT_SUCCESS → Mark existing order as paid
 *      - Others → Log and acknowledge
 */
export async function POST(req: Request) {
  const clientIp = getClientIP(req);
  const domain = req.headers.get("x-webhook-domain") ?? req.headers.get("host") ?? "unknown";
  const dedicatedIp = req.headers.get("x-webhook-dedicated-ip") ?? "unknown";

  // ── Step 1: IP Whitelist ─────────────────────────────────
  if (!isWhitelistedIP(clientIp)) {
    console.warn(`[webhook/quickpay] Blocked IP: ${clientIp} for domain: ${domain}`);
    await prisma.webhookLog.create({
      data: {
        source: WebhookSource.ANYPAY,
        endpoint: "/api/webhook/quickpay",
        headersJson: { clientIp, domain, dedicatedIp, blocked: true },
        bodyJson: { error: "IP not whitelisted" },
        signatureValid: false,
        processed: false,
        processingError: `IP ${clientIp} not whitelisted`,
      },
    });
    return NextResponse.json(
      { ok: false, error: "IP not whitelisted" },
      { status: 403 },
    );
  }

  // ── Step 2: Parse body ───────────────────────────────────
  const rawBody = await req.text();
  const signature = req.headers.get("x-quickpay-signature") ?? req.headers.get("x-signature");
  const headers: Record<string, string> = {};
  req.headers.forEach((v, k) => {
    headers[k] = v;
  });

  let body: QuickPayWebhookBody;
  try {
    body = JSON.parse(rawBody) as QuickPayWebhookBody;
  } catch {
    await prisma.webhookLog.create({
      data: {
        source: WebhookSource.ANYPAY,
        endpoint: "/api/webhook/quickpay",
        headersJson: { ...headers, clientIp },
        bodyJson: { rawBody },
        signatureValid: false,
        processed: false,
        processingError: "Invalid JSON",
      },
    });
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  // ── Step 3: Verify signature ─────────────────────────────
  let signatureValid = false;
  const secret = process.env.QUICKPAY_SECRET ?? process.env.ANYPAY_SECRET;

  if (process.env.ANYPAY_MODE === "mock" || process.env.NODE_ENV !== "production") {
    // In mock/dev mode, skip signature verification
    signatureValid = true;
  } else if (secret) {
    signatureValid = verifyQuickPaySignature(rawBody, signature, secret);
  }

  // Log the webhook
  const log = await prisma.webhookLog.create({
    data: {
      source: WebhookSource.ANYPAY,
      endpoint: "/api/webhook/quickpay",
      headersJson: { ...headers, clientIp, domain, dedicatedIp },
      bodyJson: body as never,
      signatureValid,
      processed: false,
    },
  });

  if (!signatureValid) {
    await prisma.webhookLog.update({
      where: { id: log.id },
      data: { processingError: "Invalid signature" },
    });
    return NextResponse.json(
      { ok: false, error: "Invalid signature" },
      { status: 401 },
    );
  }

  // ── Step 4: Handle event ─────────────────────────────────
  try {
    const event = body.event ?? (body.status === "PAID" ? "PAYMENT_SUCCESS" : "UNKNOWN");

    switch (event) {
      case "DEPOSIT": {
        // Create a Demo Order from the deposit amount
        const result = await createDemoOrderFromDeposit(body, domain);
        await prisma.webhookLog.update({
          where: { id: log.id },
          data: {
            processed: true,
            processingError:
              result.status === "ALREADY_EXISTS"
                ? `Demo order already exists: ${result.orderId}`
                : null,
          },
        });
        return NextResponse.json({
          ok: true,
          event: "DEPOSIT",
          demoOrder: result,
        });
      }

      case "PAYMENT_SUCCESS": {
        // If we have an order_id, mark it as paid (existing flow)
        if (body.order_id && body.transaction_id) {
          const result = await markOrderPaid({
            orderId: body.order_id,
            transactionId: body.transaction_id,
            rawPayload: body,
          });
          await prisma.webhookLog.update({
            where: { id: log.id },
            data: {
              processed: true,
              processingError: result.applied
                ? null
                : "Already paid (idempotent)",
            },
          });
          return NextResponse.json({
            ok: true,
            event: "PAYMENT_SUCCESS",
            applied: result.applied,
          });
        }

        // If no order_id but has amount, treat as a deposit → demo order
        if (body.amount && body.transaction_id) {
          const result = await createDemoOrderFromDeposit(body, domain);
          await prisma.webhookLog.update({
            where: { id: log.id },
            data: { processed: true },
          });
          return NextResponse.json({
            ok: true,
            event: "PAYMENT_SUCCESS_AS_DEPOSIT",
            demoOrder: result,
          });
        }

        await prisma.webhookLog.update({
          where: { id: log.id },
          data: {
            processed: true,
            processingError: "PAYMENT_SUCCESS without order_id or amount",
          },
        });
        return NextResponse.json({ ok: true, event: "PAYMENT_SUCCESS", skipped: true });
      }

      default: {
        await prisma.webhookLog.update({
          where: { id: log.id },
          data: {
            processed: true,
            processingError: `Event ${event} logged but not processed`,
          },
        });
        return NextResponse.json({ ok: true, event, skipped: true });
      }
    }
  } catch (err) {
    console.error("[webhook/quickpay]", err);
    await prisma.webhookLog.update({
      where: { id: log.id },
      data: {
        processingError: err instanceof Error ? err.message : String(err),
      },
    });
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
