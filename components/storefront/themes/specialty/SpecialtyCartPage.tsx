'use client';

/**
 * SpecialtyCartPage — bespoke artisan / vintage cart layout.
 *
 * Structural difference from the generic StoreCartClient and the
 * fashion-beauty cart (cart-client.tsx, FashionBeautyCartPage):
 *   - Hand-script "the maker's basket" eyebrow paired with a Fraunces
 *     slab-serif "Your collection" h1 — replaces the editorial italic
 *     curator note with a workshop-letter voice.
 *   - Each line item renders as a kraft-textured card (data-specialty-
 *     kraft="true") with a sepia-tinted image (data-specialty-sepia=
 *     "true") — feels like a handmade ledger, not a magazine spread.
 *   - Right-rail summary is a single kraft card with a SpecialtyStamp-
 *     style Total badge + a hand-script "thank you for supporting
 *     makers" footnote at the bottom.
 *   - Trust strip below speaks to handmade lead-time ("made in 5-7
 *     days · by hand · from one studio") instead of free-shipping.
 *
 * Business logic (useCart selectors, qty stepper, remove, checkout
 * link, free-shipping math) is preserved so the conversion funnel is
 * untouched — only the visual chrome is bespoke.
 */

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ChevronLeft, ShieldCheck, Hammer, Leaf, Minus, Plus } from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';
import { SpecialtyStamp } from './SpecialtyDivider';

const SPECIALTY_DISPLAY_FONT =
  'var(--font-specialty-display, "Fraunces"), Georgia, "Noto Serif Thai", serif';

const SPECIALTY_HAND_FONT =
  'var(--font-specialty-hand, "Caveat"), "Permanent Marker", cursive';

const FREE_SHIPPING_THRESHOLD = 990;
const DEFAULT_SHIPPING = 50;

interface StoreLite {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  primaryColor: string | null;
}

