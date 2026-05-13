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

interface StoreLite {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  primaryColor: string | null;
}

const FB_DISPLAY_FONT =
  'var(--font-fashion-display, "Cormorant Garamond"), "Playfair Display", Georgia, "Noto Serif Thai", serif';

const SPECIALTY_DISPLAY_FONT =
  'var(--font-specialty-display, "Fraunces"), Georgia, "Noto Serif Thai", serif';
const SPECIALTY_HAND_FONT =
  'var(--font-specialty-hand, "Caveat"), "Permanent Marker", cursive';

const FREE_SHIPPING_THRESHOLD = 990;
const DEFAULT_SHIPPING = 50;

function endOfTodayISO() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

export function StoreCartClient({
  store,
  isFashionBeauty = false,
  isSpecialty = false,
}: {
  store: StoreLite;
  isFashionBeauty?: boolean;
  isSpecialty?: boolean;
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
          {isSpecialty && (
            <p
              className="text-lg italic"
              style={{
                color: "var(--shop-accent)",
                fontFamily: SPECIALTY_HAND_FONT,
              }}
            >
              the maker's basket
            </p>
          )}
          <h1
            className={
              isFashionBeauty || isSpecialty
                ? "text-4xl md:text-5xl"
                : "text-3xl md:text-4xl font-bold tracking-tight"
            }
            style={{
              color: "var(--shop-ink)",
              ...(isFashionBeauty
                ? { fontFamily: FB_DISPLAY_FONT, fontWeight: 500, letterSpacing: '-0.005em' }
                : isSpecialty
                  ? { fontFamily: SPECIALTY_DISPLAY_FONT, fontWeight: 500, letterSpacing: '-0.005em' }
                  : {}),
            }}
          >
            {isFashionBeauty
              ? "Your Edit"
              : isSpecialty
                ? "Your collection"
                : "ตะกร้าของคุณ"}
          </h1>
          <p
            className={
              isFashionBeauty || isSpecialty
                ? "mt-2 text-sm italic"
                : "mt-2 text-sm"
            }
            style={{ color: "var(--shop-ink-muted)" }}
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
            isSpecialty={isSpecialty}
          />
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
                className={
                  isSpecialty
                    ? "space-y-4"
                    : "border-t border-b divide-y"
                }
                style={
                  isSpecialty ? undefined : { borderColor: "var(--shop-border)" }
                }
              >
                {lines.map((l) => (
                  <li
                    key={l.productId}
                    {...(isSpecialty ? { 'data-specialty-kraft': 'true' } : {})}
                    className={
                      isSpecialty
                        ? "flex rounded-md border p-4 sm:p-5"
                        : "flex py-6 sm:py-8"
                    }
                    style={
                      isSpecialty
                        ? { borderColor: "var(--shop-border)" }
                        : undefined
                    }
                  >
                    {/* Image */}
                    <Link
                      href={`/stores/${store.slug}/products/${l.productId}`}
                      {...(isSpecialty
                        ? { 'data-specialty-sepia': 'true' }
                        : {})}
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
                {...(isSpecialty ? { 'data-specialty-kraft': 'true' } : {})}
                className={
                  isSpecialty
                    ? "rounded-md px-6 py-7 shadow-none"
                    : "rounded-2xl px-6 py-7 shadow-none"
                }
                style={{
                  background: "var(--shop-card)",
                  borderColor: "var(--shop-border)",
                }}
              >
                <h3
                  className={
                    isSpecialty ? "text-2xl mb-5" : "text-lg font-bold mb-5"
                  }
                  style={{
                    color: "var(--shop-ink)",
                    ...(isSpecialty
                      ? {
                          fontFamily: SPECIALTY_DISPLAY_FONT,
                          fontWeight: 500,
                        }
                      : {}),
                  }}
                >
                  {isSpecialty ? "Your collection summary" : "สรุปคำสั่งซื้อ"}
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

                <Button
                  asChild
                  size="lg"
                  className="mt-6 h-auto w-full rounded-md py-3.5 px-4 text-base font-semibold text-white"
                  style={{ background: "var(--shop-primary)" }}
                >
                  <Link href={`/stores/${store.slug}/checkout/address`}>
                    ดำเนินการชำระเงิน
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
                  {
                    icon: Truck,
                    label: isSpecialty ? "made in 5-7 days" : "ส่งฟรี ฿990+",
                  },
                  {
                    icon: RotateCcw,
                    label: isSpecialty ? "rework available" : "คืนได้ 7 วัน",
                  },
                  {
                    icon: Banknote,
                    label: isSpecialty ? "supporting makers" : "COD ได้",
                  },
                ].map(({ icon: Icon, label }, i) => (
                  <Card
                    key={i}
                    className={
                      isSpecialty
                        ? "flex flex-col items-center gap-1 rounded-md border py-2 shadow-none"
                        : "flex flex-col items-center gap-1 rounded-lg border-0 py-2 shadow-none"
                    }
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

              {isSpecialty && (
                <p
                  className="mt-5 text-center text-lg italic"
                  style={{
                    color: "var(--shop-accent)",
                    fontFamily: SPECIALTY_HAND_FONT,
                  }}
                >
                  thank you for supporting makers
                </p>
              )}
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
  isSpecialty = false,
}: {
  storeSlug: string;
  isFashionBeauty?: boolean;
  isSpecialty?: boolean;
}) {
  return (
    <Card
      {...(isSpecialty ? { 'data-specialty-kraft': 'true' } : {})}
      className={
        isSpecialty
          ? "text-center py-24 rounded-md border border-dashed shadow-none"
          : "text-center py-24 rounded-2xl border border-dashed bg-transparent shadow-none"
      }
      style={{ borderColor: "var(--shop-border)" }}
    >
      <div
        className={
          isSpecialty
            ? "inline-flex items-center justify-center w-16 h-16 rounded-md mb-4 mx-auto"
            : "inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 mx-auto"
        }
        style={{
          background:
            "color-mix(in srgb, var(--shop-primary) 12%, transparent)",
          color: "var(--shop-primary)",
        }}
      >
        <ShoppingBag className="w-8 h-8" />
      </div>
      <p
        className={
          isFashionBeauty || isSpecialty
            ? "text-2xl"
            : "text-base font-medium"
        }
        style={{
          color: "var(--shop-ink)",
          ...(isFashionBeauty
            ? { fontFamily: FB_DISPLAY_FONT, fontWeight: 500 }
            : isSpecialty
              ? { fontFamily: SPECIALTY_DISPLAY_FONT, fontWeight: 500 }
              : {}),
        }}
      >
        {isFashionBeauty
          ? "Your edit is empty"
          : isSpecialty
            ? "Your collection is empty"
            : "ตะกร้าของคุณยังว่างอยู่"}
      </p>
      <p
        className={
          isFashionBeauty || isSpecialty
            ? "text-sm mt-2 italic"
            : "text-sm mt-2"
        }
        style={{
          color: "var(--shop-ink-muted)",
          ...(isSpecialty ? { fontFamily: SPECIALTY_HAND_FONT } : {}),
        }}
      >
        {isFashionBeauty
          ? "Discover pieces curated for you"
          : isSpecialty
            ? "discover pieces from our makers"
            : "เริ่มเลือกสินค้าที่คุณชอบ"}
      </p>
      <Button
        asChild
        className={
          isFashionBeauty
            ? "mt-6 h-auto rounded-full px-8 py-2.5 text-sm font-medium text-white"
            : "mt-6 h-auto rounded-md px-6 py-2.5 text-sm font-medium text-white"
        }
        style={{ background: "var(--shop-primary)" }}
      >
        <Link href={`/stores/${storeSlug}/category`}>
          {isFashionBeauty
            ? "Start shopping"
            : isSpecialty
              ? "Browse the makers"
              : "เลือกซื้อสินค้า"}
        </Link>
      </Button>
    </Card>
  );
}
