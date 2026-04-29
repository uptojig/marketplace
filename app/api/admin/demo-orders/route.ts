import { NextResponse } from "next/server";
import { listDemoOrders } from "@/lib/quickpay/demo-order";

/**
 * GET /api/admin/demo-orders
 *
 * List demo orders created from QuickPay deposit webhooks.
 * Used by admin dashboard for AnyPay team verification.
 *
 * Query params:
 *   - limit: number (default 50)
 *   - domain: string (filter by source domain)
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") ?? "50", 10);
  const domain = url.searchParams.get("domain") ?? undefined;

  try {
    const orders = await listDemoOrders({ limit, domain });

    const formatted = orders.map((o) => {
      const addr = o.shippingAddressJson as Record<string, unknown>;
      const meta = (addr?._metadata ?? {}) as Record<string, unknown>;

      return {
        orderId: o.id,
        status: o.status,
        amountTHB: Number(o.totalTHB),
        transactionId: o.payment?.anypayTransactionId ?? null,
        paymentStatus: o.payment?.status ?? null,
        paidAt: o.payment?.paidAt ?? null,
        domain: meta?.domain ?? "unknown",
        channel: meta?.channel ?? "unknown",
        isDemoOrder: meta?.isDemoOrder ?? false,
        createdAt: o.createdAt,
      };
    });

    return NextResponse.json({
      ok: true,
      count: formatted.length,
      orders: formatted,
    });
  } catch (err) {
    console.error("[admin/demo-orders]", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Failed to fetch" },
      { status: 500 },
    );
  }
}
