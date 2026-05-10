"use client";

/**
 * /stores/<slug>/cart — Shopping Cart matching Tailwind UI Plus pattern.
 *
 * Layout: 2-column on lg+ (items 7/12, summary 5/12 sticky), stacked
 * on mobile. Per multi-page-shop spec:
 *   - Line items: image + title (link) + variant + price + qty + remove
 *   - Summary: subtotal + shipping estimate + total + checkout CTA
 *   - Trust strip at bottom: ส่งฟรี ฿990+ / คืนได้ 7 วัน / COD
 *   - Empty state: friendly bag icon + "ไปช้อป" CTA
 *
 * All accents via var(--shop-*) so theme cascade carries.
 */
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  ShoppingBag,
  Trash2,
  ChevronLeft,
  Truck,
  RotateCcw,
  Banknote,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { formatTHB } from "@/lib/utils";

interface StoreLite {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  primaryColor: string | null;
}

const FREE_SHIPPING_THRESHOLD = 990;
const DEFAULT_SHIPPING = 50;

export function StoreCartClient({ store }: { store: StoreLite }) {
  const allLines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const lines = allLines.filter((l) => l.storeSlug === store.slug);
  const subtotal = lines.reduce((n, l) => n + l.priceTHB * l.qty, 0);
  const itemCount = lines.reduce((n, l) => n + l.qty, 0);

  // Shipping calc — free above threshold; flat fee otherwise
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING;
  const total = subtotal + shipping;
  const remainingForFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD - subtotal,
  );

  if (!mounted) {
    return <div className="container mx-auto max-w-7xl px-4 py-8 min-h-[60vh]" />;
  }

  return (
    <div className="bg-[var(--shop-bg)] min-h-screen">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24 pt-10 sm:pt-14">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/stores/${store.slug}`}
            className="inline-flex items-center gap-1 text-sm hover:underline mb-3"
            style={{ color: "var(--shop-ink-muted)" }}
          >
            <ChevronLeft className="h-4 w-4" />
            เลือกซื้อสินค้าต่อ
          </Link>
          <h1
            className="text-3xl md:text-4xl font-bold tracking-tight"
            style={{ color: "var(--shop-ink)" }}
          >
            ตะกร้าของคุณ
          </h1>
          <p
            className="mt-2 text-sm"
            style={{ color: "var(--shop-ink-muted)" }}
          >
            {lines.length === 0
              ? "ยังไม่มีสินค้า"
              : `${itemCount.toLocaleString()} ชิ้น จาก ${store.name}`}
          </p>
        </div>

        {lines.length === 0 ? (
          <EmptyCart storeSlug={store.slug} />
        ) : (
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
            {/* ── Line items ─────────────────────────────────── */}
            <section
              aria-labelledby="cart-heading"
              className="lg:col-span-7"
            >
              <h2 id="cart-heading" className="sr-only">
                สินค้าในตะกร้า
              </h2>

              <ul
                className="border-t border-b divide-y"
                style={{ borderColor: "var(--shop-border)" }}
              >
                {lines.map((l) => (
                  <li key={l.productId} className="flex py-6 sm:py-8">
                    {/* Image */}
                    <Link
                      href={`/stores/${store.slug}/products/${l.productId}`}
                      className="shrink-0 h-24 w-24 sm:h-28 sm:w-28 rounded-md overflow-hidden"
                      style={{ background: "var(--shop-bg)" }}
                    >
                      {l.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={l.imageUrl}
                          alt={l.title}
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : null}
                    </Link>

                    {/* Info column */}
                    <div className="flex-1 ml-4 sm:ml-6 flex flex-col justify-between">
                      <div className="flex justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={`/stores/${store.slug}/products/${l.productId}`}
                            className="text-sm sm:text-base font-medium line-clamp-2 hover:underline"
                            style={{ color: "var(--shop-ink)" }}
                          >
                            {l.title}
                          </Link>
                        </div>
                        <p
                          className="text-sm sm:text-base font-medium whitespace-nowrap shrink-0"
                          style={{ color: "var(--shop-ink)" }}
                        >
                          {formatTHB(l.priceTHB)}
                        </p>
                      </div>

                      <div className="mt-3 sm:mt-4 flex items-end justify-between">
                        {/* Quantity stepper */}
                        <div
                          className="inline-flex items-center rounded-md border"
                          style={{ borderColor: "var(--shop-border)" }}
                        >
                          <button
                            type="button"
                            onClick={() => setQty(l.productId, l.qty - 1)}
                            disabled={l.qty <= 1}
                            aria-label="ลด"
                            className="px-3 py-1.5 text-sm disabled:opacity-40"
                            style={{ color: "var(--shop-ink)" }}
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={l.qty}
                            onChange={(e) =>
                              setQty(
                                l.productId,
                                Math.max(
                                  1,
                                  parseInt(e.target.value, 10) || 1,
                                ),
                              )
                            }
                            className="w-12 bg-transparent py-1.5 text-center text-sm focus:outline-none"
                            style={{
                              color: "var(--shop-ink)",
                              borderLeft: "1px solid var(--shop-border)",
                              borderRight: "1px solid var(--shop-border)",
                            }}
                            aria-label={`จำนวน ${l.title}`}
                          />
                          <button
                            type="button"
                            onClick={() => setQty(l.productId, l.qty + 1)}
                            aria-label="เพิ่ม"
                            className="px-3 py-1.5 text-sm"
                            style={{ color: "var(--shop-ink)" }}
                          >
                            +
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => remove(l.productId)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium hover:underline"
                          style={{ color: "var(--shop-ink-muted)" }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          ลบ
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* ── Order summary ───────────────────────────────── */}
            <section
              aria-labelledby="summary-heading"
              className="mt-12 lg:mt-0 lg:col-span-5 lg:sticky lg:top-24"
            >
              <h2 id="summary-heading" className="sr-only">
                สรุปคำสั่งซื้อ
              </h2>

              <div
                className="rounded-2xl border px-6 py-7"
                style={{
                  background: "var(--shop-card)",
                  borderColor: "var(--shop-border)",
                }}
              >
                <h3
                  className="text-lg font-bold mb-5"
                  style={{ color: "var(--shop-ink)" }}
                >
                  สรุปคำสั่งซื้อ
                </h3>

                <dl className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <dt style={{ color: "var(--shop-ink-muted)" }}>
                      ยอดรวมสินค้า
                    </dt>
                    <dd
                      className="font-medium"
                      style={{ color: "var(--shop-ink)" }}
                    >
                      {formatTHB(subtotal)}
                    </dd>
                  </div>

                  <div
                    className="flex items-center justify-between text-sm pt-3 border-t"
                    style={{ borderColor: "var(--shop-border)" }}
                  >
                    <dt style={{ color: "var(--shop-ink-muted)" }}>
                      ค่าจัดส่ง
                    </dt>
                    <dd
                      className="font-medium"
                      style={{
                        color:
                          shipping === 0
                            ? "var(--shop-primary)"
                            : "var(--shop-ink)",
                      }}
                    >
                      {shipping === 0 ? "ส่งฟรี" : formatTHB(shipping)}
                    </dd>
                  </div>

                  {remainingForFreeShipping > 0 && (
                    <p
                      className="text-xs"
                      style={{ color: "var(--shop-ink-muted)" }}
                    >
                      ซื้ออีก{" "}
                      <span
                        className="font-medium"
                        style={{ color: "var(--shop-primary)" }}
                      >
                        {formatTHB(remainingForFreeShipping)}
                      </span>{" "}
                      จะได้ส่งฟรี
                    </p>
                  )}

                  <div
                    className="flex items-center justify-between pt-4 border-t"
                    style={{ borderColor: "var(--shop-border)" }}
                  >
                    <dt
                      className="text-base font-bold"
                      style={{ color: "var(--shop-ink)" }}
                    >
                      ยอดรวมทั้งหมด
                    </dt>
                    <dd
                      className="text-2xl font-extrabold"
                      style={{ color: "var(--shop-ink)" }}
                    >
                      {formatTHB(total)}
                    </dd>
                  </div>
                </dl>

                <Link
                  href={`/stores/${store.slug}/checkout/address`}
                  className="mt-6 flex w-full items-center justify-center rounded-md py-3.5 px-4 text-base font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ background: "var(--shop-primary)" }}
                >
                  ดำเนินการชำระเงิน
                </Link>

                <p
                  className="mt-4 text-center text-xs flex items-center justify-center gap-1.5"
                  style={{ color: "var(--shop-ink-muted)" }}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  ชำระเงินปลอดภัย • ปกป้องข้อมูลด้วย SSL
                </p>
              </div>

              {/* Trust strip */}
              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                {[
                  { icon: Truck, label: "ส่งฟรี ฿990+" },
                  { icon: RotateCcw, label: "คืนได้ 7 วัน" },
                  { icon: Banknote, label: "COD ได้" },
                ].map(({ icon: Icon, label }, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-1 py-2 rounded-lg"
                    style={{
                      background:
                        "color-mix(in srgb, var(--shop-card) 88%, transparent)",
                      border: "1px solid var(--shop-border)",
                    }}
                  >
                    <Icon
                      className="h-4 w-4"
                      style={{ color: "var(--shop-primary)" }}
                    />
                    <span
                      className="text-[11px]"
                      style={{ color: "var(--shop-ink-muted)" }}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Empty cart — friendly state + CTA back to catalog
 * ────────────────────────────────────────────────────────────── */
function EmptyCart({ storeSlug }: { storeSlug: string }) {
  return (
    <div
      className="text-center py-24 rounded-2xl border border-dashed"
      style={{ borderColor: "var(--shop-border)" }}
    >
      <div
        className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
        style={{
          background:
            "color-mix(in srgb, var(--shop-primary) 12%, transparent)",
          color: "var(--shop-primary)",
        }}
      >
        <ShoppingBag className="w-8 h-8" />
      </div>
      <p
        className="text-base font-medium"
        style={{ color: "var(--shop-ink)" }}
      >
        ตะกร้าของคุณยังว่างอยู่
      </p>
      <p
        className="text-sm mt-2"
        style={{ color: "var(--shop-ink-muted)" }}
      >
        เริ่มเลือกสินค้าที่คุณชอบ
      </p>
      <Link
        href={`/stores/${storeSlug}/category`}
        className="mt-6 inline-flex items-center px-6 py-2.5 rounded-md text-sm font-medium text-white"
        style={{ background: "var(--shop-primary)" }}
      >
        เลือกซื้อสินค้า
      </Link>
    </div>
  );
}
