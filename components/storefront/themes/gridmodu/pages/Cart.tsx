'use client';

import React from 'react';
import Link from 'next/link';
import { Trash2, Plus, Minus, Wrench, ShoppingCart, ChevronRight } from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import type { CartProps } from '@/lib/templates/types';

/**
 * GridModu — Cart. Dense layout, line items with spec mini-rows,
 * sticky order summary on the right.
 */
export default function Cart({
  store,
  freeShippingThreshold = 990,
  flatShippingTHB = 50,
}: CartProps) {
  const items = useCart((s) =>
    s.lines.filter((line) => line.storeSlug === store.slug),
  );
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  const subtotal = items.reduce(
    (sum: number, line) => sum + line.priceTHB * line.qty,
    0,
  );
  const shipping = subtotal === 0 || subtotal >= freeShippingThreshold ? 0 : flatShippingTHB;
  const total = subtotal + shipping;
  const itemCount = items.reduce((n, l) => n + l.qty, 0);
  const remaining = Math.max(0, freeShippingThreshold - subtotal);
  const progressPct =
    freeShippingThreshold > 0
      ? Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))
      : 100;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#0E0E10] text-[#E5E7EB] font-[family:var(--font-prompt)]">
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-sm border border-[#1F1F23] bg-[#15151A] mb-6">
            <ShoppingCart className="h-8 w-8 text-[#3F3F46]" aria-hidden />
          </div>
          <h1 className="font-[family:var(--font-kanit)] font-semibold uppercase tracking-wider text-3xl text-white mb-3">
            ตะกร้าว่างเปล่า
          </h1>
          <p className="text-[#9CA3AF] mb-6">
            ยังไม่มีสินค้าในตะกร้า · เลือกอะไหล่ที่คุณต้องการ
          </p>
          <Link
            href={`/stores/${store.slug}/category`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-sm font-[family:var(--font-kanit)] font-semibold uppercase tracking-wider text-sm text-[#0E0E10]"
            style={{
              background: 'var(--shop-primary-gradient, var(--shop-accent, #00BFFF))',
            }}
          >
            เริ่มเลือกอะไหล่
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E0E10] text-[#E5E7EB] font-[family:var(--font-prompt)]">
      {/* Header strip */}
      <section className="border-b border-[#1F1F23] bg-[#15151A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-[#6B7280] font-[family:var(--font-kanit)] font-semibold mb-1">
            <Link
              href={`/stores/${store.slug}/`}
              className="hover:text-[var(--shop-accent,#00BFFF)]"
            >
              HOME
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span style={{ color: 'var(--shop-accent, #00BFFF)' }}>CART</span>
          </div>
          <h1 className="font-[family:var(--font-kanit)] font-semibold uppercase tracking-wider text-2xl sm:text-3xl text-white">
            <span
              className="inline-block h-6 w-1.5 align-middle mr-3"
              style={{ background: 'var(--shop-accent, #00BFFF)' }}
              aria-hidden
            />
            ตะกร้าของคุณ
          </h1>
          <p className="mt-1 text-sm text-[#9CA3AF] tabular-nums">
            {itemCount} รายการ · {items.length} โมดูล
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* ── LINE ITEMS ──────────────────────────────────────── */}
        <section>
          {/* Table header (desktop) */}
          <div className="hidden md:grid grid-cols-[80px_1fr_120px_120px_40px] gap-3 px-3 pb-2 border-b border-[#1F1F23] text-[10px] tracking-[0.2em] uppercase text-[#6B7280] font-[family:var(--font-kanit)] font-semibold">
            <div>IMAGE</div>
            <div>โมดูล · ITEM</div>
            <div className="text-center">จำนวน · QTY</div>
            <div className="text-right">ยอด · TOTAL</div>
            <div aria-hidden />
          </div>
          <ul className="divide-y divide-[#1F1F23] border-x border-b border-[#1F1F23] bg-[#15151A] rounded-b-sm">
            {items.map((it, i) => {
              const idShort = it.productId.slice(-6).toUpperCase();
              const lineTotal = it.priceTHB * it.qty;
              return (
                <li
                  key={it.productId}
                  className="grid md:grid-cols-[80px_1fr_120px_120px_40px] grid-cols-[80px_1fr] gap-3 p-3 items-center"
                >
                  {/* Image */}
                  <div className="h-20 w-20 bg-[#0E0E10] border border-[#1F1F23] rounded-sm overflow-hidden">
                    {it.imageUrl ? (
                      <img
                        src={it.imageUrl}
                        alt={it.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full grid place-items-center">
                        <Wrench className="h-6 w-6 text-[#2A2A2E]" aria-hidden />
                      </div>
                    )}
                  </div>

                  {/* Item + spec mini-rows */}
                  <div className="min-w-0">
                    <div className="text-[9px] tracking-[0.2em] uppercase text-[#6B7280] font-[family:var(--font-kanit)] font-semibold tabular-nums mb-1">
                      SKU·{idShort} · M{String(i + 1).padStart(3, '0')}
                    </div>
                    <Link
                      href={`/stores/${store.slug}/products/${it.productId}`}
                      className="font-[family:var(--font-kanit)] font-semibold uppercase tracking-wide text-sm text-white line-clamp-2 hover:text-[var(--shop-accent,#00BFFF)]"
                    >
                      {it.title}
                    </Link>
                    <div className="mt-1 flex items-center gap-3 text-[10px] tracking-wider uppercase text-[#9CA3AF] font-[family:var(--font-kanit)] font-semibold">
                      <span>ราคา/ชิ้น</span>
                      <span className="tabular-nums text-[#E5E7EB]">
                        {formatTHB(it.priceTHB)}
                      </span>
                    </div>

                    {/* Mobile-only: qty + remove inline */}
                    <div className="md:hidden mt-3 flex items-center justify-between">
                      <div className="inline-flex items-stretch border border-[#2A2A2E] rounded-sm">
                        <button
                          type="button"
                          aria-label="ลดจำนวน"
                          onClick={() =>
                            setQty(it.productId, Math.max(1, it.qty - 1), store.slug)
                          }
                          className="px-2 py-1.5 hover:bg-[#1F1F23] text-[#9CA3AF]"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-9 grid place-items-center tabular-nums text-sm text-white border-x border-[#2A2A2E]">
                          {it.qty}
                        </span>
                        <button
                          type="button"
                          aria-label="เพิ่มจำนวน"
                          onClick={() => setQty(it.productId, it.qty + 1, store.slug)}
                          className="px-2 py-1.5 hover:bg-[#1F1F23] text-[#9CA3AF]"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="font-bold tabular-nums"
                          style={{ color: 'var(--shop-accent, #00BFFF)' }}
                        >
                          {formatTHB(lineTotal)}
                        </span>
                        <button
                          type="button"
                          aria-label="ลบสินค้า"
                          onClick={() => remove(it.productId, store.slug)}
                          className="p-1.5 rounded-sm border border-[#2A2A2E] text-[#9CA3AF] hover:border-[var(--shop-accent,#00BFFF)] hover:text-[var(--shop-accent,#00BFFF)]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Desktop qty */}
                  <div className="hidden md:flex justify-center">
                    <div className="inline-flex items-stretch border border-[#2A2A2E] rounded-sm">
                      <button
                        type="button"
                        aria-label="ลดจำนวน"
                        onClick={() =>
                          setQty(it.productId, Math.max(1, it.qty - 1), store.slug)
                        }
                        className="px-2 py-1.5 hover:bg-[#1F1F23] text-[#9CA3AF]"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-10 grid place-items-center tabular-nums text-sm text-white border-x border-[#2A2A2E]">
                        {it.qty}
                      </span>
                      <button
                        type="button"
                        aria-label="เพิ่มจำนวน"
                        onClick={() => setQty(it.productId, it.qty + 1, store.slug)}
                        className="px-2 py-1.5 hover:bg-[#1F1F23] text-[#9CA3AF]"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Desktop line total */}
                  <div className="hidden md:block text-right">
                    <span
                      className="font-bold text-base tabular-nums"
                      style={{ color: 'var(--shop-accent, #00BFFF)' }}
                    >
                      {formatTHB(lineTotal)}
                    </span>
                  </div>

                  {/* Desktop remove */}
                  <div className="hidden md:flex justify-end">
                    <button
                      type="button"
                      aria-label="ลบสินค้า"
                      onClick={() => remove(it.productId, store.slug)}
                      className="p-2 rounded-sm border border-[#2A2A2E] text-[#9CA3AF] hover:border-[var(--shop-accent,#00BFFF)] hover:text-[var(--shop-accent,#00BFFF)]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-6">
            <Link
              href={`/stores/${store.slug}/category`}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#9CA3AF] hover:text-[var(--shop-accent,#00BFFF)] font-[family:var(--font-kanit)] font-semibold"
            >
              <ChevronRight className="h-3 w-3 rotate-180" />
              ช้อปต่อ
            </Link>
          </div>
        </section>

        {/* ── STICKY SUMMARY ─────────────────────────────────── */}
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <div className="bg-[#15151A] border border-[#1F1F23] rounded-sm">
            <div className="px-4 py-3 border-b border-[#1F1F23] flex items-center gap-2">
              <span
                className="inline-block h-3 w-1"
                style={{ background: 'var(--shop-accent, #00BFFF)' }}
                aria-hidden
              />
              <h2 className="font-[family:var(--font-kanit)] font-semibold uppercase tracking-wider text-xs text-white">
                สรุปยอด · ORDER SUMMARY
              </h2>
            </div>
            <dl className="p-4 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-[#9CA3AF]">ยอดรวมสินค้า</dt>
                <dd className="tabular-nums text-white">{formatTHB(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#9CA3AF]">ค่าจัดส่ง</dt>
                <dd className="tabular-nums text-white">
                  {shipping === 0 ? (
                    <span style={{ color: 'var(--shop-accent, #00BFFF)' }}>ฟรี</span>
                  ) : (
                    formatTHB(shipping)
                  )}
                </dd>
              </div>

              {remaining > 0 && (
                <div className="pt-2">
                  <div className="text-[10px] tracking-wider uppercase text-[#6B7280] font-[family:var(--font-kanit)] font-semibold mb-1 tabular-nums">
                    ซื้อเพิ่ม {formatTHB(remaining)} เพื่อรับส่งฟรี
                  </div>
                  <div className="h-1.5 bg-[#1F1F23] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${progressPct}%`,
                        background:
                          'var(--shop-primary-gradient, var(--shop-accent, #00BFFF))',
                      }}
                    />
                  </div>
                </div>
              )}

              <div
                className="flex items-baseline justify-between pt-3 mt-2 border-t border-[#1F1F23]"
              >
                <dt className="font-[family:var(--font-kanit)] font-semibold uppercase tracking-wider text-sm text-white">
                  รวมทั้งสิ้น
                </dt>
                <dd
                  className="font-bold text-xl tabular-nums"
                  style={{ color: 'var(--shop-accent, #00BFFF)' }}
                >
                  {formatTHB(total)}
                </dd>
              </div>
            </dl>

            <div className="p-4 pt-0">
              <Link
                href={`/stores/${store.slug}/checkout`}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-sm font-[family:var(--font-kanit)] font-semibold uppercase tracking-wider text-sm text-[#0E0E10]"
                style={{
                  background:
                    'var(--shop-primary-gradient, var(--shop-accent, #00BFFF))',
                }}
              >
                ดำเนินการชำระเงิน
                <ChevronRight className="h-4 w-4" />
              </Link>
              <p className="mt-3 text-[10px] tracking-wider uppercase text-[#6B7280] font-[family:var(--font-kanit)] font-semibold text-center">
                จ่ายผ่าน ANYPAY · ปลอดภัย
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
