"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { formatTHB } from "@/lib/utils";

export function CheckoutCart({
  editable = false,
  storeSlug,
}: {
  editable?: boolean;
  /** When set, the "แก้ไขรายการสินค้า" link goes back to the
   *  per-store cart at /stores/<slug>/cart instead of the
   *  marketplace-level /cart. Caller should pass this whenever
   *  the checkout flow is hosted under /stores/[slug]/. */
  storeSlug?: string;
}) {
  // Per-store scope (gate 6 — Shopify-like architecture). If a caller
  // omits storeSlug we fall back to all lines (admin/debug surfaces);
  // every buyer-facing call site MUST pass storeSlug to avoid leaking
  // another store's items into this checkout panel.
  const allLines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const lines = storeSlug
    ? allLines.filter((l) => l.storeSlug === storeSlug)
    : allLines;
  const cartHref = storeSlug ? `/stores/${storeSlug}/cart` : null;

  return (
    <aside className="space-y-3 rounded-2xl border bg-white p-4">
      {cartHref && (
        <Link
          href={cartHref}
          className="-mx-1 flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm font-medium hover:bg-muted/70"
          style={{ color: "var(--shop-primary, #2563eb)" }}
        >
          <span className="text-lg">‹</span> แก้ไขรายการสินค้า
        </Link>
      )}
      <div className="flex items-center justify-between border-b pb-2">
        <h2 className="font-semibold">ตะกร้าสินค้า</h2>
        <span className="text-xl">🛒</span>
      </div>
      {lines.length === 0 && (
        <p className="text-sm text-muted-foreground">ตะกร้าว่าง</p>
      )}
      {lines.map((l) => (
        <div key={l.productId} className="flex gap-3 rounded-xl border p-3">
          {l.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={l.imageUrl} alt={l.title} className="h-16 w-16 shrink-0 rounded object-cover" />
          )}
          <div className="flex-1 space-y-1">
            <div className="flex items-start gap-1.5 flex-wrap">
              <div className="line-clamp-2 text-sm font-medium">{l.title}</div>
              {l.productType === "DIGITAL" && (
                <span
                  className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider shrink-0"
                  style={{ background: "var(--shop-primary, #0a0a0a)", color: "#fff" }}
                  title="สินค้าดิจิทัล — ไม่มีการจัดส่ง"
                >
                  💾 Digital
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">{l.storeName}</div>
            <div className="flex items-center justify-between pt-1">
              {editable ? (
                <div className="inline-flex h-7 items-center rounded-md border text-sm">
                  <button
                    type="button"
                    onClick={() =>
                      setQty(l.productId, l.qty - 1, l.storeSlug)
                    }
                    className="px-2"
                  >
                    −
                  </button>
                  <span className="w-8 border-x px-2 text-center">{l.qty}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setQty(l.productId, l.qty + 1, l.storeSlug)
                    }
                    className="px-2"
                  >
                    +
                  </button>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">x{l.qty}</span>
              )}
              <span className="text-sm font-semibold">{formatTHB(l.priceTHB * l.qty)}</span>
            </div>
          </div>
          {editable && (
            <button
              type="button"
              onClick={() => remove(l.productId, l.storeSlug)}
              className="text-muted-foreground hover:text-destructive"
              aria-label="Remove"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
    </aside>
  );
}
