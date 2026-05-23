'use client';

/**
 * Thai Checkout adapter — reusable Thai/THB 4-step checkout page
 * generator extracted from the bespoke per-store checkout flow at
 * `app/stores/[slug]/checkout/{address,confirm}/*-client.tsx`.
 *
 * Why this exists
 * ---------------
 * Themes that registered
 *   `export const CheckoutPage = makeCheckoutAdapter('XX');`
 * fall through to shadcn-studio's checkout-page blocks (01 / 02 /
 * 04). Those are English / USD demo pages — no real cart, no real
 * shipping calc, no POST to `/api/checkout`. A live storefront
 * pointed at them shows a checkout that simply doesn't work.
 *
 * `makeThaiCheckoutAdapter()` replaces that with a single-page Thai
 * checkout that:
 *
 *   1. Reads the per-store filtered slice of the zustand `useCart`
 *      store as the live order.
 *   2. Walks the buyer through 4 steps in one route:
 *        cart → address → payment → confirm
 *      The stepper is purely visual — all four sections render on
 *      one page so the buyer never bounces to a different URL.
 *   3. Lets the buyer enter their own shipping address inline (no
 *      address book lookup — fully guest-friendly).
 *   4. Picks shipping (EMS / REGISTERED defaults — overridable) and
 *      payment method.
 *   5. POSTs to `/api/checkout` and on success calls
 *      `clearStore(slug)` on the zustand cart + shows the success
 *      panel with the orderRef.
 *
 * Templates that want the multi-route address → confirm flow that
 * lives under `app/stores/[slug]/checkout/{address,confirm}/` should
 * NOT register `pages.checkout` — the per-store layout will redirect
 * to `/stores/[slug]/checkout/address` automatically.
 *
 * Templates that DO register a `pages.checkout` (either this adapter
 * or a bespoke one) get the entry route `/stores/[slug]/checkout`
 * rendering inline instead of redirecting.
 *
 * Theming
 * -------
 * Same `BlockPalette` shape as `thai-cart-adapter.tsx`. All surface
 * colors default to the `var(--shop-*)` cascade the storefront
 * layout already seeds.
 *
 * Logic intentionally NOT carried over
 * -------------------------------------
 *   - Saved address book lookup (`/api/addresses` round-trip + the
 *     "ที่อยู่หลัก" badge). Generic checkout assumes one-shot guest
 *     entry; templates that need the full address book should stay
 *     on the default multi-route flow.
 *   - Family-specific eyebrow chrome (Trust maison serif, BM ledger
 *     header, electronics-tech mono SKU, etc.).
 *   - Breadcrumbs widget — out of scope; the stepper carries the
 *     same orientation signal.
 */

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  CreditCard,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Truck,
} from 'lucide-react';

import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import type { BlockPalette } from './thai-cart-adapter';

/* ──────────────────────────────────────────────────────────────
 * Public types
 * ────────────────────────────────────────────────────────────── */

export type { BlockPalette };

export interface ShippingOption {
  id: string;
  /** Display name (Thai). */
  name: string;
  /** Flat price in THB; ignored when `subtotal >= freeShippingThreshold`. */
  priceTHB: number;
  /** Optional helper text, e.g. "1-2 วัน". */
  eta?: string;
}

export interface PaymentOption {
  id: string;
  /** Display name (Thai). */
  name: string;
}

export interface ThaiCheckoutConfig {
  /** Per-theme palette tokens — defaults all resolve to `var(--shop-*)`. */
  palette?: BlockPalette;
  /** Free-shipping minimum subtotal in THB. Default 990. */
  freeShippingThreshold?: number;
  /** Step labels — keep them short to fit the stepper. */
  stepLabels?: {
    cart?: string;
    address?: string;
    payment?: string;
    confirm?: string;
  };
  /** Available shipping methods. Defaults: EMS (50฿, 1-2 วัน) + REGISTERED (30฿, 3-5 วัน). */
  shippingOptions?: ShippingOption[];
  /** Available payment methods. Default: AnyPay only (covers PromptPay, card, BNPL). */
  paymentOptions?: PaymentOption[];
  /** Page heading. Default "ชำระเงิน". */
  heading?: string;
  /** Submit CTA label on the confirm step. Default "ยืนยันคำสั่งซื้อ". */
  submitCtaLabel?: string;
  /** Show "ส่งฟรี" badge on the shipping option row when subtotal qualifies. Default true. */
  highlightFreeShipping?: boolean;
}

