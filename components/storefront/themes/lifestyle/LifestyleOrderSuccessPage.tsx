/**
 * LifestyleOrderSuccessPage — bespoke lifestyle post-payment confirmation.
 *
 * Structural difference from the generic checkout/success page AND the
 * FashionBeautyOrderSuccessPage:
 *   - Sage hand-drawn squiggle SVG divider ABOVE the hero — friendly
 *     catalog flourish, NOT a hairline rule.
 *   - "We've got your order!" warm conversational h1 in Outfit / Plus
 *     Jakarta Sans display weight 600 — geometric humanist sans, NOT
 *     italic serif. Reads as a friendly note from a real person.
 *   - Soft sage check-ring 24x24 (h-24 w-24) above the headline — large
 *     friendly success icon. Matches the warm "we're so glad you're here"
 *     tone of a Patagonia / West Elm / The Citizenry order confirmation.
 *   - Order number sits in a soft amber-100 (peach) muted pill frame —
 *     sage-accent label.
 *   - ETA + status render as TWO friendly chips below the hero (rounded
 *     pill, soft warm backgrounds), not italic-serif lines.
 *   - Items list mirrors the lifestyle pillow card: 1/1 square thumbnail
 *     left, info column right, no border, soft drop shadow via
 *     data-lifestyle-frame.
 *   - Primary CTAs are rounded-full + warm voice ("Track order" /
 *     "Keep shopping") — same vocabulary as the cart checkout button.
 *
 * Auth + scoping behaviour matches the generic page (already enforced
 * at the page.tsx level before reaching this component).
 */

import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Check,
  Copy,
  MessageCircle,
  Package,
  Truck,
} from 'lucide-react';
import { formatTHB } from '@/lib/utils';

const LIFESTYLE_DISPLAY_FONT =
  'var(--font-lifestyle-display, "Outfit"), "Plus Jakarta Sans", "DM Sans", "Prompt", system-ui, sans-serif';

export interface LifestyleOrderItem {
  id: string;
  title: string;
  imageUrl: string | null;
  qty: number;
  lineTotalTHB: number;
}

export interface LifestyleOrderSuccessPageProps {
  slug: string;
  storeName: string;
  shortCode: string;
  fullId: string;
  buyerEmail: string | null;
  totalTHB: number;
  items: LifestyleOrderItem[];
  etaRange: string;
  statusLabel: string;
  paymentStatusLabel: string | null;
}

