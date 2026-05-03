"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingBag, Trash2, ChevronRight } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";
import { formatTHB } from "@/lib/utils";

/**
 * Marketplace-level cart page.
 *
 * Items in the cart are scoped per store (each line has `storeSlug`).
 * This page groups items by store and links to the *store-scoped*
 * checkout (`/stores/{slug}/checkout/address`), which runs inside the
 * store layout with the correct design-family theme applied.
 *
 * Previously this page linked to `/checkout/address` (marketplace scope),
 * which broke the store theme cascade and showed the wrong header/footer.
 */
export default function CartPage() {
  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="container mx-auto max-w-4xl px-4 py-8" />;
  }

  if (!lines.length) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-gray-300" />
        <h1 className="mt-4 text-2xl font-semibold">ตะกร้าว่าง</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          ยังไม่มีสินค้าในตะกร้า
        </p>
        <Link href="/" className="mt-4 inline-block text-sm font-medium underline">
          เลือกซื้อสินค้าต่อ
        </Link>
      </div>
    );
  }

  // Group items by store
  const storeGroups = new Map<
    string,
    { storeName: string; storeSlug: string; items: typeof lines }
  >();
  for (const line of lines) {
    const slug = line.storeSlug ?? "unknown";
    if (!storeGroups.has(slug)) {
      storeGroups.set(slug, {
        storeName: line.storeName ?? slug,
        storeSlug: slug,
        items: [],
      });
    }
    storeGroups.get(slug)!.items.push(line);
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 space-y-8">
      <h1 className="text-2xl font-semibold">ตะกร้าสินค้า</h1>

      {storeGroups.size > 1 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          คุณมีสินค้าจาก {storeGroups.size} ร้าน —
          แต่ละร้านต้องสั่งซื้อแยกกัน
        </div>
      )}

      {Array.from(storeGroups.values()).map((group) => {
        const subtotal = group.items.reduce(
          (n, l) => n + l.priceTHB * l.qty,
          0,
        );
        return (
          <section key={group.storeSlug} className="rounded-xl border bg-white">
            {/* Store header */}
            <div className="flex items-center justify-between border-b px-5 py-3">
              <Link
                href={`/stores/${group.storeSlug}`}
                className="flex items-center gap-2 font-semibold hover:underline"
              >
                <ShoppingBag className="h-4 w-4 text-gray-500" />
                {group.storeName}
              </Link>
              <Link
                href={`/stores/${group.storeSlug}/cart`}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
              >
                ไปหน้าตะกร้าร้าน <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Items */}
            <div className="divide-y">
              {group.items.map((l) => (
                <div key={l.productId} className="flex items-center gap-4 p-4">
                  <Link
                    href={`/stores/${group.storeSlug}/products/${l.productId}`}
                    className="block h-20 w-20 shrink-0 overflow-hidden rounded bg-muted"
                  >
                    {l.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={l.imageUrl}
                        alt={l.title}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </Link>
                  <div className="flex-1">
                    <Link
                      href={`/stores/${group.storeSlug}/products/${l.productId}`}
                      className="line-clamp-2 text-sm font-medium hover:underline"
                    >
                      {l.title}
                    </Link>
                    <div className="mt-1 text-base font-bold">
                      {formatTHB(l.priceTHB)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-md border">
                      <button
                        type="button"
                        onClick={() => setQty(l.productId, l.qty - 1)}
                        className="px-3 py-1.5 text-sm hover:bg-gray-50"
                        aria-label="ลดจำนวน"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={l.qty}
                        onChange={(e) =>
                          setQty(l.productId, parseInt(e.target.value, 10) || 1)
                        }
                        className="w-12 border-x py-1.5 text-center text-sm focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setQty(l.productId, l.qty + 1)}
                        className="px-3 py-1.5 text-sm hover:bg-gray-50"
                        aria-label="เพิ่มจำนวน"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(l.productId)}
                      className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      aria-label="ลบ"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Store subtotal + checkout */}
            <div className="border-t px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  ยอดรวม ({group.items.reduce((n, l) => n + l.qty, 0)} ชิ้น)
                </span>
                <span className="text-xl font-bold">{formatTHB(subtotal)}</span>
              </div>
              <Button
                asChild
                size="lg"
                className="mt-3 w-full bg-gray-900 text-white hover:bg-gray-800"
              >
                <Link href={`/stores/${group.storeSlug}/checkout/address`}>
                  สั่งซื้อจาก {group.storeName}
                </Link>
              </Button>
            </div>
          </section>
        );
      })}
    </div>
  );
}
