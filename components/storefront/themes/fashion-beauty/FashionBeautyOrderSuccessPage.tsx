/**
 * FashionBeautyOrderSuccessPage — bespoke FB post-payment confirmation.
 *
 * Structural difference from the generic checkout/success page:
 *   - "Thank you" hero in oversized serif + italic curator note,
 *     centered, with a hairline gold-accent divider below — magazine
 *     thank-you-page voice, not the icon-circle + h1 stack.
 *   - Order number sits in a soft-pink pill frame with serif label.
 *   - ETA + status render as TWO italic-serif lines below the hero,
 *     not as info cards on a grid.
 *   - Items list mirrors the FB cart magazine-card layout: 4/5 portrait
 *     image left, info column right, no central divider stripe.
 *   - Primary CTAs are rounded-full and rose-primary — same vocabulary
 *     as the cart checkout button.
 *
 * Auth + scoping behaviour matches the generic page (already enforced
 * at the page.tsx level before reaching this component).
 */

import Link from 'next/link';
import Image from 'next/image';
import { Copy, ArrowRight, MessageCircle } from 'lucide-react';
import { formatTHB } from '@/lib/utils';

const FB_DISPLAY_FONT =
  'var(--font-fashion-display, "Cormorant Garamond"), "Playfair Display", Georgia, "Noto Serif Thai", serif';

export interface FashionBeautyOrderItem {
  id: string;
  title: string;
  imageUrl: string | null;
  qty: number;
  lineTotalTHB: number;
}

export interface FashionBeautyOrderSuccessPageProps {
  slug: string;
  storeName: string;
  shortCode: string;
  fullId: string;
  buyerEmail: string | null;
  totalTHB: number;
  items: FashionBeautyOrderItem[];
  etaRange: string;
  statusLabel: string;
  paymentStatusLabel: string | null;
}