export function LifestyleOrderSuccessPage({
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
}: LifestyleOrderSuccessPageProps) {
  return (
    <div style={{ background: 'var(--shop-bg)', minHeight: '100vh' }}>
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-12 sm:px-6 sm:pt-20 lg:px-8">
        {/* Sage squiggle divider above the hero */}
        <div
          data-lifestyle-squiggle="true"
          className="mx-auto mb-8 w-32"
          aria-hidden
        />

        {/* Warm conversational thank-you hero */}
        <header className="text-center">
          {/* Soft sage check-ring 24 x 24 */}
          <div
            className="mx-auto inline-flex h-24 w-24 items-center justify-center rounded-full"
            style={{
              background: 'var(--shop-muted)',
              border: '6px solid #ffffff',
              boxShadow:
                '0 2px 4px rgba(120, 53, 15, 0.06), 0 12px 32px rgba(120, 53, 15, 0.08)',
            }}
            aria-hidden
          >
            <span
              className="inline-flex h-14 w-14 items-center justify-center rounded-full text-white"
              style={{ background: 'var(--shop-accent)' }}
            >
              <Check className="h-7 w-7" strokeWidth={3} />
            </span>
          </div>

          <p
            className="mt-6 text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: 'var(--shop-accent)' }}
          >
            สั่งซื้อสำเร็จ
          </p>
          <h1
            className="mt-3 text-4xl sm:text-5xl md:text-6xl"
            style={{
              fontFamily: LIFESTYLE_DISPLAY_FONT,
              color: 'var(--shop-ink)',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              lineHeight: 1.05,
            }}
          >
            ได้รับคำสั่งซื้อแล้ว!
          </h1>
          <p
            className="mx-auto mt-5 max-w-xl text-base leading-relaxed"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            ขอบคุณที่เลือกซื้อกับ {storeName} ทีมงานของเรากำลังจัดของให้อย่างตั้งใจ
            {buyerEmail ? (
              <>
                {' '}อีเมลยืนยันกำลังส่งไปที่{' '}
                <span
                  className="font-semibold"
                  style={{ color: 'var(--shop-ink)' }}
                >
                  {buyerEmail}
                </span>
              </>
            ) : (
              ''
            )}
          </p>

          {/* Order number pill — soft peach muted */}
          <div
            className="mx-auto mt-7 inline-flex items-center gap-3 rounded-full px-5 py-2.5"
            style={{
              background: 'var(--shop-muted)',
              border: '1px solid var(--shop-accent)',
            }}
          >
            <span
              className="text-xs font-semibold uppercase tracking-[0.18em]"
              style={{ color: 'var(--shop-accent)' }}
            >
              คำสั่งซื้อ
            </span>
            <span
              className="text-base font-semibold"
              style={{
                color: 'var(--shop-ink)',
                fontFamily: LIFESTYLE_DISPLAY_FONT,
              }}
            >
              {shortCode}
            </span>
            <Copy
              className="h-3.5 w-3.5"
              style={{ color: 'var(--shop-ink-muted)' }}
            />
          </div>

          {/* ETA + status as friendly chips */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            <span
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-sm"
              style={{ color: 'var(--shop-ink)' }}
            >
              <Truck
                className="h-3.5 w-3.5"
                style={{ color: 'var(--shop-accent)' }}
              />
              ถึงประมาณ {etaRange}
            </span>
            <span
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-sm"
              style={{ color: 'var(--shop-ink)' }}
            >
              <Package
                className="h-3.5 w-3.5"
                style={{ color: 'var(--shop-accent)' }}
              />
              {statusLabel}
            </span>
          </div>
        </header>

        {/* Items — pillow cards with soft drop shadow */}
        <section className="mt-14">
          <p
            className="text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: 'var(--shop-accent)' }}
          >
            คำสั่งซื้อของคุณ
          </p>
          <h2
            className="mt-2 text-2xl sm:text-3xl"
            style={{
              fontFamily: LIFESTYLE_DISPLAY_FONT,
              color: 'var(--shop-ink)',
              fontWeight: 600,
              letterSpacing: '-0.01em',
            }}
          >
            ของดีๆ {items.length} ชิ้น กำลังจะถึงคุณ
          </h2>

          <ul className="mt-6 space-y-4">
            {items.map((it) => (
              <li
                key={it.id}
                data-lifestyle-frame="true"
                className="grid grid-cols-[5rem_1fr_auto] items-center gap-4 rounded-3xl bg-white p-4 sm:grid-cols-[6rem_1fr_auto] sm:gap-6 sm:p-5"
              >
                <div
                  className="relative overflow-hidden rounded-2xl"
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
                  <p
                    className="line-clamp-2 text-base leading-tight"
                    style={{
                      fontFamily: LIFESTYLE_DISPLAY_FONT,
                      color: 'var(--shop-ink)',
                      fontWeight: 600,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {it.title}
                  </p>
                  <p
                    className="mt-1 text-xs font-semibold"
                    style={{ color: 'var(--shop-ink-muted)' }}
                  >
                    จำนวน {it.qty}
                  </p>
                </div>
                <p
                  className="whitespace-nowrap text-base font-semibold"
                  style={{
                    color: 'var(--shop-primary)',
                    fontFamily: LIFESTYLE_DISPLAY_FONT,
                  }}
                >
                  {formatTHB(it.lineTotalTHB)}
                </p>
              </li>
            ))}
          </ul>

          <div
            className="mt-5 flex items-baseline justify-between rounded-3xl px-5 py-4"
            style={{ background: 'var(--shop-muted)' }}
          >
            <span
              className="text-base"
              style={{
                fontFamily: LIFESTYLE_DISPLAY_FONT,
                color: 'var(--shop-ink)',
                fontWeight: 600,
              }}
            >
              ยอดสุทธิ
            </span>
            <span
              className="text-2xl font-semibold sm:text-3xl"
              style={{
                color: 'var(--shop-primary)',
                fontFamily: LIFESTYLE_DISPLAY_FONT,
              }}
            >
              {formatTHB(totalTHB)}
            </span>
          </div>
        </section>

        {/* Primary CTAs — rounded-full warm pair */}
        <div className="mt-12 grid gap-3 sm:grid-cols-2">
          <Link
            href={`/stores/${slug}/account/orders/${fullId}`}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            style={{ background: 'var(--shop-primary)' }}
          >
            ติดตามคำสั่งซื้อ
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={`/stores/${slug}`}
            className="inline-flex h-12 items-center justify-center rounded-full border bg-white text-sm font-semibold transition hover:opacity-80"
            style={{
              borderColor: 'var(--shop-ink)',
              color: 'var(--shop-ink)',
            }}
          >
            เลือกซื้อต่อ
          </Link>
        </div>

        {/* LINE follow nudge — warm conversational */}
        <div
          data-lifestyle-frame="true"
          className="mt-10 flex items-start gap-3 rounded-3xl px-5 py-4"
          style={{ background: 'var(--shop-muted)' }}
        >
          <span
            className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
            style={{ background: 'var(--shop-accent)' }}
            aria-hidden
          >
            <MessageCircle className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <p
              className="text-base"
              style={{
                fontFamily: LIFESTYLE_DISPLAY_FONT,
                color: 'var(--shop-ink)',
                fontWeight: 600,
              }}
            >
              ติดตามใกล้ๆ
            </p>
            <p
              className="mt-1 text-sm"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              เพิ่ม {storeName} บน LINE เพื่อรับข่าวการจัดส่งและของใหม่ในแคตตาล็อก
            </p>
          </div>
          <a
            href="https://line.me"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center justify-center rounded-full px-4 text-xs font-semibold text-white shadow-sm transition hover:opacity-90"
            style={{ background: 'var(--shop-primary)' }}
          >
            เพิ่ม LINE
          </a>
        </div>

        <div
          className="mt-12 space-y-1 text-center text-xs"
          style={{ color: 'var(--shop-ink-muted)' }}
        >
          <p>
            หมายเลขอ้างอิง · <span className="font-mono">{fullId}</span>
          </p>
          {paymentStatusLabel && <p>การชำระเงิน · {paymentStatusLabel}</p>}
        </div>
      </main>
    </div>
  );
}
