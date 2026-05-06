"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Truck, CreditCard, Check, ShieldCheck } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";
import { CheckoutCart } from "@/components/shop/CheckoutCart";
import { formatTHB } from "@/lib/utils";
import { Breadcrumbs } from "@/components/storefront/Breadcrumbs";

interface Address {
  id: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2: string | null;
  subdistrict: string | null;
  district: string | null;
  province: string;
  postalCode: string;
  country: string;
}

const SHIPPING_OPTIONS = [
  { id: "EMS", name: "EMS", priceTHB: 50, eta: "1-2 วัน" },
  { id: "REGISTERED", name: "ลงทะเบียนไปรษณีย์ไทย", priceTHB: 30, eta: "3-5 วัน" },
];

const PAYMENT_OPTIONS = [
  { id: "BANK_TRANSFER", name: "โอนเงินผ่านบัญชีธนาคาร" },
  { id: "ANYPAY", name: "ชำระผ่าน AnyPay (Mock)" },
];

export default function CheckoutConfirmPage({
  params,
}: {
  params: { slug: string };
}) {
  const router = useRouter();
  const lines = useCart((s) => s.lines);
  const subtotal = useCart((s) => s.subtotalTHB());
  const clearCart = useCart((s) => s.clear);

  const [address, setAddress] = useState<Address | null>(null);
  const [shipping, setShipping] = useState(SHIPPING_OPTIONS[0]);
  const [payment, setPayment] = useState(PAYMENT_OPTIONS[1]); // default ANYPAY for demo
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = sessionStorage.getItem("checkout.addressId");
    if (!id) {
      router.replace(`/stores/${params.slug}/checkout/address`);
      return;
    }
    void (async () => {
      const res = await fetch("/api/addresses");
      const data = (await res.json()) as { addresses: Address[] };
      const found = data.addresses.find((a) => a.id === id) ?? data.addresses[0] ?? null;
      if (!found) {
        router.replace(`/stores/${params.slug}/checkout/address`);
        return;
      }
      setAddress(found);
    })();
  }, [router]);

  const total = subtotal + shipping.priceTHB;

  async function placeOrder() {
    if (!address) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({ productId: l.productId, qty: l.qty })),
          address: {
            recipientName: address.recipientName,
            phone: address.phone,
            line1: address.line1,
            line2: address.line2 ?? "",
            subdistrict: address.subdistrict ?? "",
            district: address.district ?? "",
            province: address.province,
            postalCode: address.postalCode,
            country: address.country,
          },
          shipping: { method: shipping.id, priceTHB: shipping.priceTHB },
          payment: { method: payment.id },
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `Checkout failed (${res.status})`);
      }
      const data = (await res.json()) as { paymentUrl: string };
      clearCart();
      window.location.href = data.paymentUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "ไม่สามารถสร้างออเดอร์ได้");
      setSubmitting(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="bg-[var(--shop-bg)] min-h-screen">
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--shop-ink)' }}>ตะกร้าว่าง</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--shop-ink-muted)' }}>
            ยังไม่มีสินค้าในตะกร้า เริ่มเลือกสินค้าได้เลย
          </p>
          <Link
            href={`/stores/${params.slug}/category`}
            className="mt-6 inline-flex items-center px-6 py-2.5 rounded-md text-sm font-medium text-white"
            style={{ background: "var(--shop-primary)" }}
          >
            เลือกซื้อสินค้า
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-[var(--shop-bg)] min-h-screen">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24 pt-10 sm:pt-14">
        <div className="mb-4">
          <Breadcrumbs
            items={[
              { label: "หน้าแรก", href: `/stores/${params.slug}` },
              { label: "ตะกร้า", href: `/stores/${params.slug}/cart` },
              { label: "ที่อยู่จัดส่ง", href: `/stores/${params.slug}/checkout/address` },
              { label: "ยืนยัน" },
            ]}
          />
        </div>
        <h1
          className="text-3xl md:text-4xl font-bold tracking-tight mb-6"
          style={{ color: "var(--shop-ink)" }}
        >
          ยืนยันคำสั่งซื้อ
        </h1>

        {/* Step indicator — step 2 active */}
        <CheckoutSteps current={2} storeSlug={params.slug} />

        <div className="grid gap-8 lg:grid-cols-[1fr_400px] mt-8">
          <CheckoutCart editable={false} storeSlug={params.slug} />

      <section className="space-y-4">
        {/* Status header */}
        <div className="flex items-center gap-3 rounded-2xl border bg-white p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div>
            <div className="text-base font-semibold">
              ยอดที่ต้องชำระ: <span className="font-bold">{formatTHB(total)}</span>
            </div>
            <div className="text-xs text-muted-foreground">ยืนยันการสั่งซื้อ</div>
          </div>
        </div>

        {/* Address summary */}
        <div className="rounded-2xl border bg-white p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-semibold">{address?.recipientName ?? "—"}</div>
              {address && (
                <div className="mt-1 text-sm text-muted-foreground">
                  {[address.line1, address.line2, address.subdistrict, address.district].filter(Boolean).join(" ")}
                  <br />
                  {address.province} {address.postalCode} {address.country}
                  <br />
                  โทร {address.phone}
                </div>
              )}
            </div>
            <Link href={`/stores/${params.slug}/checkout/address`} className="text-sm font-medium hover:underline" style={{ color: "var(--shop-primary, #2563eb)" }}>
              เปลี่ยน
            </Link>
          </div>
        </div>

        {/* Shipping */}
        <div className="rounded-2xl border bg-white p-4">
          <div className="mb-2 flex items-center gap-2">
            <Truck className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">จัดส่งโดย</h3>
          </div>
          <div className="space-y-2">
            {SHIPPING_OPTIONS.map((opt) => (
              <label
                key={opt.id}
                className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition ${
                  shipping.id === opt.id ? "border-[var(--shop-primary)] ring-2 ring-[var(--shop-primary)]/20" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    checked={shipping.id === opt.id}
                    onChange={() => setShipping(opt)}
                  />
                  <div>
                    <div className="text-sm font-medium">{opt.name}</div>
                    <div className="text-xs text-muted-foreground">{opt.eta}</div>
                  </div>
                </div>
                <span className="text-sm font-semibold">{formatTHB(opt.priceTHB)}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Payment */}
        <div className="rounded-2xl border bg-white p-4">
          <div className="mb-2 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">ชำระเงินด้วย</h3>
          </div>
          <div className="space-y-2">
            {PAYMENT_OPTIONS.map((opt) => (
              <label
                key={opt.id}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
                  payment.id === opt.id ? "border-primary ring-2 ring-primary/20" : ""
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={payment.id === opt.id}
                  onChange={() => setPayment(opt)}
                />
                <div className="text-sm font-medium">{opt.name}</div>
              </label>
            ))}
          </div>
        </div>

        {/* Total summary */}
        <div className="rounded-2xl border bg-white p-4">
          <div className="flex justify-between text-sm">
            <span>ราคาสินค้า</span>
            <span>{formatTHB(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>ค่าจัดส่ง ({shipping.name})</span>
            <span>{formatTHB(shipping.priceTHB)}</span>
          </div>
          <hr className="my-3" />
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold" style={{ color: "var(--shop-primary)" }}>ยอดรวม</span>
            <span className="text-xl font-bold" style={{ color: "var(--shop-primary)" }}>{formatTHB(total)}</span>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          onClick={placeOrder}
          disabled={submitting || !address}
          className="w-full py-6 text-base font-semibold text-white hover:opacity-90"
          style={{ backgroundColor: "var(--shop-primary, #dc2626)" }}
        >
          {submitting ? "กำลังสร้างออเดอร์…" : "สั่งซื้อสินค้าในตะกร้า"}
        </Button>
        </section>
        </div>
      </main>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Checkout step indicator — same component as address page.
 * Inlined here too to avoid spinning a separate file just for this;
 * if more checkout pages join the flow, lift to components/.
 * ────────────────────────────────────────────────────────────── */
function CheckoutSteps({
  current,
  storeSlug,
}: {
  current: 1 | 2 | 3;
  storeSlug: string;
}) {
  const steps = [
    { id: 1, label: "ที่อยู่จัดส่ง", href: `/stores/${storeSlug}/checkout/address` },
    { id: 2, label: "ชำระเงิน", href: `/stores/${storeSlug}/checkout/confirm` },
    { id: 3, label: "ยืนยัน", href: undefined },
  ] as const;

  return (
    <nav aria-label="ขั้นตอนการชำระเงิน">
      <ol className="flex items-center gap-2 sm:gap-4">
        {steps.map((s, i) => {
          const completed = current > s.id;
          const active = current === s.id;
          const Body = (
            <span className="inline-flex items-center gap-2">
              <span
                className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border-2 transition-colors"
                style={{
                  borderColor: completed || active ? "var(--shop-primary)" : "var(--shop-border)",
                  background: completed ? "var(--shop-primary)" : "transparent",
                  color: completed ? "white" : active ? "var(--shop-primary)" : "var(--shop-ink-muted)",
                }}
              >
                {completed ? <Check className="h-3.5 w-3.5" /> : s.id}
              </span>
              <span
                className="hidden sm:inline text-sm font-medium"
                style={{ color: active || completed ? "var(--shop-ink)" : "var(--shop-ink-muted)" }}
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
              {s.href && completed ? (
                <Link href={s.href} className="hover:opacity-80">{Body}</Link>
              ) : (
                Body
              )}
              {i < steps.length - 1 && (
                <div
                  className="h-px flex-1"
                  style={{ background: completed ? "var(--shop-primary)" : "var(--shop-border)" }}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
