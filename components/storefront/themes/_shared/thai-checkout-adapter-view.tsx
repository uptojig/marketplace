'use client';

/**
 * Client-only render half of the Thai checkout adapter.
 *
 * Lives in its own module so the factory in `thai-checkout-adapter.tsx` can
 * stay server-safe — see that file's header comment for the why. All the
 * checkout hooks (`useCart`, `useState`, `useEffect`, `useMemo`) and the
 * `/api/checkout` POST flow live here.
 *
 * Public surface: `<ThaiCheckoutAdapterView store={...} config={...} />`
 * rendered by the thin wrapper returned from `makeThaiCheckoutAdapter()`.
 * The `config` prop is the already-resolved bundle of plain serializable
 * values that the factory computed once at module-eval time.
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
  X,
} from 'lucide-react';

import { useCart, isAllDigitalForStore } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import type { ResolvedPalette } from './thai-cart-adapter-view';

/* ──────────────────────────────────────────────────────────────
 * Public types (mirror of the factory-side types, shared so callers
 * can `import type { ShippingOption } from '...thai-checkout-adapter'`
 * without dragging in the client module).
 * ────────────────────────────────────────────────────────────── */

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

export interface ResolvedStepLabels {
  cart: string;
  address: string;
  payment: string;
  confirm: string;
}

/** Fully-resolved config bundle the factory hands to the view. Every field
 *  is a plain serializable value (no functions, no Date, no React elements). */
export interface ResolvedThaiCheckoutConfig {
  palette: ResolvedPalette;
  threshold: number;
  heading: string;
  submitLabel: string;
  stepLabels: ResolvedStepLabels;
  shippingOptions: ShippingOption[];
  paymentOptions: PaymentOption[];
  highlightFree: boolean;
}

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

export interface ThaiCheckoutAdapterViewProps {
  store: ThaiCheckoutStoreProp;
  config: ResolvedThaiCheckoutConfig;
}

