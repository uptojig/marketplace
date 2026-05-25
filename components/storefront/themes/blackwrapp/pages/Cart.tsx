'use client';
import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  Trash2,
  Truck,
  Shield,
  Package,
} from 'lucide-react';
import { formatTHB } from '@/lib/utils';
import { useCart } from '@/lib/store/cart';
import type { CartProps } from '@/lib/templates/types';

/**
 * BlackWrapp — premium dark Cart.
 *
 * Dark layout with an accent-color subtotal, a thin free-shipping
 * progress bar, and a single accent CTA pushing to checkout.
 * Reads + writes through the per-store cart store so the line items
 * here always match what the header badge counts.
 */
export default function BlackwrappCart(props: CartProps) {
  const { store, freeShippingThreshold = 990, flatShippingTHB = 50 } = props;

  // Read items from the per-store cart so the cart truly mirrors the
  // header badge. Callers still pass `props.items` for server-rendered
  // first paint; the live store wins on the client.
  const items = useCart((s) => s.linesForStore(store.slug));
  const subtotal = useCart((s) => s.subtotalForStore(store.slug));
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  const shipping = subtotal >= freeShippingThreshold ? 0 : flatShippingTHB;
  const total = subtotal + shipping;
  const progress = Math.min(
    100,
    Math.round((subtotal / freeShippingThreshold) * 100),
  );
  const toFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  if (items.length === 0) {
    return (
      <main
        className="font-[family:var(--font-prompt)] min-h-screen"
        style={{ background: '#0A0A0A', color: '#FAFAFA' }}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-24 text-center space-y-6">
          <Package
            size={36}
            strokeWidth={1.25}
            className="mx-auto text-white/20"
          />
          <h1 className="font-[family:var(--font-kanit)] font-medium text-3xl text-white">
            ตะกร้าว่างเปล่า
          </h1>
          <p className="text-sm text-white/55">
            ยังไม่มีสินค้าในตะกร้าของคุณ
          </p>
          <Link
            href={`/stores/${store.slug}/category`}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-[family:var(--font-kanit)] text-sm tracking-[0.18em] uppercase transition-all duration-300"
            style={{
              background:
                'var(--shop-primary-gradient, var(--shop-primary, #00FF88))',
              color: '#0A0A0A',
              boxShadow: '0 0 24px var(--shop-primary, #00FF88)45',
            }}
          >
            เลือกซื้อสินค้า
            <ArrowRight size={14} strokeWidth={2} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      className="font-[family:var(--font-prompt)] min-h-screen"
      style={{ background: '#0A0A0A', color: '#FAFAFA' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Header */}
        <header className="mb-8 space-y-2">
          <span className="text-[10px] tracking-[0.35em] uppercase text-white/50">
            CART · {store.name}
          </span>
          <h1 className="font-[family:var(--font-kanit)] font-medium text-3xl sm:text-4xl tracking-[0.02em] text-white">
            ตะกร้าสินค้า
          </h1>
          <p className="text-xs text-white/55 tabular-nums">
            {items.reduce((n, l) => n + l.qty, 0).toLocaleString()} รายการ
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
          {/* Items */}
          <section className="space-y-4">
            {/* Free-shipping progress */}
            <div
              className="rounded-xl border border-white/10 p-4"
              style={{ background: '#141414' }}
              role="status"
              aria-live="polite"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/70 flex items-center gap-2">
                  <Truck
                    size={13}
                    strokeWidth={1.75}
                    style={{ color: 'var(--shop-primary, #00FF88)' }}
                  />
                  {toFreeShipping > 0
                    ? `อีก ${formatTHB(toFreeShipping)} เพื่อรับส่งฟรี`
                    : 'คุณได้รับส่งฟรีแล้ว'}
                </span>
              </div>
              <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    background:
                      'var(--shop-primary-gradient, var(--shop-primary, #00FF88))',
                  }}
                />
              </div>
            </div>

            <ul className="space-y-3">
              {items.map((line) => (
                <li
                  key={line.productId}
                  className="rounded-xl border border-white/10 p-4 flex gap-4"
                  style={{ background: '#141414' }}
                >
                  <Link
                    href={`/stores/${store.slug}/products/${line.productId}`}
                    className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-lg bg-[#0A0A0A] border border-white/5"
                  >
                    {line.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={line.imageUrl}
                        alt={line.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package
                          size={20}
                          strokeWidth={1.25}
                          className="text-white/15"
                        />
                      </div>
                    )}
                  </Link>

                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <Link
                      href={`/stores/${store.slug}/products/${line.productId}`}
                      className="text-sm font-medium text-white hover:text-[var(--shop-primary,#00FF88)] transition-colors line-clamp-2"
                    >
                      {line.title}
                    </Link>
                    <span
                      className="text-sm font-medium tabular-nums"
                      style={{ color: 'var(--shop-primary, #00FF88)' }}
                    >
                      {formatTHB(line.priceTHB)}
                    </span>

                    <div className="flex items-center justify-between mt-auto pt-1 gap-3">
                      <div
                        role="group"
                        aria-label={`ปรับจำนวน ${line.title}`}
                        className="inline-flex items-center rounded-full border border-white/10"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setQty(
                              line.productId,
                              Math.max(1, line.qty - 1),
                              store.slug,
                            )
                          }
                          className="inline-flex h-8 w-8 items-center justify-center text-white/80 hover:text-white"
                          aria-label="ลดจำนวน"
                        >
                          <Minus size={12} strokeWidth={2} />
                        </button>
                        <span className="min-w-[24px] text-center text-xs tabular-nums text-white">
                          {line.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setQty(line.productId, line.qty + 1, store.slug)
                          }
                          className="inline-flex h-8 w-8 items-center justify-center text-white/80 hover:text-white"
                          aria-label="เพิ่มจำนวน"
                        >
                          <Plus size={12} strokeWidth={2} />
                        </button>
                      </div>

                      <span className="text-sm font-medium text-white tabular-nums">
                        {formatTHB(line.priceTHB * line.qty)}
                      </span>

                      <button
                        type="button"
                        onClick={() => remove(line.productId, store.slug)}
                        className="text-white/40 hover:text-white transition-colors p-1.5"
                        aria-label={`ลบ ${line.title} ออกจากตะกร้า`}
                      >
                        <Trash2 size={14} strokeWidth={1.75} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="pt-4">
              <Link
                href={`/stores/${store.slug}/category`}
                className="inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-white/55 hover:text-white transition-colors"
              >
                <ArrowLeft size={13} strokeWidth={1.75} />
                เลือกซื้อเพิ่ม
              </Link>
            </div>
          </section>

          {/* Summary */}
          <aside
            aria-label="สรุปคำสั่งซื้อ"
            className="rounded-xl border border-white/10 p-6 h-fit lg:sticky lg:top-24 space-y-5"
            style={{ background: '#141414' }}
          >
            <h2 className="font-[family:var(--font-kanit)] font-medium text-base text-white tracking-[0.05em]">
              สรุปคำสั่งซื้อ
            </h2>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-white/70">
                <span>ราคารวมสินค้า</span>
                <span className="tabular-nums text-white">
                  {formatTHB(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between text-white/70">
                <span>ค่าจัดส่ง</span>
                <span
                  className="tabular-nums"
                  style={{
                    color:
                      shipping === 0
                        ? 'var(--shop-primary, #00FF88)'
                        : 'rgba(255,255,255,0.85)',
                  }}
                >
                  {shipping === 0 ? 'ฟรี' : formatTHB(shipping)}
                </span>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 flex items-baseline justify-between gap-3">
              <span className="text-[11px] tracking-[0.25em] uppercase text-white/55">
                ยอดรวม
              </span>
              <span
                className="font-[family:var(--font-kanit)] font-medium text-2xl tabular-nums"
                style={{ color: 'var(--shop-primary, #00FF88)' }}
              >
                {formatTHB(total)}
              </span>
            </div>

            <Link
              href={`/stores/${store.slug}/checkout`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 font-[family:var(--font-kanit)] text-sm tracking-[0.18em] uppercase transition-all duration-300"
              style={{
                background:
                  'var(--shop-primary-gradient, var(--shop-primary, #00FF88))',
                color: '#0A0A0A',
                boxShadow: '0 0 28px var(--shop-primary, #00FF88)45',
              }}
            >
              ดำเนินการชำระเงิน
              <ArrowRight size={14} strokeWidth={2} />
            </Link>

            <ul className="pt-4 space-y-2.5 border-t border-white/5 text-[11px] text-white/60">
              <li className="flex items-center gap-2">
                <Truck
                  size={12}
                  strokeWidth={1.75}
                  style={{ color: 'var(--shop-primary, #00FF88)' }}
                />
                ส่งฟรีเมื่อยอด {formatTHB(freeShippingThreshold)} ขึ้นไป
              </li>
              <li className="flex items-center gap-2">
                <Shield
                  size={12}
                  strokeWidth={1.75}
                  style={{ color: 'var(--shop-primary, #00FF88)' }}
                />
                รับประกันคุณภาพ เปลี่ยนคืนได้ 14 วัน
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </main>
  );
}
