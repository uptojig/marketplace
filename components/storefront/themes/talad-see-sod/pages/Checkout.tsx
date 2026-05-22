'use client';

/**
 * talad-see-sod — Bespoke checkout page
 *
 * Single-page 4-step checkout (ตะกร้า → ที่อยู่ → ชำระเงิน → ยืนยัน) that
 * replaces the generic shadcn-studio `checkout-page-04` (hardcoded
 * English/USD/mock iPhone+HomePod that ignores all props). Reads real
 * cart state from the zustand store, displays Thai copy and ฿ amounts,
 * and posts to /api/checkout — the same endpoint the standard
 * multi-route flow uses — so order creation behaves identically.
 *
 * Palette: Talad red/cream (#dc2626 / #fff7ed / #fdba74) hardcoded
 * in JSX so the checkout matches the rest of the Talad chrome.
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, MapPin, CreditCard, Check, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import type { CheckoutProps } from '@/lib/templates/types';

type StepId = 'cart' | 'address' | 'payment' | 'confirm';
interface StepDef {
  id: StepId;
  title: string;
  icon: typeof ShoppingCart;
}
const STEPS: StepDef[] = [
  { id: 'cart', title: 'ตะกร้า', icon: ShoppingCart },
  { id: 'address', title: 'ที่อยู่จัดส่ง', icon: MapPin },
  { id: 'payment', title: 'ชำระเงิน', icon: CreditCard },
  { id: 'confirm', title: 'ยืนยันออเดอร์', icon: Check },
];

const SHIPPING_OPTIONS = [
  { id: 'EMS', name: 'EMS', priceTHB: 50, eta: '1-2 วัน' },
  { id: 'REGISTERED', name: 'ลงทะเบียนไปรษณีย์ไทย', priceTHB: 30, eta: '3-5 วัน' },
];
const PAYMENT_OPTIONS = [{ id: 'ANYPAY', name: 'ชำระผ่าน AnyPay' }];

const FREE_SHIPPING_THRESHOLD = 590;

export function TaladSeeSodCheckout({ store }: CheckoutProps) {
  // `linesForStore` returns a fresh `.filter()` array on every call,
  // which fails zustand's `===` selector identity check and triggers
  // an infinite re-render loop (the checkout route then explodes
  // with "เกิดข้อผิดพลาดบางอย่าง"). Read the raw `lines` array — that
  // reference is stable until the store actually mutates — and
  // derive the per-store slice via useMemo.
  const allLines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const clearStore = useCart((s) => s.clearStore);
  const allCodes = useCart((s) => s.couponCodesByStore);
  const lines = useMemo(
    () => allLines.filter((l) => l.storeSlug === store.slug),
    [allLines, store.slug],
  );
  const subtotal = useMemo(
    () => lines.reduce((n, l) => n + l.priceTHB * l.qty, 0),
    [lines],
  );
  const couponCodes = useMemo(
    () => allCodes[store.slug] ?? [],
    [allCodes, store.slug],
  );

  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = STEPS[stepIndex].id;

  const [address, setAddress] = useState({
    recipientName: '',
    phone: '',
    line1: '',
    line2: '',
    subdistrict: '',
    district: '',
    province: '',
    postalCode: '',
  });
  const [shippingId, setShippingId] = useState(SHIPPING_OPTIONS[0].id);
  const [paymentId] = useState(PAYMENT_OPTIONS[0].id);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedOrderId, setSubmittedOrderId] = useState<string | null>(null);

  const shipping = useMemo(
    () => SHIPPING_OPTIONS.find((s) => s.id === shippingId) ?? SHIPPING_OPTIONS[0],
    [shippingId],
  );
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : shipping.priceTHB;
  const total = subtotal + shippingCost;

  const canAdvanceFromAddress =
    address.recipientName.trim().length > 0 &&
    address.phone.trim().length > 0 &&
    address.line1.trim().length > 0 &&
    address.province.trim().length > 0 &&
    address.postalCode.trim().length === 5;

  const goNext = () => setStepIndex((i) => Math.min(STEPS.length - 1, i + 1));
  const goBack = () => setStepIndex((i) => Math.max(0, i - 1));

  async function placeOrder() {
    if (lines.length === 0) {
      setError('ตะกร้าว่าง ไม่สามารถสั่งซื้อได้');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          storeSlug: store.slug,
          items: lines.map((l) => ({ productId: l.productId, qty: l.qty })),
          address: {
            recipientName: address.recipientName,
            phone: address.phone,
            line1: address.line1,
            line2: address.line2,
            subdistrict: address.subdistrict,
            district: address.district,
            province: address.province,
            postalCode: address.postalCode,
            country: 'TH',
          },
          shipping: { method: shipping.id, priceTHB: shippingCost },
          payment: { method: paymentId },
          couponCodes,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `สั่งซื้อไม่สำเร็จ (${res.status})`);
      }
      const data = (await res.json()) as { orderId?: string };
      clearStore(store.slug);
      setSubmittedOrderId(data.orderId ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถสร้างออเดอร์ได้');
      setSubmitting(false);
    }
  }

  if (submittedOrderId !== null) {
    return (
      <main className="bg-[#fff7ed] text-[#7f1d1d] min-h-screen">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#dc2626] text-white mb-6 shadow-lg">
            <Check className="h-8 w-8" />
          </div>
          <h1 className="font-[family:var(--font-kanit)] font-black text-3xl text-[#dc2626] uppercase">
            สั่งซื้อสำเร็จ
          </h1>
          {submittedOrderId && (
            <p className="mt-4 text-sm text-[#7f1d1d]">
              รหัสออเดอร์: <span className="font-bold">{submittedOrderId}</span>
            </p>
          )}
          <p className="mt-2 text-sm text-[#9a3412]">
            เราจะส่งรายละเอียดและช่องทางชำระเงินไปยังอีเมล/เบอร์ที่ลงไว้
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href={`/stores/${store.slug}`}
              className="inline-flex items-center gap-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-[family:var(--font-kanit)] font-black px-6 py-3 shadow-md transition-colors"
            >
              เลือกซื้อสินค้าต่อ
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#fff7ed] text-[#7f1d1d] min-h-screen py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Stepper */}
        <nav aria-label="ขั้นตอนสั่งซื้อ" className="mb-8">
          <ol className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = idx === stepIndex;
              const isDone = idx < stepIndex;
              return (
                <li key={step.id} className="flex items-center gap-2 sm:gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center border-2 transition-colors ${
                      isActive
                        ? 'bg-[#dc2626] text-white border-[#dc2626] shadow-md'
                        : isDone
                          ? 'bg-[#dc2626] text-white border-[#dc2626] opacity-70'
                          : 'bg-white text-[#9a3412] border-[#fdba74]'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span
                    className={`font-[family:var(--font-kanit)] font-black text-xs sm:text-sm uppercase tracking-wider ${
                      isActive ? 'text-[#dc2626]' : 'text-[#9a3412]'
                    }`}
                  >
                    {step.title}
                  </span>
                  {idx < STEPS.length - 1 && (
                    <span className="hidden sm:inline text-[#fdba74]">/</span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main step content */}
          <div className="lg:col-span-2 bg-white border border-[#fdba74] p-6 shadow-sm">
            {currentStep === 'cart' && (
              <CartStep
                lines={lines}
                onQtyChange={(productId, qty) => setQty(productId, qty, store.slug)}
                onRemove={(productId) => remove(productId, store.slug)}
                storeSlug={store.slug}
              />
            )}
            {currentStep === 'address' && (
              <AddressStep address={address} setAddress={setAddress} />
            )}
            {currentStep === 'payment' && (
              <PaymentStep
                shippingId={shippingId}
                setShippingId={setShippingId}
                paymentName={PAYMENT_OPTIONS[0].name}
              />
            )}
            {currentStep === 'confirm' && (
              <ConfirmStep
                lines={lines}
                address={address}
                shipping={shipping}
                shippingCost={shippingCost}
                total={total}
                error={error}
              />
            )}
          </div>

          {/* Right summary panel */}
          <aside className="bg-white border border-[#fdba74] p-6 shadow-sm h-fit space-y-4">
            <h3 className="font-[family:var(--font-kanit)] font-black text-lg text-[#dc2626] border-b border-[#fdba74] pb-3">
              สรุปคำสั่งซื้อ
            </h3>
            <div className="flex justify-between text-sm">
              <span className="text-[#7f1d1d]">สินค้า {lines.length} รายการ</span>
              <span className="font-bold text-[#7f1d1d]">{formatTHB(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#7f1d1d]">ค่าจัดส่ง</span>
              <span className="font-bold text-[#7f1d1d]">
                {shippingCost === 0 ? 'ฟรี!' : formatTHB(shippingCost)}
              </span>
            </div>
            {subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD && (
              <p className="text-xs text-[#9a3412] bg-orange-50 px-3 py-2 border border-[#fdba74]">
                ซื้ออีก {formatTHB(FREE_SHIPPING_THRESHOLD - subtotal)} รับส่งฟรี!
              </p>
            )}
            <div className="border-t border-[#fdba74] pt-3 flex justify-between">
              <span className="font-[family:var(--font-kanit)] font-black text-[#7f1d1d]">รวมทั้งสิ้น</span>
              <span className="font-[family:var(--font-kanit)] font-black text-xl text-[#dc2626]">
                {formatTHB(total)}
              </span>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              {currentStep !== 'confirm' ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={
                    (currentStep === 'cart' && lines.length === 0) ||
                    (currentStep === 'address' && !canAdvanceFromAddress)
                  }
                  className="w-full bg-[#dc2626] hover:bg-[#b91c1c] disabled:opacity-40 disabled:cursor-not-allowed text-white font-[family:var(--font-kanit)] font-black py-3 shadow-md uppercase tracking-wider transition-colors"
                >
                  ดำเนินการต่อ →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={placeOrder}
                  disabled={submitting || lines.length === 0}
                  className="w-full bg-[#dc2626] hover:bg-[#b91c1c] disabled:opacity-40 disabled:cursor-not-allowed text-white font-[family:var(--font-kanit)] font-black py-3 shadow-md uppercase tracking-wider transition-colors"
                >
                  {submitting ? 'กำลังสั่งซื้อ...' : 'ยืนยันสั่งซื้อ'}
                </button>
              )}
              {stepIndex > 0 && !submitting && (
                <button
                  type="button"
                  onClick={goBack}
                  className="w-full bg-white border-2 border-[#dc2626] text-[#dc2626] hover:bg-[#fff7ed] font-[family:var(--font-kanit)] font-black py-2.5 uppercase tracking-wider text-xs transition-colors"
                >
                  ← ย้อนกลับ
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

interface Line {
  productId: string;
  title: string;
  imageUrl?: string;
  priceTHB: number;
  qty: number;
}

function CartStep({
  lines,
  onQtyChange,
  onRemove,
  storeSlug,
}: {
  lines: Line[];
  onQtyChange: (productId: string, qty: number) => void;
  onRemove: (productId: string) => void;
  storeSlug: string;
}) {
  if (lines.length === 0) {
    return (
      <div className="py-16 text-center">
        <ShoppingCart className="mx-auto h-12 w-12 text-[#fdba74] mb-4" />
        <p className="font-[family:var(--font-kanit)] font-black text-lg text-[#7f1d1d]">
          ตะกร้าว่างเปล่า
        </p>
        <p className="mt-2 text-sm text-[#9a3412]">เพิ่มสินค้าก่อนเริ่มสั่งซื้อ</p>
        <Link
          href={`/stores/${storeSlug}`}
          className="mt-6 inline-flex items-center gap-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-[family:var(--font-kanit)] font-black px-6 py-2.5 shadow transition-colors"
        >
          เลือกซื้อสินค้า
        </Link>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <h2 className="font-[family:var(--font-kanit)] font-black text-xl text-[#dc2626]">
        ตะกร้าของคุณ ({lines.length} รายการ)
      </h2>
      <ul className="divide-y divide-[#fdba74]/60">
        {lines.map((l) => (
          <li key={l.productId} className="flex gap-4 py-4">
            <div className="h-20 w-20 bg-orange-50 border border-[#fdba74] flex-shrink-0 overflow-hidden">
              {l.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={l.imageUrl} alt={l.title} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-[#7f1d1d] line-clamp-2">{l.title}</p>
              <p className="mt-1 font-[family:var(--font-prompt)] font-extrabold text-[#dc2626]">
                {formatTHB(l.priceTHB)}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <div className="inline-flex items-center border border-[#fdba74]">
                  <button
                    type="button"
                    onClick={() => onQtyChange(l.productId, Math.max(1, l.qty - 1))}
                    className="px-2 py-1 hover:bg-[#fff7ed] text-[#dc2626]"
                    aria-label="ลดจำนวน"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="px-3 py-1 font-bold text-sm text-[#7f1d1d] min-w-[2.5rem] text-center">
                    {l.qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => onQtyChange(l.productId, l.qty + 1)}
                    className="px-2 py-1 hover:bg-[#fff7ed] text-[#dc2626]"
                    aria-label="เพิ่มจำนวน"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(l.productId)}
                  className="text-xs text-[#9a3412] hover:text-[#dc2626] inline-flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" /> ลบ
                </button>
              </div>
            </div>
            <div className="text-right">
              <p className="font-[family:var(--font-kanit)] font-black text-[#7f1d1d]">
                {formatTHB(l.priceTHB * l.qty)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AddressStep({
  address,
  setAddress,
}: {
  address: {
    recipientName: string;
    phone: string;
    line1: string;
    line2: string;
    subdistrict: string;
    district: string;
    province: string;
    postalCode: string;
  };
  setAddress: (a: typeof address) => void;
}) {
  const onChange =
    (key: keyof typeof address) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setAddress({ ...address, [key]: e.target.value });
    };
  const fieldClass =
    'w-full border-2 border-[#fdba74] px-3 py-2 text-sm focus:outline-none focus:border-[#dc2626] bg-white';
  return (
    <div className="space-y-4">
      <h2 className="font-[family:var(--font-kanit)] font-black text-xl text-[#dc2626]">
        ที่อยู่จัดส่ง
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="space-y-1">
          <span className="text-xs font-bold text-[#7f1d1d] uppercase">ชื่อผู้รับ *</span>
          <input
            type="text"
            value={address.recipientName}
            onChange={onChange('recipientName')}
            className={fieldClass}
            placeholder="ชื่อ - นามสกุล"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-bold text-[#7f1d1d] uppercase">เบอร์โทร *</span>
          <input
            type="tel"
            value={address.phone}
            onChange={onChange('phone')}
            className={fieldClass}
            placeholder="0xx-xxx-xxxx"
          />
        </label>
        <label className="space-y-1 sm:col-span-2">
          <span className="text-xs font-bold text-[#7f1d1d] uppercase">ที่อยู่ *</span>
          <input
            type="text"
            value={address.line1}
            onChange={onChange('line1')}
            className={fieldClass}
            placeholder="บ้านเลขที่ ถนน อาคาร"
          />
        </label>
        <label className="space-y-1 sm:col-span-2">
          <span className="text-xs font-bold text-[#7f1d1d] uppercase">ที่อยู่เพิ่มเติม</span>
          <input
            type="text"
            value={address.line2}
            onChange={onChange('line2')}
            className={fieldClass}
            placeholder="หมู่บ้าน คอนโด ห้อง"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-bold text-[#7f1d1d] uppercase">แขวง/ตำบล</span>
          <input
            type="text"
            value={address.subdistrict}
            onChange={onChange('subdistrict')}
            className={fieldClass}
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-bold text-[#7f1d1d] uppercase">เขต/อำเภอ</span>
          <input
            type="text"
            value={address.district}
            onChange={onChange('district')}
            className={fieldClass}
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-bold text-[#7f1d1d] uppercase">จังหวัด *</span>
          <input
            type="text"
            value={address.province}
            onChange={onChange('province')}
            className={fieldClass}
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-bold text-[#7f1d1d] uppercase">รหัสไปรษณีย์ *</span>
          <input
            type="text"
            value={address.postalCode}
            onChange={onChange('postalCode')}
            className={fieldClass}
            placeholder="5 หลัก"
            maxLength={5}
            inputMode="numeric"
          />
        </label>
      </div>
    </div>
  );
}

function PaymentStep({
  shippingId,
  setShippingId,
  paymentName,
}: {
  shippingId: string;
  setShippingId: (id: string) => void;
  paymentName: string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family:var(--font-kanit)] font-black text-xl text-[#dc2626] mb-3">
          วิธีจัดส่ง
        </h2>
        <div className="space-y-2">
          {SHIPPING_OPTIONS.map((opt) => {
            const active = opt.id === shippingId;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setShippingId(opt.id)}
                className={`w-full text-left border-2 px-4 py-3 transition-colors flex items-center justify-between ${
                  active
                    ? 'border-[#dc2626] bg-[#fff7ed]'
                    : 'border-[#fdba74] bg-white hover:bg-[#fff7ed]'
                }`}
              >
                <div>
                  <p className="font-[family:var(--font-kanit)] font-black text-sm text-[#7f1d1d]">
                    {opt.name}
                  </p>
                  <p className="text-xs text-[#9a3412]">ระยะเวลา {opt.eta}</p>
                </div>
                <span className="font-[family:var(--font-prompt)] font-extrabold text-[#dc2626]">
                  {formatTHB(opt.priceTHB)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <h2 className="font-[family:var(--font-kanit)] font-black text-xl text-[#dc2626] mb-3">
          วิธีชำระเงิน
        </h2>
        <div className="border-2 border-[#dc2626] bg-[#fff7ed] px-4 py-3">
          <p className="font-[family:var(--font-kanit)] font-black text-sm text-[#7f1d1d]">
            {paymentName}
          </p>
          <p className="text-xs text-[#9a3412] mt-1">PromptPay · บัตรเครดิต · BNPL</p>
        </div>
      </div>
    </div>
  );
}

function ConfirmStep({
  lines,
  address,
  shipping,
  shippingCost,
  total,
  error,
}: {
  lines: Line[];
  address: {
    recipientName: string;
    phone: string;
    line1: string;
    province: string;
    postalCode: string;
  };
  shipping: { name: string; eta: string };
  shippingCost: number;
  total: number;
  error: string | null;
}) {
  return (
    <div className="space-y-4">
      <h2 className="font-[family:var(--font-kanit)] font-black text-xl text-[#dc2626]">
        ตรวจสอบและยืนยัน
      </h2>
      <section className="border border-[#fdba74] p-4 bg-[#fff7ed]/40 space-y-1 text-sm">
        <p className="font-bold text-[#dc2626]">ผู้รับ</p>
        <p className="text-[#7f1d1d]">
          {address.recipientName} · {address.phone}
        </p>
        <p className="text-[#9a3412]">
          {address.line1} {address.province} {address.postalCode}
        </p>
      </section>
      <section className="border border-[#fdba74] p-4 bg-[#fff7ed]/40 text-sm">
        <p className="font-bold text-[#dc2626]">วิธีจัดส่ง</p>
        <p className="text-[#7f1d1d]">
          {shipping.name} ({shipping.eta}) · {shippingCost === 0 ? 'ฟรี' : formatTHB(shippingCost)}
        </p>
      </section>
      <section className="border border-[#fdba74] p-4 bg-[#fff7ed]/40 text-sm">
        <p className="font-bold text-[#dc2626] mb-2">รายการสินค้า ({lines.length})</p>
        <ul className="space-y-1">
          {lines.map((l) => (
            <li key={l.productId} className="flex justify-between">
              <span className="text-[#7f1d1d] line-clamp-1 mr-2">
                {l.title} × {l.qty}
              </span>
              <span className="font-bold text-[#7f1d1d] shrink-0">
                {formatTHB(l.priceTHB * l.qty)}
              </span>
            </li>
          ))}
        </ul>
      </section>
      <p className="text-right font-[family:var(--font-kanit)] font-black text-lg text-[#dc2626]">
        รวม {formatTHB(total)}
      </p>
      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-300 px-3 py-2">{error}</p>
      )}
    </div>
  );
}

export default TaladSeeSodCheckout;
