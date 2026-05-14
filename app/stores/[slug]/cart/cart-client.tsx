"use client";

/**
 * /stores/<slug>/cart — Shopping Cart matching Tailwind UI Plus pattern,
 * with scaffold-aligned polish from marketplace-templates/src/app/cart.
 *
 * Layout: 2-column on lg+ (items 7/12, summary 5/12 sticky), stacked
 * on mobile. Per multi-page-shop spec:
 *   - Line items: image + title (link) + variant + price + qty + remove
 *   - Summary: subtotal + shipping estimate + total + checkout CTA
 *   - Free-shipping progress bar (visual nudge, scaffold-inspired)
 *   - Trust strip at bottom: ส่งฟรี ฿990+ / คืนได้ 7 วัน / COD
 *   - Empty state: friendly bag icon + "ไปช้อป" CTA
 *
 * Wiring:
 *   - Uses `useCart` from @/lib/store/cart (the active per-store
 *     storefront cart, shared with ShopHeader). NOT `useCartStore`
 *     from the scaffold's dead lib/cart/store.ts.
 *   - "Buy more" CTA points to the per-store category page so the
 *     theme cascade survives across the trip back.
 *
 * All accents via var(--shop-*) so theme cascade carries.
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ShoppingBag,
  Trash2,
  ChevronLeft,
  Minus,
  Plus,
  Truck,
  RotateCcw,
  Banknote,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { formatTHB } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CountdownBlock } from "@/components/blocks/countdown";
import { FaqBlock } from "@/components/blocks/faq";
import { bmActiveTier } from "@/lib/landing/business-model";
import { TrendingDown } from "lucide-react";

interface StoreLite {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  primaryColor: string | null;
}

const FB_DISPLAY_FONT =
  'var(--font-fashion-display, "Cormorant Garamond"), "Playfair Display", Georgia, "Noto Serif Thai", serif';

const TRUST_DISPLAY_FONT =
  'var(--font-trust-display, "Playfair Display"), Georgia, "Noto Serif Thai", serif';

const BM_MONO_FONT =
  'var(--font-bm-mono, "JetBrains Mono"), ui-monospace, "Cascadia Mono", "Source Code Pro", monospace';

const LIFESTYLE_DISPLAY_FONT =
  'var(--font-lifestyle-display, "Outfit"), "Plus Jakarta Sans", "DM Sans", "Prompt", system-ui, sans-serif';

const TECH_DISPLAY_FONT =
  'var(--font-tech-display, "Inter Tight"), "Inter", "IBM Plex Sans Thai", system-ui, sans-serif';

const TECH_MONO_FONT =
  'var(--font-tech-mono, "JetBrains Mono"), ui-monospace, "SFMono-Regular", Menlo, monospace';

const FREE_SHIPPING_THRESHOLD = 990;
const DEFAULT_SHIPPING = 50;

function endOfTodayISO() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

/**
 * Build a deterministic SKU from the product id — mirrors the
 * electronics-tech PDP hero so the same product carries the same
 * display SKU on the cart line item.
 */
function techSku(id: string): string {
  const hash = id
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(-6)
    .padStart(6, '0');
  return `ET-${hash}`;
}

