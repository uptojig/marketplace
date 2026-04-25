"use client";

import Link from "next/link";
import { useCart } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";
import { formatTHB } from "@/lib/utils";

export default function CartPage() {
  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const subtotal = useCart((s) => s.subtotalTHB());

  if (!lines.length) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">ตะกร้าสินค้า</h1>
        <p className="text-muted-foreground">ตะกร้าว่าง</p>
        <Link href="/" className="text-sm underline">
          เลือกซื้อสินค้าต่อ
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">ตะกร้าสินค้า</h1>
      <div className="divide-y rounded-lg border">
        {lines.map((l) => (
          <div key={l.productId} className="flex items-center gap-4 p-4">
            <div className="h-16 w-16 overflow-hidden rounded bg-muted">
              {l.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={l.imageUrl} alt={l.title} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">{l.title}</div>
              <div className="text-xs text-muted-foreground">{l.storeName}</div>
              <div className="text-sm">{formatTHB(l.priceTHB)}</div>
            </div>
            <input
              type="number"
              min={1}
              value={l.qty}
              onChange={(e) => setQty(l.productId, parseInt(e.target.value, 10) || 1)}
              className="h-9 w-16 rounded border px-2 text-sm"
            />
            <Button size="sm" variant="ghost" onClick={() => remove(l.productId)}>
              ลบ
            </Button>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">ยอดรวม</span>
        <span className="text-lg font-semibold">{formatTHB(subtotal)}</span>
      </div>
      <div className="flex justify-end">
        <Button asChild size="lg" className="bg-red-600 hover:bg-red-700">
          <Link href="/checkout/address">ดำเนินการชำระเงิน</Link>
        </Button>
      </div>
    </div>
  );
}
