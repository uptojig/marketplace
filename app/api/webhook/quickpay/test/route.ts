import { NextResponse } from "next/server";

/**
 * POST /api/webhook/quickpay/test
 *
 * Simulates a QuickPay DEPOSIT webhook for testing purposes.
 * Only available in non-production environments.
 *
 * Body: { amount: number, channel?: string }
 */
export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production" && process.env.ANYPAY_MODE !== "mock") {
    return NextResponse.json(
      { ok: false, error: "Test endpoint disabled in production" },
      { status: 403 },
    );
  }

  let body: { amount?: number; channel?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const amount = body.amount ?? 100;
  const channel = body.channel ?? "PROMPTPAY";
  const transactionId = `TEST-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  // Simulate the webhook by calling our own quickpay webhook endpoint
  const webhookPayload = {
    event: "DEPOSIT",
    transaction_id: transactionId,
    amount,
    currency: "THB",
    channel,
    customer_name: "ทดสอบ Demo",
    customer_email: "test@basketplace.co",
    timestamp: new Date().toISOString(),
    metadata: { test: true, simulatedAt: new Date().toISOString() },
  };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/webhook/quickpay`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-webhook-domain": "basketplace.co",
      "x-webhook-dedicated-ip": "127.0.0.1",
      "x-real-ip": "127.0.0.1",
    },
    body: JSON.stringify(webhookPayload),
  });

  const result = await res.json().catch(() => null);

  return NextResponse.json({
    ok: res.ok,
    message: res.ok
      ? `Demo deposit of ${amount} THB created via ${channel}`
      : "Failed to create demo deposit",
    transactionId,
    webhookResponse: result,
  });
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
    usage: "POST with { amount: 500, channel: 'PROMPTPAY' }",
    samplePayload: {
      event: "DEPOSIT",
      transaction_id: "TEST-xxx",
      amount: 500,
      currency: "THB",
      channel: "PROMPTPAY",
      customer_name: "ทดสอบ Demo",
      timestamp: new Date().toISOString(),
    },
    endpoints: {
      quickpay: "/api/webhook/quickpay",
      anypay: "/api/webhook/anypay",
      demoOrders: "/api/admin/demo-orders",
      webhookLogs: "/api/admin/webhook-logs",
    },
  });
}