export function ThaiCheckoutAdapterView({
  store,
  config,
}: ThaiCheckoutAdapterViewProps) {
  const {
    palette,
    threshold,
    heading,
    submitLabel,
    stepLabels,
    shippingOptions,
    paymentOptions,
    highlightFree: highlightFreeFlag,
  } = config;

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

  // Authoritative DIGITAL detection — mirrors the cart adapter. Legacy
  // cart lines (added before the productType field shipped) lack the
  // flag locally; we fetch a `{id → productType}` map from the server
  // so allDigital reflects truth even for old carts and the themed
  // checkout never accidentally surfaces a shipping/address step.
  const [serverTypes, setServerTypes] = useState<
    Record<string, "PHYSICAL" | "DIGITAL">
  >({});
  useEffect(() => {
    if (lines.length === 0) return;
    const ids = lines.map((l) => l.productId).join(",");
    fetch(`/api/checkout/product-types?ids=${encodeURIComponent(ids)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: { products?: { id: string; productType: "PHYSICAL" | "DIGITAL" }[] }) => {
        const map: Record<string, "PHYSICAL" | "DIGITAL"> = {};
        for (const p of data.products ?? []) {
          map[p.id] = p.productType;
        }
        setServerTypes(map);
      })
      .catch(() => {
        // Network/API failure — fall back to local-only detection.
        // Better to show shipping than to silently skip it.
      });
  }, [lines]);

  const allDigital = useMemo(() => {
    if (lines.length === 0) return false;
    return lines.every(
      (l) =>
        serverTypes[l.productId] === "DIGITAL" || l.productType === "DIGITAL",
    );
  }, [lines, serverTypes]);

  /* Step model — 1: cart review, 2: address, 3: payment, 4: confirm */
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [address, setAddress] = useState<AddressForm>(EMPTY_ADDRESS);
  const [shipping, setShipping] = useState<ShippingOption>(shippingOptions[0]);
  const [payment, setPayment] = useState<PaymentOption>(paymentOptions[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderRef, setOrderRef] = useState<string | null>(null);

  // Live per-store credit balance + auth state. Drives CREDIT availability
  // in the payment picker: guests never see it; signed-in users with
  // balance < total see it disabled. Fetched on mount + refreshed when
  // total changes (e.g. coupon applied). Endpoint returns 401 for guests.
  const [creditBalanceTHB, setCreditBalanceTHB] = useState<number | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(true);
  useEffect(() => {
    if (!store.slug) return;
    fetch(`/api/credit/balance?storeSlug=${encodeURIComponent(store.slug)}`)
      .then((r) => {
        if (r.status === 401) {
          setIsGuest(true);
          setCreditBalanceTHB(null);
          return null;
        }
        setIsGuest(false);
        return r.ok ? r.json() : Promise.reject(r.status);
      })
      .then((data: { balanceTHB?: number } | null) => {
        if (data && typeof data.balanceTHB === "number") {
          setCreditBalanceTHB(data.balanceTHB);
        }
      })
      .catch(() => {
        // Treat as unauthenticated; CREDIT will be disabled.
      });
  }, [store.slug]);

  // All-digital orders skip steps 2 (address) and 3 (shipping picker).
  // The trust strip's free-shipping pill and the totals' "ค่าจัดส่ง"
  // row also hide when there is no parcel.
  const effectiveShipping = allDigital
    ? 0
    : subtotal >= threshold
      ? 0
      : shipping.priceTHB;
  const total = subtotal + effectiveShipping;

  // If the resolved allDigital flag flips after server data lands, the
  // user may already be on the address step from a stale render. Kick
  // them to step 3 (payment) so they never see shipping UI for a digital
  // order — but keep them on step 3 so they can still pick CREDIT vs
  // ANYPAY. Only fires from step 2 to avoid loops.
  useEffect(() => {
    if (allDigital && step === 2) {
      setStep(3);
    }
  }, [allDigital, step]);

  const creditAvailable = !isGuest && creditBalanceTHB !== null;
  const creditEnough = creditAvailable && (creditBalanceTHB ?? 0) >= total;
  const hasAnypayOption = paymentOptions.some((o) => o.id === 'ANYPAY');
  // Map UI selection → /api/checkout enum. The historical fallback
  // routed unusable CREDIT (guest / short balance) through ANYPAY so
  // the buyer always had a way to pay — fine when ANYPAY was offered,
  // but a CREDIT-only store (sheetlab) doesn't want gateway charges to
  // sneak through. Only fall back when ANYPAY is actually in the menu.
  const apiPaymentMethod: "ANYPAY" | "CREDIT" =
    payment.id === "CREDIT" && (creditEnough || !hasAnypayOption)
      ? "CREDIT"
      : "ANYPAY";
  // Disable next/submit when the selected option can't actually run —
  // CREDIT-only stores must keep the buyer in the funnel (sign in →
  // top up → buy) instead of silently letting them through.
  const paymentBlocked = payment.id === 'CREDIT' && !creditEnough;

  function updateField<K extends keyof AddressForm>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setAddress((a) => ({ ...a, [key]: e.target.value }));
  }

  function nextFromCart() {
    if (lines.length === 0) return;
    // All-digital orders skip address (step 2) but still land on step 3
    // so the buyer can pick a payment method (CREDIT vs ANYPAY) — the
    // PaymentStep itself hides the shipping section when allDigital.
    setStep(allDigital ? 3 : 2);
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
          // All-digital orders ship nothing; the API rejects the
          // address field as the signal to skip shipping. For physical
          // orders we still snapshot the buyer's address.
          ...(allDigital
            ? {
                guestContact: {
                  name: address.recipientName || 'Customer',
                  email: undefined,
                },
              }
            : {
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
              }),
          // Top-level enum the API consumes. Earlier versions of this
          // adapter sent `payment: { method }` nested, which the zod
          // schema silently dropped — so CREDIT selections were
          // executed as ANYPAY and the wallet was never debited.
          paymentMethod: apiPaymentMethod,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `Checkout failed (${res.status})`);
      }
      const data = (await res.json()) as {
        orderId?: string;
        orderRef?: string;
        paymentUrl?: string;
        paid?: boolean;
      };
      clearStore(store.slug);

      // Post-PAID redirect rules (mirrors confirm-client.tsx):
      //   1. CREDIT + all-digital → /account/downloads
      //   2. CREDIT + physical    → /account/orders
      //   3. ANYPAY               → paymentUrl (gateway redirect)
      if (data.paid) {
        window.location.href = allDigital 
          ? `/stores/${store.slug}/account/downloads`
          : `/stores/${store.slug}/account/orders`;
        return;
      }
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }
      // Defensive fallback — no paid / no payment URL came back.
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
          allDigital={allDigital}
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
                highlightFree={highlightFreeFlag && subtotal >= threshold}
                allDigital={allDigital}
                creditBalanceTHB={creditBalanceTHB}
                isGuest={isGuest}
                total={total}
                storeSlug={store.slug}
                onBack={() => setStep(allDigital ? 1 : 2)}
                onNext={nextFromPayment}
                blocked={paymentBlocked}
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
                allDigital={allDigital}
                onBack={() => setStep(3)}
                onSubmit={placeOrder}
                onEditAddress={() => setStep(2)}
                onEditShipping={() => setStep(3)}
                blocked={paymentBlocked}
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
              allDigital={allDigital}
              // On step 1 the main cart panel already lists every item
              // with image + qty controls — don't repeat them in the
              // sticky aside, just show the totals.
              showLineItems={step !== 1}
            />
          </aside>
        </div>
      </main>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Stepper
 * ────────────────────────────────────────────────────────────── */

function CheckoutStepper({
  current,
  palette,
  labels,
  onStepClick,
  allDigital = false,
}: {
  current: 1 | 2 | 3 | 4;
  palette: ResolvedPalette;
  labels: ResolvedStepLabels;
  onStepClick: (s: 1 | 2 | 3 | 4) => void;
  /** When true the address + payment-method picker steps are not part
   *  of the flow at all — render a 2-step stepper (cart → confirm). */
  allDigital?: boolean;
}) {
  // For digital-only orders the address step is skipped (no parcel to
  // ship), but the payment-picker stays — buyers still need to choose
  // between CREDIT and ANYPAY. The internal step ids keep their original
  // values so the existing setStep hand-offs continue to work.
  const steps = allDigital
    ? [
        { id: 1 as const, label: labels.cart },
        { id: 3 as const, label: labels.payment },
        { id: 4 as const, label: labels.confirm },
      ]
    : [
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
                {completed ? <Check className="h-3.5 w-3.5" /> : i + 1}
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
  const remove = useCart((s) => s.remove);
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
            <div className="flex flex-col items-end gap-1">
              <p
                className="text-sm font-semibold whitespace-nowrap"
                style={{ color: palette.ink }}
              >
                {formatTHB(l.priceTHB * l.qty)}
              </p>
              <button
                type="button"
                onClick={() => remove(l.productId, storeSlug)}
                aria-label={`ลบ ${l.title}`}
                className="inline-flex items-center justify-center w-6 h-6 rounded-full text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-end mt-6">
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
  allDigital,
  creditBalanceTHB,
  isGuest,
  total,
  storeSlug,
  onBack,
  onNext,
  blocked = false,
}: {
  palette: ResolvedPalette;
  shippingOptions: ShippingOption[];
  paymentOptions: PaymentOption[];
  shipping: ShippingOption;
  setShipping: (s: ShippingOption) => void;
  payment: PaymentOption;
  setPayment: (p: PaymentOption) => void;
  highlightFree: boolean;
  /** When true, the shipping picker is hidden entirely. Mirrors the
   *  step-skipping logic on the page above. */
  allDigital: boolean;
  /** Live per-store balance; null = guest or fetch failed. Used to
   *  enable/disable the CREDIT option. */
  creditBalanceTHB: number | null;
  isGuest: boolean;
  total: number;
  storeSlug: string;
  onBack: () => void;
  onNext: () => void;
  /** Current payment selection isn't actually usable (guest on a
   *  CREDIT-only store, or balance short). Disables "ดำเนินการต่อ". */
  blocked?: boolean;
}) {
  return (
    <div className="space-y-4">
      {!allDigital && (
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
      )}

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
            const isCredit = opt.id === 'CREDIT';
            // CREDIT is disabled for guests and for signed-in users
            // whose balance can't cover the order. Show a reason hint
            // and (for signed-in shorts) a link to top up.
            const creditShort =
              isCredit && !isGuest && creditBalanceTHB !== null && creditBalanceTHB < total;
            const disabled = isCredit && (isGuest || creditShort);
            return (
              <label
                key={opt.id}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                  disabled ? 'opacity-60 cursor-not-allowed' : ''
                }`}
                style={{
                  borderColor: selected && !disabled ? palette.primary : palette.border,
                  background:
                    selected && !disabled
                      ? `color-mix(in srgb, ${palette.primary} 6%, transparent)`
                      : 'transparent',
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={selected}
                  disabled={disabled}
                  onChange={() => !disabled && setPayment(opt)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div
                    className="text-sm font-medium"
                    style={{ color: palette.ink }}
                  >
                    {opt.name}
                  </div>
                  {isCredit && !isGuest && creditBalanceTHB !== null && (
                    <div
                      className="text-xs mt-0.5"
                      style={{
                        color: creditShort ? '#b91c1c' : palette.inkMuted,
                      }}
                    >
                      ยอดเครดิตคงเหลือ {formatTHB(creditBalanceTHB)}
                      {creditShort && (
                        <>
                          {' · '}
                          <Link
                            href={`/stores/${storeSlug}/account/credit/topup`}
                            className="underline"
                            style={{ color: palette.primary }}
                          >
                            เติมเครดิต
                          </Link>
                        </>
                      )}
                    </div>
                  )}
                  {isCredit && isGuest && (
                    <div
                      className="text-xs mt-0.5"
                      style={{ color: palette.inkMuted }}
                    >
                      เข้าสู่ระบบเพื่อใช้เครดิต
                    </div>
                  )}
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
          disabled={blocked}
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
  allDigital = false,
  blocked = false,
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
  /** When true, hide all shipping/address related rows — the cart is
   *  digital-only and no parcel is going out. */
  allDigital?: boolean;
  /** When true, the selected payment can't actually run (e.g. guest on
   *  a CREDIT-only store). Disables the submit button. */
  blocked?: boolean;
}) {
  return (
    <div className="space-y-4">
      {!allDigital && (
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
      )}

      {!allDigital && (
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
      )}

      <Card
        className="rounded-2xl p-6 shadow-none"
        style={{ background: palette.surface, borderColor: palette.border }}
      >
        <dl className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <dt style={{ color: palette.inkMuted }}>ราคาสินค้า</dt>
            <dd style={{ color: palette.ink }}>{formatTHB(subtotal)}</dd>
          </div>
          {!allDigital && (
            <div className="flex items-center justify-between">
              <dt style={{ color: palette.inkMuted }}>
                ค่าจัดส่ง ({shipping.name})
              </dt>
              <dd style={{ color: palette.ink }}>
                {effectiveShipping === 0 ? 'ส่งฟรี' : formatTHB(effectiveShipping)}
              </dd>
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
          disabled={submitting || blocked}
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
  showLineItems = true,
  allDigital = false,
}: {
  palette: ResolvedPalette;
  lines: ReturnType<typeof useCart.getState>['lines'];
  subtotal: number;
  shipping: number;
  total: number;
  threshold: number;
  /** Hide the item list on the cart-review step (step 1) since the
   *  main panel already shows the items in full. Keep showing on
   *  steps 2-4 where the buyer needs the at-a-glance reference. */
  showLineItems?: boolean;
  /** When true the cart is digital-only — hide ค่าจัดส่ง row and the
   *  free-shipping progress nudge entirely. */
  allDigital?: boolean;
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

      {showLineItems ? (
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
      ) : null}

      <dl className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <dt style={{ color: palette.inkMuted }}>ยอดสินค้า</dt>
          <dd style={{ color: palette.ink }}>{formatTHB(subtotal)}</dd>
        </div>
        {!allDigital && (
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
        )}
        {!allDigital && remaining > 0 && (
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
