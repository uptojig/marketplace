import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    order_id?: string;
    amount?: number;
    return_url?: string;
  };
  const { order_id, amount, return_url } = body;

  if (!order_id || typeof amount !== "number") {
    return NextResponse.json({ error: "order_id and amount required" }, { status: 400 });
  }

  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const transactionId = `ANYPAY-MOCK-${Date.now()}`;
  // Instead of redirecting to the mock gateway dev UI (which breaks tenant routing),
  // we immediately return the return_url (the success page) as the payment destination.
  // This completely bypasses the PAID webhook simulation, leaving the order naturally
  // in 'PENDING_PAYMENT' state so the success page correctly displays 'รอชำระเงิน'.
  const paymentUrl = return_url || `${base}/order-success?orderId=${order_id}`;

  return NextResponse.json({
    status: "success",
    payment_url: paymentUrl,
    transaction_id: transactionId,
  });
}
