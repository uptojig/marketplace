"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Trash2 } from "lucide-react";
import { useWishlist } from "@/components/storefront/Wishlist";
import { formatTHB } from "@/lib/utils";

export function WishlistClient({ storeSlug }: { storeSlug: string }) {
  const { items, remove, clear } = useWishlist(storeSlug);

  if (items.length === 0) {
    return (
      <div
        className="text-center py-24 rounded-xl border border-dashed"
        style={{ borderColor: "var(--shop-border)" }}
      >
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
          style={{
            background: "color-mix(in srgb, var(--shop-primary) 12%, transparent)",
            color: "var(--shop-primary)",
          }}
        >
          <Heart className="w-8 h-8" />
        </div>
        <p className="text-base font-medium" style={{ color: "var(--shop-ink)" }}>
          ยังไม่มีรายการโปรด
        </p>
        <p className="text-sm mt-2" style={{ color: "var(--shop-ink-muted)" }}>
          กดรูป❤️บนสินค้าที่ชอบ เพื่อเพิ่มในรายการนี้
        </p>
        <Link
          href={`/stores/${storeSlug}/category`}
          className="inline-flex items-center mt-6 px-5 py-2.5 rounded-md text-sm font-medium text-white"
          style={{ background: "var(--shop-primary)" }}
        >
          เลือกซื้อสินค้า
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm" style={{ color: "var(--shop-ink-muted)" }}>
          {items.length.toLocaleString()} รายการ
        </span>
        <button
          type="button"
          onClick={() => {
            if (confirm("ล้างรายการโปรดทั้งหมด?")) clear();
          }}
          className="text-xs hover:underline inline-flex items-center gap-1"
          style={{ color: "var(--shop-ink-muted)" }}
        >
          <Trash2 className="h-3 w-3" />
          ล้างทั้งหมด
        </button>
      </div>

      <ul className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
        {items.map((p) => (
          <li key={p.id} className="group relative">
            <div
              className="aspect-square w-full overflow-hidden rounded-md lg:aspect-auto lg:h-80"
              style={{
                background:
                  "color-mix(in srgb, var(--shop-card) 88%, transparent)",
              }}
            >
              {p.imageUrl ? (
                <Image
                  src={p.imageUrl}
                  alt={p.title}
                  width={320}
                  height={320}
                  unoptimized
                  className="h-full w-full object-cover group-hover:opacity-75 transition-opacity"
                />
              ) : (
                <div
                  className="h-full w-full flex items-center justify-center text-xs"
                  style={{ color: "var(--shop-ink-muted)" }}
                >
                  ไม่มีรูปภาพ
                </div>
              )}
            </div>

            {/* Remove button — top-right of the image */}
            <button
              type="button"
              aria-label="เอาออก"
              onClick={() => remove(p.id)}
              className="absolute top-2 right-2 inline-flex items-center justify-center w-8 h-8 rounded-full"
              style={{
                background: "rgba(255,255,255,0.92)",
                color: "var(--shop-ink-muted)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>

            <div className="mt-4 flex justify-between gap-2">
              <h3
                className="text-sm line-clamp-2 flex-1 min-w-0"
                style={{ color: "var(--shop-ink-muted)" }}
              >
                <Link
                  href={`/stores/${storeSlug}/products/${p.id}`}
                  className="hover:underline"
                  style={{ color: "var(--shop-ink)" }}
                >
                  <span aria-hidden="true" className="absolute inset-0" />
                  {p.title}
                </Link>
              </h3>
              <p
                className="text-sm font-medium whitespace-nowrap shrink-0"
                style={{ color: "var(--shop-ink)" }}
              >
                {formatTHB(p.priceTHB)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
