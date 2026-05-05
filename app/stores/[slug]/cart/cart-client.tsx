"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ShoppingBag, Trash2, ChevronLeft } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { formatTHB } from "@/lib/utils";

interface StoreLite {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  primaryColor: string | null;
}

export function StoreCartClient({ store }: { store: StoreLite }) {
  const allLines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const lines = allLines.filter((l) => l.storeSlug === store.slug);
  const subtotal = lines.reduce((n, l) => n + l.priceTHB * l.qty, 0);
  const otherStoreLines = allLines.filter((l) => l.storeSlug !== store.slug);
  const otherStoreCount = otherStoreLines.length;

  // Note: primary color is read from --shop-primary CSS var set by
  // the storefront layout (which already applies the design family
  // cascade). The store.primaryColor prop is only used as a fallback
  // for the avatar background when no logo image is set.
  const primary = store.primaryColor ?? "#2563eb";

  if (!mounted) {
    return <div className="container mx-auto max-w-4xl px-4 py-8" />;
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <Link
        href={`/stores/${store.slug}`}
        className="inline-flex items-center gap-1 text-sm hover:opacity-80"
        style={{ color: 'var(--shop-ink-muted)' }}
      >
        <ChevronLeft className="h-4 w-4" />
        เลือกซื้อสินค้าต่อ
      </Link>

      <div className="mt-3 flex items-center gap-3">
        {store.logoUrl ? (
          <Image
            src={store.logoUrl}
            alt={store.name}
            width={40}
            height={40}
            className="h-10 w-10 rounded object-cover"
            unoptimized
          />
        ) : (
          <div
            className="flex h-10 w-10 items-center justify-center rounded text-sm font-bold text-white"
            style={{ backgroundColor: primary }}
          >
            {store.name[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--shop-ink)' }}>ตะกร้าของ {store.name}</h1>
          <p className="text-xs" style={{ color: 'var(--shop-ink-muted)' }}>
            {lines.length === 0
              ? "ยังไม่มีสินค้าในตะกร้า"
              : `${lines.reduce((n, l) => n + l.qty, 0)} ชิ้น`}
          </p>
        </div>
      </div>

      {otherStoreCount > 0 && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          คุณมีสินค้าจากร้านอื่นอยู่ในตะกร้า ({otherStoreCount} รายการ) — แต่ละร้านต้องสั่งซื้อแยกกัน
          <ul className="mt-2 space-y-1 text-xs">
            {Array.from(
              new Map(otherStoreLines.map((l) => [l.storeSlug, l])).values(),
            ).map((l) => (
              <li key={l.storeSlug}>
                →{" "}
                <Link
                  href={`/stores/${l.storeSlug}/cart`}
                  className="font-medium underline hover:text-amber-700"
                >
                  ดูตะกร้าของ {l.storeName}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {lines.length === 0 ? (
        <div className="mt-6 rounded-xl border p-12 text-center" style={{ background: 'var(--shop-card)', borderColor: 'var(--shop-border)' }}>
          <ShoppingBag className="mx-auto h-10 w-10" style={{ color: 'var(--shop-border)' }} />
          <p className="mt-3 text-sm" style={{ color: 'var(--shop-ink-muted)' }}>ตะกร้าของร้านนี้ยังว่าง</p>
          <Link
            href={`/stores/${store.slug}`}
            className="mt-4 inline-flex rounded-md px-4 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: "var(--shop-primary)" }}
          >
            เลือกซื้อสินค้า
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-5 divide-y rounded-xl border" style={{ background: 'var(--shop-card)', borderColor: 'var(--shop-border)' }}>
            {lines.map((l) => (
              <div key={l.productId} className="flex items-center gap-4 p-4">
                <Link
                  href={`/stores/${store.slug}/products/${l.productId}`}
                  className="block h-20 w-20 shrink-0 overflow-hidden rounded"
                  style={{ backgroundColor: 'var(--shop-bg)' }}
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
                    href={`/stores/${store.slug}/products/${l.productId}`}
                    className="line-clamp-2 text-sm font-medium hover:underline"
                    style={{ color: 'var(--shop-ink)' }}
                  >
                    {l.title}
                  </Link>
                  <div className="mt-1 text-base font-bold" style={{ color: "var(--shop-primary)" }}>
                    {formatTHB(l.priceTHB)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-md border">
                    <button
                      type="button"
                      onClick={() => setQty(l.productId, l.qty - 1)}
                      className="px-3 py-1.5 text-sm opacity-80 hover:opacity-100"
                      aria-label="ลดจำนวน"
                      style={{ color: 'var(--shop-ink)' }}
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
                      className="w-12 py-1.5 text-center text-sm focus:outline-none"
                      style={{ backgroundColor: 'transparent', color: 'var(--shop-ink)', borderLeft: '1px solid var(--shop-border)', borderRight: '1px solid var(--shop-border)' }}
                    />
                    <button
                      type="button"
                      onClick={() => setQty(l.productId, l.qty + 1)}
                      className="px-3 py-1.5 text-sm opacity-80 hover:opacity-100"
                      aria-label="เพิ่มจำนวน"
                      style={{ color: 'var(--shop-ink)' }}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(l.productId)}
                    className="rounded p-1.5 opacity-60 hover:opacity-100 hover:text-red-500"
                    aria-label="ลบ"
                    style={{ color: 'var(--shop-ink)' }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl border p-5" style={{ background: 'var(--shop-card)', borderColor: 'var(--shop-border)' }}>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--shop-ink-muted)' }}>ยอดรวม</span>
              <span className="text-2xl font-bold" style={{ color: 'var(--shop-ink)' }}>{formatTHB(subtotal)}</span>
            </div>
            <Link
              href={`/stores/${store.slug}/checkout/address`}
              className="mt-4 flex w-full items-center justify-center rounded-lg py-3 text-base font-semibold text-white transition hover:opacity-90"
              style={{ backgroundColor: "var(--shop-primary)" }}
            >
              ดำเนินการชำระเงิน
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
