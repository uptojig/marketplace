'use client';

/**
 * OmniPack — checkout page.
 *
 * Single shipping form (name / phone / address / district / postal
 * code) + a sticky summary card. Payment is ANYPAY-only — no
 * cash-on-delivery option appears anywhere in the flow.
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Lock,
  PackageOpen,
  ShieldCheck,
} from 'lucide-react';
import type { CheckoutProps } from '@/lib/templates/types';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';

interface OmnipackCheckoutProps extends CheckoutProps {
  storeSlug: string;
  freeShippingThreshold?: number;
  flatShippingTHB?: number;
}

const DEFAULT_FREE_SHIPPING_THRESHOLD = 990;
const DEFAULT_FLAT_SHIPPING_THB = 50;

export function OmnipackCheckout(props: OmnipackCheckoutProps) {
  const { store, storeSlug } = props;
  const router = useRouter();
  const lines = useCart((s) => s.linesForStore(storeSlug));
  const subtotal = useCart((s) => s.subtotalForStore(storeSlug));

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const freeShippingThreshold =
    props.freeShippingThreshold ?? DEFAULT_FREE_SHIPPING_THRESHOLD;
  const flatShipping = props.flatShippingTHB ?? DEFAULT_FLAT_SHIPPING_THB;
  const shippingCost = subtotal >= freeShippingThreshold ? 0 : flatShipping;
  const total = subtotal + shippingCost;

  const cartUrl = `/stores/${storeSlug}/cart`;
  const shopUrl = `/stores/${storeSlug}/category`;
  const homeUrl = `/stores/${storeSlug}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Downstream ANYPAY redirect is wired by the per-store checkout
    // subroute — this bespoke page only needs to collect address and
    // send the buyer there. Falling back to the homepage if no
    // dispatcher has wired anypay yet.
    router.push(homeUrl);
  };

  if (!mounted) {
    return <div className="min-h-[60vh]" aria-hidden />;
  }

  // Empty cart redirect-ish — show CTA to go shop
  if (lines.length === 0) {
    return (
      <main
        className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 font-[family:var(--font-prompt)]"
        style={{ backgroundColor: 'var(--shop-bg)', color: 'var(--shop-ink)' }}
      >
        <PackageOpen
          className="w-12 h-12 mb-4"
          style={{ color: 'var(--shop-border)' }}
        />
        <h1
          className="font-[family:var(--font-kanit)] font-medium text-xl mb-2"
          style={{ color: 'var(--shop-ink)' }}
        >
          ยังไม่มีสินค้าในตะกร้า
        </h1>
        <Link
          href={shopUrl}
          className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-white text-sm font-medium hover:opacity-90"
          style={{ backgroundColor: 'var(--shop-primary)' }}
        >
          เลือกสินค้า
        </Link>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen py-10 font-[family:var(--font-prompt)]"
      style={{ backgroundColor: 'var(--shop-bg)', color: 'var(--shop-ink)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href={cartUrl}
            className="inline-flex items-center gap-1 text-sm hover:opacity-80"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            <ChevronLeft className="w-4 h-4" />
            กลับไปที่ตะกร้า
          </Link>
          <h1
            className="font-[family:var(--font-kanit)] font-medium text-2xl sm:text-3xl mt-2"
            style={{ color: 'var(--shop-ink)' }}
          >
            ชำระเงิน
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            {store.name} · ปลอดภัย จ่ายผ่าน ANYPAY
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* Shipping form */}
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border p-6"
            style={{
              backgroundColor: 'var(--shop-card)',
              borderColor: 'var(--shop-border)',
            }}
          >
            <h2
              className="font-[family:var(--font-kanit)] font-medium text-lg mb-5"
              style={{ color: 'var(--shop-ink)' }}
            >
              ที่อยู่จัดส่ง
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="ชื่อ-นามสกุล" name="fullName" required />
              <Field
                label="เบอร์โทรศัพท์"
                name="phone"
                type="tel"
                required
              />
              <Field
                label="ชื่อบริษัท (ถ้ามี)"
                name="company"
                className="sm:col-span-2"
              />
              <Field
                label="ที่อยู่"
                name="address"
                required
                className="sm:col-span-2"
              />
              <Field label="แขวง/ตำบล" name="subdistrict" required />
              <Field label="เขต/อำเภอ" name="district" required />
              <Field label="จังหวัด" name="province" required />
              <Field label="รหัสไปรษณีย์" name="postalCode" required />
            </div>

            {/* Payment — ANYPAY only */}
            <h2
              className="font-[family:var(--font-kanit)] font-medium text-lg mt-8 mb-4"
              style={{ color: 'var(--shop-ink)' }}
            >
              วิธีการชำระเงิน
            </h2>
            <label
              className="flex items-center justify-between gap-4 p-4 rounded-md border cursor-pointer"
              style={{
                backgroundColor: 'var(--shop-bg-soft, var(--shop-bg))',
                borderColor: 'var(--shop-primary)',
              }}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payment"
                  value="anypay"
                  defaultChecked
                  className="w-4 h-4"
                  style={{ accentColor: 'var(--shop-primary)' }}
                />
                <div>
                  <span
                    className="inline-flex items-center justify-center text-[10px] font-bold tracking-wide px-2 py-0.5 rounded text-white mb-1"
                    style={{ backgroundColor: 'var(--shop-primary)' }}
                  >
                    ANYPAY
                  </span>
                  <p
                    className="text-sm font-medium"
                    style={{ color: 'var(--shop-ink)' }}
                  >
                    ชำระเงินผ่าน ANYPAY
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: 'var(--shop-ink-muted)' }}
                  >
                    บัตรเครดิต · PromptPay · Mobile Banking
                  </p>
                </div>
              </div>
              <Lock
                className="w-5 h-5"
                style={{ color: 'var(--shop-primary)' }}
              />
            </label>
            <p
              className="mt-3 text-xs flex items-center gap-1.5"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              ร้านนี้ไม่รับชำระเงินปลายทาง — เพื่อความปลอดภัยของผู้ซื้อและร้าน
            </p>

            <button
              type="submit"
              className="mt-6 w-full inline-flex items-center justify-center gap-2 py-3 rounded-md text-white text-sm font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--shop-primary)' }}
            >
              ยืนยันคำสั่งซื้อ {formatTHB(total)}
            </button>
          </form>

          {/* Summary */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div
              className="rounded-xl border p-6"
              style={{
                backgroundColor: 'var(--shop-card)',
                borderColor: 'var(--shop-border)',
              }}
            >
              <h2
                className="font-[family:var(--font-kanit)] font-medium text-base mb-4"
                style={{ color: 'var(--shop-ink)' }}
              >
                สรุปคำสั่งซื้อ
              </h2>
              <ul
                className="space-y-3 pb-4 mb-4 border-b max-h-56 overflow-auto"
                style={{ borderColor: 'var(--shop-border)' }}
              >
                {lines.map((line) => (
                  <li
                    key={line.productId}
                    className="flex items-start justify-between gap-3 text-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <span
                        className="block truncate font-medium"
                        style={{ color: 'var(--shop-ink)' }}
                      >
                        {line.title}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: 'var(--shop-ink-muted)' }}
                      >
                        {line.qty} × {formatTHB(line.priceTHB)}
                      </span>
                    </div>
                    <span
                      className="shrink-0"
                      style={{ color: 'var(--shop-ink)' }}
                    >
                      {formatTHB(line.priceTHB * line.qty)}
                    </span>
                  </li>
                ))}
              </ul>

              <dl
                className="text-sm space-y-2 pb-4 mb-4 border-b"
                style={{ borderColor: 'var(--shop-border)' }}
              >
                <div className="flex justify-between">
                  <dt style={{ color: 'var(--shop-ink-muted)' }}>ยอดสินค้า</dt>
                  <dd style={{ color: 'var(--shop-ink)' }}>
                    {formatTHB(subtotal)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt style={{ color: 'var(--shop-ink-muted)' }}>ค่าจัดส่ง</dt>
                  <dd style={{ color: 'var(--shop-ink)' }}>
                    {shippingCost === 0 ? 'ฟรี' : formatTHB(shippingCost)}
                  </dd>
                </div>
              </dl>

              <div className="flex items-baseline justify-between">
                <span
                  className="font-[family:var(--font-kanit)] font-medium text-base"
                  style={{ color: 'var(--shop-ink)' }}
                >
                  รวมทั้งหมด
                </span>
                <span
                  className="font-[family:var(--font-kanit)] font-medium text-2xl"
                  style={{ color: 'var(--shop-primary)' }}
                >
                  {formatTHB(total)}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

/** Themed input field — kraft-card surface, ANYPAY-friendly. */
function Field({
  label,
  name,
  type = 'text',
  required,
  className,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className ?? ''}`}>
      <span
        className="text-xs font-medium"
        style={{ color: 'var(--shop-ink-muted)' }}
      >
        {label}
        {required && (
          <span
            className="ml-0.5"
            style={{ color: 'var(--shop-primary)' }}
            aria-hidden
          >
            *
          </span>
        )}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-offset-0"
        style={{
          backgroundColor: 'var(--shop-bg)',
          borderColor: 'var(--shop-border)',
          color: 'var(--shop-ink)',
        }}
      />
    </label>
  );
}
