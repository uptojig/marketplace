'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Truck,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import type { CheckoutProps } from '@/lib/templates/types';

type ShippingOption = 'std' | 'express';

/**
 * Konvy — K-beauty checkout.
 *
 * Per project rule:
 *   - ONLY ANYPAY is offered as payment (it handles PromptPay / card /
 *     TrueMoney internally). No COD, no direct PromptPay, no cards.
 *   - Shipping options: ส่งมาตรฐาน + ส่งด่วน — NO COD shipping option.
 *
 * Layout:
 *   - Hero band
 *   - LEFT: shipping address form + shipping option picker + payment block
 *   - RIGHT: sticky order summary with line items + totals
 *
 * The actual checkout submission is handled by the shared
 * /api/checkout endpoint; this page collects the data + presents the
 * order summary so the buyer can verify before submitting.
 */
export default function Checkout({ store }: CheckoutProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const items = useCart((s) =>
    s.lines.filter((line) => line.storeSlug === store.slug),
  );

  const [shipping, setShipping] = useState<ShippingOption>('std');

  const subtotal = items.reduce(
    (sum, line) => sum + line.priceTHB * line.qty,
    0,
  );
  const totalItems = items.reduce((sum, line) => sum + line.qty, 0);

  const shippingTable: Record<
    ShippingOption,
    { label: string; sub: string; fee: number }
  > = {
    std: {
      label: 'ส่งมาตรฐาน',
      sub: '2-3 วันทำการ · Kerry / Flash Express',
      fee: subtotal >= 590 ? 0 : 50,
    },
    express: {
      label: 'ส่งด่วน Same-day',
      sub: 'ในวันเดียว · เฉพาะกรุงเทพและปริมณฑล',
      fee: 120,
    },
  };
  const shippingFee = shippingTable[shipping].fee;
  const grandTotal = subtotal + shippingFee;

  if (!mounted) {
    return (
      <div
        className="min-h-[60vh]"
        style={{ background: 'var(--shop-bg, #FFFFFF)' }}
      />
    );
  }

  if (items.length === 0) {
    return (
      <div
        className="font-[family:var(--font-prompt)] text-[var(--shop-ink)]"
        style={{ background: 'var(--shop-bg, #FFFFFF)' }}
      >
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="font-[family:var(--font-kanit)] text-2xl font-semibold mb-3">
            ไม่มีสินค้าในตะกร้า
          </h1>
          <p
            className="text-sm mb-8"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            กลับไปเลือกสินค้าก่อนทำการสั่งซื้อ
          </p>
          <Link
            href={`/stores/${store.slug}/category`}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-white text-sm font-semibold"
            style={{
              background:
                'var(--shop-primary-gradient, var(--shop-primary))',
            }}
          >
            กลับไปช้อป
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="font-[family:var(--font-prompt)] text-[var(--shop-ink)]"
      style={{ background: 'var(--shop-bg, #FFFFFF)' }}
    >
      {/* Hero band */}
      <section
        className="border-b border-[var(--shop-border)]"
        style={{ background: 'var(--shop-bg-soft, #FAF6F2)' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p
            className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-2"
            style={{ color: 'var(--shop-primary)' }}
          >
            Secure checkout
          </p>
          <h1 className="font-[family:var(--font-kanit)] text-3xl sm:text-4xl font-semibold tracking-tight">
            ดำเนินการสั่งซื้อ
          </h1>
          <p
            className="mt-2 text-sm flex items-center gap-1.5"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            <ShieldCheck
              className="h-3.5 w-3.5"
              style={{ color: 'var(--shop-primary)' }}
            />
            ทุกการชำระเงินออนไลน์ · ปลอดภัยและรวดเร็ว
          </p>
        </div>
      </section>

      <form
        action="/api/checkout"
        method="post"
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid gap-8 lg:grid-cols-[1fr_360px]"
        aria-label="ฟอร์มสั่งซื้อ"
      >
        {/* hidden meta for the endpoint */}
        <input type="hidden" name="storeSlug" value={store.slug} />
        <input type="hidden" name="shipping" value={shipping} />
        <input type="hidden" name="payment" value="anypay" />

        {/* LEFT — form column */}
        <div className="space-y-6">
          {/* 1 · Shipping address */}
          <section className="bg-white rounded-2xl border border-[var(--shop-border)] shadow-sm overflow-hidden">
            <header
              className="px-5 sm:px-6 py-4 border-b border-[var(--shop-border)] flex items-center gap-2"
              style={{ background: 'var(--shop-bg-soft, #FAF6F2)' }}
            >
              <MapPin
                className="h-4 w-4"
                style={{ color: 'var(--shop-primary)' }}
              />
              <h2 className="font-[family:var(--font-kanit)] font-semibold text-sm">
                ที่อยู่จัดส่ง
              </h2>
            </header>
            <div className="p-5 sm:p-6 grid gap-3 sm:grid-cols-2">
              <Field
                label="ชื่อ - นามสกุล"
                name="fullName"
                type="text"
                required
                span={2}
              />
              <Field
                label="เบอร์โทรศัพท์"
                name="phone"
                type="tel"
                required
              />
              <Field
                label="อีเมล (สำหรับใบเสร็จ)"
                name="email"
                type="email"
              />
              <Field
                label="ที่อยู่ บ้านเลขที่ / อาคาร / ซอย / ถนน"
                name="addressLine1"
                type="text"
                required
                span={2}
              />
              <Field label="แขวง / ตำบล" name="subdistrict" type="text" />
              <Field label="เขต / อำเภอ" name="district" type="text" />
              <Field
                label="จังหวัด"
                name="province"
                type="text"
                required
              />
              <Field
                label="รหัสไปรษณีย์"
                name="postalCode"
                type="text"
                required
              />
            </div>
          </section>

          {/* 2 · Shipping option */}
          <section className="bg-white rounded-2xl border border-[var(--shop-border)] shadow-sm overflow-hidden">
            <header
              className="px-5 sm:px-6 py-4 border-b border-[var(--shop-border)] flex items-center gap-2"
              style={{ background: 'var(--shop-bg-soft, #FAF6F2)' }}
            >
              <Truck
                className="h-4 w-4"
                style={{ color: 'var(--shop-primary)' }}
              />
              <h2 className="font-[family:var(--font-kanit)] font-semibold text-sm">
                วิธีจัดส่ง
              </h2>
            </header>
            <div className="p-5 sm:p-6 space-y-2.5">
              {(['std', 'express'] as const).map((opt) => {
                const item = shippingTable[opt];
                const active = shipping === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setShipping(opt)}
                    className="w-full text-left p-4 rounded-2xl flex items-center justify-between gap-3 transition-all border-2"
                    style={{
                      borderColor: active
                        ? 'var(--shop-primary)'
                        : 'var(--shop-border)',
                      background: active
                        ? 'var(--shop-bg-soft, #FAF6F2)'
                        : 'white',
                    }}
                    aria-pressed={active}
                  >
                    <div>
                      <p
                        className="font-[family:var(--font-kanit)] font-semibold text-sm"
                        style={{
                          color: active
                            ? 'var(--shop-primary)'
                            : 'var(--shop-ink)',
                        }}
                      >
                        {item.label}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: 'var(--shop-ink-muted)' }}
                      >
                        {item.sub}
                      </p>
                    </div>
                    <span
                      className="font-[family:var(--font-kanit)] font-semibold text-sm shrink-0"
                      style={{
                        color:
                          item.fee === 0
                            ? 'var(--shop-primary)'
                            : 'var(--shop-ink)',
                      }}
                    >
                      {item.fee === 0 ? 'ฟรี' : formatTHB(item.fee)}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 3 · Payment — ANYPAY only */}
          <section className="bg-white rounded-2xl border border-[var(--shop-border)] shadow-sm overflow-hidden">
            <header
              className="px-5 sm:px-6 py-4 border-b border-[var(--shop-border)] flex items-center gap-2"
              style={{ background: 'var(--shop-bg-soft, #FAF6F2)' }}
            >
              <CreditCard
                className="h-4 w-4"
                style={{ color: 'var(--shop-primary)' }}
              />
              <h2 className="font-[family:var(--font-kanit)] font-semibold text-sm">
                วิธีการชำระเงิน
              </h2>
            </header>
            <div className="p-5 sm:p-6">
              <div
                className="p-4 rounded-2xl flex items-center gap-3 border-2"
                style={{
                  borderColor: 'var(--shop-primary)',
                  background: 'var(--shop-bg-soft, #FAF6F2)',
                }}
              >
                <div
                  className="h-10 w-10 rounded-full grid place-items-center shrink-0 text-white"
                  style={{
                    background:
                      'var(--shop-primary-gradient, var(--shop-primary))',
                  }}
                >
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p
                    className="font-[family:var(--font-kanit)] font-semibold text-sm"
                    style={{ color: 'var(--shop-primary)' }}
                  >
                    ชำระเงินออนไลน์
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: 'var(--shop-ink-muted)' }}
                  >
                    พร้อมเพย์ · บัตรเครดิต · TrueMoney Wallet
                  </p>
                </div>
              </div>
              <p
                className="mt-3 text-[11px] flex items-center gap-1"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                <ShieldCheck
                  className="h-3 w-3"
                  style={{ color: 'var(--shop-primary)' }}
                />
                ชำระเงินปลอดภัย
              </p>
            </div>
          </section>
        </div>

        {/* RIGHT — sticky summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="bg-white rounded-2xl border border-[var(--shop-border)] shadow-sm overflow-hidden">
            <div
              className="px-5 py-4 text-white font-[family:var(--font-kanit)] font-semibold text-sm"
              style={{
                background:
                  'var(--shop-primary-gradient, var(--shop-primary))',
              }}
            >
              คำสั่งซื้อของคุณ
            </div>

            <ul className="px-5 pt-4 max-h-72 overflow-y-auto divide-y divide-[var(--shop-border)]">
              {items.map((it) => (
                <li
                  key={it.productId}
                  className="py-3 flex items-center gap-3"
                >
                  <div
                    className="h-12 w-12 rounded-lg overflow-hidden shrink-0"
                    style={{ background: 'var(--shop-bg-soft, #FAF6F2)' }}
                  >
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
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium leading-snug line-clamp-2">
                      {it.title}
                    </p>
                    <p
                      className="text-[10px] mt-0.5"
                      style={{ color: 'var(--shop-ink-muted)' }}
                    >
                      จำนวน {it.qty}
                    </p>
                  </div>
                  <span className="text-xs font-[family:var(--font-kanit)] font-semibold whitespace-nowrap">
                    {formatTHB(it.priceTHB * it.qty)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="px-5 py-4 border-t border-[var(--shop-border)] space-y-2 text-sm">
              <div className="flex justify-between">
                <dt style={{ color: 'var(--shop-ink-muted)' }}>
                  ยอดสินค้า ({totalItems} ชิ้น)
                </dt>
                <dd className="font-medium">{formatTHB(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt style={{ color: 'var(--shop-ink-muted)' }}>ค่าจัดส่ง</dt>
                <dd
                  className="font-medium"
                  style={{
                    color:
                      shippingFee === 0
                        ? 'var(--shop-primary)'
                        : 'inherit',
                  }}
                >
                  {shippingFee === 0 ? 'ฟรี' : formatTHB(shippingFee)}
                </dd>
              </div>
            </dl>

            <div className="px-5 py-4 border-t border-[var(--shop-border)] flex items-baseline justify-between">
              <span className="font-[family:var(--font-kanit)] font-semibold">
                รวมทั้งสิ้น
              </span>
              <span
                className="font-[family:var(--font-kanit)] font-semibold text-2xl"
                style={{ color: 'var(--shop-primary)' }}
              >
                {formatTHB(grandTotal)}
              </span>
            </div>

            <div className="px-5 pb-5 pt-4">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-white text-sm font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5"
                style={{
                  background:
                    'var(--shop-primary-gradient, var(--shop-primary))',
                }}
              >
                ยืนยันคำสั่งซื้อ
                <ArrowRight className="h-4 w-4" />
              </button>
              <p
                className="mt-3 text-center text-[11px] flex items-center justify-center gap-1"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                <ShieldCheck
                  className="h-3 w-3"
                  style={{ color: 'var(--shop-primary)' }}
                />
                รับประกันคืนเงินใน 7 วัน
              </p>
              <Link
                href={`/stores/${store.slug}/cart`}
                className="block text-center text-xs mt-4 hover:underline"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                ← กลับไปแก้ตะกร้า
              </Link>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}

interface FieldProps {
  label: string;
  name: string;
  type: 'text' | 'tel' | 'email';
  required?: boolean;
  span?: 1 | 2;
}

function Field({ label, name, type, required, span = 1 }: FieldProps) {
  return (
    <label className={`block ${span === 2 ? 'sm:col-span-2' : ''}`}>
      <span
        className="block text-[11px] uppercase tracking-[0.15em] font-medium mb-1.5"
        style={{ color: 'var(--shop-ink-muted)' }}
      >
        {label}
        {required ? <span className="text-[var(--shop-primary)]"> *</span> : null}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        className="w-full px-4 py-2.5 rounded-full text-sm border border-[var(--shop-border)] bg-white focus:outline-none focus:border-[var(--shop-primary)] transition-colors"
        style={{ color: 'var(--shop-ink)' }}
      />
    </label>
  );
}
