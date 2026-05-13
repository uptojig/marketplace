// GET /api/anypay/intents/[id]
//
// Polled by the checkout/processing page every ~2s until the intent
// reaches a terminal status. Source of truth is Anypay, but we fall
// back to our PaymentIntent mirror if Anypay is unreachable.

import { NextResponse } from "next/server";
import { getIntent } from "@/lib/anypay/intent-server";
import { getPaymentIntent } from "@/lib/orders/queries";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const { id } = params;

  try {
    const intent = await getIntent(id);
    return NextResponse.json(intent);
  } catch {
    const dbRow = await getPaymentIntent(id);
    if (!dbRow) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({
      intentId: dbRow.id,
      status: dbRow.status.toLowerCase(),
      amount: Number(dbRow.amountTHB),
      paymentMethod: dbRow.paymentMethod.toLowerCase(),
      qrCode: dbRow.qrCode,
      redirectUrl: dbRow.redirectUrl,
      expiresAt: dbRow.expiresAt?.toISOString(),
      paidAt: dbRow.paidAt?.toISOString(),
      failureReason: dbRow.failureReason,
      _fallback: true,
    });
  }
}
