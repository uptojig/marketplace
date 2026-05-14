'use client';

/**
 * TrustCartPage — bespoke heritage-maison cart layout.
 *
 * Structural difference from the generic StoreCartClient and from
 * FashionBeautyCartPage:
 *   - Department-store top band: ALL CAPS letterspaced eyebrow
 *     ("MAISON · YOUR ORDER BOOK") + serif title cartouche framed
 *     by gold hairlines. NO italic anywhere.
 *   - Each line item renders as a single-row LEDGER entry: small
 *     square 1/1 frame on the left, item title + heritage SKU
 *     in tabular caps in the middle, qty stepper + total on the
 *     right. The whole row sits between two gold hairlines so the
 *     list reads like a bound order book, not a card stack.
 *   - Right-rail summary lives in a SHARP BORDERED CARTOUCHE: white
 *     surface with thick gold trim and a serif "ORDER SUMMARY"
 *     label cartouche at the top. Dotted-leader rows mimic an
 *     invoice ledger.
 *   - Free-shipping nudge presented as a sober caps line with a
 *     bracketed annotation, not a progress bar or italic line.
 *   - Empty state is a centered serif title cartouche with caps
 *     instructions and a charcoal CTA.
 *
 * All business logic (useCart, shipping calc, free-shipping
 * threshold, checkout link) matches StoreCartClient so the
 * conversion funnel is unchanged — only the visual surface is
 * bespoke.
 */

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ChevronLeft, ShieldCheck, Truck, RotateCcw, Minus, Plus } from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';

const TRUST_DISPLAY_FONT =
  'var(--font-trust-display, "Playfair Display"), Georgia, "Noto Serif Thai", serif';

const FREE_SHIPPING_THRESHOLD = 990;
const DEFAULT_SHIPPING = 50;

interface StoreLite {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  primaryColor: string | null;
}

/**
 * Build a deterministic 6-char heritage SKU from product id —
 * matches TrustCategoryGrid + TrustProductHero so the same item
 * shows the same SKU across cart / catalog / PDP.
 */
function heritageSku(id: string): string {
  const hash = id
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(-6)
    .padStart(6, '0');
  return `BP-${hash}`;
}

