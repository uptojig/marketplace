'use client';

/**
 * FashionBeautyCartPage — bespoke FB cart layout.
 *
 * Structural difference from the generic StoreCartClient (cart-client.tsx):
 *   - Editorial top band with serif "Your Edit · Spring Season" tagline
 *     and an italic curator note instead of a back-link + h1.
 *   - Each line item renders as a horizontal MAGAZINE CARD: large 4/5
 *     portrait image on the left, item info column on the right with
 *     a "remove" link styled as italic serif rather than a trash icon.
 *   - Right-rail order summary lives in a soft-pink (rose-50) frame
 *     with rose-300 hairlines instead of a generic white card.
 *   - Free-shipping nudge presented as an italic serif line instead of
 *     a progress bar — fits the magazine-letter voice.
 *   - Empty state is a full-bleed editorial spread with a serif
 *     headline + handwritten-feel sub-copy.
 *
 * All business logic (useCart, shipping calc, free-shipping threshold,
 * checkout link) matches StoreCartClient so the conversion funnel is
 * unchanged — only the visual surface is bespoke.
 */

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ChevronLeft, ShieldCheck, Truck, RotateCcw, Minus, Plus } from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';

const FB_DISPLAY_FONT =
  'var(--font-fashion-display, "Cormorant Garamond"), "Playfair Display", Georgia, "Noto Serif Thai", serif';

const FREE_SHIPPING_THRESHOLD = 990;
const DEFAULT_SHIPPING = 50;

interface StoreLite {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  primaryColor: string | null;
}

