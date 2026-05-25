'use client';

/**
 * LifestyleCartPage — bespoke lifestyle cart layout.
 *
 * Structural difference from the generic StoreCartClient (cart-client.tsx)
 * AND the FashionBeautyCartPage:
 *   - Warm conversational eyebrow ("Your basket · Almost there") instead
 *     of FB's "The Edit · Curated for you" magazine voice. Display is
 *     Outfit / Plus Jakarta Sans geometric humanist sans, NOT serif.
 *   - Each line item renders as a horizontal warm PILLOW CARD: rounded-3xl,
 *     no hard border, soft natural drop shadow via data-lifestyle-frame.
 *     1/1 square thumbnail left + warm info column right. Quantity stepper
 *     and "Remove" sit on the bottom of the right column rather than
 *     pulling them apart vertically (matches Patagonia / West Elm catalog
 *     bag spacing).
 *   - Tag chip (room / activity / "Everyday essentials") under the price —
 *     reinforces the lifestyle-catalog voice.
 *   - Right-rail summary lives in a soft amber-100 (peach) muted card with
 *     a hand-drawn sage SVG squiggle divider above the totals block.
 *     Replaces FB's single hairline rule.
 *   - Free-shipping nudge is a friendly sage chip ("✓ You're getting
 *     free shipping" / "Add ฿X for free shipping") instead of FB's serif
 *     italic line.
 *   - Empty state is a large soft amber rounded-FULL ring around a heart
 *     icon + warm "Your basket is empty" + "Find something you'll love"
 *     sub. Matches the warm lifestyle voice rather than FB's stationery
 *     mat block.
 *
 * All business logic (useCart selector, free-shipping threshold, shipping
 * calc, checkout link) matches StoreCartClient + FashionBeautyCartPage so
 * the conversion funnel is unchanged — only the visual surface is bespoke.
 */

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import {
  ChevronLeft,
  Heart,
  Leaf,
  Minus,
  Plus,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';

const LIFESTYLE_DISPLAY_FONT =
  'var(--font-lifestyle-display, "Outfit"), "Plus Jakarta Sans", "DM Sans", "Prompt", system-ui, sans-serif';

const FREE_SHIPPING_THRESHOLD = 990;
const DEFAULT_SHIPPING = 50;

interface StoreLite {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  primaryColor: string | null;
}

export function LifestyleCartPage({ store }: { store: StoreLite }) {
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

  const isZugarbox = store.slug === 'zugarbox';

  if (!mounted) {
    return <div className="min-h-[60vh]" style={{ background: isZugarbox ? '#fffaf4' : 'var(--shop-bg)' }} />;
  }

  if (isZugarbox) {
    return (
      <div className="min-h-screen font-[family:var(--font-prompt)]" style={{ background: '#fffaf4' }}>
        <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 sm:pt-14 lg:px-8">
          {/* Warm catalog top band */}
          <header className="mb-10 sm:mb-14">
            <Link
              href={`/stores/${store.slug}`}
              className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em] hover:underline"
              style={{ color: '#5c3826', opacity: 0.8 }}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              เลือกซื้อสินค้าต่อ
            </Link>
            <p
              className="mt-6 text-xs font-semibold uppercase tracking-[0.18em]"
              style={{ color: '#e67e22' }}
            >
              ตะกร้าของคุณ · อีกนิดเดียวเท่านั้น
            </p>
            <h1
              className="mt-2 text-4xl sm:text-5xl md:text-6xl font-bold font-[family:var(--font-kanit)]"
              style={{
                color: '#5c3826',
                letterSpacing: '-0.01em',
                lineHeight: 1.05,
              }}
            >
              ตะกร้าสินค้า
            </h1>
            <p
              className="mt-3 max-w-xl text-base"
              style={{ color: '#5c3826', opacity: 0.7 }}
            >
              {lines.length === 0
                ? `ดูเหมือนว่าร้าน zugarbox ยังไม่มีสินค้าในตะกร้าของคุณ — มาเริ่มช้อปกันเลย!`
                : `พบสินค้าจำนวน ${itemCount.toLocaleString()} ชิ้นจากร้าน ${store.name} พร้อมจัดส่งเมื่อคุณพร้อม`}
            </p>
          </header>

          {lines.length === 0 ? (
            <LifestyleEmptyCart storeSlug={store.slug} isZugarbox={true} />
          ) : (
            <div className="lg:grid lg:grid-cols-[1fr_22rem] lg:gap-12 lg:items-start">
              {/* Pillow cards line items */}
              <section aria-labelledby="cart-heading" className="space-y-5">
                <h2 id="cart-heading" className="sr-only">
                  สินค้าในตะกร้า
                </h2>

                {/* Friendly free-shipping chip on top */}
                <div
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold"
                  style={{
                    background: shipping === 0 ? '#e67e22' : '#fdf4eb',
                    color: shipping === 0 ? '#ffffff' : '#5c3826',
                    border: '1px solid #fed7aa',
                  }}
                >
                  <Truck className="h-3.5 w-3.5" />
                  {shipping === 0
                    ? '🎉 คุณได้รับสิทธิ์จัดส่งฟรีแล้ว!'
                    : `ซื้อสินค้าเพิ่มอีก ${formatTHB(remainingForFreeShipping)} เพื่อรับสิทธิ์จัดส่งฟรี!`}
                </div>

                {lines.map((l) => (
                  <article
                    key={l.productId}
                    className="grid grid-cols-[6.5rem_1fr] gap-4 overflow-hidden rounded-3xl bg-[#fffcf9] border border-[#fed7aa]/40 p-4 sm:grid-cols-[8rem_1fr] sm:gap-6 sm:p-5 shadow-sm"
                  >
                    {/* Square 1/1 thumbnail with peach backdrop */}
                    <Link
                      href={`/stores/${store.slug}/products/${l.productId}`}
                      className="relative block overflow-hidden rounded-2xl"
                      style={{
                        aspectRatio: '1 / 1',
                        background: '#fdf4eb',
                      }}
                    >
                      {l.imageUrl ? (
                        <Image
                          src={l.imageUrl}
                          alt={l.title}
                          fill
                          sizes="(max-width: 640px) 104px, 128px"
                          className="object-cover"
                        />
                      ) : null}
                    </Link>

                    <div className="flex flex-col justify-between gap-3">
                      <div>
                        <Link
                          href={`/stores/${store.slug}/products/${l.productId}`}
                          className="block text-base leading-tight hover:underline sm:text-lg font-bold font-[family:var(--font-kanit)]"
                          style={{
                            color: '#5c3826',
                            letterSpacing: '-0.01em',
                          }}
                        >
                          {l.title}
                        </Link>
                        <p
                          className="mt-1 text-xs"
                          style={{ color: '#5c3826', opacity: 0.6 }}
                        >
                          จากร้าน {store.name}
                        </p>
                        <div className="mt-3 flex flex-wrap items-baseline gap-3">
                          <span
                            className="text-base font-bold"
                            style={{
                              color: '#e67e22',
                              fontFamily: LIFESTYLE_DISPLAY_FONT,
                            }}
                          >
                            {formatTHB(l.priceTHB)}
                          </span>
                          <span
                            className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold"
                            style={{
                              borderColor: '#fed7aa',
                              color: '#5c3826',
                              background: '#ffffff',
                            }}
                          >
                            ของใช้น่ารัก
                          </span>
                        </div>
                      </div>

                      {/* Bottom row: qty stepper + remove */}
                      <div className="flex items-center justify-between gap-3">
                        <div
                          className="inline-flex h-9 items-center overflow-hidden rounded-full border bg-white"
                          style={{ borderColor: '#fed7aa' }}
                        >
                          <button
                            type="button"
                            onClick={() => setQty(l.productId, l.qty - 1, store.slug)}
                            disabled={l.qty <= 1}
                            aria-label="ลด"
                            className="inline-flex h-9 w-9 items-center justify-center text-sm disabled:opacity-40"
                            style={{ color: '#5c3826' }}
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
                              color: '#5c3826',
                              borderColor: '#fed7aa',
                            }}
                            aria-label={`จำนวน ${l.title}`}
                          />
                          <button
                            type="button"
                            onClick={() => setQty(l.productId, l.qty + 1, store.slug)}
                            aria-label="เพิ่ม"
                            className="inline-flex h-9 w-9 items-center justify-center text-sm"
                            style={{ color: '#5c3826' }}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => remove(l.productId, store.slug)}
                          className="text-xs font-semibold uppercase tracking-[0.12em] hover:underline"
                          style={{ color: '#5c3826', opacity: 0.8 }}
                          aria-label={`ลบ ${l.title}`}
                        >
                          ลบออก
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </section>

              {/* Soft amber card */}
              <aside
                aria-labelledby="summary-heading"
                className="mt-12 lg:mt-0 lg:sticky lg:top-24"
              >
                <h2 id="summary-heading" className="sr-only">
                  สรุปคำสั่งซื้อ
                </h2>

                <div
                  className="rounded-3xl p-7 border border-[#fed7aa]/60"
                  style={{ background: '#fdf4eb' }}
                >
                  <p
                    className="text-xs font-semibold uppercase tracking-[0.18em]"
                    style={{ color: '#e67e22' }}
                  >
                    ตะกร้าสินค้า
                  </p>
                  <h3
                    className="mt-1 text-2xl sm:text-3xl font-bold font-[family:var(--font-kanit)]"
                    style={{
                      color: '#5c3826',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    สรุปยอดคำสั่งซื้อ
                  </h3>

                  {/* Dashed divider */}
                  <div
                    className="border-t-2 border-dashed border-[#fed7aa] my-5"
                    aria-hidden
                  />

                  <dl className="space-y-3.5 text-sm">
                    <div className="flex items-center justify-between">
                      <dt style={{ color: '#5c3826', opacity: 0.8 }}>ยอดรวมสินค้า</dt>
                      <dd
                        className="font-bold"
                        style={{ color: '#5c3826' }}
                      >
                        {formatTHB(subtotal)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt style={{ color: '#5c3826', opacity: 0.8 }}>ค่าจัดส่ง</dt>
                      <dd
                        className="font-bold"
                        style={{
                          color: shipping === 0 ? '#e67e22' : '#5c3826',
                        }}
                      >
                        {shipping === 0 ? 'จัดส่งฟรี' : formatTHB(shipping)}
                      </dd>
                    </div>
                    <div
                      className="flex items-baseline justify-between border-t pt-4"
                      style={{ borderColor: '#fed7aa' }}
                    >
                      <dt
                        className="text-base font-bold font-[family:var(--font-kanit)]"
                        style={{
                          color: '#5c3826',
                        }}
                      >
                        ยอดรวมสุทธิ
                      </dt>
                      <dd
                        className="text-2xl font-bold font-[family:var(--font-kanit)]"
                        style={{
                          color: '#e67e22',
                        }}
                      >
                        {formatTHB(total)}
                      </dd>
                    </div>
                  </dl>

                  <Link
                    href={`/stores/${store.slug}/checkout/address`}
                    className="mt-7 inline-flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold text-white shadow-sm transition hover:bg-[#d35400]"
                    style={{ background: '#e67e22' }}
                  >
                    ดำเนินการสั่งซื้อ
                  </Link>

                  <p
                    className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs"
                    style={{ color: '#5c3826', opacity: 0.7 }}
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-[#e67e22]" />
                    ชำระเงินปลอดภัย • ปกป้องข้อมูลโดย Basketplace
                  </p>
                </div>

                {/* Warm trust strip */}
                <ul
                  className="mt-6 space-y-3 text-sm px-2"
                  style={{ color: '#5c3826' }}
                >
                  <li className="flex items-start gap-2.5">
                    <Truck
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#e67e22]"
                    />
                    <span>
                      จัดส่งฟรี เมื่อมียอดสั่งซื้อตั้งแต่{' '}
                      <span className="font-bold">
                        {formatTHB(FREE_SHIPPING_THRESHOLD)}
                      </span>
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Leaf
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#e67e22]"
                    />
                    <span>เปลี่ยนหรือคืนสินค้าได้ง่ายภายใน 7 วัน</span>
                  </li>
                </ul>
              </aside>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--shop-bg)' }}>
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        {/* Warm catalog top band — friendly eyebrow + Outfit display h1 */}
        <header className="mb-10 sm:mb-14">
          <Link
            href={`/stores/${store.slug}`}
            className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em] hover:underline"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Keep shopping
          </Link>
          <p
            className="mt-6 text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: 'var(--shop-accent)' }}
          >
            Your basket · Almost there
          </p>
          <h1
            className="mt-2 text-4xl sm:text-5xl md:text-6xl"
            style={{
              fontFamily: LIFESTYLE_DISPLAY_FONT,
              color: 'var(--shop-ink)',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              lineHeight: 1.05,
            }}
          >
            Your basket
          </h1>
          <p
            className="mt-3 max-w-xl text-base"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            {lines.length === 0
              ? `Looks like ${store.name} hasn't found its way in yet — let's change that.`
              : `${itemCount.toLocaleString()} good thing${itemCount === 1 ? '' : 's'} from ${store.name}, ready when you are.`}
          </p>
        </header>

        {lines.length === 0 ? (
          <LifestyleEmptyCart storeSlug={store.slug} />
        ) : (
          <div className="lg:grid lg:grid-cols-[1fr_22rem] lg:gap-12 lg:items-start">
            {/* ── Pillow cards line items ───────────────────────────── */}
            <section aria-labelledby="cart-heading" className="space-y-5">
              <h2 id="cart-heading" className="sr-only">
                สินค้าในตะกร้า
              </h2>

              {/* Friendly free-shipping chip on top */}
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold"
                style={{
                  background: shipping === 0 ? 'var(--shop-accent)' : 'var(--shop-muted)',
                  color: shipping === 0 ? '#ffffff' : 'var(--shop-ink)',
                }}
              >
                <Truck className="h-3.5 w-3.5" />
                {shipping === 0
                  ? "You're getting free shipping"
                  : `Add ${formatTHB(remainingForFreeShipping)} for free shipping`}
              </div>

              {lines.map((l) => (
                <article
                  key={l.productId}
                  data-lifestyle-frame="true"
                  className="grid grid-cols-[6.5rem_1fr] gap-4 overflow-hidden rounded-3xl bg-white p-4 sm:grid-cols-[8rem_1fr] sm:gap-6 sm:p-5"
                >
                  {/* Square 1/1 thumbnail with peach muted backdrop */}
                  <Link
                    href={`/stores/${store.slug}/products/${l.productId}`}
                    className="relative block overflow-hidden rounded-2xl"
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
                        sizes="(max-width: 640px) 104px, 128px"
                        className="object-cover"
                      />
                    ) : null}
                  </Link>

                  <div className="flex flex-col justify-between gap-3">
                    <div>
                      <Link
                        href={`/stores/${store.slug}/products/${l.productId}`}
                        className="block text-base leading-tight hover:underline sm:text-lg"
                        style={{
                          fontFamily: LIFESTYLE_DISPLAY_FONT,
                          color: 'var(--shop-ink)',
                          fontWeight: 600,
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {l.title}
                      </Link>
                      <p
                        className="mt-1 text-xs"
                        style={{ color: 'var(--shop-ink-muted)' }}
                      >
                        from {store.name}
                      </p>
                      <div className="mt-3 flex flex-wrap items-baseline gap-3">
                        <span
                          className="text-base font-semibold"
                          style={{
                            color: 'var(--shop-primary)',
                            fontFamily: LIFESTYLE_DISPLAY_FONT,
                          }}
                        >
                          {formatTHB(l.priceTHB)}
                        </span>
                        <span
                          className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold"
                          style={{
                            borderColor: 'var(--shop-accent)',
                            color: 'var(--shop-ink)',
                            background: '#ffffff',
                          }}
                        >
                          Everyday essentials
                        </span>
                      </div>
                    </div>

                    {/* Bottom row: qty stepper + remove */}
                    <div className="flex items-center justify-between gap-3">
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

                      <button
                        type="button"
                        onClick={() => remove(l.productId, store.slug)}
                        className="text-xs font-semibold uppercase tracking-[0.12em] hover:underline"
                        style={{ color: 'var(--shop-ink-muted)' }}
                        aria-label={`ลบ ${l.title}`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            {/* ── Soft peach muted summary card with squiggle above totals ─ */}
            <aside
              aria-labelledby="summary-heading"
              className="mt-12 lg:mt-0 lg:sticky lg:top-24"
            >
              <h2 id="summary-heading" className="sr-only">
                สรุปคำสั่งซื้อ
              </h2>

              <div
                data-lifestyle-frame="true"
                className="rounded-3xl p-7"
                style={{ background: 'var(--shop-muted)' }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-[0.18em]"
                  style={{ color: 'var(--shop-accent)' }}
                >
                  Your basket
                </p>
                <h3
                  className="mt-1 text-2xl sm:text-3xl"
                  style={{
                    fontFamily: LIFESTYLE_DISPLAY_FONT,
                    color: 'var(--shop-ink)',
                    fontWeight: 600,
                    letterSpacing: '-0.01em',
                  }}
                >
                  Order summary
                </h3>

                {/* Sage squiggle divider above totals */}
                <div
                  data-lifestyle-squiggle="true"
                  className="my-5"
                  aria-hidden
                />

                <dl className="space-y-3.5 text-sm">
                  <div className="flex items-center justify-between">
                    <dt style={{ color: 'var(--shop-ink-muted)' }}>Subtotal</dt>
                    <dd
                      className="font-semibold"
                      style={{ color: 'var(--shop-ink)' }}
                    >
                      {formatTHB(subtotal)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt style={{ color: 'var(--shop-ink-muted)' }}>Shipping</dt>
                    <dd
                      className="font-semibold"
                      style={{
                        color:
                          shipping === 0 ? 'var(--shop-accent)' : 'var(--shop-ink)',
                      }}
                    >
                      {shipping === 0 ? 'Free' : formatTHB(shipping)}
                    </dd>
                  </div>
                  <div
                    className="flex items-baseline justify-between border-t pt-4"
                    style={{ borderColor: 'var(--shop-border)' }}
                  >
                    <dt
                      className="text-base"
                      style={{
                        fontFamily: LIFESTYLE_DISPLAY_FONT,
                        color: 'var(--shop-ink)',
                        fontWeight: 600,
                      }}
                    >
                      Total
                    </dt>
                    <dd
                      className="text-2xl font-semibold"
                      style={{
                        color: 'var(--shop-primary)',
                        fontFamily: LIFESTYLE_DISPLAY_FONT,
                      }}
                    >
                      {formatTHB(total)}
                    </dd>
                  </div>
                </dl>

                <Link
                  href={`/stores/${store.slug}/checkout/address`}
                  className="mt-7 inline-flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                  style={{ background: 'var(--shop-primary)' }}
                >
                  Checkout
                </Link>

                <p
                  className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs"
                  style={{ color: 'var(--shop-ink-muted)' }}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Secure checkout · protected by Basketplace
                </p>
              </div>

              {/* Warm trust strip — sage icons */}
              <ul
                className="mt-6 space-y-3 text-sm"
                style={{ color: 'var(--shop-ink)' }}
              >
                <li className="flex items-start gap-2.5">
                  <Truck
                    className="mt-0.5 h-4 w-4 shrink-0"
                    style={{ color: 'var(--shop-accent)' }}
                  />
                  <span>
                    Free shipping on orders over{' '}
                    <span className="font-semibold">
                      {formatTHB(FREE_SHIPPING_THRESHOLD)}
                    </span>
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Leaf
                    className="mt-0.5 h-4 w-4 shrink-0"
                    style={{ color: 'var(--shop-accent)' }}
                  />
                  <span>Easy returns within 7 days</span>
                </li>
              </ul>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

function LifestyleEmptyCart({ storeSlug, isZugarbox = false }: { storeSlug: string; isZugarbox?: boolean }) {
  if (isZugarbox) {
    return (
      <div className="mx-auto max-w-2xl py-10 text-center font-[family:var(--font-prompt)]">
        {/* Soft amber rounded-FULL ring around a heart icon */}
        <div
          className="mx-auto mb-8 inline-flex h-32 w-32 items-center justify-center rounded-full"
          style={{
            background: '#fdf4eb',
            border: '6px solid #ffffff',
            boxShadow:
              '0 2px 4px rgba(92, 56, 38, 0.06), 0 12px 32px rgba(92, 56, 38, 0.08)',
          }}
        >
          <Heart
            className="h-12 w-12 text-[#e67e22]"
          />
        </div>
        <h2
          className="text-3xl sm:text-4xl font-bold font-[family:var(--font-kanit)]"
          style={{
            color: '#5c3826',
            letterSpacing: '-0.01em',
          }}
        >
          ตะกร้าสินค้าของคุณยังว่างอยู่
        </h2>
        <p
          className="mx-auto mt-3 max-w-md text-base"
          style={{ color: '#5c3826', opacity: 0.8 }}
        >
          ค้นพบสินค้าสุดคิ้วท์ที่คุณจะหลงรัก — คัดสรรพิเศษเพื่อแต่งเติมรอยยิ้มในทุกวัน
        </p>
        <Link
          href={`/stores/${storeSlug}/category`}
          className="mt-8 inline-flex h-12 items-center justify-center rounded-full px-10 text-sm font-semibold text-white shadow-sm transition hover:bg-[#d35400]"
          style={{ background: '#e67e22' }}
        >
          เริ่มเลือกซื้อสินค้า
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl py-10 text-center">
      {/* Soft amber rounded-FULL ring around a heart icon */}
      <div
        className="mx-auto mb-8 inline-flex h-32 w-32 items-center justify-center rounded-full"
        style={{
          background: 'var(--shop-muted)',
          border: '6px solid #ffffff',
          boxShadow:
            '0 2px 4px rgba(120, 53, 15, 0.06), 0 12px 32px rgba(120, 53, 15, 0.08)',
        }}
      >
        <Heart
          className="h-12 w-12"
          style={{ color: 'var(--shop-accent)' }}
        />
      </div>
      <h2
        className="text-3xl sm:text-4xl"
        style={{
          fontFamily: LIFESTYLE_DISPLAY_FONT,
          color: 'var(--shop-ink)',
          fontWeight: 600,
          letterSpacing: '-0.01em',
        }}
      >
        Your basket is empty
      </h2>
      <p
        className="mx-auto mt-3 max-w-md text-base"
        style={{ color: 'var(--shop-ink-muted)' }}
      >
        Find something you&rsquo;ll love — every piece in our catalog is hand
        chosen for the way you live.
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
