import { NextResponse } from "next/server";
import { createDemoOrderFromDeposit } from "@/lib/quickpay/demo-order";

/**
 * POST /api/webhook/quickpay/test
 *
 * Simulates a QuickPay DEPOSIT webhook for testing purposes.
 * Creates demo order directly (bypasses IP whitelist + signature check).
 * Only available when ANYPAY_MODE=mock.
 *
 * Body: { amount: number, channel?: string }
 */
export async function POST(req: Request) {
  if (process.env.ANYPAY_MODE !== "mock") {
    return NextResponse.json(
      { ok: false, error: "Test endpoint disabled — set ANYPAY_MODE=mock to enable" },
      { status: 403 },
    );
  }

  let body: {
    amount?: number;
    channel?: string;
    domain?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    ref1?: string;
    ref2?: string;
    mid?: string;
    fee?: number;
    custom1?: string;
    custom2?: string;
    custom3?: string;
    custom4?: string;
    custom5?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const amount = body.amount ?? 100;
  const channel = body.channel ?? "PROMPTPAY";
  const domain = body.domain ?? "basketplace.co";
  const transactionId = `TEST-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  try {
    const demoOrder = await createDemoOrderFromDeposit(
      {
        event: "DEPOSIT",
        transaction_id: transactionId,
        amount,
        currency: "THB",
        channel,
        customer_name: body.customerName ?? "ทดสอบ Demo",
        customer_email: body.customerEmail ?? "test@basketplace.co",
        customer_phone: body.customerPhone,
        ref1: body.ref1,
        ref2: body.ref2,
        mid: body.mid,
        fee: body.fee,
        custom1: body.custom1,
        custom2: body.custom2,
        custom3: body.custom3,
        custom4: body.custom4,
        custom5: body.custom5,
        timestamp: new Date().toISOString(),
        metadata: { test: true },
      },
      domain,
    );

    return NextResponse.json({
      ok: true,
      message: `Demo deposit of ${amount} THB created via ${channel}`,
      transactionId,
      demoOrder,
    });
  } catch (err) {
    console.error("[test-webhook] Error creating demo order:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Failed to create demo order" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/webhook/quickpay/test
 *
 * Returns test endpoint info and a sample payload.
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    description: "QuickPay webhook test endpoint for basketplace.co",
    mode: process.env.ANYPAY_MODE ?? "unknown",
    usage: "POST with { amount: 500, channel: 'PROMPTPAY' }",
    samplePayload: {
      amount: 500,
      channel: "PROMPTPAY",
    },
    endpoints: {
      quickpay: "/api/webhook/quickpay",
      anypay: "/api/webhook/anypay",
      demoOrders: "/api/admin/demo-orders",
      webhookLogs: "/api/admin/webhook-logs",
    },
  });
}
