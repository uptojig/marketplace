/**
 * SpecialtyOrderSuccessPage — bespoke artisan / vintage post-payment
 * confirmation.
 *
 * Structural difference from the generic checkout/success page AND
 * from the fashion-beauty bespoke variant:
 *   - "Order Stamped" SpecialtyStamp badge over the hero — reads as
 *     a curator's wax stamp on a paper receipt.
 *   - Hand-script "thank you, friend" eyebrow + Fraunces slab-serif
 *     h1 "Thank you for supporting handcrafted goods" — workshop-
 *     letter voice, not a magazine thank-you spread.
 *   - Order code sits inside a kraft-textured pill with a SpecialtyStamp
 *     "wax-seal" label, NOT a soft-pink rounded-full pill.
 *   - ETA + status render as Caveat hand-script lines — softer than
 *     the FB italic-serif treatment.
 *   - Items list is kraft-textured cards (data-specialty-kraft="true")
 *     with sepia-tinted square images (data-specialty-sepia="true")
 *     and maker attribution under each title.
 *   - Footer hand-script "p.s. each piece ships within 5-7 days —
 *     made by hand" replaces the FB italic order-reference footer.
 *
 * Auth + scoping behaviour matches the generic page (already enforced
 * at the page.tsx level before reaching this component).
 */

import Link from 'next/link';
import Image from 'next/image';
import { Copy, ArrowRight, MessageCircle } from 'lucide-react';
import { formatTHB } from '@/lib/utils';
import { SpecialtyStamp } from './SpecialtyDivider';

const SPECIALTY_DISPLAY_FONT =
  'var(--font-specialty-display, "Fraunces"), Georgia, "Noto Serif Thai", serif';

const SPECIALTY_HAND_FONT =
  'var(--font-specialty-hand, "Caveat"), "Permanent Marker", cursive';

export interface SpecialtyOrderItem {
  id: string;
  title: string;
  imageUrl: string | null;
  qty: number;
  lineTotalTHB: number;
}

export interface SpecialtyOrderSuccessPageProps {
  slug: string;
  storeName: string;
  shortCode: string;
  fullId: string;
  buyerEmail: string | null;
  totalTHB: number;
  items: SpecialtyOrderItem[];
  etaRange: string;
  statusLabel: string;
  paymentStatusLabel: string | null;
}

