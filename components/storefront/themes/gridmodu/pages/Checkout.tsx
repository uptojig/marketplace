'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import type { CheckoutProps } from '@/lib/templates/types';

/**
 * GridModu — checkout (scaffold).
 *
 * Designer should expand into a multi-step stepper + shipping/payment
 * pickers. This scaffold renders a single-page summary that POSTs to
 * the shared `/api/checkout` endpoint.
 */
export default function Checkout({ store }: CheckoutProps) {
  const items = useCart((s) =>
    s.lines.filter((line) => line.storeSlug === store.slug)
  );
  const subtotal = items.reduce(
    (sum: number, line) => sum + line.priceTHB * line.qty,
    0
  );
  const shipping = subtotal >= 990 || subtotal === 0 ? 0 : 50;
  const total = subtotal + shipping;

  return (
    <div className="bg-[var(--shop-bg)] text-[var(--shop-ink)] font-[family:var(--font-prompt)]">
      <div className="max-w-5xl mx-auto px-4 py-8 grid gap-8 md:grid-cols-[1fr_320px]">
        <form
          action="/api/checkout"
          method="post"
          className="space-y-6"
          aria-label="ฟอร์มชำระเงิน"
        >
          <h1 className="font-[family:var(--font-kanit)] text-3xl font-black">
            ชำระเงิน
          </h1>

          <fieldset className="bg-white border border-[var(--shop-border)] rounded p-4 space-y-3">
            <legend className="font-bold px-2">ข้อมูลผู้รับ</legend>
            <input
              type="text"
              name="fullName"
              required
              placeholder="ชื่อ-นามสกุล"
              className="w-full border border-[var(--shop-border)] rounded px-3 py-2"
            />
            <input
              type="tel"
              name="phone"
              required
              placeholder="เบอร์โทร"
              className="w-full border border-[var(--shop-border)] rounded px-3 py-2"
            />
            <input
              type="email"
              name="email"
              placeholder="อีเมล (ไม่บังคับ)"
              className="w-full border border-[var(--shop-border)] rounded px-3 py-2"
            />
            <textarea
              name="address"
              required
              placeholder="ที่อยู่จัดส่ง"
              rows={3}
              className="w-full border border-[var(--shop-border)] rounded px-3 py-2"
            />
          </fieldset>

          <fieldset className="bg-white border border-[var(--shop-border)] rounded p-4 space-y-2">
            <legend className="font-bold px-2">วิธีชำระเงิน</legend>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="payment" value="promptpay" defaultChecked />
              PromptPay (โอนพร้อมเพย์)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="payment" value="cod" />
              เก็บเงินปลายทาง (COD)
            </label>
          </fieldset>

          <button
            type="submit"
            className="block w-full px-6 py-3 rounded-full text-white font-bold"
            style={{ background: 'var(--shop-primary)' }}
          >
            ยืนยันคำสั่งซื้อ
          </button>
        </form>

        <aside className="bg-[var(--shop-bg-soft)] border border-[var(--shop-border)] rounded p-4 h-fit md:sticky md:top-4">
          <h2 className="font-[family:var(--font-kanit)] font-bold text-lg mb-3">
            คำสั่งซื้อของคุณ
          </h2>
          <ul className="space-y-2 text-sm mb-3">
            {items.map((it) => (
              <li key={it.productId} className="flex justify-between">
                <span className="line-clamp-1 pr-2">
                  {it.title} × {it.qty}
                </span>
                <span>{formatTHB(it.priceTHB * it.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="space-y-1 text-sm pt-3 border-t border-[var(--shop-border)]">
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
            href={`/stores/${store.slug}/cart`}
            className="block text-center text-xs underline text-[var(--shop-ink-muted)] mt-4"
          >
            ← กลับไปแก้ตะกร้า
          </Link>
        </aside>
      </div>
    </div>
  );
}
