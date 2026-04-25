import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { order_id?: string; amount?: number };
  const { order_id, amount } = body;

  if (!order_id || typeof amount !== "number") {
    return NextResponse.json({ error: "order_id and amount required" }, { status: 400 });
  }

  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const transactionId = `ANYPAY-MOCK-${Date.now()}`;
  const paymentUrl = `${base}/mock-payment-gate?order_id=${encodeURIComponent(order_id)}&amount=${amount}&tx=${transactionId}`;

  return NextResponse.json({
    status: "success",
    payment_url: paymentUrl,
    transaction_id: transactionId,
  });
}