export function SpecialtyOrderSuccessPage({
  slug,
  storeName,
  shortCode,
  fullId,
  buyerEmail,
  totalTHB,
  items,
  etaRange,
  statusLabel,
  paymentStatusLabel,
}: SpecialtyOrderSuccessPageProps) {
  return (
    <div style={{ background: 'var(--shop-bg)', minHeight: '100vh' }}>
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-12 sm:px-6 sm:pt-20 lg:px-8">
        {/* Workshop-letter thank-you hero */}
        <header className="text-center">
          <div className="flex justify-center">
            <SpecialtyStamp tone="primary">Order Stamped</SpecialtyStamp>
          </div>
          <p
            className="mt-6 text-2xl"
            style={{
              fontFamily: SPECIALTY_HAND_FONT,
              color: 'var(--shop-accent)',
            }}
          >
            thank you, friend
          </p>
          <h1
            className="mt-1 text-3xl sm:text-5xl"
            style={{
              fontFamily: SPECIALTY_DISPLAY_FONT,
              color: 'var(--shop-ink)',
              fontWeight: 500,
              letterSpacing: '-0.005em',
              lineHeight: 1.1,
            }}
          >
            Thank you for supporting handcrafted goods
          </h1>
          <div
            aria-hidden
            className="mx-auto mt-5 h-px w-12"
            style={{ background: 'var(--shop-accent)' }}
          />
          <p
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            Your order is on the workbench and {storeName} is preparing it by hand
            {buyerEmail ? (
              <>
                . A confirmation has been sent to{' '}
                <span style={{ color: 'var(--shop-ink)' }}>{buyerEmail}</span>.
              </>
            ) : (
              '.'
            )}
          </p>

          {/* Order number — kraft pill */}
          <div
            data-specialty-kraft="true"
            className="mx-auto mt-7 inline-flex items-center gap-3 rounded-md border px-5 py-2.5"
            style={{ borderColor: 'var(--shop-border)' }}
          >
            <span
              className="text-[11px] uppercase tracking-[0.22em]"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              Receipt
            </span>
            <span
              className="text-base font-semibold"
              style={{ color: 'var(--shop-ink)' }}
            >
              {shortCode}
            </span>
            <Copy className="h-3.5 w-3.5" style={{ color: 'var(--shop-ink-muted)' }} />
          </div>

          {/* ETA + status as hand-script lines */}
          <p
            className="mt-8 text-xl"
            style={{
              fontFamily: SPECIALTY_HAND_FONT,
              color: 'var(--shop-ink-muted)',
            }}
          >
            arriving between{' '}
            <span style={{ color: 'var(--shop-ink)' }}>{etaRange}</span>
          </p>
          <p
            className="mt-1 text-lg"
            style={{
              fontFamily: SPECIALTY_HAND_FONT,
              color: 'var(--shop-ink-muted)',
            }}
          >
            status ·{' '}
            <span style={{ color: 'var(--shop-ink)' }}>{statusLabel}</span>
          </p>
        </header>

        {/* Items — kraft cards with sepia images */}
        <section className="mt-14">
          <p
            className="text-2xl"
            style={{
              fontFamily: SPECIALTY_HAND_FONT,
              color: 'var(--shop-accent)',
            }}
          >
            on the workbench
          </p>
          <h2
            className="mt-1 text-2xl sm:text-3xl"
            style={{
              fontFamily: SPECIALTY_DISPLAY_FONT,
              color: 'var(--shop-ink)',
              fontWeight: 500,
            }}
          >
            {items.length} piece{items.length === 1 ? '' : 's'} in the making
          </h2>

          <ul className="mt-6 space-y-4">
            {items.map((it) => (
              <li
                key={it.id}
                data-specialty-kraft="true"
                className="grid grid-cols-[5rem_1fr_auto] items-center gap-4 rounded-md border p-4 shadow-sm sm:grid-cols-[6rem_1fr_auto] sm:gap-6 sm:p-5"
                style={{ borderColor: 'var(--shop-border)' }}
              >
                <div
                  data-specialty-sepia="true"
                  className="relative overflow-hidden rounded-md"
                  style={{
                    aspectRatio: '1 / 1',
                    background: 'var(--shop-muted)',
                  }}
                >
                  {it.imageUrl && (
                    <Image
                      src={it.imageUrl}
                      alt={it.title}
                      fill
                      sizes="(max-width: 640px) 80px, 96px"
                      className="object-cover"
                      unoptimized
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <span
                    className="text-base italic"
                    style={{
                      fontFamily: SPECIALTY_HAND_FONT,
                      color: 'var(--shop-accent)',
                    }}
                  >
                    Made by {storeName}
                  </span>
                  <p
                    className="line-clamp-2 text-base"
                    style={{
                      fontFamily: SPECIALTY_DISPLAY_FONT,
                      color: 'var(--shop-ink)',
                      fontWeight: 500,
                      lineHeight: 1.3,
                    }}
                  >
                    {it.title}
                  </p>
                  <p
                    className="mt-1 text-sm"
                    style={{ color: 'var(--shop-ink-muted)' }}
                  >
                    Quantity {it.qty}
                  </p>
                </div>
                <p
                  className="text-base font-semibold whitespace-nowrap"
                  style={{ color: 'var(--shop-primary)' }}
                >
                  {formatTHB(it.lineTotalTHB)}
                </p>
              </li>
            ))}
          </ul>

          <div
            className="mt-5 flex items-baseline justify-between border-t border-dashed pt-5"
            style={{ borderColor: 'var(--shop-accent)' }}
          >
            <span
              className="text-base"
              style={{
                fontFamily: SPECIALTY_DISPLAY_FONT,
                color: 'var(--shop-ink)',
                fontWeight: 500,
              }}
            >
              Total
            </span>
            <span
              className="text-2xl font-semibold"
              style={{ color: 'var(--shop-primary)' }}
            >
              {formatTHB(totalTHB)}
            </span>
          </div>
        </section>

        {/* Sober artisan CTAs — rounded-md ochre + outline */}
        <div className="mt-12 grid gap-3 sm:grid-cols-2">
          <Link
            href={`/stores/${slug}/account/orders/${fullId}`}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            style={{ background: 'var(--shop-primary)' }}
          >
            Track your order
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={`/stores/${slug}`}
            className="inline-flex h-12 items-center justify-center rounded-md border text-sm font-semibold transition hover:opacity-80"
            style={{
              borderColor: 'var(--shop-ink)',
              color: 'var(--shop-ink)',
            }}
          >
            Back to the studio
          </Link>
        </div>

        {/* LINE follow nudge — kraft card, artisan voice */}
        <div
          data-specialty-kraft="true"
          className="mt-10 flex items-start gap-3 rounded-md border px-5 py-4"
          style={{ borderColor: 'var(--shop-border)' }}
        >
          <MessageCircle
            className="mt-0.5 h-5 w-5 shrink-0"
            style={{ color: 'var(--shop-primary)' }}
          />
          <div className="flex-1">
            <p
              className="text-base"
              style={{
                fontFamily: SPECIALTY_DISPLAY_FONT,
                color: 'var(--shop-ink)',
                fontWeight: 500,
              }}
            >
              Stay close to the studio
            </p>
            <p
              className="mt-1 text-sm"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              Add {storeName} on LINE for shaping updates and a peek at the next batch.
            </p>
          </div>
          <a
            href="https://line.me"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center justify-center rounded-md px-4 text-xs font-semibold text-white shadow-sm transition hover:opacity-90"
            style={{ background: 'var(--shop-primary)' }}
          >
            Add LINE
          </a>
        </div>

        {/* Hand-script footer — handmade lead-time, no order ref */}
        <div className="mt-12 space-y-2 text-center">
          <p
            className="text-xl leading-tight"
            style={{
              fontFamily: SPECIALTY_HAND_FONT,
              color: 'var(--shop-accent)',
            }}
          >
            p.s. each piece ships within 5-7 days — made by hand.
          </p>
          <p
            className="text-xs"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            Full order reference · <span className="font-mono">{fullId}</span>
          </p>
          {paymentStatusLabel && (
            <p className="text-xs" style={{ color: 'var(--shop-ink-muted)' }}>
              Payment · {paymentStatusLabel}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