/* ──────────────────────────────────────────────────────────────
 * Internal helpers
 * ────────────────────────────────────────────────────────────── */

interface ResolvedPalette {
  background: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  ink: string;
  inkMuted: string;
  primary: string;
  accent: string;
  primaryFg: string;
}

function resolvePalette(p?: BlockPalette): ResolvedPalette {
  return {
    background: p?.background ?? 'var(--shop-bg)',
    surface: p?.surface ?? 'var(--shop-card)',
    surfaceMuted: p?.surfaceMuted ?? 'var(--shop-muted)',
    border: p?.border ?? 'var(--shop-border)',
    ink: p?.ink ?? 'var(--shop-ink)',
    inkMuted: p?.inkMuted ?? 'var(--shop-ink-muted)',
    primary: p?.primary ?? 'var(--shop-primary)',
    accent: p?.accent ?? 'var(--shop-accent)',
    primaryFg: p?.primaryFg ?? '#ffffff',
  };
}

const DEFAULT_SHIPPING: ShippingOption[] = [
  { id: 'EMS', name: 'EMS', priceTHB: 50, eta: '1-2 วัน' },
  { id: 'REGISTERED', name: 'ลงทะเบียนไปรษณีย์ไทย', priceTHB: 30, eta: '3-5 วัน' },
];

const DEFAULT_PAYMENT: PaymentOption[] = [
  { id: 'ANYPAY', name: 'ชำระผ่าน AnyPay (PromptPay / บัตรเครดิต)' },
];

/* ──────────────────────────────────────────────────────────────
 * Form types
 * ────────────────────────────────────────────────────────────── */

interface AddressForm {
  recipientName: string;
  phone: string;
  line1: string;
  line2: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
  country: string;
}

const EMPTY_ADDRESS: AddressForm = {
  recipientName: '',
  phone: '',
  line1: '',
  line2: '',
  subdistrict: '',
  district: '',
  province: '',
  postalCode: '',
  country: 'TH',
};

interface ThaiCheckoutStoreProp {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
}

/* ──────────────────────────────────────────────────────────────
 * Public factory
 * ────────────────────────────────────────────────────────────── */

