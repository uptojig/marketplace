'use client';

/**
 * ElectronicsTechCartPage — bespoke ET cart layout.
 *
 * Structural difference from the generic StoreCartClient (cart-client.tsx):
 *   - Mono "CART · NN ITEMS" eyebrow + Inter Tight display h1, NOT the
 *     generic back-link + h1 stack. Reads as a spec-sheet header.
 *   - Each line item is a horizontal SPEC-SHEET ROW: square 1/1 thumb on
 *     the left, title + mono SKU subtitle + mint "In stock" chip in the
 *     middle, sharp-bordered qty stepper + mono unit price on the right.
 *   - Right-rail order summary is a white sharp-bordered card with mono
 *     uppercase labels ("SUBTOTAL" / "SHIPPING" / "TOTAL") and tabular-num
 *     mono totals — replaces the FB soft-pink rounded-2xl frame.
 *   - Free-shipping nudge presented as a mono caps line ("ADD ฿XXX TO
 *     UNLOCK FREE SHIPPING") in the muted spec-row style.
 *   - Empty state is a centered spec-card with mono caps "CART EMPTY"
 *     header + Inter Tight display sub + sharp-bordered CTA.
 *
 * All business logic (useCart, shipping calc, free-shipping threshold,
 * checkout link) matches StoreCartClient so the conversion funnel is
 * unchanged — only the visual surface is bespoke.
 */

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import {
  ChevronLeft,
  CheckCircle2,
  Minus,
  Plus,
  ShieldCheck,
  Trash2,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';

const TECH_DISPLAY_FONT =
  'var(--font-tech-display, "Inter Tight"), "Inter", "IBM Plex Sans Thai", system-ui, sans-serif';

const TECH_MONO_FONT =
  'var(--font-tech-mono, "JetBrains Mono"), ui-monospace, "SFMono-Regular", Menlo, monospace';

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
 * Build a deterministic SKU from the product id — mirrors the PDP hero
 * + category grid so the same product carries the same display SKU on
 * the cart row. Format: "ET-XXXXXX".
 */
function techSku(id: string): string {
  const hash = id
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(-6)
    .padStart(6, '0');
  return `ET-${hash}`;
}

/** Two-digit zero-padded item count for the mono "CART · NN ITEMS" badge. */
function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function ElectronicsTechCartPage({ store }: { store: StoreLite }) {
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
  const remainingForFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD - subtotal,
  );

  if (!mounted) {
    return (
      <div className="min-h-[60vh]" style={{ background: 'var(--shop-bg)' }} />
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--shop-bg)' }}>
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        {/* Spec-sheet header */}
        <header className="mb-10 sm:mb-12">
          <Link
            href={`/stores/${store.slug}`}
            data-tech-mono="true"
            className="inline-flex items-center gap-1 text-[11px] uppercase hover:underline"
            style={{
              color: 'var(--shop-ink-muted)',
              fontFamily: TECH_MONO_FONT,
              letterSpacing: '0.16em',
              fontWeight: 600,
            }}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Continue shopping
          </Link>
          <p
            data-tech-mono="true"
            className="mt-6 inline-block rounded-md border bg-[var(--shop-muted)] px-2.5 py-1 text-[11px] uppercase"
            style={{
              borderColor: 'var(--shop-border)',
              color: 'var(--shop-ink-muted)',
              fontFamily: TECH_MONO_FONT,
              letterSpacing: '0.16em',
              fontWeight: 600,
            }}
          >
            CART · {pad2(itemCount)} ITEMS
          </p>
          <h1
            className="mt-3 text-3xl sm:text-4xl"
            style={{
              fontFamily: TECH_DISPLAY_FONT,
              color: 'var(--shop-ink)',
              fontWeight: 700,
              letterSpacing: '-0.015em',
              lineHeight: 1.1,
            }}
          >
            Your cart
          </h1>
        </header>

        {lines.length === 0 ? (
          <ElectronicsTechEmptyCart storeSlug={store.slug} />
        ) : (
          <div className="lg:grid lg:grid-cols-[1fr_22rem] lg:gap-8 lg:items-start">
            {/* ── Spec-sheet line items ─────────────────────────── */}
            <section aria-labelledby="cart-heading" className="space-y-3">
              <h2 id="cart-heading" className="sr-only">
                สินค้าในตะกร้า
              </h2>

              {/* Spec-sheet header strip — mono caps column labels */}
              <div
                className="hidden rounded-md border bg-[var(--shop-muted)] px-4 py-2 sm:grid"
                style={{
                  borderColor: 'var(--shop-border)',
                  gridTemplateColumns: '6rem 1fr 7rem 6rem 2rem',
                  columnGap: '1rem',
                }}
              >
                <span
                  data-tech-mono="true"
                  className="text-[10px] uppercase"
                  style={{
                    color: 'var(--shop-ink-muted)',
                    fontFamily: TECH_MONO_FONT,
                    letterSpacing: '0.18em',
                    fontWeight: 600,
                  }}
                >
                  Item
                </span>
                <span
                  data-tech-mono="true"
                  className="text-[10px] uppercase"
                  style={{
                    color: 'var(--shop-ink-muted)',
                    fontFamily: TECH_MONO_FONT,
                    letterSpacing: '0.18em',
                    fontWeight: 600,
                  }}
                >
                  Description
                </span>
                <span
                  data-tech-mono="true"
                  className="text-right text-[10px] uppercase"
                  style={{
                    color: 'var(--shop-ink-muted)',
                    fontFamily: TECH_MONO_FONT,
                    letterSpacing: '0.18em',
                    fontWeight: 600,
                  }}
                >
                  Qty
                </span>
                <span
                  data-tech-mono="true"
                  className="text-right text-[10px] uppercase"
                  style={{
                    color: 'var(--shop-ink-muted)',
                    fontFamily: TECH_MONO_FONT,
                    letterSpacing: '0.18em',
                    fontWeight: 600,
                  }}
                >
                  Total
                </span>
                <span aria-hidden />
              </div>

              {lines.map((l) => (
                <article
                  key={l.productId}
                  className="grid grid-cols-[5rem_1fr] gap-4 rounded-md border bg-white p-4 sm:grid-cols-[6rem_1fr_7rem_6rem_2rem] sm:items-center sm:gap-4 sm:p-4"
                  style={{ borderColor: 'var(--shop-border)' }}
                >
                  {/* Square thumbnail with hairline border */}
                  <Link
                    href={`/stores/${store.slug}/products/${l.productId}`}
                    className="relative block overflow-hidden rounded-md border"
                    style={{
                      aspectRatio: '1 / 1',
                      background: 'var(--shop-muted)',
                      borderColor: 'var(--shop-border)',
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

                  {/* Title + mono SKU + mint stock chip */}
                  <div className="min-w-0">
                    <Link
                      href={`/stores/${store.slug}/products/${l.productId}`}
                      className="block text-sm leading-snug hover:underline sm:text-base"
                      style={{
                        fontFamily: TECH_DISPLAY_FONT,
                        color: 'var(--shop-ink)',
                        fontWeight: 600,
                        letterSpacing: '-0.005em',
                      }}
                    >
                      {l.title}
                    </Link>
                    <p
                      data-tech-mono="true"
                      className="mt-1 text-[10px] uppercase"
                      style={{
                        color: 'var(--shop-ink-muted)',
                        fontFamily: TECH_MONO_FONT,
                        letterSpacing: '0.16em',
                        fontWeight: 600,
                      }}
                    >
                      SKU · {techSku(l.productId)}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        data-tech-stock="true"
                        className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase"
                        style={{ letterSpacing: '0.12em' }}
                      >
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        In stock
                      </span>
                      <span
                        data-tech-mono="true"
                        className="text-[11px] uppercase sm:hidden"
                        style={{
                          color: 'var(--shop-ink-muted)',
                          fontFamily: TECH_MONO_FONT,
                          letterSpacing: '0.14em',
                          fontWeight: 600,
                        }}
                      >
                        Unit · {formatTHB(l.priceTHB)}
                      </span>
                    </div>
                  </div>

                  {/* Qty stepper — sharp-bordered rectangle */}
                  <div className="col-span-2 mt-3 flex items-center justify-between sm:col-span-1 sm:mt-0 sm:justify-end">
                    <div
                      className="inline-flex h-9 items-center overflow-hidden rounded-md border bg-white"
                      style={{ borderColor: 'var(--shop-border)' }}
                    >
                      <button
                        type="button"
                        onClick={() => setQty(l.productId, l.qty - 1, store.slug)}
                        disabled={l.qty <= 1}
                        aria-label="ลด"
                        className="inline-flex h-9 w-9 items-center justify-center text-sm hover:bg-[var(--shop-muted)] disabled:opacity-40"
                        style={{ color: 'var(--shop-ink)' }}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        value={l.qty}
                        data-tech-mono="true"
                        onChange={(e) =>
                          setQty(
                            l.productId,
                            Math.max(1, parseInt(e.target.value, 10) || 1),
                            store.slug,
                          )
                        }
                        className="h-9 w-12 border-x bg-transparent text-center text-sm focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        style={{
                          color: 'var(--shop-ink)',
                          borderColor: 'var(--shop-border)',
                          fontFamily: TECH_MONO_FONT,
                          fontWeight: 600,
                        }}
                        aria-label={`จำนวน ${l.title}`}
                      />
                      <button
                        type="button"
                        onClick={() => setQty(l.productId, l.qty + 1, store.slug)}
                        aria-label="เพิ่ม"
                        className="inline-flex h-9 w-9 items-center justify-center text-sm hover:bg-[var(--shop-muted)]"
                        style={{ color: 'var(--shop-ink)' }}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Mono line total */}
                  <div className="hidden text-right sm:block">
                    <span
                      data-tech-mono="true"
                      className="text-base"
                      style={{
                        color: 'var(--shop-primary)',
                        fontFamily: TECH_MONO_FONT,
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {formatTHB(l.priceTHB * l.qty)}
                    </span>
                  </div>

                  {/* Remove — square trash button */}
                  <button
                    type="button"
                    onClick={() => remove(l.productId, store.slug)}
                    aria-label={`ลบ ${l.title}`}
                    className="hidden h-8 w-8 items-center justify-center rounded-md border bg-white text-[var(--shop-ink-muted)] transition hover:border-[var(--shop-primary)] hover:text-[var(--shop-primary)] sm:inline-flex"
                    style={{ borderColor: 'var(--shop-border)' }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>

                  {/* Mobile-only: line total + trash row */}
                  <div className="col-span-2 mt-3 flex items-center justify-between border-t pt-3 sm:hidden"
                       style={{ borderColor: 'var(--shop-border)' }}>
                    <span
                      data-tech-mono="true"
                      className="text-[10px] uppercase"
                      style={{
                        color: 'var(--shop-ink-muted)',
                        fontFamily: TECH_MONO_FONT,
                        letterSpacing: '0.16em',
                        fontWeight: 600,
                      }}
                    >
                      Line total
                    </span>
                    <div className="flex items-center gap-3">
                      <span
                        data-tech-mono="true"
                        className="text-base"
                        style={{
                          color: 'var(--shop-primary)',
                          fontFamily: TECH_MONO_FONT,
                          fontWeight: 700,
                          letterSpacing: '-0.02em',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {formatTHB(l.priceTHB * l.qty)}
                      </span>
                      <button
                        type="button"
                        onClick={() => remove(l.productId, store.slug)}
                        aria-label={`ลบ ${l.title}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border bg-white text-[var(--shop-ink-muted)]"
                        style={{ borderColor: 'var(--shop-border)' }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}

              {/* Mono caps free-shipping nudge */}
              {remainingForFreeShipping > 0 && (
                <div
                  className="mt-4 rounded-md border bg-[var(--shop-muted)] px-4 py-3"
                  style={{ borderColor: 'var(--shop-border)' }}
                >
                  <p
                    data-tech-mono="true"
                    className="text-[11px] uppercase"
                    style={{
                      color: 'var(--shop-ink)',
                      fontFamily: TECH_MONO_FONT,
                      letterSpacing: '0.14em',
                      fontWeight: 600,
                    }}
                  >
                    ADD{' '}
                    <span style={{ color: 'var(--shop-primary)' }}>
                      {formatTHB(remainingForFreeShipping)}
                    </span>{' '}
                    TO UNLOCK FREE SHIPPING
                  </p>
                </div>
              )}
            </section>

            {/* ── Sharp-bordered summary card ───────────────── */}
            <aside
              aria-labelledby="summary-heading"
              className="mt-10 lg:mt-0 lg:sticky lg:top-24"
            >
              <h2 id="summary-heading" className="sr-only">
                สรุปคำสั่งซื้อ
              </h2>

              <div
                className="rounded-md border bg-white p-6"
                style={{ borderColor: 'var(--shop-border)' }}
              >
                <p
                  data-tech-mono="true"
                  className="text-[11px] uppercase"
                  style={{
                    color: 'var(--shop-ink-muted)',
                    fontFamily: TECH_MONO_FONT,
                    letterSpacing: '0.18em',
                    fontWeight: 600,
                  }}
                >
                  Order Summary
                </p>
                <h3
                  className="mt-1 text-xl"
                  style={{
                    fontFamily: TECH_DISPLAY_FONT,
                    color: 'var(--shop-ink)',
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                  }}
                >
                  Checkout total
                </h3>

                <dl className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <dt
                      data-tech-mono="true"
                      className="text-[11px] uppercase"
                      style={{
                        color: 'var(--shop-ink-muted)',
                        fontFamily: TECH_MONO_FONT,
                        letterSpacing: '0.16em',
                        fontWeight: 600,
                      }}
                    >
                      Subtotal
                    </dt>
                    <dd
                      data-tech-mono="true"
                      className="text-sm"
                      style={{
                        color: 'var(--shop-ink)',
                        fontFamily: TECH_MONO_FONT,
                        fontWeight: 600,
                        letterSpacing: '-0.02em',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {formatTHB(subtotal)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt
                      data-tech-mono="true"
                      className="text-[11px] uppercase"
                      style={{
                        color: 'var(--shop-ink-muted)',
                        fontFamily: TECH_MONO_FONT,
                        letterSpacing: '0.16em',
                        fontWeight: 600,
                      }}
                    >
                      Shipping
                    </dt>
                    <dd
                      data-tech-mono="true"
                      className="text-sm"
                      style={{
                        color: shipping === 0 ? 'var(--shop-highlight, #34d399)' : 'var(--shop-ink)',
                        fontFamily: TECH_MONO_FONT,
                        fontWeight: 600,
                        letterSpacing: shipping === 0 ? '0.14em' : '-0.02em',
                        fontVariantNumeric: 'tabular-nums',
                        textTransform: shipping === 0 ? 'uppercase' : undefined,
                      }}
                    >
                      {shipping === 0 ? 'FREE' : formatTHB(shipping)}
                    </dd>
                  </div>
                  <div
                    className="flex items-baseline justify-between border-t pt-4"
                    style={{ borderColor: 'var(--shop-border)' }}
                  >
                    <dt
                      data-tech-mono="true"
                      className="text-xs uppercase"
                      style={{
                        color: 'var(--shop-ink)',
                        fontFamily: TECH_MONO_FONT,
                        letterSpacing: '0.18em',
                        fontWeight: 700,
                      }}
                    >
                      Total
                    </dt>
                    <dd
                      data-tech-mono="true"
                      className="text-2xl"
                      style={{
                        color: 'var(--shop-primary)',
                        fontFamily: TECH_MONO_FONT,
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {formatTHB(total)}
                    </dd>
                  </div>
                </dl>

                <Link
                  href={`/stores/${store.slug}/checkout/address`}
                  className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-md text-sm font-semibold uppercase text-white transition hover:opacity-90"
                  style={{
                    background: 'var(--shop-primary)',
                    fontFamily: TECH_DISPLAY_FONT,
                    letterSpacing: '0.08em',
                  }}
                >
                  Proceed to checkout
                </Link>

                <p
                  data-tech-mono="true"
                  className="mt-4 flex items-center justify-center gap-1.5 text-center text-[10px] uppercase"
                  style={{
                    color: 'var(--shop-ink-muted)',
                    fontFamily: TECH_MONO_FONT,
                    letterSpacing: '0.16em',
                    fontWeight: 600,
                  }}
                >
                  <ShieldCheck className="h-3 w-3" />
                  Secure · 256-bit SSL
                </p>
              </div>

              {/* Mono trust strip */}
              <ul
                className="mt-5 space-y-2 rounded-md border bg-[var(--shop-muted)] px-4 py-3"
                style={{ borderColor: 'var(--shop-border)' }}
              >
                <li
                  data-tech-mono="true"
                  className="flex items-center gap-2 text-[11px] uppercase"
                  style={{
                    color: 'var(--shop-ink-muted)',
                    fontFamily: TECH_MONO_FONT,
                    letterSpacing: '0.14em',
                    fontWeight: 600,
                  }}
                >
                  <Truck className="h-3.5 w-3.5" />
                  Free shipping over {formatTHB(FREE_SHIPPING_THRESHOLD)}
                </li>
                <li
                  data-tech-mono="true"
                  className="flex items-center gap-2 text-[11px] uppercase"
                  style={{
                    color: 'var(--shop-ink-muted)',
                    fontFamily: TECH_MONO_FONT,
                    letterSpacing: '0.14em',
                    fontWeight: 600,
                  }}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  7-day return policy
                </li>
              </ul>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

function ElectronicsTechEmptyCart({ storeSlug }: { storeSlug: string }) {
  return (
    <div className="mx-auto max-w-xl text-center">
      <div
        className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-md border bg-[var(--shop-muted)]"
        style={{ borderColor: 'var(--shop-border)' }}
      >
        <span
          data-tech-mono="true"
          className="text-[10px] uppercase"
          style={{
            color: 'var(--shop-ink-muted)',
            fontFamily: TECH_MONO_FONT,
            letterSpacing: '0.18em',
            fontWeight: 600,
          }}
        >
          0 items
        </span>
      </div>
      <p
        data-tech-mono="true"
        className="text-[11px] uppercase"
        style={{
          color: 'var(--shop-ink-muted)',
          fontFamily: TECH_MONO_FONT,
          letterSpacing: '0.18em',
          fontWeight: 600,
        }}
      >
        CART EMPTY
      </p>
      <h2
        className="mt-2 text-3xl sm:text-4xl"
        style={{
          fontFamily: TECH_DISPLAY_FONT,
          color: 'var(--shop-ink)',
          fontWeight: 700,
          letterSpacing: '-0.015em',
        }}
      >
        Nothing in the cart yet
      </h2>
      <p
        className="mt-3 text-sm"
        style={{
          color: 'var(--shop-ink-muted)',
          fontFamily: TECH_DISPLAY_FONT,
        }}
      >
        Browse the catalog to add your first device.
      </p>
      <Link
        href={`/stores/${storeSlug}/category`}
        className="mt-8 inline-flex h-12 items-center justify-center rounded-md px-10 text-sm font-semibold uppercase text-white transition hover:opacity-90"
        style={{
          background: 'var(--shop-primary)',
          fontFamily: TECH_DISPLAY_FONT,
          letterSpacing: '0.08em',
        }}
      >
        Browse catalog
      </Link>
    </div>
  );
}
