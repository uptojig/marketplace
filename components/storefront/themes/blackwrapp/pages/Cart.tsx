'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import type { CartProps } from '@/lib/templates/types';

/**
 * BlackWrapp — cart (scaffold). Reads `useCart` directly so the
 * client state stays the source of truth.
 */
export default function Cart({ store, freeShippingThreshold = 990, flatShippingTHB = 50 }: CartProps) {
  const items = useCart((s) =>
    s.lines.filter((line) => line.storeSlug === store.slug)
  );
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  const subtotal = items.reduce(
    (sum: number, line) => sum + line.priceTHB * line.qty,
    0
  );
  const shipping = subtotal >= freeShippingThreshold ? 0 : flatShippingTHB;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="bg-[var(--shop-bg)] text-[var(--shop-ink)] font-[family:var(--font-prompt)]">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h1 className="font-[family:var(--font-kanit)] text-3xl font-black mb-4">
            ตะกร้าว่างเปล่า
          </h1>
          <p className="text-[var(--shop-ink-muted)] mb-6">
            ยังไม่มีสินค้าในตะกร้าของคุณ
          </p>
          <Link
            href={`/stores/${store.slug}/category`}
            className="inline-block px-6 py-3 rounded-full text-white font-bold"
            style={{ background: 'var(--shop-primary)' }}
          >
            เริ่มช้อปเลย
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--shop-bg)] text-[var(--shop-ink)] font-[family:var(--font-prompt)]">
      <div className="max-w-5xl mx-auto px-4 py-8 grid gap-8 md:grid-cols-[1fr_320px]">
        <div>
          <h1 className="font-[family:var(--font-kanit)] text-3xl font-black mb-6">
            ตะกร้าของคุณ
          </h1>
          <ul className="space-y-3">
            {items.map((it) => (
              <li
                key={it.productId}
                className="bg-white border border-[var(--shop-border)] rounded p-3 flex gap-3"
              >
                <div className="h-20 w-20 bg-[var(--shop-bg-soft)] rounded overflow-hidden shrink-0">
                  {it.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={it.imageUrl}
                      alt={it.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : null}
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <span className="text-sm font-medium">{it.title}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="ลดจำนวน"
                      onClick={() =>
                        setQty(it.productId, Math.max(1, it.qty - 1), store.slug)
                      }
                      className="h-7 w-7 grid place-items-center border border-[var(--shop-border)] rounded"
                    >
                      −
                    </button>
                    <span className="min-w-6 text-center text-sm">{it.qty}</span>
                    <button
                      type="button"
                      aria-label="เพิ่มจำนวน"
                      onClick={() => setQty(it.productId, it.qty + 1, store.slug)}
                      className="h-7 w-7 grid place-items-center border border-[var(--shop-border)] rounded"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(it.productId, store.slug)}
                      className="ml-auto text-xs underline text-[var(--shop-ink-muted)]"
                    >
                      ลบ
                    </button>
                  </div>
                </div>
                <div
                  className="font-bold self-center"
                  style={{ color: 'var(--shop-primary)' }}
                >
                  {formatTHB(it.priceTHB * it.qty)}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <aside className="bg-[var(--shop-bg-soft)] border border-[var(--shop-border)] rounded p-4 h-fit md:sticky md:top-4">
          <h2 className="font-[family:var(--font-kanit)] font-bold text-lg mb-3">
            สรุปการสั่งซื้อ
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt>ยอดรวม</dt>
              <dd>{formatTHB(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>ค่าจัดส่ง</dt>
              <dd>{shipping === 0 ? 'ฟรี' : formatTHB(shipping)}</dd>
            </div>
            <div
              className="flex justify-between font-bold text-base pt-2 border-t border-[var(--shop-border)]"
              style={{ color: 'var(--shop-primary)' }}
            >
              <dt>รวมทั้งสิ้น</dt>
              <dd>{formatTHB(total)}</dd>
            </div>
          </dl>
          <Link
            href={`/stores/${store.slug}/checkout`}
            className="mt-4 block text-center px-4 py-3 rounded-full text-white font-bold"
            style={{ background: 'var(--shop-primary)' }}
          >
            ดำเนินการสั่งซื้อ
          </Link>
        </aside>
      </div>
    </div>
  );
}