export function makeThaiCheckoutAdapter(config: ThaiCheckoutConfig = {}) {
  const palette = resolvePalette(config.palette);
  const threshold = config.freeShippingThreshold ?? 990;
  const heading = config.heading ?? 'ชำระเงิน';
  const submitLabel = config.submitCtaLabel ?? 'ยืนยันคำสั่งซื้อ';
  const stepLabels = {
    cart: config.stepLabels?.cart ?? 'ตะกร้า',
    address: config.stepLabels?.address ?? 'ที่อยู่จัดส่ง',
    payment: config.stepLabels?.payment ?? 'การชำระเงิน',
    confirm: config.stepLabels?.confirm ?? 'ยืนยัน',
  };
  const shippingOptions = config.shippingOptions ?? DEFAULT_SHIPPING;
  const paymentOptions = config.paymentOptions ?? DEFAULT_PAYMENT;
  const highlightFree = config.highlightFreeShipping ?? true;

  return function ThaiCheckoutPage({ store }: { store: ThaiCheckoutStoreProp }) {
    const allLines = useCart((s) => s.lines);
    const clearStore = useCart((s) => s.clearStore);

    const lines = useMemo(
      () => allLines.filter((l) => l.storeSlug === store.slug),
      [allLines, store.slug],
    );
    const subtotal = lines.reduce((acc, l) => acc + l.priceTHB * l.qty, 0);
    const itemCount = lines.reduce((acc, l) => acc + l.qty, 0);

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    /* Step model — 1: cart review, 2: address, 3: payment, 4: confirm */
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
    const [address, setAddress] = useState<AddressForm>(EMPTY_ADDRESS);
    const [shipping, setShipping] = useState<ShippingOption>(shippingOptions[0]);
    const [payment, setPayment] = useState<PaymentOption>(paymentOptions[0]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [orderRef, setOrderRef] = useState<string | null>(null);

    const effectiveShipping = subtotal >= threshold ? 0 : shipping.priceTHB;
    const total = subtotal + effectiveShipping;

    function updateField<K extends keyof AddressForm>(key: K) {
      return (e: React.ChangeEvent<HTMLInputElement>) =>
        setAddress((a) => ({ ...a, [key]: e.target.value }));
    }

    function nextFromCart() {
      if (lines.length === 0) return;
      setStep(2);
    }

    function nextFromAddress() {
      // Minimal Thai-form validation — required fields per /api/checkout
      // contract. Optional fields stay optional.
      const required: (keyof AddressForm)[] = [
        'recipientName',
        'phone',
        'line1',
        'province',
        'postalCode',
      ];
      const missing = required.find((k) => !address[k].trim());
      if (missing) {
        setError('กรุณากรอกข้อมูลที่อยู่จัดส่งให้ครบ');
        return;
      }
      setError(null);
      setStep(3);
    }

    function nextFromPayment() {
      setStep(4);
    }

    async function placeOrder() {
      if (lines.length === 0) return;
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
              country: address.country || 'TH',
            },
            shipping: { method: shipping.id, priceTHB: effectiveShipping },
            payment: { method: payment.id },
          }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error ?? `Checkout failed (${res.status})`);
        }
        const data = (await res.json()) as { orderId?: string; orderRef?: string };
        clearStore(store.slug);
        setOrderRef(data.orderRef ?? data.orderId ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'ไม่สามารถสร้างออเดอร์ได้');
      } finally {
        setSubmitting(false);
      }
    }

    /* ── Loading skeleton (avoid hydration mismatch) ── */
    if (!mounted) {
      return (
        <div
          className="min-h-screen"
          style={{ background: palette.background }}
        />
      );
    }

    /* ── Success state ── */
    if (orderRef !== null) {
      return (
        <div className="min-h-screen" style={{ background: palette.background }}>
          <main className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-20 text-center">
            <div
              className="inline-flex h-16 w-16 items-center justify-center rounded-full mb-4 mx-auto"
              style={{
                background: `color-mix(in srgb, ${palette.primary} 14%, transparent)`,
                color: palette.primary,
              }}
            >
              <Check className="h-8 w-8" />
            </div>
            <h1
              className="text-2xl md:text-3xl font-bold"
              style={{ color: palette.ink }}
            >
              สั่งซื้อสำเร็จ
            </h1>
            <p
              className="mt-2 text-sm"
              style={{ color: palette.inkMuted }}
            >
              ออเดอร์ของคุณถูกบันทึกแล้ว ระบบจะส่งรายละเอียดการชำระเงินไปทางอีเมล
              หรือเข้าสู่ระบบเพื่อชำระเงินภายหลังในหน้าคำสั่งซื้อ
            </p>
            {orderRef && (
              <p
                className="mt-3 text-xs font-mono"
                style={{ color: palette.inkMuted }}
              >
                เลขที่ออเดอร์: {orderRef}
              </p>
            )}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button
                asChild
                className="rounded-md px-6 py-2.5 text-sm font-medium"
                style={{ background: palette.primary, color: palette.primaryFg }}
              >
                <Link href={`/stores/${store.slug}/category`}>เลือกซื้อสินค้าต่อ</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-md px-6 py-2.5 text-sm font-medium"
                style={{ color: palette.ink, borderColor: palette.border }}
              >
                <Link href={`/stores/${store.slug}`}>กลับหน้าร้าน</Link>
              </Button>
            </div>
          </main>
        </div>
      );
    }

    /* ── Empty cart ── */
    if (lines.length === 0) {
      return (
        <div className="min-h-screen" style={{ background: palette.background }}>
          <main className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-20 text-center">
            <div
              className="inline-flex h-16 w-16 items-center justify-center rounded-full mb-4 mx-auto"
              style={{
                background: `color-mix(in srgb, ${palette.primary} 12%, transparent)`,
                color: palette.primary,
              }}
            >
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h1
              className="text-2xl font-bold"
              style={{ color: palette.ink }}
            >
              ตะกร้าว่าง
            </h1>
            <p className="mt-2 text-sm" style={{ color: palette.inkMuted }}>
              ยังไม่มีสินค้าในตะกร้า เริ่มเลือกสินค้าได้เลย
            </p>
            <Button
              asChild
              className="mt-6 rounded-md px-6 py-2.5 text-sm font-medium"
              style={{ background: palette.primary, color: palette.primaryFg }}
            >
              <Link href={`/stores/${store.slug}/category`}>เลือกซื้อสินค้า</Link>
            </Button>
          </main>
        </div>
      );
    }

    return (
      <div className="min-h-screen" style={{ background: palette.background }}>
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24 pt-10 sm:pt-14">
          <h1
            className="text-3xl md:text-4xl font-bold tracking-tight mb-6"
            style={{ color: palette.ink }}
          >
            {heading}
          </h1>

          <CheckoutStepper
            current={step}
            palette={palette}
            labels={stepLabels}
            onStepClick={(s) => {
              if (s < step) setStep(s);
            }}
          />

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
            {/* ── Main column — step-specific body ─────────────── */}
            <section className="space-y-4">
              {step === 1 && (
                <CartReviewStep
                  storeSlug={store.slug}
                  lines={lines}
                  palette={palette}
                  onNext={nextFromCart}
                  itemCount={itemCount}
                  storeName={store.name}
                />
              )}

              {step === 2 && (
                <AddressStep
                  palette={palette}
                  address={address}
                  updateField={updateField}
                  onBack={() => setStep(1)}
                  onNext={nextFromAddress}
                  error={error}
                />
              )}

              {step === 3 && (
                <PaymentStep
                  palette={palette}
                  shippingOptions={shippingOptions}
                  paymentOptions={paymentOptions}
                  shipping={shipping}
                  setShipping={setShipping}
                  payment={payment}
                  setPayment={setPayment}
                  highlightFree={highlightFree && subtotal >= threshold}
                  onBack={() => setStep(2)}
                  onNext={nextFromPayment}
                />
              )}

              {step === 4 && (
                <ConfirmStep
                  palette={palette}
                  address={address}
                  shipping={shipping}
                  payment={payment}
                  effectiveShipping={effectiveShipping}
                  subtotal={subtotal}
                  total={total}
                  submitting={submitting}
                  submitLabel={submitLabel}
                  error={error}
                  onBack={() => setStep(3)}
                  onSubmit={placeOrder}
                  onEditAddress={() => setStep(2)}
                  onEditShipping={() => setStep(3)}
                />
              )}
            </section>

            {/* ── Sticky order summary ─────────────────────────── */}
            <aside className="lg:sticky lg:top-24">
              <OrderSummaryCard
                palette={palette}
                lines={lines}
                subtotal={subtotal}
                shipping={effectiveShipping}
                total={total}
                threshold={threshold}
              />
            </aside>
          </div>
        </main>
      </div>
    );
  };
}