export function FashionBeautyCartPage({ store }: { store: StoreLite }) {
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
        {/* Editorial top band — serif tagline + italic curator note. */}
        <header className="mb-12 sm:mb-16">
          <Link
            href={`/stores/${store.slug}`}
            className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.18em] hover:underline"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back to the boutique
          </Link>
          <p
            className="mt-6 text-[11px] uppercase tracking-[0.28em]"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            The Edit · Curated for you
          </p>
          <h1
            className="mt-2 text-5xl sm:text-6xl"
            style={{
              fontFamily: FB_DISPLAY_FONT,
              color: 'var(--shop-ink)',
              fontWeight: 500,
              letterSpacing: '-0.005em',
              lineHeight: 1.05,
            }}
          >
            Your Edit
          </h1>
          <p
            className="mt-3 max-w-xl text-base italic"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            {lines.length === 0
              ? 'A few pieces from ' + store.name + ' are waiting for you to discover them.'
              : itemCount.toLocaleString() + ' piece' + (itemCount === 1 ? '' : 's') + ' selected — review your edit before we wrap it for you.'}
          </p>
        </header>

        {lines.length === 0 ? (
          <FashionBeautyEmptyCart storeSlug={store.slug} />
        ) : (
          <div className="lg:grid lg:grid-cols-[1fr_22rem] lg:gap-12 lg:items-start">
            {/* ── Magazine line items ───────────────────────────── */}
            <section aria-labelledby="cart-heading" className="space-y-6">
              <h2 id="cart-heading" className="sr-only">
                สินค้าในตะกร้า
              </h2>
              {lines.map((l) => (
                <article
                  key={l.productId}
                  className="grid grid-cols-[7rem_1fr] gap-5 rounded-2xl border bg-white p-4 shadow-sm sm:grid-cols-[10rem_1fr] sm:gap-7 sm:p-6"
                  style={{ borderColor: 'var(--shop-border)' }}
                >
                  {/* Portrait 4/5 frame — gallery-paper mat */}
                  <Link
                    href={`/stores/${store.slug}/products/${l.productId}`}
                    className="relative block overflow-hidden rounded-xl"
                    style={{
                      aspectRatio: '4 / 5',
                      background: 'var(--shop-muted)',
                    }}
                  >
                    {l.imageUrl ? (
                      <Image
                        src={l.imageUrl}
                        alt={l.title}
                        fill
                        sizes="(max-width: 640px) 112px, 160px"
                        className="object-cover"
                      />
                    ) : null}
                  </Link>

                  <div className="flex flex-col justify-between">
                    <div>
                      <Link
                        href={`/stores/${store.slug}/products/${l.productId}`}
                        className="block text-lg leading-snug hover:underline sm:text-xl"
                        style={{
                          fontFamily: FB_DISPLAY_FONT,
                          color: 'var(--shop-ink)',
                          fontWeight: 500,
                          letterSpacing: '-0.005em',
                        }}
                      >
                        {l.title}
                      </Link>
                      <p
                        className="mt-1 text-sm italic"
                        style={{ color: 'var(--shop-ink-muted)' }}
                      >
                        from {store.name}
                      </p>
                      <p
                        className="mt-3 text-base font-semibold"
                        style={{ color: 'var(--shop-primary)' }}
                      >
                        {formatTHB(l.priceTHB)}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      {/* Quantity stepper — rounded-full editorial pills */}
                      <div
                        className="inline-flex h-9 items-center overflow-hidden rounded-full border bg-white"
                        style={{ borderColor: 'var(--shop-border)' }}
                      >
                        <button
                          type="button"
                          onClick={() => setQty(l.productId, l.qty - 1, store.slug)}
                          disabled={l.qty <= 1}
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
                          value={l.qty}
                          onChange={(e) =>
                            setQty(
                              l.productId,
                              Math.max(1, parseInt(e.target.value, 10) || 1),
                              store.slug,
                            )
                          }
                          className="h-9 w-10 border-x bg-transparent text-center text-sm focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          style={{
                            color: 'var(--shop-ink)',
                            borderColor: 'var(--shop-border)',
                          }}
                          aria-label={`จำนวน ${l.title}`}
                        />
                        <button
                          type="button"
                          onClick={() => setQty(l.productId, l.qty + 1, store.slug)}
                          aria-label="เพิ่ม"
                          className="inline-flex h-9 w-9 items-center justify-center text-sm"
                          style={{ color: 'var(--shop-ink)' }}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Remove as italic serif link — softer than trash icon */}
                      <button
                        type="button"
                        onClick={() => remove(l.productId, store.slug)}
                        className="text-sm italic hover:underline"
                        style={{
                          fontFamily: FB_DISPLAY_FONT,
                          color: 'var(--shop-ink-muted)',
                        }}
                        aria-label={`ลบ ${l.title}`}
                      >
                        Remove from edit
                      </button>
                    </div>
                  </div>
                </article>
              ))}

              {/* Italic free-shipping nudge — serif curator voice */}
              {remainingForFreeShipping > 0 && (
                <p
                  className="text-center text-base italic"
                  style={{
                    fontFamily: FB_DISPLAY_FONT,
                    color: 'var(--shop-ink-muted)',
                  }}
                >
                  Add {formatTHB(remainingForFreeShipping)} more and we&rsquo;ll wrap it for free.
                </p>
              )}
            </section>

            {/* ── Soft-pink frame order summary ───────────────── */}
            <aside
              aria-labelledby="summary-heading"
              className="mt-12 lg:mt-0 lg:sticky lg:top-24"
            >
              <h2 id="summary-heading" className="sr-only">
                สรุปคำสั่งซื้อ
              </h2>

              <div
                className="rounded-2xl border p-7 shadow-sm"
                style={{
                  background: 'var(--shop-muted)',
                  borderColor: 'var(--shop-accent)',
                }}
              >
                <p
                  className="text-[11px] uppercase tracking-[0.28em]"
                  style={{ color: 'var(--shop-ink-muted)' }}
                >
                  Summary
                </p>
                <h3
                  className="mt-1 text-3xl"
                  style={{
                    fontFamily: FB_DISPLAY_FONT,
                    color: 'var(--shop-ink)',
                    fontWeight: 500,
                    letterSpacing: '-0.005em',
                  }}
                >
                  Your order
                </h3>

                <div
                  aria-hidden
                  className="mt-4 h-px w-12"
                  style={{ background: 'var(--shop-accent)' }}
                />

                <dl className="mt-6 space-y-3.5 text-sm">
                  <div className="flex items-center justify-between">
                    <dt style={{ color: 'var(--shop-ink-muted)' }}>Subtotal</dt>
                    <dd className="font-medium" style={{ color: 'var(--shop-ink)' }}>
                      {formatTHB(subtotal)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt style={{ color: 'var(--shop-ink-muted)' }}>Shipping</dt>
                    <dd
                      className="font-medium"
                      style={{
                        color:
                          shipping === 0 ? 'var(--shop-primary)' : 'var(--shop-ink)',
                      }}
                    >
                      {shipping === 0 ? 'Complimentary' : formatTHB(shipping)}
                    </dd>
                  </div>
                  <div
                    className="flex items-baseline justify-between border-t pt-4"
                    style={{ borderColor: 'var(--shop-accent)' }}
                  >
                    <dt
                      className="text-base"
                      style={{
                        fontFamily: FB_DISPLAY_FONT,
                        color: 'var(--shop-ink)',
                        fontWeight: 500,
                      }}
                    >
                      Total
                    </dt>
                    <dd
                      className="text-2xl font-semibold"
                      style={{ color: 'var(--shop-primary)' }}
                    >
                      {formatTHB(total)}
                    </dd>
                  </div>
                </dl>

                <Link
                  href={`/stores/${store.slug}/checkout`}
                  className="mt-7 inline-flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                  style={{ background: 'var(--shop-primary)' }}
                >
                  Proceed to checkout
                </Link>

                <p
                  className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs italic"
                  style={{
                    fontFamily: FB_DISPLAY_FONT,
                    color: 'var(--shop-ink-muted)',
                  }}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Secure checkout · protected by Basketplace
                </p>
              </div>

              {/* Italic serif trust strip — magazine voice */}
              <ul
                className="mt-6 space-y-3 text-sm italic"
                style={{
                  fontFamily: FB_DISPLAY_FONT,
                  color: 'var(--shop-ink-muted)',
                }}
              >
                <li className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Complimentary shipping on orders over {formatTHB(FREE_SHIPPING_THRESHOLD)}
                </li>
                <li className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Easy returns within 7 days of delivery
                </li>
              </ul>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

function FashionBeautyEmptyCart({ storeSlug }: { storeSlug: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div
        className="mx-auto mb-8 h-40 w-32 rounded-2xl border shadow-sm"
        style={{
          background: 'var(--shop-muted)',
          borderColor: 'var(--shop-accent)',
        }}
      />
      <h2
        className="text-4xl sm:text-5xl"
        style={{
          fontFamily: FB_DISPLAY_FONT,
          color: 'var(--shop-ink)',
          fontWeight: 500,
          letterSpacing: '-0.005em',
        }}
      >
        Your edit is empty
      </h2>
      <p
        className="mt-4 text-base italic"
        style={{
          fontFamily: FB_DISPLAY_FONT,
          color: 'var(--shop-ink-muted)',
        }}
      >
        Discover pieces curated by our team — every season, hand-picked.
      </p>
      <Link
        href={`/stores/${storeSlug}/category`}
        className="mt-8 inline-flex h-12 items-center justify-center rounded-full px-10 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
        style={{ background: 'var(--shop-primary)' }}
      >
        Start shopping
      </Link>
    </div>
  );
}