export function StoreCartClient({
  store,
  isFashionBeauty = false,
  isTrust = false,
  isBusinessModel = false,
  isLifestyle = false,
  isElectronicsTech = false,
}: {
  store: StoreLite;
  isFashionBeauty?: boolean;
  isTrust?: boolean;
  isBusinessModel?: boolean;
  isLifestyle?: boolean;
  isElectronicsTech?: boolean;
}) {
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
          {isTrust && (
            <p
              className="mb-2 text-xs uppercase"
              style={{
                color: "var(--shop-accent)",
                letterSpacing: "0.28em",
                fontWeight: 600,
              }}
            >
              Order Summary · Maison
            </p>
          )}
          {isBusinessModel && (
            <p
              className="mb-2 text-xs font-semibold uppercase"
              style={{
                color: "var(--shop-primary)",
                letterSpacing: "0.12em",
              }}
            >
              Cart · Bulk order
            </p>
          )}
          {isLifestyle && (
            <p
              className="mb-2 text-xs uppercase"
              style={{
                color: "var(--shop-accent)",
                letterSpacing: "0.18em",
                fontWeight: 600,
              }}
            >
              Your basket
            </p>
          )}
          {isElectronicsTech && (
            <p
              data-tech-mono="true"
              className="mb-2 text-[11px] uppercase"
              style={{
                color: "var(--shop-ink-muted)",
                fontFamily: TECH_MONO_FONT,
                letterSpacing: "0.16em",
                fontWeight: 600,
              }}
            >
              Cart · {itemCount.toLocaleString().padStart(2, '0')} item{itemCount === 1 ? '' : 's'}
            </p>
          )}
          <h1
            className={
              isFashionBeauty || isTrust || isLifestyle
                ? "text-4xl md:text-5xl"
                : isElectronicsTech
                  ? "text-3xl md:text-4xl"
                  : "text-3xl md:text-4xl font-bold tracking-tight"
            }
            style={{
              color: "var(--shop-ink)",
              ...(isFashionBeauty
                ? { fontFamily: FB_DISPLAY_FONT, fontWeight: 500, letterSpacing: '-0.005em' }
                : isTrust
                  ? { fontFamily: TRUST_DISPLAY_FONT, fontWeight: 600, letterSpacing: '-0.01em' }
                  : isBusinessModel
                    ? { fontWeight: 700, letterSpacing: '-0.015em' }
                    : isLifestyle
                      ? { fontFamily: LIFESTYLE_DISPLAY_FONT, fontWeight: 700, letterSpacing: '-0.01em' }
                      : isElectronicsTech
                        ? { fontFamily: TECH_DISPLAY_FONT, fontWeight: 700, letterSpacing: '-0.015em' }
                        : {}),
            }}
          >
            {isFashionBeauty
              ? "Your Edit"
              : isTrust
                ? "Your Order"
                : isBusinessModel
                  ? "Cart"
                  : isLifestyle
                    ? "Your basket"
                    : isElectronicsTech
                      ? "Shopping cart"
                      : "ตะกร้าของคุณ"}
          </h1>
          {isTrust && (
            <div
              aria-hidden
              className="mt-3 h-px w-16"
              style={{ background: "var(--shop-accent)" }}
            />
          )}
          {isLifestyle && (
            <div
              aria-hidden
              data-lifestyle-squiggle="true"
              className="mt-3 w-24"
            />
          )}
          <p
            className={
              isFashionBeauty
                ? "mt-2 text-sm italic"
                : isElectronicsTech
                  ? "mt-3 text-sm"
                  : "mt-3 text-sm"
            }
            data-tech-mono={isElectronicsTech ? "true" : undefined}
            style={{
              color: "var(--shop-ink-muted)",
              ...(isElectronicsTech
                ? { fontFamily: TECH_MONO_FONT, letterSpacing: "-0.005em" }
                : {}),
            }}
          >
            {lines.length === 0
              ? "ยังไม่มีสินค้า"
              : `${itemCount.toLocaleString()} ชิ้น จาก ${store.name}`}
          </p>
        </div>

        {lines.length === 0 ? (
          <EmptyCart
            storeSlug={store.slug}
            isFashionBeauty={isFashionBeauty}
            isTrust={isTrust}
            isBusinessModel={isBusinessModel}
            isLifestyle={isLifestyle}
            isElectronicsTech={isElectronicsTech}
          />
        ) : (
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
            {/* ── Volume-discount banner (business-model only) ──
                Shows when the total qty across all lines crosses a
                tier boundary (10 / 50). Static stub copy — no real
                tier maths driving order totals yet. */}
            {isBusinessModel && itemCount >= 10 && (
              <div
                className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border px-4 py-2.5 lg:col-span-12"
                style={{
                  background: "color-mix(in srgb, var(--shop-savings, #10b981) 12%, transparent)",
                  borderColor: "var(--shop-savings, #10b981)",
                }}
              >
                <div className="flex items-center gap-2 text-sm">
                  <TrendingDown
                    className="h-4 w-4 shrink-0"
                    style={{ color: "var(--shop-savings, #10b981)" }}
                  />
                  <span className="font-bold" style={{ color: "var(--shop-ink)" }}>
                    Volume discount applied
                  </span>
                  <span style={{ color: "var(--shop-ink-muted)" }}>
                    จำนวน{" "}
                    <span
                      data-bm-mono="true"
                      className="font-bold"
                      style={{
                        color: "var(--shop-ink)",
                        fontFamily: BM_MONO_FONT,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {itemCount}
                    </span>{" "}
                    ชิ้น = ลด{" "}
                    <span
                      className="font-bold"
                      style={{ color: "var(--shop-savings, #10b981)" }}
                    >
                      {bmActiveTier(itemCount).savingsPct}%
                    </span>
                  </span>
                </div>
                <span
                  data-bm-savings="true"
                  className="rounded-sm px-2 py-0.5 text-xs font-bold uppercase"
                  style={{
                    background: "var(--shop-savings, #10b981)",
                    color: "#ffffff",
                    letterSpacing: "0.08em",
                  }}
                >
                  Tier {bmActiveTier(itemCount).label}
                </span>
              </div>
            )}

            {/* ── Line items ─────────────────────────────────── */}
            <section
              aria-labelledby="cart-heading"
              className="lg:col-span-7"
            >
              <h2 id="cart-heading" className="sr-only">
                สินค้าในตะกร้า
              </h2>

              {/* Business-model adds a sortable column header above
                  the line items — Item / Qty / Unit price / Subtotal
                  — so the cart reads as a B2B order ledger. Other
                  families keep the implicit row layout. */}
              {isBusinessModel && (
                <div
                  className="grid grid-cols-[1fr_5rem_6rem_6rem] gap-3 border-y px-2 py-2 text-[10px] font-semibold uppercase"
                  style={{
                    borderColor: "var(--shop-border)",
                    color: "var(--shop-ink-muted)",
                    letterSpacing: "0.12em",
                    background: "#fafafa",
                  }}
                >
                  <span>Item</span>
                  <span className="text-center">Qty</span>
                  <span className="text-right">Unit price</span>
                  <span className="text-right">Subtotal</span>
                </div>
              )}

              <ul
                className={
                  isLifestyle
                    ? "space-y-4"
                    : "border-t border-b divide-y"
                }
                style={
                  isLifestyle
                    ? undefined
                    : { borderColor: "var(--shop-border)" }
                }
              >
                {lines.map((l) => (
                  <li
                    key={l.productId}
                    className={
                      isLifestyle
                        ? "flex p-5 rounded-3xl border"
                        : "flex py-6 sm:py-8"
                    }
                    style={
                      isLifestyle
                        ? {
                            background: "var(--shop-muted)",
                            borderColor: "var(--shop-border)",
                          }
                        : undefined
                    }
                  >
                    {/* Image */}
                    <Link
                      href={`/stores/${store.slug}/products/${l.productId}`}
                      className={
                        isLifestyle
                          ? "shrink-0 h-24 w-24 sm:h-28 sm:w-28 rounded-2xl overflow-hidden bg-white"
                          : "shrink-0 h-24 w-24 sm:h-28 sm:w-28 rounded-md overflow-hidden"
                      }
                      style={
                        isLifestyle
                          ? undefined
                          : { background: "var(--shop-bg)" }
                      }
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
                          {isElectronicsTech && (
                            <p
                              data-tech-mono="true"
                              className="mt-1 text-[10px] uppercase"
                              style={{
                                color: "var(--shop-ink-muted)",
                                fontFamily: TECH_MONO_FONT,
                                letterSpacing: "0.16em",
                                fontWeight: 600,
                              }}
                            >
                              SKU · {techSku(l.productId)}
                            </p>
                          )}
                        </div>
                        <p
                          data-tech-mono={isElectronicsTech ? "true" : undefined}
                          className={
                            isElectronicsTech
                              ? "text-sm sm:text-base font-bold whitespace-nowrap shrink-0"
                              : "text-sm sm:text-base font-medium whitespace-nowrap shrink-0"
                          }
                          style={{
                            color: isElectronicsTech
                              ? "var(--shop-primary)"
                              : "var(--shop-ink)",
                            ...(isElectronicsTech
                              ? {
                                  fontFamily: TECH_MONO_FONT,
                                  letterSpacing: "-0.01em",
                                }
                              : {}),
                          }}
                        >
                          {formatTHB(l.priceTHB)}
                        </p>
                      </div>

                      <div className="mt-3 sm:mt-4 flex items-end justify-between">
                        {/* Quantity stepper — scaffold-style icon buttons */}
                        <div
                          className="inline-flex items-center rounded-md border"
                          style={{ borderColor: "var(--shop-border)" }}
                        >
                          <button
                            type="button"
                            onClick={() => setQty(l.productId, l.qty - 1)}
                            disabled={l.qty <= 1}
                            aria-label="ลด"
                            className="inline-flex h-9 w-9 items-center justify-center text-sm disabled:opacity-40"
                            style={{ color: "var(--shop-ink)" }}
                          >
                            <Minus className="h-3.5 w-3.5" />
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
                            className="inline-flex h-9 w-9 items-center justify-center text-sm"
                            style={{ color: "var(--shop-ink)" }}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => remove(l.productId)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium hover:underline"
                          style={{ color: "var(--shop-ink-muted)" }}
                          aria-label={`ลบ ${l.title}`}
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

              <Card
                className={
                  isTrust
                    ? "rounded-sm px-6 py-7 shadow-none"
                    : isBusinessModel
                      ? "rounded-md px-6 py-6 shadow-none"
                      : isLifestyle
                        ? "rounded-3xl px-6 py-7 shadow-sm"
                        : isElectronicsTech
                          ? "rounded-md px-6 py-7 shadow-none"
                          : "rounded-2xl px-6 py-7 shadow-none"
                }
                style={{
                  background: isLifestyle
                    ? "var(--shop-muted)"
                    : "var(--shop-card)",
                  borderColor: isTrust
                    ? "var(--shop-accent)"
                    : "var(--shop-border)",
                }}
              >
                {isTrust && (
                  <p
                    className="mb-2 text-xs uppercase"
                    style={{
                      color: "var(--shop-accent)",
                      letterSpacing: "0.28em",
                      fontWeight: 600,
                    }}
                  >
                    Summary
                  </p>
                )}
                {isBusinessModel && (
                  <p
                    className="mb-2 text-xs font-semibold uppercase"
                    style={{
                      color: "var(--shop-primary)",
                      letterSpacing: "0.12em",
                    }}
                  >
                    Order Summary
                  </p>
                )}
                {isLifestyle && (
                  <p
                    className="mb-2 text-xs uppercase"
                    style={{
                      color: "var(--shop-accent)",
                      letterSpacing: "0.18em",
                      fontWeight: 600,
                    }}
                  >
                    Almost there
                  </p>
                )}
                {isElectronicsTech && (
                  <p
                    data-tech-mono="true"
                    className="mb-2 text-[11px] uppercase"
                    style={{
                      color: "var(--shop-ink-muted)",
                      fontFamily: TECH_MONO_FONT,
                      letterSpacing: "0.16em",
                      fontWeight: 600,
                    }}
                  >
                    Order Totals
                  </p>
                )}
                <h3
                  className={
                    isTrust
                      ? "text-2xl mb-5"
                      : isBusinessModel
                        ? "text-xl font-bold mb-4"
                        : isLifestyle
                          ? "text-2xl mb-5"
                          : isElectronicsTech
                            ? "text-xl mb-5"
                            : "text-lg font-bold mb-5"
                  }
                  style={{
                    color: "var(--shop-ink)",
                    ...(isTrust
                      ? { fontFamily: TRUST_DISPLAY_FONT, fontWeight: 600 }
                      : isBusinessModel
                        ? { fontWeight: 700, letterSpacing: '-0.015em' }
                        : isLifestyle
                          ? { fontFamily: LIFESTYLE_DISPLAY_FONT, fontWeight: 700 }
                          : isElectronicsTech
                            ? {
                                fontFamily: TECH_DISPLAY_FONT,
                                fontWeight: 700,
                                letterSpacing: "-0.015em",
                              }
                            : {}),
                  }}
                >
                  {isTrust
                    ? "Order summary"
                    : isBusinessModel
                      ? "Order summary"
                      : isLifestyle
                        ? "Your order"
                        : isElectronicsTech
                          ? "Order summary"
                          : "สรุปคำสั่งซื้อ"}
                </h3>
                {isTrust && (
                  <div
                    aria-hidden
                    className="mb-5 h-px w-full"
                    style={{ background: "var(--shop-accent)" }}
                  />
                )}
                {isElectronicsTech && (
                  <div
                    aria-hidden
                    className="mb-5 h-px w-full"
                    style={{ background: "var(--shop-border)" }}
                  />
                )}

                <dl className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <dt
                      data-tech-mono={isElectronicsTech ? "true" : undefined}
                      style={{
                        color: "var(--shop-ink-muted)",
                        ...(isElectronicsTech
                          ? {
                              fontFamily: TECH_MONO_FONT,
                              letterSpacing: "0.08em",
                              fontWeight: 500,
                              fontSize: "12px",
                              textTransform: "uppercase",
                            }
                          : {}),
                      }}
                    >
                      {isElectronicsTech ? "Subtotal" : "ยอดรวมสินค้า"}
                    </dt>
                    <dd
                      data-tech-mono={isElectronicsTech ? "true" : undefined}
                      className="font-medium"
                      style={{
                        color: "var(--shop-ink)",
                        ...(isElectronicsTech
                          ? {
                              fontFamily: TECH_MONO_FONT,
                              fontWeight: 600,
                            }
                          : {}),
                      }}
                    >
                      {formatTHB(subtotal)}
                    </dd>
                  </div>

                  <div
                    className="flex items-center justify-between text-sm pt-3 border-t"
                    style={{ borderColor: "var(--shop-border)" }}
                  >
                    <dt
                      data-tech-mono={isElectronicsTech ? "true" : undefined}
                      style={{
                        color: "var(--shop-ink-muted)",
                        ...(isElectronicsTech
                          ? {
                              fontFamily: TECH_MONO_FONT,
                              letterSpacing: "0.08em",
                              fontWeight: 500,
                              fontSize: "12px",
                              textTransform: "uppercase",
                            }
                          : {}),
                      }}
                    >
                      {isElectronicsTech ? "Shipping" : "ค่าจัดส่ง"}
                    </dt>
                    <dd
                      data-tech-mono={isElectronicsTech ? "true" : undefined}
                      className="font-medium"
                      style={{
                        color:
                          shipping === 0
                            ? "var(--shop-primary)"
                            : "var(--shop-ink)",
                        ...(isElectronicsTech
                          ? {
                              fontFamily: TECH_MONO_FONT,
                              fontWeight: 600,
                            }
                          : {}),
                      }}
                    >
                      {shipping === 0 ? "ส่งฟรี" : formatTHB(shipping)}
                    </dd>
                  </div>

                  {remainingForFreeShipping > 0 && (
                    <div className="space-y-1.5">
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
                      <div
                        className="h-1.5 w-full overflow-hidden rounded-full"
                        style={{ background: "var(--shop-border)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%`,
                            background: "var(--shop-primary)",
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div
                    className="flex items-center justify-between pt-4 border-t"
                    style={{ borderColor: "var(--shop-border)" }}
                  >
                    <dt
                      data-tech-mono={isElectronicsTech ? "true" : undefined}
                      className={isElectronicsTech ? "text-sm font-bold" : "text-base font-bold"}
                      style={{
                        color: "var(--shop-ink)",
                        ...(isElectronicsTech
                          ? {
                              fontFamily: TECH_MONO_FONT,
                              letterSpacing: "0.12em",
                              textTransform: "uppercase",
                              fontWeight: 700,
                            }
                          : {}),
                      }}
                    >
                      {isBusinessModel ? "Total" : isElectronicsTech ? "Total" : "ยอดรวมทั้งหมด"}
                    </dt>
                    <dd
                      data-bm-mono={isBusinessModel ? "true" : undefined}
                      data-tech-mono={isElectronicsTech ? "true" : undefined}
                      className={
                        isBusinessModel
                          ? "text-2xl font-extrabold"
                          : isElectronicsTech
                            ? "text-2xl font-bold"
                            : "text-2xl font-extrabold"
                      }
                      style={{
                        color: isBusinessModel
                          ? "var(--shop-primary)"
                          : isElectronicsTech
                            ? "var(--shop-primary)"
                            : "var(--shop-ink)",
                        ...(isBusinessModel
                          ? {
                              fontFamily: BM_MONO_FONT,
                              fontVariantNumeric: "tabular-nums",
                              letterSpacing: "-0.02em",
                            }
                          : isElectronicsTech
                            ? {
                                fontFamily: TECH_MONO_FONT,
                                letterSpacing: "-0.02em",
                              }
                            : {}),
                      }}
                    >
                      {formatTHB(total)}
                    </dd>
                  </div>
                </dl>

                <Button
                  asChild
                  size="lg"
                  className={
                    isTrust
                      ? "mt-6 h-auto w-full rounded-sm py-3.5 px-4 text-base font-semibold uppercase tracking-[0.18em] text-white"
                      : isBusinessModel
                        ? "mt-6 h-auto w-full rounded-md py-3.5 px-4 text-base font-bold uppercase tracking-[0.08em] text-white"
                        : isLifestyle
                          ? "mt-6 h-auto w-full rounded-full py-3.5 px-4 text-base font-semibold text-white"
                          : isElectronicsTech
                            ? "mt-6 h-auto w-full rounded-md py-3.5 px-4 text-base font-bold text-white"
                            : "mt-6 h-auto w-full rounded-md py-3.5 px-4 text-base font-semibold text-white"
                  }
                  style={{ background: "var(--shop-primary)" }}
                >
                  <Link href={`/stores/${store.slug}/checkout/address`}>
                    {isTrust
                      ? "Proceed to checkout"
                      : isBusinessModel
                        ? "Checkout"
                        : isLifestyle
                          ? "Check out"
                          : isElectronicsTech
                            ? "ดำเนินการชำระเงิน"
                            : "ดำเนินการชำระเงิน"}
                  </Link>
                </Button>

                <p
                  className="mt-4 text-center text-xs flex items-center justify-center gap-1.5"
                  style={{ color: "var(--shop-ink-muted)" }}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  ชำระเงินปลอดภัย • ปกป้องข้อมูลด้วย SSL
                </p>
              </Card>

              {/* Trust strip */}
              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                {[
                  { icon: Truck, label: "ส่งฟรี ฿990+" },
                  { icon: RotateCcw, label: "คืนได้ 7 วัน" },
                  { icon: Banknote, label: "COD ได้" },
                ].map(({ icon: Icon, label }, i) => (
                  <Card
                    key={i}
                    className="flex flex-col items-center gap-1 rounded-lg border-0 py-2 shadow-none"
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
                  </Card>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* shadcn-studio extras — Countdown urgency + Cart FAQ.
            Only render when the cart has lines so the empty state stays
            quiet. Countdown target is end-of-day so it resets daily. */}
        {lines.length > 0 && (
          <>
            <CountdownBlock
              headline="ดีลพิเศษวันนี้ — สั่งภายในเที่ยงคืนเพื่อรับส่วนลด"
              target_at={endOfTodayISO()}
              ctaText="ไปเลือกสินค้าเพิ่ม"
              ctaLink={`/stores/${store.slug}/category`}
            />
            <FaqBlock
              title="คำถามที่พบบ่อยเรื่องการสั่งซื้อ"
              items={[
                {
                  question: "ใช้เวลาส่งกี่วัน?",
                  answer:
                    "1-3 วันทำการ ผ่าน Kerry / Flash / EMS หลังจากชำระเงินแล้ว",
                },
                {
                  question: "เก็บเงินปลายทางได้ไหม?",
                  answer:
                    "ได้ทุกออเดอร์ (มีค่าธรรมเนียมเก็บปลายทาง 30 บาท)",
                },
                {
                  question: "ผ่อน 0% ได้ไหม?",
                  answer:
                    "รับบัตรเครดิตธนาคารชั้นนำ เลือกผ่อน 0% นาน 3 เดือนได้",
                },
                {
                  question: "เปลี่ยน / คืนสินค้าได้ไหม?",
                  answer:
                    "เปลี่ยนหรือคืนได้ภายใน 7 วันหากสินค้ามีตำหนิจากโรงงาน",
                },
              ]}
            />
          </>
        )}
      </main>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Empty cart — friendly state + CTA back to catalog
 * ────────────────────────────────────────────────────────────── */
function EmptyCart({
  storeSlug,
  isFashionBeauty = false,
  isTrust = false,
  isBusinessModel = false,
  isLifestyle = false,
  isElectronicsTech = false,
}: {
  storeSlug: string;
  isFashionBeauty?: boolean;
  isTrust?: boolean;
  isBusinessModel?: boolean;
  isLifestyle?: boolean;
  isElectronicsTech?: boolean;
}) {
  return (
    <Card
      className={
        isTrust
          ? "text-center py-24 rounded-sm border bg-transparent shadow-none"
          : isBusinessModel
            ? "text-center py-20 rounded-md border bg-transparent shadow-none"
            : isLifestyle
              ? "text-center py-24 rounded-3xl border bg-[var(--shop-muted)] shadow-sm"
              : isElectronicsTech
                ? "text-center py-24 rounded-md border bg-transparent shadow-none"
                : "text-center py-24 rounded-2xl border border-dashed bg-transparent shadow-none"
      }
      style={{ borderColor: isTrust ? "var(--shop-accent)" : "var(--shop-border)" }}
    >
      <div
        className={
          isTrust
            ? "inline-flex items-center justify-center w-16 h-16 rounded-sm mb-4 mx-auto border"
            : isBusinessModel
              ? "inline-flex items-center justify-center w-16 h-16 rounded-md mb-4 mx-auto border"
              : isLifestyle
                ? "inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 mx-auto bg-white"
                : isElectronicsTech
                  ? "inline-flex items-center justify-center w-16 h-16 rounded-md mb-4 mx-auto border"
                  : "inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 mx-auto"
        }
        style={{
          background: isTrust
            ? "var(--shop-muted)"
            : isBusinessModel
              ? "var(--shop-muted)"
              : isLifestyle
                ? "#ffffff"
                : isElectronicsTech
                  ? "var(--shop-muted)"
                  : "color-mix(in srgb, var(--shop-primary) 12%, transparent)",
          color: isTrust
            ? "var(--shop-ink)"
            : isBusinessModel
              ? "var(--shop-primary)"
              : isLifestyle
                ? "var(--shop-primary)"
                : isElectronicsTech
                  ? "var(--shop-primary)"
                  : "var(--shop-primary)",
          ...(isTrust ? { borderColor: "var(--shop-accent)" } : {}),
          ...(isBusinessModel ? { borderColor: "var(--shop-border)" } : {}),
          ...(isElectronicsTech ? { borderColor: "var(--shop-border)" } : {}),
        }}
      >
        <ShoppingBag className="w-8 h-8" />
      </div>
      {isTrust && (
        <p
          className="mt-2 text-xs uppercase"
          style={{
            color: "var(--shop-accent)",
            letterSpacing: "0.28em",
            fontWeight: 600,
          }}
        >
          Maison
        </p>
      )}
      {isBusinessModel && (
        <p
          className="mt-2 text-xs font-semibold uppercase"
          style={{
            color: "var(--shop-primary)",
            letterSpacing: "0.12em",
          }}
        >
          Cart · Empty
        </p>
      )}
      {isElectronicsTech && (
        <p
          data-tech-mono="true"
          className="mt-2 text-[11px] uppercase"
          style={{
            color: "var(--shop-ink-muted)",
            fontFamily: TECH_MONO_FONT,
            letterSpacing: "0.16em",
            fontWeight: 600,
          }}
        >
          Cart · Empty
        </p>
      )}
      <p
        className={
          isFashionBeauty || isTrust
            ? "text-2xl mt-1"
            : isBusinessModel
              ? "text-xl font-bold mt-1"
              : isLifestyle
                ? "text-2xl mt-1"
                : isElectronicsTech
                  ? "text-xl mt-1 font-bold"
                  : "text-base font-medium"
        }
        style={{
          color: "var(--shop-ink)",
          ...(isFashionBeauty
            ? { fontFamily: FB_DISPLAY_FONT, fontWeight: 500 }
            : isTrust
              ? { fontFamily: TRUST_DISPLAY_FONT, fontWeight: 600 }
              : isBusinessModel
                ? { fontWeight: 700 }
                : isLifestyle
                  ? { fontFamily: LIFESTYLE_DISPLAY_FONT, fontWeight: 700 }
                  : isElectronicsTech
                    ? {
                        fontFamily: TECH_DISPLAY_FONT,
                        fontWeight: 700,
                        letterSpacing: "-0.015em",
                      }
                    : {}),
        }}
      >
        {isFashionBeauty
          ? "Your edit is empty"
          : isTrust
            ? "Your order is empty"
            : isBusinessModel
              ? "No items in cart"
              : isLifestyle
                ? "Your basket is empty"
                : isElectronicsTech
                  ? "Your cart is empty"
                  : "ตะกร้าของคุณยังว่างอยู่"}
      </p>
      <p
        className={isFashionBeauty ? "text-sm mt-2 italic" : "text-sm mt-2"}
        style={{ color: "var(--shop-ink-muted)" }}
      >
        {isFashionBeauty
          ? "Discover pieces curated for you"
          : isTrust
            ? "Begin building your collection"
            : isBusinessModel
              ? "เพิ่มสินค้าเพื่อเริ่มสั่งซื้อแบบ wholesale"
              : isLifestyle
                ? "Find something you'll love"
                : isElectronicsTech
                  ? "Browse our catalog to find your next gear"
                  : "เริ่มเลือกสินค้าที่คุณชอบ"}
      </p>
      <Button
        asChild
        className={
          isFashionBeauty
            ? "mt-6 h-auto rounded-full px-8 py-2.5 text-sm font-medium text-white"
            : isTrust
              ? "mt-6 h-auto rounded-sm px-8 py-2.5 text-sm font-semibold uppercase tracking-[0.18em] text-white"
              : isBusinessModel
                ? "mt-6 h-auto rounded-md px-6 py-2.5 text-sm font-bold uppercase tracking-[0.08em] text-white"
                : isLifestyle
                  ? "mt-6 h-auto rounded-full px-8 py-2.5 text-sm font-semibold text-white"
                  : isElectronicsTech
                    ? "mt-6 h-auto rounded-md px-8 py-2.5 text-sm font-bold text-white"
                    : "mt-6 h-auto rounded-md px-6 py-2.5 text-sm font-medium text-white"
        }
        style={{ background: "var(--shop-primary)" }}
      >
        <Link href={`/stores/${storeSlug}/category`}>
          {isFashionBeauty
            ? "Start shopping"
            : isTrust
              ? "Browse the collection"
              : isBusinessModel
                ? "Browse deals"
                : isLifestyle
                  ? "Keep shopping"
                  : isElectronicsTech
                    ? "Browse catalog"
                    : "เลือกซื้อสินค้า"}
        </Link>
      </Button>
    </Card>
  );
}
