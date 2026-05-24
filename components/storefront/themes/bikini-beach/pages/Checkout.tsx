'use client';

import React, { useState } from 'react';
import {
  IconArrowRight,
  IconShieldCheck,
  IconLock,
  IconCreditCard,
  IconBrandLine,
  IconWallet,
  IconCash,
} from '@tabler/icons-react';
import type { CartItem } from './Cart';

// ============ Types ============
export interface ShippingAddress {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  address?: string;
  district?: string;
  province?: string;
  postcode?: string;
  notes?: string;
}

export interface ShippingOption {
  value: string;
  label: string;
  description: string;
  price: number;
  estimate?: string;
  icon?: React.ReactNode;
}

export interface PaymentOption {
  value: string;
  label: string;
  description: string;
  icon?: React.ReactNode;
}

export type CheckoutStep = 'address' | 'shipping' | 'payment';

export interface CheckoutProps {
  items?: CartItem[];
  address?: ShippingAddress;
  shippingOptions?: ShippingOption[];
  paymentMethods?: PaymentOption[];
  currentStep?: CheckoutStep;
  selectedShipping?: string;
  selectedPayment?: string;
  subtotal?: number;
  promoCode?: string;
  promoAmount?: number;
  /** Submit any step → next step. Pass step-specific payload */
  onSubmitStep?: (step: CheckoutStep, data: Record<string, unknown>) => void;
  onSelectShipping?: (value: string) => void;
  onSelectPayment?: (value: string) => void;
  // URL prop: terms & conditions page (legal)
  termsUrl: string;
}

const tinyBikini = (color: string) => (
  <svg viewBox="0 0 200 250" width="80%" aria-hidden="true">
    <path d="M40 60 Q70 45 100 60 L105 100 Q80 115 50 105 Z" fill={color} />
    <path d="M100 60 Q130 45 160 60 L155 100 Q125 115 100 100 Z" fill={color} />
    <path d="M50 140 Q100 132 150 140 L145 200 Q100 210 55 200 Z" fill={color} />
  </svg>
);

const DEFAULT_ITEMS: CartItem[] = [
  { id: 'i1', productId: 'p1', slug: 'polka-pink-triangle', name: 'Polka Pink · Triangle', variant: 'Pink · M', price: 890, qty: 1, colorHex: '#EC4899', bgVariant: 'bg-rose', illustration: tinyBikini('#EC4899') },
  { id: 'i2', productId: 'p2', slug: 'ocean-blue', name: 'Ocean Blue · Bandeau', variant: 'Sky · S', price: 1290, qty: 1, colorHex: '#38BDF8', bgVariant: 'bg-sky', illustration: tinyBikini('#38BDF8') },
  { id: 'i3', productId: 'p3', slug: 'sunset-gold', name: 'Sunset Gold · Tankini', variant: 'Green · L', price: 1190, qty: 2, colorHex: '#10B981', bgVariant: 'bg-green', illustration: tinyBikini('#10B981') },
];

const DEFAULT_SHIPPING: ShippingOption[] = [
  { value: 'standard', label: 'Standard Shipping', description: '🚚 Kerry / Flash · 2-4 วัน', price: 0, estimate: '15-17 พ.ค.' },
  { value: 'express', label: 'Express (Bangkok)', description: '⚡ ส่งวันเดียวกัน (สั่งก่อน 14:00)', price: 80, estimate: 'วันนี้' },
  { value: 'pickup', label: 'Self Pickup', description: '📍 รับเองที่ Showroom Asok', price: 0, estimate: 'พรุ่งนี้' },
];

// ANYPAY-only per project rule. AnyPay gateway internally routes to
// PromptPay / Visa / Mastercard / TrueMoney / Rabbit LINE Pay / etc.
// COD removed (CJ Dropshipping does not support it).
const DEFAULT_PAYMENT: PaymentOption[] = [
  { value: 'anypay', label: 'ANYPAY · พร้อมเพย์ / บัตร / TrueMoney', description: 'ระบบรับชำระเงินที่ปลอดภัย รองรับทุกช่องทาง', icon: <IconCreditCard size={22} /> },
];