export function TrustCartPage({ store }: { store: StoreLite }) {
  const allLines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const lines = allLines.filter((l) => l.storeSlug === store.slug);
  const subtotal = lines.reduce((n, l) => n + l.priceTHB * l.qty, 0);
  const itemCount = lines.reduce((n, l) => n + l.qty, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING;
  const total = subtotal + shipping;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  if (!mounted) {
    return <div className="min-h-[60vh]" style={{ background: 'var(--shop-bg)' }} />;
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--shop-bg)' }}>
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        {/* Heritage top band — caps eyebrow + serif title cartouche. */}
        <header className="mb-12 sm:mb-16">
          <Link
            href={`/stores/${store.slug}`}
            className="inline-flex items-center gap-1 text-xs uppercase hover:underline"
            style={{
              color: 'var(--shop-ink-muted)',
              letterSpacing: '0.22em',
              fontWeight: 600,
            }}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            กลับสู่เมซอน
          </Link>

          <p
            className="mt-7 text-[11px] uppercase"
            style={{
              color: 'var(--shop-accent)',
              letterSpacing: '0.32em',
              fontWeight: 600,
            }}
          >
            เมซอน · สมุดคำสั่งซื้อ
          </p>

          {/* Title cartouche — squared frame, gold trim. */}
          <div
            className="mt-3 inline-block border-y py-3"
            style={{ borderColor: 'var(--shop-accent)' }}
          >
            <h1
              className="text-4xl sm:text-5xl"
              style={{
                fontFamily: TRUST_DISPLAY_FONT,
                color: 'var(--shop-ink)',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                lineHeight: 1.05,
              }}
            >
              ตะกร้าสินค้า
            </h1>
          </div>

          <p
            className="mt-5 max-w-xl text-sm"
            style={{
              fontFamily: TRUST_DISPLAY_FONT,
              color: 'var(--shop-ink-muted)',
              fontWeight: 500,
            }}
          >
            {lines.length === 0
              ? `สมุดคำสั่งซื้อของคุณว่างเปล่า ดูคอลเลกชันล่าสุดจาก ${store.name}`
              : `${itemCount.toLocaleString()} รายการบันทึกในสมุดคำสั่งซื้อ — กรุณาตรวจสอบก่อนจัดส่ง`}
          </p>
        </header>

        {lines.length === 0 ? (
          <TrustEmptyCart storeSlug={store.slug} />
        ) : (
          <div className="lg:grid lg:grid-cols-[1fr_22rem] lg:gap-12 lg:items-start">
            {/* ── Ledger of line items ──────────────────────────── */}
            <section aria-labelledby="cart-heading">
              <h2 id="cart-heading" className="sr-only">
                สินค้าในตะกร้า
              </h2>

              {/* Ledger header row — caps column labels above the
                  first hairline. Heritage order-book voice. */}
              <div
                className="hidden grid-cols-[1fr_8rem_8rem_2rem] items-end gap-4 border-b pb-3 text-[10px] uppercase sm:grid"
                style={{
                  borderColor: 'var(--shop-accent)',
                  color: 'var(--shop-ink-muted)',
                  letterSpacing: '0.28em',
                  fontWeight: 600,
                }}
              >
                <span>รายการสินค้า</span>
                <span className="text-center">จำนวน</span>
                <span className="text-right">รวม</span>
                <span />
              </div>

              <ul className="divide-y" style={{ borderColor: 'var(--shop-border)' }}>
                {lines.map((l) => (
                  <li
                    key={l.productId}
                    className="grid grid-cols-[5rem_1fr] items-start gap-4 py-6 sm:grid-cols-[6rem_1fr_8rem_8rem_2rem] sm:items-center sm:gap-4"
                    style={{ borderColor: 'var(--shop-border)' }}
                  >
                    {/* Square 1/1 image frame — gold-rule trim. */}
                    <Link
                      href={`/stores/${store.slug}/products/${l.productId}`}
                      className="relative block overflow-hidden rounded-sm border"
                      style={{
                        aspectRatio: '1 / 1',
                        background: 'var(--shop-muted)',
                        borderColor: 'var(--shop-accent)',
                      }}
                    >
                      {l.imageUrl ? (
                        <Image
                          src={l.imageUrl}
                          alt={l.title}
                          fill
                          sizes="(max-width: 640px) 80px, 96px"
                          className="object-cover"
                        />
                      ) : null}
                    </Link>

                    {/* Title + heritage SKU + per-unit price. */}
                    <div className="min-w-0 sm:pr-4">
                      <Link
                        href={`/stores/${store.slug}/products/${l.productId}`}
                        className="line-clamp-2 text-base leading-snug hover:underline sm:text-lg"
                        style={{
                          fontFamily: TRUST_DISPLAY_FONT,
                          color: 'var(--shop-ink)',
                          fontWeight: 600,
                          letterSpacing: '-0.005em',
                        }}
                      >
                        {l.title}
                      </Link>
                      <p
                        className="mt-1 font-mono text-[10px] uppercase"
                        style={{
                          color: 'var(--shop-ink-muted)',
                          letterSpacing: '0.22em',
                        }}
                      >
                        SKU {heritageSku(l.productId)}
                      </p>
                      <p
                        className="mt-2 text-sm"
                        style={{ color: 'var(--shop-ink-muted)' }}
                      >
                        ราคาต่อชิ้น · {formatTHB(l.priceTHB)}
                      </p>

                      {/* Mobile: qty + total stack inside the body
                          since the desktop columns are hidden. */}
                      <div className="mt-3 flex items-center justify-between gap-3 sm:hidden">
                        <QtyStepper
                          qty={l.qty}
                          onDec={() => setQty(l.productId, l.qty - 1, store.slug)}
                          onInc={() => setQty(l.productId, l.qty + 1, store.slug)}
                          onChange={(n) => setQty(l.productId, n, store.slug)}
                          title={l.title}
                        />
                        <p
                          className="text-base font-semibold tabular-nums"
                          style={{ color: 'var(--shop-ink)' }}
                        >
                          {formatTHB(l.priceTHB * l.qty)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(l.productId, store.slug)}
                        className="mt-2 text-[11px] uppercase hover:underline sm:hidden"
                        style={{
                          color: 'var(--shop-ink-muted)',
                          letterSpacing: '0.22em',
                          fontWeight: 600,
                        }}
                        aria-label={`ลบ ${l.title}`}
                      >
                        ลบออกจากคำสั่งซื้อ
                      </button>
                    </div>

                    {/* Desktop columns — qty stepper + line total + remove. */}
                    <div className="hidden justify-self-center sm:block">
                      <QtyStepper
                        qty={l.qty}
                        onDec={() => setQty(l.productId, l.qty - 1, store.slug)}
                        onInc={() => setQty(l.productId, l.qty + 1, store.slug)}
                        onChange={(n) => setQty(l.productId, n, store.slug)}
                        title={l.title}
                      />
                    </div>

                    <p
                      className="hidden text-right text-base font-semibold tabular-nums sm:block"
                      style={{ color: 'var(--shop-ink)' }}
                    >
                      {formatTHB(l.priceTHB * l.qty)}
                    </p>

                    <div className="hidden text-right sm:block">
                      <button
                        type="button"
                        onClick={() => remove(l.productId, store.slug)}
                        className="text-[11px] uppercase hover:underline"
                        style={{
                          color: 'var(--shop-ink-muted)',
                          letterSpacing: '0.22em',
                          fontWeight: 600,
                        }}
                        aria-label={`ลบ ${l.title}`}
                      >
                        ลบ
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Closing gold rule under the ledger. */}
              <div
                aria-hidden
                className="h-px w-full"
                style={{ background: 'var(--shop-accent)' }}
              />

              {/* Free-shipping nudge — sober caps line with bracket. */}
              {remainingForFreeShipping > 0 && (
                <p
                  className="mt-6 text-center text-xs uppercase"
                  style={{
                    color: 'var(--shop-ink-muted)',
                    letterSpacing: '0.22em',
                    fontWeight: 600,
                  }}
                >
                  [ เพิ่มอีก{' '}
                  <span style={{ color: 'var(--shop-ink)' }}>
                    {formatTHB(remainingForFreeShipping)}
                  </span>{' '}
                  เพื่อรับสิทธิ์จัดส่งฟรี ]
                </p>
              )}
            </section>

            {/* ── Order summary cartouche ──────────────────────── */}
            <aside
              aria-labelledby="summary-heading"
              className="mt-12 lg:mt-0 lg:sticky lg:top-24"
            >
              <h2 id="summary-heading" className="sr-only">
                สรุปคำสั่งซื้อ
              </h2>

              {/* Sharp white cartouche with thick gold border. */}
              <div
                className="rounded-sm border-2 bg-white p-7"
                style={{ borderColor: 'var(--shop-accent)' }}
              >
                <p
                  className="text-[11px] uppercase"
                  style={{
                    color: 'var(--shop-accent)',
                    letterSpacing: '0.32em',
                    fontWeight: 600,
                  }}
                >
                  สรุปคำสั่งซื้อ
                </p>
                <h3
                  className="mt-2 text-2xl"
                  style={{
                    fontFamily: TRUST_DISPLAY_FONT,
                    color: 'var(--shop-ink)',
                    fontWeight: 600,
                  }}
                >
                  รายการชำระเงิน
                </h3>

                <div
                  aria-hidden
                  className="mt-4 h-px w-full"
                  style={{ background: 'var(--shop-accent)' }}
                />

                <dl className="mt-6 space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <dt
                      className="uppercase"
                      style={{
                        color: 'var(--shop-ink-muted)',
                        letterSpacing: '0.18em',
                        fontWeight: 600,
                        fontSize: '11px',
                      }}
                    >
                      ยอดรวมย่อย
                    </dt>
                    <dd
                      className="font-semibold tabular-nums"
                      style={{ color: 'var(--shop-ink)' }}
                    >
                      {formatTHB(subtotal)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt
                      className="uppercase"
                      style={{
                        color: 'var(--shop-ink-muted)',
                        letterSpacing: '0.18em',
                        fontWeight: 600,
                        fontSize: '11px',
                      }}
                    >
                      ค่าจัดส่ง
                    </dt>
                    <dd
                      className="font-semibold tabular-nums"
                      style={{
                        color:
                          shipping === 0 ? 'var(--shop-accent)' : 'var(--shop-ink)',
                      }}
                    >
                      {shipping === 0 ? 'ฟรี' : formatTHB(shipping)}
                    </dd>
                  </div>
                  <div
                    className="flex items-baseline justify-between border-t pt-4"
                    style={{ borderColor: 'var(--shop-accent)' }}
                  >
                    <dt
                      className="uppercase"
                      style={{
                        color: 'var(--shop-ink)',
                        letterSpacing: '0.22em',
                        fontWeight: 600,
                        fontSize: '12px',
                      }}
                    >
                      ยอดชำระทั้งหมด
                    </dt>
                    <dd
                      className="text-2xl font-semibold tabular-nums"
                      style={{
                        color: 'var(--shop-ink)',
                        fontFamily: TRUST_DISPLAY_FONT,
                      }}
                    >
                      {formatTHB(total)}
                    </dd>
                  </div>
                </dl>

                <Link
                  href={`/stores/${store.slug}/checkout/address`}
                  className="mt-7 inline-flex h-12 w-full items-center justify-center rounded-sm text-xs font-semibold uppercase text-white transition hover:opacity-90"
                  style={{
                    background: 'var(--shop-primary)',
                    letterSpacing: '0.28em',
                  }}
                >
                  ดำเนินการชำระเงิน
                </Link>

                <p
                  className="mt-4 flex items-center justify-center gap-1.5 text-center text-[10px] uppercase"
                  style={{
                    color: 'var(--shop-ink-muted)',
                    letterSpacing: '0.22em',
                    fontWeight: 600,
                  }}
                >
                  <ShieldCheck className="h-3 w-3" />
                  ชำระเงินปลอดภัย · Basketplace
                </p>
              </div>

              {/* Heritage trust strip — caps label + serif row. */}
              <ul
                data-trust-rule="true"
                className="mt-6 space-y-4 pt-5 text-sm"
                style={{ color: 'var(--shop-ink)' }}
              >
                <li className="flex items-start gap-3">
                  <Truck
                    className="mt-0.5 h-4 w-4 shrink-0"
                    style={{ color: 'var(--shop-accent)' }}
                  />
                  <div>
                    <div
                      className="text-[10px] uppercase"
                      style={{
                        color: 'var(--shop-ink-muted)',
                        letterSpacing: '0.22em',
                        fontWeight: 600,
                      }}
                    >
                      จัดส่งฟรี
                    </div>
                    <div
                      className="mt-1 text-sm"
                      style={{
                        fontFamily: TRUST_DISPLAY_FONT,
                        fontWeight: 500,
                      }}
                    >
                      เมื่อสั่งซื้อตั้งแต่ {formatTHB(FREE_SHIPPING_THRESHOLD)} ขึ้นไป
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <RotateCcw
                    className="mt-0.5 h-4 w-4 shrink-0"
                    style={{ color: 'var(--shop-accent)' }}
                  />
                  <div>
                    <div
                      className="text-[10px] uppercase"
                      style={{
                        color: 'var(--shop-ink-muted)',
                        letterSpacing: '0.22em',
                        fontWeight: 600,
                      }}
                    >
                      รับคืนสินค้า
                    </div>
                    <div
                      className="mt-1 text-sm"
                      style={{
                        fontFamily: TRUST_DISPLAY_FONT,
                        fontWeight: 500,
                      }}
                    >
                      ภายใน 7 วันหลังรับสินค้า
                    </div>
                  </div>
                </li>
              </ul>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

/**
 * QtyStepper — squared rectangular stepper (no pill). Used inline
 * by both desktop and mobile branches of the ledger row to keep
 * the stepper visual consistent.
 */
function QtyStepper({
  qty,
  onDec,
  onInc,
  onChange,
  title,
}: {
  qty: number;
  onDec: () => void;
  onInc: () => void;
  onChange: (n: number) => void;
  title: string;
}) {
  return (
    <div
      className="inline-flex h-9 items-center overflow-hidden rounded-sm border bg-white"
      style={{ borderColor: 'var(--shop-border)' }}
    >
      <button
        type="button"
        onClick={onDec}
        disabled={qty <= 1}
        aria-label="ลด"
        className="inline-flex h-9 w-9 items-center justify-center text-sm disabled:opacity-40"
        style={{ color: 'var(--shop-ink)' }}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        value={qty}
        onChange={(e) => onChange(Math.max(1, parseInt(e.target.value, 10) || 1))}
        className="h-9 w-10 border-x bg-transparent text-center text-sm tabular-nums focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        style={{
          color: 'var(--shop-ink)',
          borderColor: 'var(--shop-border)',
        }}
        aria-label={`จำนวน ${title}`}
      />
      <button
        type="button"
        onClick={onInc}
        aria-label="เพิ่ม"
        className="inline-flex h-9 w-9 items-center justify-center text-sm"
        style={{ color: 'var(--shop-ink)' }}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function TrustEmptyCart({ storeSlug }: { storeSlug: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {/* Squared crest plate — gold-rule frame, charcoal monogram. */}
      <div
        className="mx-auto mb-10 flex h-32 w-32 items-center justify-center rounded-sm border-2 bg-white"
        style={{ borderColor: 'var(--shop-accent)' }}
      >
        <span
          className="text-3xl"
          style={{
            fontFamily: TRUST_DISPLAY_FONT,
            color: 'var(--shop-ink)',
            fontWeight: 600,
            letterSpacing: '-0.01em',
          }}
        >
          BP
        </span>
      </div>
      <p
        className="text-[11px] uppercase"
        style={{
          color: 'var(--shop-accent)',
          letterSpacing: '0.32em',
          fontWeight: 600,
        }}
      >
        สมุดคำสั่งซื้อ · ว่างเปล่า
      </p>
      <h2
        className="mt-3 text-3xl sm:text-4xl"
        style={{
          fontFamily: TRUST_DISPLAY_FONT,
          color: 'var(--shop-ink)',
          fontWeight: 600,
          letterSpacing: '-0.01em',
        }}
      >
        ตะกร้าสินค้าของคุณ
      </h2>
      <div
        aria-hidden
        className="mx-auto mt-5 h-px w-12"
        style={{ background: 'var(--shop-accent)' }}
      />
      <p
        className="mx-auto mt-6 max-w-md text-sm"
        style={{
          fontFamily: TRUST_DISPLAY_FONT,
          color: 'var(--shop-ink-muted)',
          fontWeight: 500,
        }}
      >
        เลือกชมสินค้าล่าสุดจากเมซอนและเพิ่มลงในสมุดคำสั่งซื้อของคุณ
      </p>
      <Link
        href={`/stores/${storeSlug}/category`}
        className="mt-8 inline-flex h-12 items-center justify-center rounded-sm px-10 text-xs font-semibold uppercase text-white transition hover:opacity-90"
        style={{
          background: 'var(--shop-primary)',
          letterSpacing: '0.28em',
        }}
      >
        ดูคอลเลกชัน
      </Link>
    </div>
  );
}
