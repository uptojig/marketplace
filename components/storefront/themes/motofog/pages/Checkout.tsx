'use client';

/**
 * MotoFog — racing checkout.
 *
 * ANYPAY-only payment flow (no COD, no manual transfers). Address form
 * + AnyPay-only payment section + order summary. Submitting routes to
 * the marketplace-standard checkout/confirm step which is where the
 * actual AnyPay handoff happens; we just collect address + show review
 * locally on this themed page.
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CreditCard, ShieldCheck, Flag, ArrowRight, Bike } from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import type { CheckoutProps } from '@/lib/templates/types';

interface AddressForm {
  fullName: string;
  phone: string;
  addressLine1: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
}

const EMPTY_ADDRESS: AddressForm = {
  fullName: '',
  phone: '',
  addressLine1: '',
  subdistrict: '',
  district: '',
  province: '',
  postalCode: '',
};

export function MotoFogCheckout({ store }: CheckoutProps) {
  const router = useRouter();
  const allLines = useCart((s) => s.lines);

  const [mounted, setMounted] = useState(false);
  const [address, setAddress] = useState<AddressForm>(EMPTY_ADDRESS);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => setMounted(true), []);

  const items = allLines.filter((l) => l.storeSlug === store.slug);
  const subtotal = items.reduce((acc, l) => acc + l.priceTHB * l.qty, 0);
  const freeShippingThreshold = 1990;
  const shipping = subtotal >= freeShippingThreshold ? 0 : 50;
  const total = subtotal + shipping;

  if (!mounted) {
    return (
      <div
        className="min-h-[60vh]"
        style={{ backgroundColor: 'var(--shop-bg, #0F1417)' }}
      />
    );
  }

  if (items.length === 0) {
    return (
      <main
        className="min-h-[60vh] flex items-center justify-center px-4"
        style={{
          backgroundColor: 'var(--shop-bg, #0F1417)',
          color: 'var(--shop-ink, #F5F7FA)',
        }}
      >
        <div className="text-center max-w-md py-16">
          <Bike
            className="h-12 w-12 mx-auto mb-3"
            style={{ color: 'var(--shop-border, #2B3540)' }}
          />
          <h1
            className="font-[family:var(--font-kanit)] italic font-black text-2xl uppercase tracking-tight mb-3"
            style={{ color: 'var(--shop-ink, #F5F7FA)' }}
          >
            ตะกร้าว่างเปล่า
          </h1>
          <p
            className="font-[family:var(--font-prompt)] text-sm mb-6"
            style={{ color: 'var(--shop-ink-muted, #94A3B0)' }}
          >
            กรุณาเลือกสินค้าเข้าตะกร้าก่อนชำระเงิน
          </p>
          <Link
            href={`/stores/${store.slug}/category`}
            className="inline-flex items-center gap-2 px-6 h-12 rounded-md font-[family:var(--font-kanit)] italic font-black text-sm uppercase tracking-widest"
            style={{
              background:
                'var(--shop-primary-gradient, var(--shop-primary, #FF6B35))',
              color: '#0A0A0A',
            }}
          >
            เลือกสินค้า
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    );
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    // Forward to the marketplace standard confirm step (AnyPay handoff).
    router.push(`/stores/${store.slug}/checkout/confirm`);
  };

  const onField =
    (key: keyof AddressForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setAddress((a) => ({ ...a, [key]: e.target.value }));

  const fieldStyles: React.CSSProperties = {
    backgroundColor: 'var(--shop-bg, #0F1417)',
    border: '1px solid var(--shop-border, #2B3540)',
    color: 'var(--shop-ink, #F5F7FA)',
  };

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--shop-bg, #0F1417)',
        color: 'var(--shop-ink, #F5F7FA)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-8">
          <p
            className="font-[family:var(--font-prompt)] text-[10px] uppercase tracking-[0.3em] font-bold mb-2"
            style={{ color: 'var(--shop-accent, #FFC72C)' }}
          >
            Checkout · ชำระเงิน
          </p>
          <h1
            className="font-[family:var(--font-kanit)] italic font-black text-3xl sm:text-4xl uppercase tracking-tight"
            style={{ color: 'var(--shop-ink, #F5F7FA)' }}
          >
            ยืนยันคำสั่งซื้อ
          </h1>
        </header>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          {/* Left — address + payment */}
          <div className="lg:col-span-8 space-y-6">
            {/* Address card */}
            <section
              className="rounded-md p-6"
              style={{
                backgroundColor: 'var(--shop-surface, #1A2128)',
                border: '1px solid var(--shop-border, #2B3540)',
              }}
            >
              <h2
                className="font-[family:var(--font-kanit)] italic font-black text-lg uppercase tracking-widest mb-5"
                style={{ color: 'var(--shop-ink, #F5F7FA)' }}
              >
                ที่อยู่จัดส่ง
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="ชื่อ-นามสกุล"
                  required
                  value={address.fullName}
                  onChange={onField('fullName')}
                  styles={fieldStyles}
                />
                <Field
                  label="เบอร์โทร"
                  required
                  inputMode="tel"
                  value={address.phone}
                  onChange={onField('phone')}
                  styles={fieldStyles}
                />
                <Field
                  label="ที่อยู่ (บ้านเลขที่ ถนน)"
                  required
                  className="sm:col-span-2"
                  value={address.addressLine1}
                  onChange={onField('addressLine1')}
                  styles={fieldStyles}
                />
                <Field
                  label="ตำบล / แขวง"
                  required
                  value={address.subdistrict}
                  onChange={onField('subdistrict')}
                  styles={fieldStyles}
                />
                <Field
                  label="อำเภอ / เขต"
                  required
                  value={address.district}
                  onChange={onField('district')}
                  styles={fieldStyles}
                />
                <Field
                  label="จังหวัด"
                  required
                  value={address.province}
                  onChange={onField('province')}
                  styles={fieldStyles}
                />
                <Field
                  label="รหัสไปรษณีย์"
                  required
                  inputMode="numeric"
                  value={address.postalCode}
                  onChange={onField('postalCode')}
                  styles={fieldStyles}
                />
              </div>
            </section>

            {/* Payment — ANYPAY only */}
            <section
              className="rounded-md p-6"
              style={{
                backgroundColor: 'var(--shop-surface, #1A2128)',
                border: '1px solid var(--shop-border, #2B3540)',
              }}
            >
              <h2
                className="font-[family:var(--font-kanit)] italic font-black text-lg uppercase tracking-widest mb-5"
                style={{ color: 'var(--shop-ink, #F5F7FA)' }}
              >
                ช่องทางชำระเงิน
              </h2>
              <div
                className="flex items-start gap-4 rounded-md p-5"
                style={{
                  backgroundColor: 'var(--shop-bg, #0F1417)',
                  border: '2px solid var(--shop-primary, #FF6B35)',
                }}
              >
                <div
                  className="h-12 w-12 shrink-0 rounded-md inline-flex items-center justify-center"
                  style={{
                    background:
                      'var(--shop-primary-gradient, var(--shop-primary, #FF6B35))',
                    color: '#0A0A0A',
                  }}
                >
                  <CreditCard className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-[family:var(--font-kanit)] italic font-black text-base uppercase tracking-wider"
                    style={{ color: 'var(--shop-ink, #F5F7FA)' }}
                  >
                    จ่ายออนไลน์
                  </p>
                  <p
                    className="font-[family:var(--font-prompt)] text-xs mt-1"
                    style={{ color: 'var(--shop-ink-muted, #94A3B0)' }}
                  >
                    รองรับ QR PromptPay · บัตรเครดิต · โอนผ่านธนาคาร · ปลอดภัย
                    ด้วยการเข้ารหัสระดับธนาคาร
                  </p>
                  <div
                    className="mt-2 inline-flex items-center gap-1 text-[10px] font-[family:var(--font-prompt)] uppercase tracking-widest font-bold"
                    style={{ color: 'var(--shop-accent, #FFC72C)' }}
                  >
                    <ShieldCheck className="h-3 w-3" />
                    
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right — summary + submit */}
          <aside className="lg:col-span-4">
            <div
              className="rounded-md p-6 sticky top-24 space-y-5"
              style={{
                backgroundColor: 'var(--shop-surface, #1A2128)',
                border: '1px solid var(--shop-border, #2B3540)',
              }}
            >
              <div className="flex items-center gap-2">
                <Flag
                  className="h-4 w-4"
                  style={{ color: 'var(--shop-accent, #FFC72C)' }}
                />
                <h2
                  className="font-[family:var(--font-kanit)] italic font-black text-sm uppercase tracking-widest"
                  style={{ color: 'var(--shop-ink, #F5F7FA)' }}
                >
                  คำสั่งซื้อของคุณ
                </h2>
              </div>

              <ul className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {items.map((line) => (
                  <li
                    key={line.productId}
                    className="flex gap-3 items-center"
                  >
                    <div
                      className="h-14 w-14 shrink-0 overflow-hidden rounded-sm"
                      style={{
                        backgroundColor: 'var(--shop-bg, #0F1417)',
                        border: '1px solid var(--shop-border, #2B3540)',
                      }}
                    >
                      {line.imageUrl ? (
                        <img
                          src={line.imageUrl}
                          alt={line.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Bike
                            className="h-5 w-5"
                            style={{ color: 'var(--shop-border, #2B3540)' }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-[family:var(--font-prompt)] text-xs font-semibold line-clamp-2"
                        style={{ color: 'var(--shop-ink, #F5F7FA)' }}
                      >
                        {line.title}
                      </p>
                      <p
                        className="font-[family:var(--font-prompt)] text-[10px]"
                        style={{ color: 'var(--shop-ink-muted, #94A3B0)' }}
                      >
                        × {line.qty}
                      </p>
                    </div>
                    <span
                      className="font-[family:var(--font-prompt)] text-xs tabular-nums font-bold shrink-0"
                      style={{ color: 'var(--shop-ink, #F5F7FA)' }}
                    >
                      {formatTHB(line.priceTHB * line.qty)}
                    </span>
                  </li>
                ))}
              </ul>

              <dl
                className="space-y-2 pt-4"
                style={{ borderTop: '1px solid var(--shop-border, #2B3540)' }}
              >
                <div className="flex justify-between font-[family:var(--font-prompt)] text-sm">
                  <dt style={{ color: 'var(--shop-ink-muted, #94A3B0)' }}>
                    ยอดสินค้า
                  </dt>
                  <dd
                    className="tabular-nums font-semibold"
                    style={{ color: 'var(--shop-ink, #F5F7FA)' }}
                  >
                    {formatTHB(subtotal)}
                  </dd>
                </div>
                <div className="flex justify-between font-[family:var(--font-prompt)] text-sm">
                  <dt style={{ color: 'var(--shop-ink-muted, #94A3B0)' }}>
                    ค่าจัดส่ง
                  </dt>
                  <dd
                    className="tabular-nums font-semibold"
                    style={{
                      color:
                        shipping === 0
                          ? 'var(--shop-accent, #FFC72C)'
                          : 'var(--shop-ink, #F5F7FA)',
                    }}
                  >
                    {shipping === 0 ? 'ฟรี' : formatTHB(shipping)}
                  </dd>
                </div>
              </dl>

              <div
                className="flex items-baseline justify-between pt-3"
                style={{ borderTop: '1px solid var(--shop-border, #2B3540)' }}
              >
                <span
                  className="font-[family:var(--font-prompt)] text-sm uppercase tracking-widest font-bold"
                  style={{ color: 'var(--shop-ink, #F5F7FA)' }}
                >
                  รวมทั้งสิ้น
                </span>
                <span
                  className="font-[family:var(--font-kanit)] italic font-black text-2xl tabular-nums"
                  style={{ color: 'var(--shop-ink, #F5F7FA)' }}
                >
                  {formatTHB(total)}
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-md font-[family:var(--font-kanit)] italic font-black text-sm uppercase tracking-widest transition-transform hover:-translate-y-0.5 disabled:opacity-60"
                style={{
                  background:
                    'var(--shop-primary-gradient, var(--shop-primary, #FF6B35))',
                  color: '#0A0A0A',
                }}
              >
                {submitting ? 'กำลังนำคุณไปยังหน้าชำระเงิน...' : 'ยืนยัน · จ่ายออนไลน์'}
                <ArrowRight className="h-4 w-4" />
              </button>
              <div
                className="flex items-center gap-2 text-xs font-[family:var(--font-prompt)]"
                style={{ color: 'var(--shop-ink-muted, #94A3B0)' }}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>ปลอดภัย · เข้ารหัส SSL · ไม่เก็บข้อมูลบัตร</span>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  required,
  value,
  onChange,
  styles,
  className,
  inputMode,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  styles: React.CSSProperties;
  className?: string;
  inputMode?: 'text' | 'tel' | 'numeric';
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className ?? ''}`}>
      <span
        className="font-[family:var(--font-prompt)] text-[10px] uppercase tracking-widest font-bold"
        style={{ color: 'var(--shop-ink-muted, #94A3B0)' }}
      >
        {label}
        {required && <span style={{ color: 'var(--shop-accent, #FFC72C)' }}> *</span>}
      </span>
      <input
        type="text"
        inputMode={inputMode}
        required={required}
        value={value}
        onChange={onChange}
        className="h-11 rounded-sm px-3 font-[family:var(--font-prompt)] text-sm outline-none focus:ring-2 focus:ring-[var(--shop-primary,#FF6B35)]"
        style={styles}
      />
    </label>
  );
}

export default MotoFogCheckout;