export function SpecialtyCartPage({ store }: { store: StoreLite }) {
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

  if (!mounted) {
    return <div className="min-h-[60vh]" style={{ background: 'var(--shop-bg)' }} />;
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--shop-bg)' }}>
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        {/* Workshop-letter top band */}
        <header className="mb-12 sm:mb-16">
          <Link
            href={`/stores/${store.slug}`}
            className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.18em] hover:underline"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            กลับสตูดิโอ
          </Link>
          <p
            className="mt-6 text-2xl"
            style={{
              fontFamily: SPECIALTY_HAND_FONT,
              color: 'var(--shop-accent)',
            }}
          >
            ตะกร้าของช่างฝีมือ
          </p>
          <h1
            className="mt-1 text-4xl sm:text-5xl"
            style={{
              fontFamily: SPECIALTY_DISPLAY_FONT,
              color: 'var(--shop-ink)',
              fontWeight: 500,
              letterSpacing: '-0.005em',
              lineHeight: 1.05,
            }}
          >
            คอลเลกชันของคุณ
          </h1>
          <p
            className="mt-3 max-w-xl text-base"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            {lines.length === 0
              ? `งานบางชิ้นจาก ${store.name} กำลังรอคุณอยู่`
              : `เลือกไว้ ${itemCount.toLocaleString()} ชิ้น — ตรวจคอลเลกชันก่อนแต่ละชิ้นจะถูกห่อด้วยมือ`}
          </p>
        </header>

        {lines.length === 0 ? (
          <SpecialtyEmptyCart storeSlug={store.slug} />
        ) : (
          <div className="lg:grid lg:grid-cols-[1fr_22rem] lg:gap-12 lg:items-start">
            {/* ── Kraft-textured line items ──────────────────────── */}
            <section aria-labelledby="cart-heading" className="space-y-6">
              <h2 id="cart-heading" className="sr-only">
                สินค้าในตะกร้า
              </h2>
              {lines.map((l) => (
                <article
                  key={l.productId}
                  data-specialty-kraft="true"
                  className="grid grid-cols-[7rem_1fr] gap-5 rounded-md border p-4 shadow-sm sm:grid-cols-[10rem_1fr] sm:gap-7 sm:p-6"
                  style={{ borderColor: 'var(--shop-border)' }}
                >
                  {/* Sepia-toned square frame — kraft mat */}
                  <Link
                    href={`/stores/${store.slug}/products/${l.productId}`}
                    data-specialty-sepia="true"
                    className="relative block overflow-hidden rounded-md"
                    style={{
                      aspectRatio: '1 / 1',
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
                      <span
                        className="text-base italic"
                        style={{
                          fontFamily: SPECIALTY_HAND_FONT,
                          color: 'var(--shop-accent)',
                        }}
                      >
                        ทำโดย {store.name}
                      </span>
                      <Link
                        href={`/stores/${store.slug}/products/${l.productId}`}
                        className="mt-1 block text-lg leading-snug hover:underline sm:text-xl"
                        style={{
                          fontFamily: SPECIALTY_DISPLAY_FONT,
                          color: 'var(--shop-ink)',
                          fontWeight: 500,
                          letterSpacing: '-0.005em',
                        }}
                      >
                        {l.title}
                      </Link>
                      <p
                        className="mt-3 text-base font-semibold"
                        style={{ color: 'var(--shop-primary)' }}
                      >
                        {formatTHB(l.priceTHB)}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      {/* Quantity stepper — rounded-md kraft pills */}
                      <div
                        className="inline-flex h-9 items-center overflow-hidden rounded-md border bg-[var(--shop-card)]"
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

                      {/* Remove as hand-script link — softer than trash icon */}
                      <button
                        type="button"
                        onClick={() => remove(l.productId, store.slug)}
                        className="text-lg hover:underline"
                        style={{
                          fontFamily: SPECIALTY_HAND_FONT,
                          color: 'var(--shop-ink-muted)',
                        }}
                        aria-label={`ลบ ${l.title}`}
                      >
                        วางไว้ก่อน
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            {/* ── Kraft-card order summary ─────────────────────── */}
            <aside
              aria-labelledby="summary-heading"
              className="mt-12 lg:mt-0 lg:sticky lg:top-24"
            >
              <h2 id="summary-heading" className="sr-only">
                สรุปคำสั่งซื้อ
              </h2>

              <div
                data-specialty-kraft="true"
                className="rounded-md border p-7 shadow-sm"
                style={{ borderColor: 'var(--shop-border)' }}
              >
                <p
                  className="text-[11px] uppercase tracking-[0.28em]"
                  style={{ color: 'var(--shop-ink-muted)' }}
                >
                  สรุป
                </p>
                <div className="mt-1 flex items-baseline justify-between gap-3">
                  <h3
                    className="text-2xl sm:text-3xl"
                    style={{
                      fontFamily: SPECIALTY_DISPLAY_FONT,
                      color: 'var(--shop-ink)',
                      fontWeight: 500,
                      letterSpacing: '-0.005em',
                    }}
                  >
                    คำสั่งซื้อของคุณ
                  </h3>
                  <SpecialtyStamp tone="primary">ห่อด้วยมือ</SpecialtyStamp>
                </div>

                <div
                  aria-hidden
                  className="mt-4 h-px w-12"
                  style={{ background: 'var(--shop-accent)' }}
                />

                <dl className="mt-6 space-y-3.5 text-sm">
                  <div className="flex items-center justify-between">
                    <dt style={{ color: 'var(--shop-ink-muted)' }}>ยอดรวมย่อย</dt>
                    <dd className="font-medium" style={{ color: 'var(--shop-ink)' }}>
                      {formatTHB(subtotal)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt style={{ color: 'var(--shop-ink-muted)' }}>ค่าจัดส่ง</dt>
                    <dd
                      className="font-medium"
                      style={{
                        color:
                          shipping === 0 ? 'var(--shop-primary)' : 'var(--shop-ink)',
                      }}
                    >
                      {shipping === 0 ? 'ช่างฝีมือออกให้' : formatTHB(shipping)}
                    </dd>
                  </div>
                  <div
                    className="flex items-baseline justify-between border-t pt-4"
                    style={{ borderColor: 'var(--shop-accent)' }}
                  >
                    <dt
                      className="text-base"
                      style={{
                        fontFamily: SPECIALTY_DISPLAY_FONT,
                        color: 'var(--shop-ink)',
                        fontWeight: 500,
                      }}
                    >
                      ยอดรวม
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
                  href={`/stores/${store.slug}/checkout/address`}
                  className="mt-7 inline-flex h-12 w-full items-center justify-center rounded-md text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                  style={{ background: 'var(--shop-primary)' }}
                >
                  ไปชำระเงิน
                </Link>

                <p
                  className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs"
                  style={{ color: 'var(--shop-ink-muted)' }}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  ชำระเงินปลอดภัย · คุ้มครองโดย Basketplace
                </p>

                <p
                  className="mt-5 border-t pt-4 text-center text-xl leading-tight"
                  style={{
                    borderColor: 'var(--shop-border)',
                    fontFamily: SPECIALTY_HAND_FONT,
                    color: 'var(--shop-accent)',
                  }}
                >
                  ขอบคุณที่สนับสนุนช่างฝีมือ
                </p>
              </div>

              {/* Trust strip — handmade lead-time, no free-shipping vibe */}
              <ul
                className="mt-6 space-y-3 text-sm"
                style={{ color: 'var(--shop-ink-muted)' }}
              >
                <li className="flex items-center gap-2">
                  <Hammer className="h-4 w-4" style={{ color: 'var(--shop-primary)' }} />
                  ใช้เวลา 5-7 วัน · ทำด้วยมือ · จากสตูดิโอเดียว
                </li>
                <li className="flex items-center gap-2">
                  <Leaf className="h-4 w-4" style={{ color: 'var(--shop-primary)' }} />
                  ห่อด้วยกระดาษคราฟท์รีไซเคิล · ไม่ใช้พลาสติก
                </li>
              </ul>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

function SpecialtyEmptyCart({ storeSlug }: { storeSlug: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div
        data-specialty-kraft="true"
        className="mx-auto mb-8 flex h-40 w-40 items-center justify-center rounded-md border shadow-sm"
        style={{ borderColor: 'var(--shop-border)' }}
      >
        <span
          className="text-3xl"
          style={{
            fontFamily: SPECIALTY_HAND_FONT,
            color: 'var(--shop-accent)',
          }}
        >
          ตะกร้าว่างเปล่า
        </span>
      </div>
      <p
        className="text-2xl"
        style={{
          fontFamily: SPECIALTY_HAND_FONT,
          color: 'var(--shop-accent)',
        }}
      >
        ยังไม่มีอะไรที่นี่
      </p>
      <h2
        className="mt-1 text-3xl sm:text-4xl"
        style={{
          fontFamily: SPECIALTY_DISPLAY_FONT,
          color: 'var(--shop-ink)',
          fontWeight: 500,
          letterSpacing: '-0.005em',
        }}
      >
        คอลเลกชันของคุณยังว่าง
      </h2>
      <p
        className="mx-auto mt-4 max-w-md text-base"
        style={{ color: 'var(--shop-ink-muted)' }}
      >
        แต่ละชิ้นทำด้วยมือ — เริ่มสำรวจสตูดิโอเพื่อเก็บงานที่ชอบไว้ในตะกร้า
      </p>
      <Link
        href={`/stores/${storeSlug}/category`}
        className="mt-8 inline-flex h-12 items-center justify-center rounded-md px-10 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
        style={{ background: 'var(--shop-primary)' }}
      >
        ดูสตูดิโอ
      </Link>
    </div>
  );
}
