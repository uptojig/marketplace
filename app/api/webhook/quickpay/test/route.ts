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

  let body: { amount?: number; channel?: string; domain?: string };
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
        customer_name: "ทดสอบ Demo",
        customer_email: "test@basketplace.co",
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
