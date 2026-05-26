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
  // Pass return_url through so the mock gate lands the buyer on the
  // correct post-payment page (e.g. /account/credit for topups vs
  // /checkout/success for orders).
  const params = new URLSearchParams({
    order_id,
    amount: String(amount),
    tx: transactionId,
  });
  if (return_url) params.set("return_url", return_url);
  const paymentUrl = `${base}/mock-payment-gate?${params.toString()}`;

  return NextResponse.json({
    status: "success",
    payment_url: paymentUrl,
    transaction_id: transactionId,
  });
}
