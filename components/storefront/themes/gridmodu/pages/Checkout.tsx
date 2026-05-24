'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Wrench, ChevronRight, Zap } from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import type { CheckoutProps } from '@/lib/templates/types';

/**
 * GridModu — Checkout. ANYPAY-only (no COD).
 *
 * Posts to /api/checkout with a single payment method (anypay). Designer
 * extending this should add stepper / shipping pickers but must NOT
 * re-introduce COD.
 */
export default function Checkout({ store }: CheckoutProps) {
  const items = useCart((s) =>
    s.lines.filter((line) => line.storeSlug === store.slug),
  );
  const subtotal = items.reduce(
    (sum: number, line) => sum + line.priceTHB * line.qty,
    0,
  );
  const shipping = subtotal === 0 || subtotal >= 990 ? 0 : 50;
  const total = subtotal + shipping;
  const itemCount = items.reduce((n, l) => n + l.qty, 0);

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
            <Link
              href={`/stores/${store.slug}/cart`}
              className="hover:text-[var(--shop-accent,#00BFFF)]"
            >
              CART
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span style={{ color: 'var(--shop-accent, #00BFFF)' }}>CHECKOUT</span>
          </div>
          <h1 className="font-[family:var(--font-kanit)] font-semibold uppercase tracking-wider text-2xl sm:text-3xl text-white">
            <span
              className="inline-block h-6 w-1.5 align-middle mr-3"
              style={{ background: 'var(--shop-accent, #00BFFF)' }}
              aria-hidden
            />
            ชำระเงิน
          </h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* ── FORM ────────────────────────────────────────────── */}
        <form
          action="/api/checkout"
          method="post"
          className="space-y-5"
          aria-label="ฟอร์มชำระเงิน"
        >
          {/* Hidden — single ANYPAY method */}
          <input type="hidden" name="payment" value="anypay" />

          {/* Customer info */}
          <fieldset className="bg-[#15151A] border border-[#1F1F23] rounded-sm">
            <legend className="sr-only">ข้อมูลผู้รับ</legend>
            <div className="px-4 py-3 border-b border-[#1F1F23] flex items-center gap-2">
              <span
                className="inline-block h-3 w-1"
                style={{ background: 'var(--shop-accent, #00BFFF)' }}
                aria-hidden
              />
              <h2 className="font-[family:var(--font-kanit)] font-semibold uppercase tracking-wider text-xs text-white">
                ข้อมูลผู้รับ · CONTACT
              </h2>
            </div>
            <div className="p-4 grid gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="block text-[10px] tracking-[0.2em] uppercase text-[#6B7280] font-[family:var(--font-kanit)] font-semibold mb-1">
                  ชื่อ-นามสกุล
                </span>
                <input
                  type="text"
                  name="fullName"
                  required
                  className="w-full bg-[#0E0E10] border border-[#2A2A2E] rounded-sm px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--shop-accent,#00BFFF)]"
                  placeholder="กรอกชื่อจริง-นามสกุล"
                />
              </label>
              <label className="block">
                <span className="block text-[10px] tracking-[0.2em] uppercase text-[#6B7280] font-[family:var(--font-kanit)] font-semibold mb-1">
                  เบอร์โทร
                </span>
                <input
                  type="tel"
                  name="phone"
                  required
                  className="w-full bg-[#0E0E10] border border-[#2A2A2E] rounded-sm px-3 py-2.5 text-sm text-white tabular-nums focus:outline-none focus:border-[var(--shop-accent,#00BFFF)]"
                  placeholder="0XX-XXX-XXXX"
                />
              </label>
              <label className="block">
                <span className="block text-[10px] tracking-[0.2em] uppercase text-[#6B7280] font-[family:var(--font-kanit)] font-semibold mb-1">
                  อีเมล (ไม่บังคับ)
                </span>
                <input
                  type="email"
                  name="email"
                  className="w-full bg-[#0E0E10] border border-[#2A2A2E] rounded-sm px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--shop-accent,#00BFFF)]"
                  placeholder="you@example.com"
                />
              </label>
            </div>
          </fieldset>

          {/* Address */}
          <fieldset className="bg-[#15151A] border border-[#1F1F23] rounded-sm">
            <legend className="sr-only">ที่อยู่จัดส่ง</legend>
            <div className="px-4 py-3 border-b border-[#1F1F23] flex items-center gap-2">
              <span
                className="inline-block h-3 w-1"
                style={{ background: 'var(--shop-accent, #00BFFF)' }}
                aria-hidden
              />
              <h2 className="font-[family:var(--font-kanit)] font-semibold uppercase tracking-wider text-xs text-white">
                ที่อยู่จัดส่ง · SHIPPING
              </h2>
            </div>
            <div className="p-4 grid gap-3">
              <label className="block">
                <span className="block text-[10px] tracking-[0.2em] uppercase text-[#6B7280] font-[family:var(--font-kanit)] font-semibold mb-1">
                  ที่อยู่
                </span>
                <textarea
                  name="address"
                  required
                  rows={3}
                  className="w-full bg-[#0E0E10] border border-[#2A2A2E] rounded-sm px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--shop-accent,#00BFFF)]"
                  placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
                />
              </label>
              <label className="block">
                <span className="block text-[10px] tracking-[0.2em] uppercase text-[#6B7280] font-[family:var(--font-kanit)] font-semibold mb-1">
                  หมายเหตุการจัดส่ง (ไม่บังคับ)
                </span>
                <input
                  type="text"
                  name="note"
                  className="w-full bg-[#0E0E10] border border-[#2A2A2E] rounded-sm px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--shop-accent,#00BFFF)]"
                  placeholder="เช่น โทรก่อนส่ง ฝากที่ป้อม"
                />
              </label>
            </div>
          </fieldset>

          {/* Payment — ANYPAY only (no COD) */}
          <fieldset className="bg-[#15151A] border border-[#1F1F23] rounded-sm">
            <legend className="sr-only">วิธีชำระเงิน</legend>
            <div className="px-4 py-3 border-b border-[#1F1F23] flex items-center gap-2">
              <span
                className="inline-block h-3 w-1"
                style={{ background: 'var(--shop-accent, #00BFFF)' }}
                aria-hidden
              />
              <h2 className="font-[family:var(--font-kanit)] font-semibold uppercase tracking-wider text-xs text-white">
                วิธีชำระเงิน · PAYMENT
              </h2>
            </div>
            <div className="p-4">
              <div
                className="flex items-center gap-3 p-3 rounded-sm border"
                style={{
                  borderColor: 'var(--shop-accent, #00BFFF)',
                  background: 'rgba(0,191,255,0.06)',
                }}
              >
                <span
                  className="grid place-items-center h-10 w-10 rounded-sm text-[#0E0E10] font-[family:var(--font-kanit)] font-bold tracking-wider tabular-nums text-[10px]"
                  style={{ background: 'var(--shop-accent, #00BFFF)' }}
                >
                  ANY
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-[family:var(--font-kanit)] font-semibold uppercase tracking-wider text-sm text-white">
                    จ่ายผ่าน ANYPAY
                  </div>
                  <div className="text-[10px] tracking-wider uppercase text-[#9CA3AF] font-[family:var(--font-kanit)] font-semibold mt-0.5">
                    บัตรเครดิต · พร้อมเพย์ · โอนธนาคาร · ปลอดภัย
                  </div>
                </div>
                <ShieldCheck
                  className="h-5 w-5 shrink-0"
                  style={{ color: 'var(--shop-accent, #00BFFF)' }}
                  aria-hidden
                />
              </div>
              <p className="mt-3 text-[10px] tracking-wider uppercase text-[#6B7280] font-[family:var(--font-kanit)] font-semibold">
                ไม่รับเก็บเงินปลายทาง (NO COD)
              </p>
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={items.length === 0}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-sm font-[family:var(--font-kanit)] font-semibold uppercase tracking-wider text-sm text-[#0E0E10] disabled:opacity-50"
            style={{
              background:
                'var(--shop-primary-gradient, var(--shop-accent, #00BFFF))',
            }}
          >
            <Zap className="h-4 w-4" />
            ยืนยันคำสั่งซื้อ
          </button>
        </form>

        {/* ── ORDER SUMMARY ─────────────────────────────────── */}
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <div className="bg-[#15151A] border border-[#1F1F23] rounded-sm">
            <div className="px-4 py-3 border-b border-[#1F1F23] flex items-center gap-2">
              <span
                className="inline-block h-3 w-1"
                style={{ background: 'var(--shop-accent, #00BFFF)' }}
                aria-hidden
              />
              <h2 className="font-[family:var(--font-kanit)] font-semibold uppercase tracking-wider text-xs text-white">
                คำสั่งซื้อ · ORDER
              </h2>
            </div>

            {items.length === 0 ? (
              <div className="p-6 text-center">
                <Wrench
                  className="h-8 w-8 mx-auto text-[#2A2A2E] mb-3"
                  aria-hidden
                />
                <p className="text-sm text-[#9CA3AF] mb-3">ตะกร้าว่างเปล่า</p>
                <Link
                  href={`/stores/${store.slug}/category`}
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--shop-accent,#00BFFF)] font-[family:var(--font-kanit)] font-semibold"
                >
                  เลือกสินค้า <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            ) : (
              <>
                <ul className="divide-y divide-[#1F1F23]">
                  {items.map((it) => {
                    const idShort = it.productId.slice(-6).toUpperCase();
                    return (
                      <li key={it.productId} className="flex gap-3 p-3">
                        <div className="h-14 w-14 bg-[#0E0E10] border border-[#1F1F23] rounded-sm overflow-hidden shrink-0">
                          {it.imageUrl ? (
                            <img
                              src={it.imageUrl}
                              alt={it.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full grid place-items-center">
                              <Wrench
                                className="h-5 w-5 text-[#2A2A2E]"
                                aria-hidden
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[9px] tracking-[0.2em] uppercase text-[#6B7280] font-[family:var(--font-kanit)] font-semibold tabular-nums mb-0.5">
                            SKU·{idShort} × {it.qty}
                          </div>
                          <div className="text-xs text-white line-clamp-2">
                            {it.title}
                          </div>
                        </div>
                        <div
                          className="font-bold tabular-nums text-sm self-center"
                          style={{ color: 'var(--shop-accent, #00BFFF)' }}
                        >
                          {formatTHB(it.priceTHB * it.qty)}
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <dl className="p-4 space-y-2 text-sm border-t border-[#1F1F23]">
                  <div className="flex justify-between">
                    <dt className="text-[#9CA3AF]">ยอดรวมสินค้า</dt>
                    <dd className="tabular-nums text-white">
                      {formatTHB(subtotal)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#9CA3AF]">ค่าจัดส่ง</dt>
                    <dd className="tabular-nums text-white">
                      {shipping === 0 ? (
                        <span style={{ color: 'var(--shop-accent, #00BFFF)' }}>
                          ฟรี
                        </span>
                      ) : (
                        formatTHB(shipping)
                      )}
                    </dd>
                  </div>
                  <div className="flex justify-between text-xs text-[#6B7280] tabular-nums">
                    <dt>จำนวนรายการ</dt>
                    <dd>{itemCount}</dd>
                  </div>
                  <div className="flex items-baseline justify-between pt-3 border-t border-[#1F1F23]">
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
              </>
            )}

            <Link
              href={`/stores/${store.slug}/cart`}
              className="block px-4 py-3 border-t border-[#1F1F23] text-[10px] tracking-wider uppercase text-[#9CA3AF] hover:text-[var(--shop-accent,#00BFFF)] font-[family:var(--font-kanit)] font-semibold text-center"
            >
              ← กลับไปแก้ตะกร้า
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
