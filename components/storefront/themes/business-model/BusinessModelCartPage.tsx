'use client';

/**
 * BusinessModelCartPage — bespoke deal-dashboard / wholesale-utility
 * cart layout.
 *
 * Structural difference from the generic StoreCartClient and from
 * FashionBeautyCartPage / TrustCartPage:
 *   - Top band reads as a B2B "BULK ORDER" dashboard header: caps
 *     eyebrow ("BULK ORDER · DEAL DASHBOARD") + bold sans h1 +
 *     mono-numeric line-count chip ("LINES 4 · QTY 12"). NO italic
 *     anywhere — utility, not editorial.
 *   - Tier-discount banner pinned UNDER the header ONLY when the
 *     cart hits a higher tier (qty >= 10). Renders as a red->amber
 *     stripe with mono savings number ("TIER 2 · 8% off this order").
 *     Drops to a yellow-50 nudge below tier 1 telling the buyer how
 *     many more units unlock the next tier.
 *   - Each line item renders as a LEDGER ROW in a 5-column grid:
 *     [thumb 56px] [Item + SKU] [Unit] [Qty stepper] [Subtotal +
 *     remove]. Sits in a single bordered table-card so the list reads
 *     like a spreadsheet. Header strip with "ITEM / UNIT / QTY /
 *     SUBTOTAL" caps row sits above the rows.
 *   - All prices in JetBrains Mono with tabular-nums. Item title in
 *     bold sans, SKU in mono caps caption.
 *   - Right-rail SUMMARY card uses dotted-leader ledger rows (sub /
 *     volume discount / shipping / total). Volume-discount line shows
 *     mint savings color ("-฿1,234"). Total in oversized red mono.
 *   - Primary CTA reads "CHECKOUT · BULK ORDER" — rectangular red
 *     rounded-md, NOT a pill. Secondary "Request quote" outlined link.
 *   - Empty state is a dashboard placeholder: caps eyebrow + bold sans
 *     headline + spreadsheet-icon block + red rectangular CTA.
 *
 * All business logic (useCart, shipping calc, free-shipping threshold,
 * per-store filter, checkout link) matches StoreCartClient so the
 * conversion funnel is unchanged — only the visual surface is bespoke.
 *
 * Reuses bmActiveTier from lib/landing/business-model so the cart's
 * tier banner stays in sync with the PDP's tier-pricing table.
 */

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import {
  AlertCircle,
  ChevronLeft,
  Mail,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  ShoppingCart,
  TrendingDown,
  Truck,
  X,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import { BM_DEFAULT_TIERS, bmActiveTier, bmSku } from '@/lib/landing/business-model';

const BM_MONO_FONT =
  'var(--font-bm-mono, "JetBrains Mono"), ui-monospace, "Cascadia Mono", "Source Code Pro", monospace';

const FREE_SHIPPING_THRESHOLD = 990;
const DEFAULT_SHIPPING = 50;

interface StoreLite {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  primaryColor: string | null;
}

export function BusinessModelCartPage({ store }: { store: StoreLite }) {
  const allLines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const lines = allLines.filter((l) => l.storeSlug === store.slug);
  const subtotal = lines.reduce((n, l) => n + l.priceTHB * l.qty, 0);
  const itemCount = lines.reduce((n, l) => n + l.qty, 0);
  const lineCount = lines.length;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING;

  // Volume-discount banner — engages once cart total qty crosses the
  // tier-2 floor (10 units). bmActiveTier reads from BM_DEFAULT_TIERS
  // so the cart's tier matches the PDP's volume-pricing table.
  const tier = bmActiveTier(itemCount);
  const tierIndex = BM_DEFAULT_TIERS.findIndex((t) => t.label === tier.label);
  const nextTier = BM_DEFAULT_TIERS[tierIndex + 1] ?? null;
  const tierDiscountPct = tier.savingsPct;
  const volumeDiscountAmount =
    tierDiscountPct > 0 ? Math.round(subtotal * (tierDiscountPct / 100)) : 0;
  const discountedSubtotal = subtotal - volumeDiscountAmount;
  const total = discountedSubtotal + shipping;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - total);
  const unitsToNextTier = nextTier ? Math.max(0, nextTier.minQty - itemCount) : 0;

  if (!mounted) {
    return <div className="min-h-[60vh]" style={{ background: 'var(--shop-bg)' }} />;
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--shop-bg)' }}>
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 sm:pt-12 lg:px-8">
        {/* Dashboard header — caps eyebrow + bold sans h1 + count chip */}
        <header className="mb-6 sm:mb-8">
          <Link
            href={`/stores/${store.slug}`}
            className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] hover:underline"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            กลับไปแคตตาล็อก
          </Link>
          <p
            className="mt-5 text-[11px] font-semibold uppercase tracking-[0.12em]"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            สั่งซื้อจำนวนมาก · ดีลที่กำลังจะหมดเวลา
          </p>
          <div className="mt-1 flex flex-wrap items-baseline justify-between gap-3">
            <h1
              className="text-3xl sm:text-4xl"
              style={{
                color: 'var(--shop-ink)',
                fontWeight: 700,
                letterSpacing: '-0.015em',
                lineHeight: 1.05,
              }}
            >
              บัญชีคำสั่งซื้อ
            </h1>
            <span
              className="inline-flex items-center gap-2 rounded-md border px-3 py-1 text-xs font-semibold"
              style={{
                borderColor: 'var(--shop-border)',
                color: 'var(--shop-ink-muted)',
              }}
            >
              <span className="uppercase tracking-[0.12em]">รายการ</span>
              <span
                data-bm-mono="true"
                style={{
                  color: 'var(--shop-ink)',
                  fontFamily: BM_MONO_FONT,
                  fontVariantNumeric: 'tabular-nums',
                  fontWeight: 700,
                }}
              >
                {lineCount}
              </span>
              <span aria-hidden style={{ color: 'var(--shop-border)' }}>
                ·
              </span>
              <span className="uppercase tracking-[0.12em]">จำนวน</span>
              <span
                data-bm-mono="true"
                style={{
                  color: 'var(--shop-ink)',
                  fontFamily: BM_MONO_FONT,
                  fontVariantNumeric: 'tabular-nums',
                  fontWeight: 700,
                }}
              >
                {itemCount}
              </span>
            </span>
          </div>
        </header>

        {lines.length === 0 ? (
          <BusinessModelEmptyCart storeSlug={store.slug} />
        ) : (
          <>
            {/* Tier-discount banner — fires when cart has hit tier 2+ */}
            {tierDiscountPct > 0 ? (
              <div
                data-bm-countdown="true"
                className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-md px-4 py-3 text-sm sm:text-base"
                style={{ background: 'var(--shop-primary)', color: '#ffffff' }}
              >
                <div className="flex items-center gap-2.5">
                  <TrendingDown className="h-4 w-4 shrink-0" />
                  <span className="font-bold uppercase tracking-[0.12em]">
                    ปลดล็อกระดับ {tierIndex + 1}
                  </span>
                  <span
                    data-bm-mono="true"
                    className="font-bold"
                    style={{
                      fontFamily: BM_MONO_FONT,
                      fontVariantNumeric: 'tabular-nums',
                      letterSpacing: '0.02em',
                    }}
                  >
                    ลด {tierDiscountPct}%
                  </span>
                  <span className="text-xs opacity-90 hidden sm:inline">
                    ทั้งคำสั่งซื้อ
                  </span>
                </div>
                {nextTier && unitsToNextTier > 0 && (
                  <span className="text-xs uppercase tracking-[0.12em] opacity-90">
                    เพิ่มอีก{' '}
                    <span
                      data-bm-mono="true"
                      className="font-bold"
                      style={{
                        fontFamily: BM_MONO_FONT,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {unitsToNextTier}
                    </span>{' '}
                    เพื่อรับลด{' '}
                    <span
                      data-bm-mono="true"
                      className="font-bold"
                      style={{
                        fontFamily: BM_MONO_FONT,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {nextTier.savingsPct}%
                    </span>
                  </span>
                )}
              </div>
            ) : nextTier ? (
              <div
                className="mb-5 flex flex-wrap items-center gap-2.5 rounded-md border px-4 py-3 text-sm"
                style={{
                  background: 'var(--shop-muted)',
                  borderColor: 'var(--shop-accent)',
                  color: 'var(--shop-ink)',
                }}
              >
                <AlertCircle
                  className="h-4 w-4 shrink-0"
                  style={{ color: 'var(--shop-accent)' }}
                />
                <span className="font-semibold uppercase tracking-[0.12em] text-[11px]">
                  ส่วนลดจากปริมาณ
                </span>
                <span className="text-xs sm:text-sm">
                  เพิ่มอีก{' '}
                  <span
                    data-bm-mono="true"
                    className="font-bold"
                    style={{
                      fontFamily: BM_MONO_FONT,
                      fontVariantNumeric: 'tabular-nums',
                      color: 'var(--shop-primary)',
                    }}
                  >
                    {unitsToNextTier}
                  </span>{' '}
                  ชิ้นเพื่อปลดล็อกระดับ {tierIndex + 2} ({' '}
                  <span
                    data-bm-mono="true"
                    className="font-bold"
                    style={{
                      fontFamily: BM_MONO_FONT,
                      fontVariantNumeric: 'tabular-nums',
                      color: 'var(--shop-savings, #10b981)',
                    }}
                  >
                    -{nextTier.savingsPct}%
                  </span>{' '}
                  ทุกชิ้น )
                </span>
              </div>
            ) : null}

            <div className="lg:grid lg:grid-cols-[1fr_22rem] lg:gap-8 lg:items-start">
              {/* ── Spreadsheet ledger ─────────────────────────────── */}
              <section aria-labelledby="cart-heading">
                <h2 id="cart-heading" className="sr-only">
                  รายการในตะกร้า
                </h2>
                <div
                  className="overflow-hidden rounded-md border bg-white"
                  style={{ borderColor: 'var(--shop-border)' }}
                >
                  {/* Spreadsheet header strip */}
                  <div
                    className="hidden grid-cols-[3.5rem_minmax(0,1fr)_5.5rem_8rem_7rem] gap-3 border-b px-4 py-2.5 text-[10px] font-semibold uppercase sm:grid"
                    style={{
                      background: '#fafafa',
                      borderColor: 'var(--shop-border)',
                      color: 'var(--shop-ink-muted)',
                      letterSpacing: '0.12em',
                    }}
                  >
                    <span className="sr-only">รูปภาพ</span>
                    <span>สินค้า · SKU</span>
                    <span>ต่อหน่วย</span>
                    <span>จำนวน</span>
                    <span className="text-right">รวม</span>
                  </div>

                  <ul>
                    {lines.map((l, idx) => {
                      const lineTotal = l.priceTHB * l.qty;
                      const sku = bmSku(l.productId);
                      return (
                        <li
                          key={`${l.productId}-${l.storeSlug}`}
                          data-bm-row={idx % 2 === 1 ? 'alt' : undefined}
                          className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-3 border-t px-4 py-4 sm:grid-cols-[3.5rem_minmax(0,1fr)_5.5rem_8rem_7rem]"
                          style={{
                            borderColor: 'var(--shop-border)',
                            background:
                              idx % 2 === 1 ? 'var(--shop-muted)' : undefined,
                          }}
                        >
                          {/* Square thumb */}
                          <Link
                            href={`/stores/${store.slug}/products/${l.productId}`}
                            className="relative block aspect-square overflow-hidden rounded-sm border bg-white"
                            style={{ borderColor: 'var(--shop-border)' }}
                          >
                            {l.imageUrl ? (
                              <Image
                                src={l.imageUrl}
                                alt={l.title}
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Package
                                  className="h-4 w-4"
                                  style={{ color: 'var(--shop-ink-muted)' }}
                                />
                              </div>
                            )}
                          </Link>

                          {/* Item + SKU */}
                          <div className="min-w-0">
                            <Link
                              href={`/stores/${store.slug}/products/${l.productId}`}
                              className="line-clamp-2 text-sm font-bold leading-snug hover:underline"
                              style={{ color: 'var(--shop-ink)' }}
                            >
                              {l.title}
                            </Link>
                            <p
                              data-bm-mono="true"
                              className="mt-0.5 text-[10px] uppercase"
                              style={{
                                color: 'var(--shop-ink-muted)',
                                letterSpacing: '0.12em',
                                fontFamily: BM_MONO_FONT,
                                fontVariantNumeric: 'tabular-nums',
                              }}
                            >
                              {sku}
                            </p>
                            {/* Mobile-only mono price under title */}
                            <p
                              data-bm-mono="true"
                              className="mt-1 text-sm font-bold sm:hidden"
                              style={{
                                color: 'var(--shop-primary)',
                                fontFamily: BM_MONO_FONT,
                                fontVariantNumeric: 'tabular-nums',
                              }}
                            >
                              {formatTHB(l.priceTHB)} ×{' '}
                              <span style={{ color: 'var(--shop-ink)' }}>
                                {l.qty}
                              </span>{' '}
                              ={' '}
                              <span style={{ color: 'var(--shop-ink)' }}>
                                {formatTHB(lineTotal)}
                              </span>
                            </p>
                          </div>

                          {/* Unit price */}
                          <div className="hidden sm:block">
                            <p
                              data-bm-mono="true"
                              className="text-sm font-bold"
                              style={{
                                color: 'var(--shop-ink)',
                                fontFamily: BM_MONO_FONT,
                                fontVariantNumeric: 'tabular-nums',
                              }}
                            >
                              {formatTHB(l.priceTHB)}
                            </p>
                          </div>

                          {/* Qty stepper — square corners */}
                          <div className="col-span-2 mt-3 flex items-center sm:col-span-1 sm:mt-0">
                            <div
                              className="inline-flex h-9 items-center overflow-hidden rounded-md border bg-white"
                              style={{ borderColor: 'var(--shop-border)' }}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  setQty(l.productId, l.qty - 1, store.slug)
                                }
                                disabled={l.qty <= 1}
                                aria-label="ลดจำนวน"
                                className="inline-flex h-9 w-9 items-center justify-center text-sm transition hover:bg-[var(--shop-muted)] disabled:opacity-40"
                                style={{ color: 'var(--shop-ink)' }}
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <input
                                type="number"
                                inputMode="numeric"
                                min={1}
                                value={l.qty}
                                onChange={(e) =>
                                  setQty(
                                    l.productId,
                                    Math.max(1, parseInt(e.target.value, 10) || 1),
                                    store.slug,
                                  )
                                }
                                data-bm-mono="true"
                                className="h-9 w-12 border-x bg-transparent text-center text-sm font-bold focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                style={{
                                  color: 'var(--shop-ink)',
                                  borderColor: 'var(--shop-border)',
                                  fontFamily: BM_MONO_FONT,
                                  fontVariantNumeric: 'tabular-nums',
                                }}
                                aria-label={`จำนวนของ ${l.title}`}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setQty(l.productId, l.qty + 1, store.slug)
                                }
                                aria-label="เพิ่มจำนวน"
                                className="inline-flex h-9 w-9 items-center justify-center text-sm transition hover:bg-[var(--shop-muted)]"
                                style={{ color: 'var(--shop-ink)' }}
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Subtotal + remove (desktop) */}
                          <div className="col-span-2 mt-2 flex items-center justify-between sm:col-span-1 sm:mt-0 sm:flex-col sm:items-end sm:justify-center sm:gap-1.5">
                            <p
                              data-bm-mono="true"
                              className="hidden text-base font-bold sm:block"
                              style={{
                                color: 'var(--shop-primary)',
                                fontFamily: BM_MONO_FONT,
                                fontVariantNumeric: 'tabular-nums',
                              }}
                            >
                              {formatTHB(lineTotal)}
                            </p>
                            <button
                              type="button"
                              onClick={() => remove(l.productId, store.slug)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] transition hover:text-[var(--shop-primary)]"
                              style={{ color: 'var(--shop-ink-muted)' }}
                              aria-label={`ลบ ${l.title}`}
                            >
                              <X className="h-3 w-3" />
                              ลบ
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Free-shipping nudge — sober dashboard line */}
                {remainingForFreeShipping > 0 && (
                  <p
                    className="mt-4 text-xs font-semibold uppercase"
                    style={{
                      color: 'var(--shop-ink-muted)',
                      letterSpacing: '0.12em',
                    }}
                  >
                    เพิ่มอีก{' '}
                    <span
                      data-bm-mono="true"
                      className="font-bold"
                      style={{
                        color: 'var(--shop-primary)',
                        fontFamily: BM_MONO_FONT,
                        fontVariantNumeric: 'tabular-nums',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {formatTHB(remainingForFreeShipping)}
                    </span>{' '}
                    เพื่อรับจัดส่งฟรี
                  </p>
                )}
              </section>

              {/* ── Summary card — dotted-leader ledger ───────────── */}
              <aside
                aria-labelledby="summary-heading"
                className="mt-8 lg:mt-0 lg:sticky lg:top-24"
              >
                <h2 id="summary-heading" className="sr-only">
                  สรุปคำสั่งซื้อ
                </h2>

                <div
                  className="rounded-md border bg-white p-5"
                  style={{ borderColor: 'var(--shop-border)' }}
                >
                  <p
                    className="text-[11px] font-semibold uppercase"
                    style={{
                      color: 'var(--shop-ink-muted)',
                      letterSpacing: '0.12em',
                    }}
                  >
                    สรุปคำสั่งซื้อ
                  </p>
                  <h3
                    className="mt-1 text-xl"
                    style={{
                      color: 'var(--shop-ink)',
                      fontWeight: 700,
                      letterSpacing: '-0.015em',
                    }}
                  >
                    สั่งซื้อจำนวนมาก
                  </h3>

                  <dl className="mt-5 space-y-2.5 text-sm">
                    <div className="flex items-center justify-between">
                      <dt style={{ color: 'var(--shop-ink-muted)' }}>
                        ยอดรวมสินค้า{' '}
                        <span
                          data-bm-mono="true"
                          style={{
                            fontFamily: BM_MONO_FONT,
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          ({itemCount})
                        </span>
                      </dt>
                      <dd
                        data-bm-mono="true"
                        className="font-bold"
                        style={{
                          color: 'var(--shop-ink)',
                          fontFamily: BM_MONO_FONT,
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {formatTHB(subtotal)}
                      </dd>
                    </div>

                    {volumeDiscountAmount > 0 && (
                      <div className="flex items-center justify-between">
                        <dt
                          className="inline-flex items-center gap-2"
                          style={{ color: 'var(--shop-ink-muted)' }}
                        >
                          <span>ส่วนลดจากปริมาณ</span>
                          <span
                            data-bm-savings="true"
                            className="rounded-sm px-1.5 py-0.5 text-[10px] font-bold uppercase"
                            style={{
                              background: 'var(--shop-savings, #10b981)',
                              color: '#ffffff',
                              letterSpacing: '0.06em',
                            }}
                          >
                            ระดับ {tierIndex + 1}
                          </span>
                        </dt>
                        <dd
                          data-bm-mono="true"
                          className="font-bold"
                          style={{
                            color: 'var(--shop-savings, #10b981)',
                            fontFamily: BM_MONO_FONT,
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          -{formatTHB(volumeDiscountAmount)}
                        </dd>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <dt style={{ color: 'var(--shop-ink-muted)' }}>ค่าจัดส่ง</dt>
                      <dd
                        data-bm-mono="true"
                        className="font-bold"
                        style={{
                          color:
                            shipping === 0
                              ? 'var(--shop-savings, #10b981)'
                              : 'var(--shop-ink)',
                          fontFamily: BM_MONO_FONT,
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {shipping === 0 ? 'ฟรี' : formatTHB(shipping)}
                      </dd>
                    </div>

                    <div
                      className="flex items-baseline justify-between border-t pt-3"
                      style={{ borderColor: 'var(--shop-border)' }}
                    >
                      <dt
                        className="text-sm font-bold uppercase"
                        style={{
                          color: 'var(--shop-ink),',
                          letterSpacing: '0.12em',
                        }}
                      >
                        ยอดรวม
                      </dt>
                      <dd
                        data-bm-mono="true"
                        className="text-2xl font-bold"
                        style={{
                          color: 'var(--shop-primary)',
                          fontFamily: BM_MONO_FONT,
                          fontVariantNumeric: 'tabular-nums',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {formatTHB(total)}
                      </dd>
                    </div>
                  </dl>

                  <Link
                    href={`/stores/${store.slug}/checkout/address`}
                    className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md text-sm font-bold uppercase tracking-[0.08em] text-white shadow-sm transition hover:opacity-90"
                    style={{ background: 'var(--shop-primary)' }}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    ชำระเงิน · สั่งซื้อจำนวนมาก
                  </Link>

                  <a
                    href={`mailto:sales@basketplace.local?subject=${encodeURIComponent(
                      `Quote request: bulk order from ${store.name} (${itemCount} units)`,
                    )}`}
                    className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border text-xs font-bold uppercase tracking-[0.08em] transition hover:bg-[var(--shop-muted)]"
                    style={{
                      borderColor: 'var(--shop-ink)',
                      color: 'var(--shop-ink)',
                    }}
                  >
                    <Mail className="h-4 w-4" />
                    ขอใบเสนอราคา
                  </a>

                  <p
                    className="mt-4 inline-flex w-full items-center justify-center gap-1.5 text-[11px] font-semibold uppercase"
                    style={{
                      color: 'var(--shop-ink-muted)',
                      letterSpacing: '0.12em',
                    }}
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    ชำระเงินอย่างปลอดภัย · B2B
                  </p>
                </div>

                {/* Utility strip — fast facts for B2B buyers */}
                <ul className="mt-4 space-y-2">
                  <li
                    className="flex items-start gap-2 rounded-md border p-2.5"
                    style={{ borderColor: 'var(--shop-border)' }}
                  >
                    <Truck
                      className="mt-0.5 h-4 w-4 shrink-0"
                      style={{ color: 'var(--shop-primary)' }}
                    />
                    <div className="text-xs">
                      <div
                        className="font-semibold uppercase"
                        style={{
                          color: 'var(--shop-ink-muted)',
                          letterSpacing: '0.12em',
                          fontSize: '10px',
                        }}
                      >
                        ค่าจัดส่ง
                      </div>
                      <div className="font-semibold" style={{ color: 'var(--shop-ink)' }}>
                        ฟรีเมื่อซื้อเกิน{' '}
                        <span
                          data-bm-mono="true"
                          style={{
                            fontFamily: BM_MONO_FONT,
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {formatTHB(FREE_SHIPPING_THRESHOLD)}
                        </span>
                      </div>
                    </div>
                  </li>
                  <li
                    className="flex items-start gap-2 rounded-md border p-2.5"
                    style={{ borderColor: 'var(--shop-border)' }}
                  >
                    <TrendingDown
                      className="mt-0.5 h-4 w-4 shrink-0"
                      style={{ color: 'var(--shop-savings, #10b981)' }}
                    />
                    <div className="text-xs">
                      <div
                        className="font-semibold uppercase"
                        style={{
                          color: 'var(--shop-ink-muted)',
                          letterSpacing: '0.12em',
                          fontSize: '10px',
                        }}
                      >
                        ส่วนลดจากปริมาณ
                      </div>
                      <div className="font-semibold" style={{ color: 'var(--shop-ink)' }}>
                        สูงสุด{' '}
                        <span
                          data-bm-mono="true"
                          style={{
                            fontFamily: BM_MONO_FONT,
                            fontVariantNumeric: 'tabular-nums',
                            color: 'var(--shop-savings, #10b981)',
                          }}
                        >
                          -20%
                        </span>{' '}
                        เมื่อซื้อ 50+ ชิ้น
                      </div>
                    </div>
                  </li>
                </ul>
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function BusinessModelEmptyCart({ storeSlug }: { storeSlug: string }) {
  return (
    <div
      className="mx-auto max-w-xl rounded-md border bg-white p-12 text-center"
      style={{ borderColor: 'var(--shop-border)' }}
    >
      <div
        className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-md border"
        style={{
          background: 'var(--shop-muted)',
          borderColor: 'var(--shop-accent)',
          color: 'var(--shop-ink-muted)',
        }}
      >
        <ShoppingCart className="h-7 w-7" />
      </div>
      <p
        className="text-[11px] font-semibold uppercase"
        style={{
          color: 'var(--shop-ink-muted)',
          letterSpacing: '0.12em',
        }}
      >
        ยังไม่มีรายการ
      </p>
      <h2
        className="mt-2 text-2xl sm:text-3xl"
        style={{
          color: 'var(--shop-ink)',
          fontWeight: 700,
          letterSpacing: '-0.015em',
        }}
      >
        ตะกร้าว่าง
      </h2>
      <p
        className="mx-auto mt-3 max-w-sm text-sm"
        style={{ color: 'var(--shop-ink-muted)' }}
      >
        เลือกชมแคตตาล็อกเพื่อเริ่มสั่งซื้อจำนวนมาก ส่วนลดจากปริมาณเริ่มต้นที่{' '}
        <span
          data-bm-mono="true"
          style={{
            fontFamily: BM_MONO_FONT,
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 700,
            color: 'var(--shop-ink)',
          }}
        >
          10
        </span>{' '}
        และ{' '}
        <span
          data-bm-mono="true"
          style={{
            fontFamily: BM_MONO_FONT,
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 700,
            color: 'var(--shop-ink)',
          }}
        >
          50
        </span>{' '}
        ชิ้น
      </p>
      <Link
        href={`/stores/${storeSlug}/category`}
        className="mt-7 inline-flex h-11 items-center justify-center rounded-md px-7 text-xs font-bold uppercase tracking-[0.08em] text-white shadow-sm transition hover:opacity-90"
        style={{ background: 'var(--shop-primary)' }}
      >
        ดูแคตตาล็อก
      </Link>
    </div>
  );
}
