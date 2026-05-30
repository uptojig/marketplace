"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Truck, CreditCard, Check, ShieldCheck } from "lucide-react";
import { useCart, isAllDigitalForStore } from "@/lib/store/cart";
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

// BANK_TRANSFER removed — AnyPay covers PromptPay, card, BNPL, etc.
// already, and operators didn't want a manual transfer slip workflow.
const PAYMENT_OPTIONS = [
  { id: "ANYPAY", name: "ชำระเงินออนไลน์" },
];

export default function CheckoutConfirmClient({
  params,
}: {
  params: { slug: string };
}) {
  const router = useRouter();
  // Per-store scope — only this store's items + subtotal during confirm.
  const allLines = useCart((s) => s.lines);
  const clearStore = useCart((s) => s.clearStore);
  const lines = allLines.filter((l) => l.storeSlug === params.slug);
  const subtotal = lines.reduce((acc, l) => acc + l.priceTHB * l.qty, 0);
  const clearCart = () => clearStore(params.slug);
  // All-digital path: no address, no shipping cost, no shipping picker.
  const allDigital = isAllDigitalForStore(allLines, params.slug);

  const [address, setAddress] = useState<Address | null>(null);
  const [shipping, setShipping] = useState(SHIPPING_OPTIONS[0]);
  const [payment, setPayment] = useState(PAYMENT_OPTIONS[0]); // only ANYPAY now
  /** Selected payment method. CREDIT requires signed-in user + enough
   *  per-store balance — we fetch the balance below and disable the
   *  CREDIT option when it's < total. */
  const [paymentMethod, setPaymentMethod] = useState<"ANYPAY" | "CREDIT">("ANYPAY");
  const [creditBalanceTHB, setCreditBalanceTHB] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{
    orderId?: string;
    paid?: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Guest contact for all-digital orders (we still need a name + an
  // email to deliver the unlock notification).
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  // Pull the buyer's per-store credit balance once on mount. Guests
  // (no session) get 401 — we treat that as "no balance" and disable
  // the CREDIT option silently.
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/credit/balance?storeSlug=${encodeURIComponent(params.slug)}`)
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) {
          setCreditBalanceTHB(0);
          return;
        }
        const data = (await res.json()) as { balanceTHB: number };
        setCreditBalanceTHB(data.balanceTHB);
      })
      .catch(() => {
        if (!cancelled) setCreditBalanceTHB(0);
      });
    return () => {
      cancelled = true;
    };
  }, [params.slug]);

  useEffect(() => {
    void (async () => {
      // Digital-only orders skip the entire address lookup. We resolve
      // identity via session or via the inline guestContact form below.
      if (allDigital) return;
      // Phase 1C: scope by storeSlug so the confirm step looks up the
      // selected address within THIS store's address book. Otherwise
      // a buyer with the same id at another store could shadow the
      // intended selection.
      const res = await fetch(
        `/api/addresses?storeSlug=${encodeURIComponent(params.slug)}`,
      );
      // Guest checkout — /api/addresses 401s; the typed-in address
      // lives in sessionStorage instead. Use that without bouncing
      // to /signin.
      if (res.status === 401) {
        const raw = sessionStorage.getItem("checkout.guestAddress");
        if (!raw) {
          router.replace(`/stores/${params.slug}/checkout/address`);
          return;
        }
        try {
          setAddress(JSON.parse(raw) as Address);
        } catch {
          router.replace(`/stores/${params.slug}/checkout/address`);
        }
        return;
      }
      if (!res.ok) {
        router.replace(`/stores/${params.slug}/checkout/address`);
        return;
      }
      const id = sessionStorage.getItem("checkout.addressId");
      if (!id) {
        router.replace(`/stores/${params.slug}/checkout/address`);
        return;
      }
      const data = (await res.json()) as { addresses: Address[] };
      const found = data.addresses.find((a) => a.id === id) ?? data.addresses[0] ?? null;
      if (!found) {
        router.replace(`/stores/${params.slug}/checkout/address`);
        return;
      }
      setAddress(found);
    })();
  }, [router, params.slug, allDigital]);

  const total = allDigital ? subtotal : subtotal + shipping.priceTHB;

  async function placeOrder() {
    // Physical orders need a selected address; digital orders need
    // at minimum a name + email (so the unlock-ready email reaches
    // someone). The server re-validates both.
    if (!allDigital && !address) return;
    if (allDigital && (!guestName.trim() || !guestEmail.trim())) {
      setError("กรุณากรอกชื่อและอีเมลเพื่อรับลิงก์สินค้าดิจิทัล");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          storeSlug: params.slug,
          items: lines.map((l) => ({ productId: l.productId, qty: l.qty })),
          ...(allDigital
            ? {
                guestContact: {
                  name: guestName.trim(),
                  email: guestEmail.trim(),
                },
              }
            : {
                address: {
                  recipientName: address!.recipientName,
                  phone: address!.phone,
                  line1: address!.line1,
                  line2: address!.line2 ?? "",
                  subdistrict: address!.subdistrict ?? "",
                  district: address!.district ?? "",
                  province: address!.province,
                  postalCode: address!.postalCode,
                  country: address!.country,
                },
                shipping: { method: shipping.id, priceTHB: shipping.priceTHB },
              }),
          payment: { method: payment.id },
          paymentMethod,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `Checkout failed (${res.status})`);
      }
      const data = (await res.json()) as {
        orderId?: string;
        paymentUrl?: string;
        paid?: boolean;
      };
      clearCart();
      // For CREDIT path the order is already PAID — refresh balance
      // state so the buyer sees the new (lower) number if they come
      // back to this page.
      if (data.paid) setCreditBalanceTHB((b) => (b ?? 0) - total);

      // Redirect rules:
      //   1. CREDIT + all-digital → straight to /account/downloads
      //      (order is already PAID + unlocks created server-side).
      //   2. CREDIT + physical → orders page (no parcel yet; show order).
      //   3. ANYPAY → the payment gate URL (mock or real). Real AnyPay
      //      will redirect back to /checkout/success on PAID; mock gate
      //      auto-PAIDs after 3s + redirects to its returnUrl.
      if (data.paid && allDigital) {
        window.location.href = `/stores/${params.slug}/account/downloads`;
        return;
      }
      if (data.paid) {
        window.location.href = `/stores/${params.slug}/account/orders`;
        return;
      }
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }
      // Defensive fallback — show the static success page only when
      // neither paid nor a payment URL came back (shouldn't happen,
      // but better than a blank screen).
      setSubmitted({ orderId: data.orderId, paid: data.paid });
    } catch (err) {
      setError(err instanceof Error ? err.message : "ไม่สามารถสร้างออเดอร์ได้");
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-[var(--shop-bg)] min-h-screen">
        <main className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mb-4">
            <Check className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--shop-ink)' }}>
            {submitted.paid ? "ชำระสำเร็จ" : "สั่งซื้อสำเร็จ"}
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--shop-ink-muted)' }}>
            {submitted.paid
              ? "ตัดเครดิตเรียบร้อยแล้ว ระบบจะส่งอีเมลยืนยันและลิงก์ดาวน์โหลด (ถ้ามี) ทางอีเมล"
              : "ออเดอร์ของคุณถูกบันทึกแล้ว ระบบจะส่งรายละเอียดการชำระเงินไปทางอีเมล หรือเข้าสู่ระบบเพื่อชำระเงินภายหลังในหน้าคำสั่งซื้อของคุณ"}
          </p>
          {submitted.orderId && (
            <p className="mt-3 text-xs font-mono" style={{ color: 'var(--shop-ink-muted)' }}>
              เลขที่ออเดอร์: {submitted.orderId}
            </p>
          )}
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              href={`/stores/${params.slug}/category`}
              className="inline-flex items-center px-6 py-2.5 rounded-md text-sm font-medium text-white"
              style={{ background: "var(--shop-primary)" }}
            >
              เลือกซื้อสินค้าต่อ
            </Link>
            <Link
              href={`/stores/${params.slug}`}
              className="inline-flex items-center px-6 py-2.5 rounded-md text-sm font-medium border"
              style={{ color: 'var(--shop-ink)', borderColor: 'var(--shop-border)' }}
            >
              กลับหน้าร้าน
            </Link>
          </div>
        </main>
      </div>
    );
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

        {allDigital ? (
          /* Digital-only order: no shipping, no address. We still need
           * the buyer's name + email to send the unlock-ready notice. */
          <div className="rounded-2xl border bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">ข้อมูลผู้สั่งซื้อ (สำหรับส่งลิงก์ดาวน์โหลด)</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                placeholder="ชื่อ-นามสกุล"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
              <input
                type="email"
                placeholder="อีเมล"
                required
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              สินค้าดิจิทัลทั้งหมด — ไม่มีค่าจัดส่ง ลิงก์ดาวน์โหลดจะส่งไปที่อีเมลที่ระบุ
            </p>
          </div>
        ) : (
          <>
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
          </>
        )}

        {/* Payment */}
        <div className="rounded-2xl border bg-white p-4">
          <div className="mb-2 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">ชำระเงินด้วย</h3>
          </div>
          <div className="space-y-2">
            {/* ANYPAY — always available */}
            <label
              className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-3 transition ${
                paymentMethod === "ANYPAY" ? "border-primary ring-2 ring-primary/20" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "ANYPAY"}
                  onChange={() => setPaymentMethod("ANYPAY")}
                />
                <div className="text-sm font-medium">ชำระผ่าน QR PromptPay</div>
              </div>
            </label>

            {/* CREDIT option hidden — no stores use it in production yet.
            {(() => {
              const enough =
                creditBalanceTHB !== null && creditBalanceTHB >= total;
              const disabled = !enough;
              return (
                <label
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-3 transition ${
                    paymentMethod === "CREDIT" && !disabled
                      ? "border-primary ring-2 ring-primary/20"
                      : ""
                  } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                  onClick={(e) => {
                    if (disabled) e.preventDefault();
                  }}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "CREDIT"}
                      disabled={disabled}
                      onChange={() => setPaymentMethod("CREDIT")}
                    />
                    <div className="text-sm font-medium">
                      ชำระด้วยเครดิตในร้าน
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground text-right">
                    {creditBalanceTHB === null ? (
                      "กำลังโหลด..."
                    ) : enough ? (
                      <>เครดิต {formatTHB(creditBalanceTHB)} ✓</>
                    ) : creditBalanceTHB === 0 ? (
                      <Link
                        href={`/stores/${params.slug}/account/credit`}
                        className="underline hover:text-foreground"
                      >
                        เติมเครดิต →
                      </Link>
                    ) : (
                      <>
                        มี {formatTHB(creditBalanceTHB)} ·{" "}
                        <Link
                          href={`/stores/${params.slug}/account/credit`}
                          className="underline hover:text-foreground"
                        >
                          เติม
                        </Link>
                      </>
                    )}
                  </div>
                </label>
              );
            })()}
            */}
          </div>
        </div>

        {/* Total summary */}
        <div className="rounded-2xl border bg-white p-4">
          <div className="flex justify-between text-sm">
            <span>ราคาสินค้า</span>
            <span>{formatTHB(subtotal)}</span>
          </div>
          {allDigital ? (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>สินค้าดิจิทัล — ไม่มีค่าจัดส่ง</span>
              <span>—</span>
            </div>
          ) : (
            <div className="flex justify-between text-sm">
              <span>ค่าจัดส่ง ({shipping.name})</span>
              <span>{formatTHB(shipping.priceTHB)}</span>
            </div>
          )}
          <hr className="my-3" />
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold" style={{ color: "var(--shop-primary)" }}>ยอดรวม</span>
            <span className="text-xl font-bold" style={{ color: "var(--shop-primary)" }}>{formatTHB(total)}</span>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          onClick={placeOrder}
          disabled={
            submitting
            || (!allDigital && !address)
            || (allDigital && (!guestName.trim() || !guestEmail.trim()))
          }
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