export function FashionBeautyOrderSuccessPage({
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
}: FashionBeautyOrderSuccessPageProps) {
  return (
    <div style={{ background: 'var(--shop-bg)', minHeight: '100vh' }}>
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-12 sm:px-6 sm:pt-20 lg:px-8">
        {/* Editorial thank-you hero */}
        <header className="text-center">
          <p
            className="text-[11px] uppercase tracking-[0.28em]"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            สั่งซื้อสำเร็จ
          </p>
          <h1
            className="mt-3 text-5xl sm:text-7xl"
            style={{
              fontFamily: FB_DISPLAY_FONT,
              color: 'var(--shop-ink)',
              fontWeight: 500,
              letterSpacing: '-0.005em',
              lineHeight: 1.05,
            }}
          >
            ขอบคุณ
          </h1>
          <div
            aria-hidden
            className="mx-auto mt-5 h-px w-12"
            style={{ background: 'var(--shop-accent)' }}
          />
          <p
            className="mx-auto mt-6 max-w-xl text-base italic leading-relaxed"
            style={{
              fontFamily: FB_DISPLAY_FONT,
              color: 'var(--shop-ink-muted)',
            }}
          >
            เราได้รับคำสั่งซื้อแล้ว ทีมงานกำลังเตรียมสินค้าด้วยความใส่ใจ
            {buyerEmail ? (
              <>
                {' '}
                อีเมลยืนยันถูกส่งไปยัง{' '}
                <span style={{ color: 'var(--shop-ink)' }}>{buyerEmail}</span> เรียบร้อยแล้ว
              </>
            ) : (
              ''
            )}
          </p>

          {/* Order number pill — soft pink frame */}
          <div
            className="mx-auto mt-7 inline-flex items-center gap-3 rounded-full border px-5 py-2.5"
            style={{
              background: 'var(--shop-muted)',
              borderColor: 'var(--shop-accent)',
            }}
          >
            <span
              className="text-[11px] uppercase tracking-[0.22em]"
              style={{ color: 'var(--shop-ink-muted)' }}
            >
              คำสั่งซื้อ
            </span>
            <span
              className="text-base font-semibold"
              style={{ color: 'var(--shop-ink)' }}
            >
              {shortCode}
            </span>
            <Copy className="h-3.5 w-3.5" style={{ color: 'var(--shop-ink-muted)' }} />
          </div>

          {/* ETA + status as italic-serif lines below */}
          <p
            className="mt-8 text-base italic"
            style={{
              fontFamily: FB_DISPLAY_FONT,
              color: 'var(--shop-ink-muted)',
            }}
          >
            จัดส่งถึงระหว่าง <span style={{ color: 'var(--shop-ink)' }}>{etaRange}</span>
          </p>
          <p
            className="mt-1 text-sm italic"
            style={{
              fontFamily: FB_DISPLAY_FONT,
              color: 'var(--shop-ink-muted)',
            }}
          >
            สถานะ · <span style={{ color: 'var(--shop-ink)' }}>{statusLabel}</span>
          </p>
        </header>

        {/* Items — magazine cards */}
        <section className="mt-14">
          <p
            className="text-[11px] uppercase tracking-[0.28em]"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            สินค้าของคุณ
          </p>
          <h2
            className="mt-2 text-3xl"
            style={{
              fontFamily: FB_DISPLAY_FONT,
              color: 'var(--shop-ink)',
              fontWeight: 500,
            }}
          >
            {items.length} ชิ้นกำลังเดินทาง
          </h2>

          <ul className="mt-6 space-y-4">
            {items.map((it) => (
              <li
                key={it.id}
                className="grid grid-cols-[5rem_1fr_auto] items-center gap-4 rounded-2xl border bg-white p-4 shadow-sm sm:grid-cols-[6rem_1fr_auto] sm:gap-6 sm:p-5"
                style={{ borderColor: 'var(--shop-border)' }}
              >
                <div
                  className="relative overflow-hidden rounded-xl"
                  style={{
                    aspectRatio: '4 / 5',
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
                    className="line-clamp-2 text-base"
                    style={{
                      fontFamily: FB_DISPLAY_FONT,
                      color: 'var(--shop-ink)',
                      fontWeight: 500,
                      lineHeight: 1.3,
                    }}
                  >
                    {it.title}
                  </p>
                  <p
                    className="mt-1 text-sm italic"
                    style={{
                      fontFamily: FB_DISPLAY_FONT,
                      color: 'var(--shop-ink-muted)',
                    }}
                  >
                    จำนวน {it.qty}
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
            className="mt-5 flex items-baseline justify-between border-t pt-5"
            style={{ borderColor: 'var(--shop-accent)' }}
          >
            <span
              className="text-base"
              style={{
                fontFamily: FB_DISPLAY_FONT,
                color: 'var(--shop-ink)',
                fontWeight: 500,
              }}
            >
              ยอดรวม
            </span>
            <span
              className="text-2xl font-semibold"
              style={{ color: 'var(--shop-primary)' }}
            >
              {formatTHB(totalTHB)}
            </span>
          </div>
        </section>

        {/* Primary actions — rounded-full rose pair */}
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
            className="inline-flex h-12 items-center justify-center rounded-full border text-sm font-semibold transition hover:opacity-80"
            style={{
              borderColor: 'var(--shop-ink)',
              color: 'var(--shop-ink)',
            }}
          >
            เลือกซื้อต่อ
          </Link>
        </div>

        {/* LINE follow nudge — translated to FB voice */}
        <div
          className="mt-10 flex items-start gap-3 rounded-2xl border px-5 py-4"
          style={{
            background: 'var(--shop-muted)',
            borderColor: 'var(--shop-accent)',
          }}
        >
          <MessageCircle
            className="mt-0.5 h-5 w-5 shrink-0"
            style={{ color: 'var(--shop-primary)' }}
          />
          <div className="flex-1">
            <p
              className="text-base"
              style={{
                fontFamily: FB_DISPLAY_FONT,
                color: 'var(--shop-ink)',
                fontWeight: 500,
              }}
            >
              อย่าพลาดข่าวสาร
            </p>
            <p
              className="mt-1 text-sm italic"
              style={{
                fontFamily: FB_DISPLAY_FONT,
                color: 'var(--shop-ink-muted)',
              }}
            >
              เพิ่ม {storeName} เป็นเพื่อนบน LINE เพื่อรับอัปเดตการจัดส่งและคอลเลกชันใหม่ก่อนใคร
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
          className="mt-12 space-y-1 text-center text-xs italic"
          style={{
            fontFamily: FB_DISPLAY_FONT,
            color: 'var(--shop-ink-muted)',
          }}
        >
          <p>
            หมายเลขคำสั่งซื้อเต็ม · <span className="font-mono">{fullId}</span>
          </p>
          {paymentStatusLabel && (
            <p>การชำระเงิน · {paymentStatusLabel}</p>
          )}
        </div>
      </main>
    </div>
  );
}