/* ──────────────────────────────────────────────────────────────
 * Stepper
 * ────────────────────────────────────────────────────────────── */

function CheckoutStepper({
  current,
  palette,
  labels,
  onStepClick,
}: {
  current: 1 | 2 | 3 | 4;
  palette: ResolvedPalette;
  labels: { cart: string; address: string; payment: string; confirm: string };
  onStepClick: (s: 1 | 2 | 3 | 4) => void;
}) {
  const steps = [
    { id: 1 as const, label: labels.cart },
    { id: 2 as const, label: labels.address },
    { id: 3 as const, label: labels.payment },
    { id: 4 as const, label: labels.confirm },
  ];

  return (
    <nav aria-label="ขั้นตอนการชำระเงิน">
      <ol className="flex items-center gap-2 sm:gap-4">
        {steps.map((s, i) => {
          const completed = current > s.id;
          const active = current === s.id;
          const clickable = completed;
          const Body = (
            <span className="inline-flex items-center gap-2">
              <span
                className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border-2 transition-colors"
                style={{
                  borderColor: completed || active ? palette.primary : palette.border,
                  background: completed ? palette.primary : 'transparent',
                  color: completed
                    ? palette.primaryFg
                    : active
                    ? palette.primary
                    : palette.inkMuted,
                }}
              >
                {completed ? <Check className="h-3.5 w-3.5" /> : s.id}
              </span>
              <span
                className="hidden sm:inline text-sm font-medium"
                style={{
                  color: active || completed ? palette.ink : palette.inkMuted,
                }}
              >
                {s.label}
              </span>
            </span>
          );
          return (
            <li
              key={s.id}
              className="flex items-center gap-2 sm:gap-4 flex-1 last:flex-initial"
            >
              {clickable ? (
                <button
                  type="button"
                  onClick={() => onStepClick(s.id)}
                  className="hover:opacity-80"
                >
                  {Body}
                </button>
              ) : (
                Body
              )}
              {i < steps.length - 1 && (
                <div
                  className="h-px flex-1"
                  style={{
                    background: completed ? palette.primary : palette.border,
                  }}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Step bodies
 * ────────────────────────────────────────────────────────────── */

function CartReviewStep({
  storeSlug,
  storeName,
  lines,
  itemCount,
  palette,
  onNext,
}: {
  storeSlug: string;
  storeName: string;
  lines: ReturnType<typeof useCart.getState>['lines'];
  itemCount: number;
  palette: ResolvedPalette;
  onNext: () => void;
}) {
  return (
    <Card
      className="rounded-2xl p-6 shadow-none"
      style={{ background: palette.surface, borderColor: palette.border }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{
            background: `color-mix(in srgb, ${palette.primary} 14%, transparent)`,
            color: palette.primary,
          }}
        >
          <ShoppingCart className="h-5 w-5" />
        </div>
        <div>
          <h2
            className="text-base font-semibold"
            style={{ color: palette.ink }}
          >
            ตรวจสอบสินค้าในตะกร้า
          </h2>
          <p className="text-xs" style={{ color: palette.inkMuted }}>
            {itemCount.toLocaleString()} ชิ้น จาก {storeName}
          </p>
        </div>
      </div>

      <ul
        className="border-t divide-y"
        style={{ borderColor: palette.border }}
      >
        {lines.map((l) => (
          <li key={l.productId} className="flex gap-4 py-4">
            <div
              className="shrink-0 h-16 w-16 rounded-md overflow-hidden"
              style={{ background: palette.background }}
            >
              {l.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={l.imageUrl}
                  alt={l.title}
                  className="h-full w-full object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : null}
            </div>
            <div className="flex-1 min-w-0">
              <Link
                href={`/stores/${storeSlug}/products/${l.productId}`}
                className="text-sm font-medium line-clamp-2 hover:underline"
                style={{ color: palette.ink }}
              >
                {l.title}
              </Link>
              <p className="mt-1 text-xs" style={{ color: palette.inkMuted }}>
                จำนวน {l.qty} × {formatTHB(l.priceTHB)}
              </p>
            </div>
            <p
              className="text-sm font-semibold whitespace-nowrap"
              style={{ color: palette.ink }}
            >
              {formatTHB(l.priceTHB * l.qty)}
            </p>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between gap-3 mt-6">
        <Button
          asChild
          variant="outline"
          className="text-sm"
          style={{ color: palette.ink, borderColor: palette.border }}
        >
          <Link href={`/stores/${storeSlug}/cart`}>แก้ไขตะกร้า</Link>
        </Button>
        <Button
          onClick={onNext}
          className="text-sm font-semibold"
          style={{ background: palette.primary, color: palette.primaryFg }}
        >
          ดำเนินการต่อ
        </Button>
      </div>
    </Card>
  );
}

function AddressStep({
  palette,
  address,
  updateField,
  onBack,
  onNext,
  error,
}: {
  palette: ResolvedPalette;
  address: AddressForm;
  updateField: <K extends keyof AddressForm>(
    key: K,
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBack: () => void;
  onNext: () => void;
  error: string | null;
}) {
  return (
    <Card
      className="rounded-2xl p-6 shadow-none"
      style={{ background: palette.surface, borderColor: palette.border }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{
            background: `color-mix(in srgb, ${palette.primary} 14%, transparent)`,
            color: palette.primary,
          }}
        >
          <MapPin className="h-5 w-5" />
        </div>
        <h2
          className="text-base font-semibold"
          style={{ color: palette.ink }}
        >
          ที่อยู่จัดส่ง
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          placeholder="ชื่อผู้รับ *"
          value={address.recipientName}
          onChange={updateField('recipientName')}
        />
        <Input
          placeholder="เบอร์โทรศัพท์ *"
          value={address.phone}
          onChange={updateField('phone')}
        />
        <Input
          className="sm:col-span-2"
          placeholder="ที่อยู่ (บ้านเลขที่ ซอย ถนน) *"
          value={address.line1}
          onChange={updateField('line1')}
        />
        <Input
          className="sm:col-span-2"
          placeholder="รายละเอียดเพิ่มเติม (ไม่บังคับ)"
          value={address.line2}
          onChange={updateField('line2')}
        />
        <Input
          placeholder="ตำบล / แขวง"
          value={address.subdistrict}
          onChange={updateField('subdistrict')}
        />
        <Input
          placeholder="อำเภอ / เขต"
          value={address.district}
          onChange={updateField('district')}
        />
        <Input
          placeholder="จังหวัด *"
          value={address.province}
          onChange={updateField('province')}
        />
        <Input
          placeholder="รหัสไปรษณีย์ *"
          value={address.postalCode}
          onChange={updateField('postalCode')}
        />
      </div>

      {error && (
        <p
          className="mt-3 text-sm"
          style={{ color: palette.primary }}
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-3 mt-6">
        <Button
          variant="outline"
          onClick={onBack}
          className="text-sm"
          style={{ color: palette.ink, borderColor: palette.border }}
        >
          ย้อนกลับ
        </Button>
        <Button
          onClick={onNext}
          className="text-sm font-semibold"
          style={{ background: palette.primary, color: palette.primaryFg }}
        >
          ดำเนินการต่อ
        </Button>
      </div>
    </Card>
  );
}

function PaymentStep({
  palette,
  shippingOptions,
  paymentOptions,
  shipping,
  setShipping,
  payment,
  setPayment,
  highlightFree,
  onBack,
  onNext,
}: {
  palette: ResolvedPalette;
  shippingOptions: ShippingOption[];
  paymentOptions: PaymentOption[];
  shipping: ShippingOption;
  setShipping: (s: ShippingOption) => void;
  payment: PaymentOption;
  setPayment: (p: PaymentOption) => void;
  highlightFree: boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-4">
      <Card
        className="rounded-2xl p-6 shadow-none"
        style={{ background: palette.surface, borderColor: palette.border }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{
              background: `color-mix(in srgb, ${palette.primary} 14%, transparent)`,
              color: palette.primary,
            }}
          >
            <Truck className="h-5 w-5" />
          </div>
          <h2
            className="text-base font-semibold"
            style={{ color: palette.ink }}
          >
            วิธีจัดส่ง
          </h2>
        </div>

        <div className="space-y-2">
          {shippingOptions.map((opt) => {
            const selected = shipping.id === opt.id;
            return (
              <label
                key={opt.id}
                className="flex cursor-pointer items-center justify-between rounded-lg border p-3 transition"
                style={{
                  borderColor: selected ? palette.primary : palette.border,
                  background: selected
                    ? `color-mix(in srgb, ${palette.primary} 6%, transparent)`
                    : 'transparent',
                }}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    checked={selected}
                    onChange={() => setShipping(opt)}
                  />
                  <div>
                    <div
                      className="text-sm font-medium"
                      style={{ color: palette.ink }}
                    >
                      {opt.name}
                    </div>
                    {opt.eta && (
                      <div
                        className="text-xs"
                        style={{ color: palette.inkMuted }}
                      >
                        {opt.eta}
                      </div>
                    )}
                  </div>
                </div>
                <span
                  className="text-sm font-semibold"
                  style={{
                    color:
                      selected && highlightFree
                        ? palette.primary
                        : palette.ink,
                  }}
                >
                  {selected && highlightFree
                    ? 'ส่งฟรี'
                    : formatTHB(opt.priceTHB)}
                </span>
              </label>
            );
          })}
        </div>
      </Card>

      <Card
        className="rounded-2xl p-6 shadow-none"
        style={{ background: palette.surface, borderColor: palette.border }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{
              background: `color-mix(in srgb, ${palette.primary} 14%, transparent)`,
              color: palette.primary,
            }}
          >
            <CreditCard className="h-5 w-5" />
          </div>
          <h2
            className="text-base font-semibold"
            style={{ color: palette.ink }}
          >
            วิธีชำระเงิน
          </h2>
        </div>

        <div className="space-y-2">
          {paymentOptions.map((opt) => {
            const selected = payment.id === opt.id;
            return (
              <label
                key={opt.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition"
                style={{
                  borderColor: selected ? palette.primary : palette.border,
                  background: selected
                    ? `color-mix(in srgb, ${palette.primary} 6%, transparent)`
                    : 'transparent',
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={selected}
                  onChange={() => setPayment(opt)}
                />
                <div
                  className="text-sm font-medium"
                  style={{ color: palette.ink }}
                >
                  {opt.name}
                </div>
              </label>
            );
          })}
        </div>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="text-sm"
          style={{ color: palette.ink, borderColor: palette.border }}
        >
          ย้อนกลับ
        </Button>
        <Button
          onClick={onNext}
          className="text-sm font-semibold"
          style={{ background: palette.primary, color: palette.primaryFg }}
        >
          ดำเนินการต่อ
        </Button>
      </div>
    </div>
  );
}

function ConfirmStep({
  palette,
  address,
  shipping,
  payment,
  effectiveShipping,
  subtotal,
  total,
  submitting,
  submitLabel,
  error,
  onBack,
  onSubmit,
  onEditAddress,
  onEditShipping,
}: {
  palette: ResolvedPalette;
  address: AddressForm;
  shipping: ShippingOption;
  payment: PaymentOption;
  effectiveShipping: number;
  subtotal: number;
  total: number;
  submitting: boolean;
  submitLabel: string;
  error: string | null;
  onBack: () => void;
  onSubmit: () => void;
  onEditAddress: () => void;
  onEditShipping: () => void;
}) {
  return (
    <div className="space-y-4">
      <Card
        className="rounded-2xl p-6 shadow-none"
        style={{ background: palette.surface, borderColor: palette.border }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p
              className="text-xs uppercase tracking-wider mb-1"
              style={{ color: palette.inkMuted }}
            >
              ที่อยู่จัดส่ง
            </p>
            <p
              className="text-sm font-semibold"
              style={{ color: palette.ink }}
            >
              {address.recipientName || '—'}
            </p>
            <p className="mt-1 text-sm" style={{ color: palette.inkMuted }}>
              {[address.line1, address.line2, address.subdistrict, address.district]
                .filter(Boolean)
                .join(' ')}
              <br />
              {address.province} {address.postalCode} {address.country}
              <br />
              <span className="text-xs">โทร {address.phone}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onEditAddress}
            className="text-sm font-medium hover:underline"
            style={{ color: palette.primary }}
          >
            เปลี่ยน
          </button>
        </div>
      </Card>

      <Card
        className="rounded-2xl p-6 shadow-none"
        style={{ background: palette.surface, borderColor: palette.border }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p
              className="text-xs uppercase tracking-wider mb-1"
              style={{ color: palette.inkMuted }}
            >
              จัดส่ง &amp; ชำระเงิน
            </p>
            <p
              className="text-sm font-semibold"
              style={{ color: palette.ink }}
            >
              {shipping.name} · {payment.name}
            </p>
            <p className="mt-1 text-sm" style={{ color: palette.inkMuted }}>
              ค่าจัดส่ง:{' '}
              <span style={{ color: palette.ink }}>
                {effectiveShipping === 0 ? 'ส่งฟรี' : formatTHB(effectiveShipping)}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onEditShipping}
            className="text-sm font-medium hover:underline"
            style={{ color: palette.primary }}
          >
            เปลี่ยน
          </button>
        </div>
      </Card>

      <Card
        className="rounded-2xl p-6 shadow-none"
        style={{ background: palette.surface, borderColor: palette.border }}
      >
        <dl className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <dt style={{ color: palette.inkMuted }}>ราคาสินค้า</dt>
            <dd style={{ color: palette.ink }}>{formatTHB(subtotal)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt style={{ color: palette.inkMuted }}>
              ค่าจัดส่ง ({shipping.name})
            </dt>
            <dd style={{ color: palette.ink }}>
              {effectiveShipping === 0 ? 'ส่งฟรี' : formatTHB(effectiveShipping)}
            </dd>
          </div>
          <div
            className="flex items-center justify-between pt-3 mt-1 border-t"
            style={{ borderColor: palette.border }}
          >
            <dt
              className="text-base font-semibold"
              style={{ color: palette.ink }}
            >
              ยอดรวม
            </dt>
            <dd
              className="text-xl font-bold"
              style={{ color: palette.primary }}
            >
              {formatTHB(total)}
            </dd>
          </div>
        </dl>
      </Card>

      {error && (
        <p
          className="text-sm"
          style={{ color: palette.primary }}
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="text-sm"
          style={{ color: palette.ink, borderColor: palette.border }}
        >
          ย้อนกลับ
        </Button>
        <Button
          onClick={onSubmit}
          disabled={submitting}
          className="text-sm font-semibold flex-1 max-w-xs py-5"
          style={{ background: palette.primary, color: palette.primaryFg }}
        >
          {submitting ? 'กำลังสร้างออเดอร์…' : submitLabel}
        </Button>
      </div>

      <p
        className="text-center text-xs flex items-center justify-center gap-1.5"
        style={{ color: palette.inkMuted }}
      >
        <ShieldCheck className="h-3.5 w-3.5" />
        ชำระเงินปลอดภัย • ปกป้องข้อมูลด้วย SSL
      </p>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Sticky order summary aside
 * ────────────────────────────────────────────────────────────── */

function OrderSummaryCard({
  palette,
  lines,
  subtotal,
  shipping,
  total,
  threshold,
}: {
  palette: ResolvedPalette;
  lines: ReturnType<typeof useCart.getState>['lines'];
  subtotal: number;
  shipping: number;
  total: number;
  threshold: number;
}) {
  const remaining = Math.max(0, threshold - subtotal);
  return (
    <Card
      className="rounded-2xl p-6 shadow-none"
      style={{ background: palette.surface, borderColor: palette.border }}
    >
      <h3
        className="text-base font-bold mb-4"
        style={{ color: palette.ink }}
      >
        สรุปคำสั่งซื้อ
      </h3>

      <ul
        className="border-t divide-y mb-4"
        style={{ borderColor: palette.border }}
      >
        {lines.map((l) => (
          <li key={l.productId} className="flex items-center gap-3 py-3">
            <div
              className="shrink-0 h-12 w-12 rounded overflow-hidden"
              style={{ background: palette.background }}
            >
              {l.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={l.imageUrl}
                  alt={l.title}
                  className="h-full w-full object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : null}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-xs font-medium line-clamp-1"
                style={{ color: palette.ink }}
              >
                {l.title}
              </p>
              <p
                className="text-[11px]"
                style={{ color: palette.inkMuted }}
              >
                × {l.qty}
              </p>
            </div>
            <p
              className="text-xs whitespace-nowrap"
              style={{ color: palette.ink }}
            >
              {formatTHB(l.priceTHB * l.qty)}
            </p>
          </li>
        ))}
      </ul>

      <dl className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <dt style={{ color: palette.inkMuted }}>ยอดสินค้า</dt>
          <dd style={{ color: palette.ink }}>{formatTHB(subtotal)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt style={{ color: palette.inkMuted }}>ค่าจัดส่ง</dt>
          <dd
            style={{
              color: shipping === 0 ? palette.primary : palette.ink,
            }}
          >
            {shipping === 0 ? 'ส่งฟรี' : formatTHB(shipping)}
          </dd>
        </div>
        {remaining > 0 && (
          <div className="space-y-1.5">
            <p
              className="text-xs"
              style={{ color: palette.inkMuted }}
            >
              ซื้ออีก{' '}
              <span style={{ color: palette.primary, fontWeight: 600 }}>
                {formatTHB(remaining)}
              </span>{' '}
              จะได้ส่งฟรี
            </p>
            <div
              className="h-1.5 w-full overflow-hidden rounded-full"
              style={{ background: palette.border }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (subtotal / threshold) * 100)}%`,
                  background: palette.primary,
                }}
              />
            </div>
          </div>
        )}
        <div
          className="flex items-center justify-between pt-3 mt-1 border-t"
          style={{ borderColor: palette.border }}
        >
          <dt
            className="text-base font-semibold"
            style={{ color: palette.ink }}
          >
            รวมทั้งหมด
          </dt>
          <dd
            className="text-xl font-bold"
            style={{ color: palette.ink }}
          >
            {formatTHB(total)}
          </dd>
        </div>
      </dl>
    </Card>
  );
}