// ============ Component ============
export function Checkout({
  items = DEFAULT_ITEMS,
  address: addr = {},
  shippingOptions = DEFAULT_SHIPPING,
  paymentMethods = DEFAULT_PAYMENT,
  currentStep = 'payment',
  selectedShipping = 'standard',
  selectedPayment = 'promptpay',
  subtotal,
  promoCode = 'WELCOME200',
  promoAmount = 200,
  onSubmitStep,
  onSelectShipping,
  onSelectPayment,
  termsUrl,
}: CheckoutProps) {
  const [form, setForm] = useState<ShippingAddress>(addr);

  const sub = subtotal ?? items.reduce((s, i) => s + i.price * i.qty, 0);
  const shippingPrice = shippingOptions.find(s => s.value === selectedShipping)?.price ?? 0;
  // ANYPAY-only — no per-method surcharge.
  const total = sub - promoAmount + shippingPrice;

  const update = <K extends keyof ShippingAddress>(k: K, v: ShippingAddress[K]) => setForm(s => ({ ...s, [k]: v }));

  return (
    <main>
      {/* STEPS */}
      <div className="bk-steps" role="progressbar" aria-label="Checkout progress">
        <div className="bk-container bk-steps-inner">
          {[
            { v: 'address', n: '1', l: 'ที่อยู่จัดส่ง' },
            { v: 'shipping', n: '2', l: 'วิธีจัดส่ง' },
            { v: 'payment', n: '3', l: 'ชำระเงิน' },
          ].map((s, i) => {
            const order = ['address', 'shipping', 'payment'].indexOf(currentStep);
            const me = i;
            const cls = me < order ? 'done' : me === order ? 'active' : '';
            return (
              <React.Fragment key={s.v}>
                <div className={`bk-step ${cls}`}>
                  <div className="num" aria-hidden="true">{me < order ? '✓' : s.n}</div>
                  {s.l}
                </div>
                {i < 2 && <span style={{ color: 'var(--bikini-hint)' }}>→</span>}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="bk-container">
        <div className="bk-checkout">
          {/* MAIN */}
          <div>
            {/* Address */}
            <section className="bk-checkout-section" aria-labelledby="addr-h">
              <h4 id="addr-h"><span style={{ background: 'var(--bikini-grad-coral)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>1.</span> ที่อยู่จัดส่ง</h4>
              <form
                className="bk-fields"
                onSubmit={(e) => { e.preventDefault(); onSubmitStep?.('address', form as Record<string, unknown>); }}
              >
                <div className="bk-field">
                  <label htmlFor="fn">ชื่อ <span style={{ color: '#EF4444' }}>*</span></label>
                  <input id="fn" required value={form.firstName ?? ''} onChange={e => update('firstName', e.target.value)} />
                </div>
                <div className="bk-field">
                  <label htmlFor="ln">นามสกุล <span style={{ color: '#EF4444' }}>*</span></label>
                  <input id="ln" required value={form.lastName ?? ''} onChange={e => update('lastName', e.target.value)} />
                </div>
                <div className="bk-field">
                  <label htmlFor="ph">เบอร์โทร <span style={{ color: '#EF4444' }}>*</span></label>
                  <input id="ph" type="tel" required placeholder="08X-XXX-XXXX" value={form.phone ?? ''} onChange={e => update('phone', e.target.value)} />
                </div>
                <div className="bk-field">
                  <label htmlFor="em">อีเมล <span style={{ color: '#EF4444' }}>*</span></label>
                  <input id="em" type="email" required value={form.email ?? ''} onChange={e => update('email', e.target.value)} />
                </div>
                <div className="bk-field full">
                  <label htmlFor="addr">ที่อยู่ <span style={{ color: '#EF4444' }}>*</span></label>
                  <textarea id="addr" rows={2} required placeholder="บ้านเลขที่ / หมู่บ้าน / ซอย / ถนน" value={form.address ?? ''} onChange={e => update('address', e.target.value)} />
                </div>
                <div className="bk-field">
                  <label htmlFor="dist">เขต/อำเภอ</label>
                  <input id="dist" value={form.district ?? ''} onChange={e => update('district', e.target.value)} />
                </div>
                <div className="bk-field">
                  <label htmlFor="prov">จังหวัด <span style={{ color: '#EF4444' }}>*</span></label>
                  <select id="prov" required value={form.province ?? ''} onChange={e => update('province', e.target.value)}>
                    <option value="">เลือกจังหวัด</option>
                    <option>กรุงเทพมหานคร</option>
                    <option>นนทบุรี</option>
                    <option>ปทุมธานี</option>
                    <option>สมุทรปราการ</option>
                    <option>เชียงใหม่</option>
                    <option>ภูเก็ต</option>
                  </select>
                </div>
                <div className="bk-field">
                  <label htmlFor="pc">รหัสไปรษณีย์ <span style={{ color: '#EF4444' }}>*</span></label>
                  <input id="pc" required pattern="[0-9]{5}" maxLength={5} value={form.postcode ?? ''} onChange={e => update('postcode', e.target.value)} />
                </div>
                <div className="bk-field full">
                  <label htmlFor="notes">หมายเหตุ (ถ้ามี)</label>
                  <input id="notes" value={form.notes ?? ''} onChange={e => update('notes', e.target.value)} placeholder="เช่น ส่งหลัง 17:00, โทรก่อนถึง" />
                </div>
              </form>
            </section>

            {/* Shipping */}
            <section className="bk-checkout-section" aria-labelledby="ship-h">
              <h4 id="ship-h"><span style={{ background: 'var(--bikini-grad-coral)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>2.</span> วิธีจัดส่ง</h4>
              <div role="radiogroup" aria-label="Shipping method">
                {shippingOptions.map((o) => (
                  <label
                    key={o.value}
                    className={`bk-radio${o.value === selectedShipping ? ' selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      value={o.value}
                      checked={o.value === selectedShipping}
                      onChange={() => onSelectShipping?.(o.value)}
                      style={{ width: 18, height: 18, accentColor: 'var(--shop-primary)' }}
                    />
                    {o.icon}
                    <div style={{ flex: 1 }}>
                      <div className="name">{o.label}</div>
                      <div className="desc">{o.description}{o.estimate && ` · ส่งถึง ${o.estimate}`}</div>
                    </div>
                    <span style={{ fontWeight: 800, color: o.price === 0 ? '#10B981' : 'var(--shop-ink)' }}>
                      {o.price === 0 ? 'ฟรี' : `฿${o.price}`}
                    </span>
                  </label>
                ))}
              </div>
            </section>

            {/* Payment */}
            <section className="bk-checkout-section" aria-labelledby="pay-h">
              <h4 id="pay-h"><span style={{ background: 'var(--bikini-grad-coral)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>3.</span> ชำระเงิน</h4>
              <div role="radiogroup" aria-label="Payment method">
                {paymentMethods.map((o) => (
                  <label
                    key={o.value}
                    className={`bk-radio${o.value === selectedPayment ? ' selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={o.value}
                      checked={o.value === selectedPayment}
                      onChange={() => onSelectPayment?.(o.value)}
                      style={{ width: 18, height: 18, accentColor: 'var(--shop-primary)' }}
                    />
                    {o.icon}
                    <div style={{ flex: 1 }}>
                      <div className="name">{o.label}</div>
                      <div className="desc">{o.description}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div style={{ marginTop: 18, padding: 14, background: 'var(--bikini-sky-pale)', borderRadius: 12, display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 12 }}>
                <IconShieldCheck size={20} color="var(--shop-primary)" style={{ flexShrink: 0 }} />
                <div>
                  <b style={{ display: 'block', marginBottom: 2 }}>การชำระเงินปลอดภัย 100%</b>
                  <span style={{ color: 'var(--bikini-text-2)' }}>เข้ารหัส SSL · ผ่านมาตรฐาน PCI-DSS · ไม่เก็บข้อมูลบัตรในระบบ</span>
                </div>
              </div>
            </section>
          </div>

          {/* SUMMARY */}
          <aside className="bk-summary" aria-label="Order summary">
            <h4>สรุปคำสั่งซื้อ</h4>

            {items.map((it) => (
              <div key={it.id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--bikini-line)' }}>
                <div style={{ width: 60, aspectRatio: '4/5', borderRadius: 10, padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'var(--bikini-bg-rose)' }} className={it.bgVariant ?? ''}>
                  {it.illustration}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 2 }}>{it.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--bikini-muted)', marginBottom: 4 }}>{it.variant}</div>
                  <div style={{ fontSize: 12, fontWeight: 800 }}>{it.qty} × ฿{it.price.toLocaleString()}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--shop-primary)' }}>฿{(it.price * it.qty).toLocaleString()}</div>
              </div>
            ))}

            <div style={{ marginTop: 14 }}>
              <div className="bk-summary-row"><span>Subtotal</span><span>฿{sub.toLocaleString()}</span></div>
              {promoAmount > 0 && <div className="bk-summary-row discount"><span>โค้ด {promoCode}</span><span>− ฿{promoAmount}</span></div>}
              <div className="bk-summary-row">
                <span>ค่าจัดส่ง</span>
                <span style={shippingPrice === 0 ? { color: '#10B981', fontWeight: 800 } : undefined}>{shippingPrice === 0 ? 'ฟรี' : `฿${shippingPrice}`}</span>
              </div>
              <div className="bk-summary-row total">
                <span>รวม</span>
                <span className="amount">฿{total.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="button"
              className="bk-btn bk-btn-primary bk-btn-lg bk-btn-block"
              style={{ marginTop: 18 }}
              onClick={() => onSubmitStep?.('payment', { shipping: selectedShipping, payment: selectedPayment, total })}
            >
              <IconLock size={16} /> ยืนยันคำสั่งซื้อ · ฿{total.toLocaleString()}
            </button>

            <p style={{ marginTop: 12, fontSize: 11, color: 'var(--bikini-muted)', textAlign: 'center', fontWeight: 600 }}>
              กดแล้วถือว่ายอมรับ <a href={termsUrl} style={{ color: 'var(--shop-primary)' }}>เงื่อนไขการใช้บริการ</a>
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Checkout;
