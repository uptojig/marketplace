/**
 * TrustOrderSuccessPage — bespoke heritage-maison post-payment
 * confirmation.
 *
 * Structural difference from the generic checkout/success page and
 * from FashionBeautyOrderSuccessPage:
 *   - Heritage thank-you hero: caps eyebrow ("ORDER PLACED · WITH
 *     GRATITUDE"), centered serif title cartouche framed by gold
 *     hairlines, and a sober body line in upright serif (NO
 *     italic). A gold rule sits below the title.
 *   - Order number presented as a CAPS "ORDER NUMBER" pill — a
 *     squared rectangle with thick gold trim, the short code in
 *     tabular caps with letterspacing, the full id mono below.
 *   - ETA + status render as caps label-rule pairs in a two-column
 *     grid below the hero — heritage signage, not italic lines.
 *   - Items list mirrors the cart ledger: square 1/1 image, title +
 *     heritage SKU + qty in tabular caps, line total tabular-nums
 *     right-aligned, hairline divider between rows.
 *   - CTAs are a sober pair of squared rectangles: charcoal-filled
 *     primary "Track Your Order" + outlined secondary "Browse the
 *     Collection". Same uppercase letterspaced typography.
 *
 * Auth + scoping behaviour matches the generic page (already enforced
 * at the page.tsx level before reaching this component).
 */

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { formatTHB } from '@/lib/utils';

const TRUST_DISPLAY_FONT =
  'var(--font-trust-display, "Playfair Display"), Georgia, "Noto Serif Thai", serif';

export interface TrustOrderItem {
  id: string;
  title: string;
  imageUrl: string | null;
  qty: number;
  lineTotalTHB: number;
}

export interface TrustOrderSuccessPageProps {
  slug: string;
  storeName: string;
  shortCode: string;
  fullId: string;
  buyerEmail: string | null;
  totalTHB: number;
  items: TrustOrderItem[];
  etaRange: string;
  statusLabel: string;
  paymentStatusLabel: string | null;
}

/**
 * Build a deterministic 6-char heritage SKU from product id —
 * matches TrustCategoryGrid + TrustProductHero so the same item
 * shows the same SKU across cart / catalog / PDP / receipt.
 */
function heritageSku(id: string): string {
  const hash = id
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(-6)
    .padStart(6, '0');
  return `BP-${hash}`;
}

export function TrustOrderSuccessPage({
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
}: TrustOrderSuccessPageProps) {
  return (
    <div style={{ background: 'var(--shop-bg)', minHeight: '100vh' }}>
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-12 sm:px-6 sm:pt-20 lg:px-8">
        {/* Heritage thank-you hero. */}
        <header className="text-center">
          <p
            className="text-[11px] uppercase"
            style={{
              color: 'var(--shop-accent)',
              letterSpacing: '0.32em',
              fontWeight: 600,
            }}
          >
            คำสั่งซื้อยืนยันแล้ว · ขอบคุณ
          </p>

          {/* Title cartouche — gold-rule top + bottom. */}
          <div
            className="mx-auto mt-4 inline-block border-y py-3"
            style={{ borderColor: 'var(--shop-accent)' }}
          >
            <h1
              className="text-4xl sm:text-5xl md:text-6xl"
              style={{
                fontFamily: TRUST_DISPLAY_FONT,
                color: 'var(--shop-ink)',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                lineHeight: 1.05,
              }}
            >
              ขอบคุณสำหรับคำสั่งซื้อ
            </h1>
          </div>

          <div
            aria-hidden
            className="mx-auto mt-6 h-px w-12"
            style={{ background: 'var(--shop-accent)' }}
          />

          <p
            className="mx-auto mt-6 max-w-xl text-sm leading-relaxed"
            style={{
              fontFamily: TRUST_DISPLAY_FONT,
              color: 'var(--shop-ink-muted)',
              fontWeight: 500,
            }}
          >
            เราได้รับคำสั่งซื้อของคุณแล้ว เมซอนกำลังจัดเตรียมสินค้าอย่างพิถีพิถัน
            {buyerEmail ? (
              <>
                ส่งอีเมลยืนยันไปที่{' '}
                <span style={{ color: 'var(--shop-ink)' }}>{buyerEmail}</span>
              </>
            ) : (
              ''
            )}
          </p>

          {/* Order number pill — squared cartouche with thick gold
              trim, caps "ORDER NUMBER" eyebrow + tabular short code. */}
          <div
            className="mx-auto mt-8 inline-block rounded-sm border-2 bg-white px-7 py-4"
            style={{ borderColor: 'var(--shop-accent)' }}
          >
            <p
              className="text-[10px] uppercase"
              style={{
                color: 'var(--shop-accent)',
                letterSpacing: '0.32em',
                fontWeight: 600,
              }}
            >
              เลขที่คำสั่งซื้อ
            </p>
            <p
              className="mt-1 text-2xl font-semibold tabular-nums"
              style={{
                color: 'var(--shop-ink)',
                fontFamily: TRUST_DISPLAY_FONT,
                letterSpacing: '0.18em',
              }}
            >
              {shortCode}
            </p>
          </div>

          {/* ETA + status — two-column caps label-rule pairs. */}
          <div
            className="mx-auto mt-10 grid max-w-md grid-cols-2 gap-6 border-t pt-6"
            style={{ borderColor: 'var(--shop-accent)' }}
          >
            <div>
              <p
                className="text-[10px] uppercase"
                style={{
                  color: 'var(--shop-ink-muted)',
                  letterSpacing: '0.28em',
                  fontWeight: 600,
                }}
              >
                ระยะเวลาจัดส่ง
              </p>
              <p
                className="mt-2 text-sm"
                style={{
                  fontFamily: TRUST_DISPLAY_FONT,
                  color: 'var(--shop-ink)',
                  fontWeight: 600,
                }}
              >
                {etaRange}
              </p>
            </div>
            <div className="border-l pl-6" style={{ borderColor: 'var(--shop-border)' }}>
              <p
                className="text-[10px] uppercase"
                style={{
                  color: 'var(--shop-ink-muted)',
                  letterSpacing: '0.28em',
                  fontWeight: 600,
                }}
              >
                สถานะ
              </p>
              <p
                className="mt-2 text-sm"
                style={{
                  fontFamily: TRUST_DISPLAY_FONT,
                  color: 'var(--shop-ink)',
                  fontWeight: 600,
                }}
              >
                {statusLabel}
              </p>
            </div>
          </div>
        </header>

        {/* Items — heritage ledger rows. */}
        <section className="mt-14">
          <p
            className="text-[11px] uppercase"
            style={{
              color: 'var(--shop-accent)',
              letterSpacing: '0.32em',
              fontWeight: 600,
            }}
          >
            เมซอน · รายการสินค้า
          </p>
          <h2
            className="mt-2 text-2xl sm:text-3xl"
            style={{
              fontFamily: TRUST_DISPLAY_FONT,
              color: 'var(--shop-ink)',
              fontWeight: 600,
              letterSpacing: '-0.01em',
            }}
          >
            {items.length} ชิ้นในระหว่างจัดส่ง
          </h2>

          <div
            aria-hidden
            className="mt-4 h-px w-full"
            style={{ background: 'var(--shop-accent)' }}
          />

          {/* Ledger header — caps column labels. */}
          <div
            className="mt-3 hidden grid-cols-[5rem_1fr_6rem_8rem] items-end gap-4 pb-3 text-[10px] uppercase sm:grid"
            style={{
              color: 'var(--shop-ink-muted)',
              letterSpacing: '0.28em',
              fontWeight: 600,
            }}
          >
            <span />
            <span>รายการสินค้า</span>
            <span className="text-center">จำนวน</span>
            <span className="text-right">รวม</span>
          </div>

          <ul className="divide-y" style={{ borderColor: 'var(--shop-border)' }}>
            {items.map((it) => (
              <li
                key={it.id}
                className="grid grid-cols-[4rem_1fr_auto] items-start gap-4 py-5 sm:grid-cols-[5rem_1fr_6rem_8rem] sm:items-center sm:gap-4"
                style={{ borderColor: 'var(--shop-border)' }}
              >
                <div
                  className="relative overflow-hidden rounded-sm border"
                  style={{
                    aspectRatio: '1 / 1',
                    background: 'var(--shop-muted)',
                    borderColor: 'var(--shop-accent)',
                  }}
                >
                  {it.imageUrl && (
                    <Image
                      src={it.imageUrl}
                      alt={it.title}
                      fill
                      sizes="(max-width: 640px) 64px, 80px"
                      className="object-cover"
                      unoptimized
                    />
                  )}
                </div>

                <div className="min-w-0">
                  <p
                    className="line-clamp-2 text-base leading-snug"
                    style={{
                      fontFamily: TRUST_DISPLAY_FONT,
                      color: 'var(--shop-ink)',
                      fontWeight: 600,
                    }}
                  >
                    {it.title}
                  </p>
                  <p
                    className="mt-1 font-mono text-[10px] uppercase"
                    style={{
                      color: 'var(--shop-ink-muted)',
                      letterSpacing: '0.22em',
                    }}
                  >
                    SKU {heritageSku(it.id)}
                  </p>
                  {/* Mobile inline qty. */}
                  <p
                    className="mt-1 text-xs uppercase sm:hidden"
                    style={{
                      color: 'var(--shop-ink-muted)',
                      letterSpacing: '0.22em',
                      fontWeight: 600,
                    }}
                  >
                    จำนวน <span style={{ color: 'var(--shop-ink)' }}>{it.qty}</span>
                  </p>
                </div>

                <p
                  className="hidden text-center text-sm font-semibold tabular-nums sm:block"
                  style={{ color: 'var(--shop-ink)' }}
                >
                  {it.qty}
                </p>

                <p
                  className="text-right text-base font-semibold tabular-nums whitespace-nowrap"
                  style={{ color: 'var(--shop-ink)' }}
                >
                  {formatTHB(it.lineTotalTHB)}
                </p>
              </li>
            ))}
          </ul>

          <div
            className="flex items-baseline justify-between border-t pt-5"
            style={{ borderColor: 'var(--shop-accent)' }}
          >
            <span
              className="text-xs uppercase"
              style={{
                color: 'var(--shop-ink)',
                letterSpacing: '0.28em',
                fontWeight: 600,
              }}
            >
              ยอดชำระทั้งหมด
            </span>
            <span
              className="text-2xl font-semibold tabular-nums"
              style={{
                color: 'var(--shop-ink)',
                fontFamily: TRUST_DISPLAY_FONT,
              }}
            >
              {formatTHB(totalTHB)}
            </span>
          </div>
        </section>

        {/* Sober CTA pair — squared rectangles. */}
        <div className="mt-12 grid gap-3 sm:grid-cols-2">
          <Link
            href={`/stores/${slug}/account/orders/${fullId}`}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-sm text-xs font-semibold uppercase text-white transition hover:opacity-90"
            style={{
              background: 'var(--shop-primary)',
              letterSpacing: '0.28em',
            }}
          >
            ติดตามคำสั่งซื้อ
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={`/stores/${slug}`}
            className="inline-flex h-12 items-center justify-center rounded-sm border-2 text-xs font-semibold uppercase transition hover:bg-[var(--shop-muted)]"
            style={{
              borderColor: 'var(--shop-ink)',
              color: 'var(--shop-ink)',
              letterSpacing: '0.28em',
            }}
          >
            ดูคอลเลกชัน
          </Link>
        </div>

        {/* LINE follow — heritage cartouche translated. */}
        <div
          className="mt-10 flex items-start gap-3 rounded-sm border-2 bg-white px-5 py-4"
          style={{ borderColor: 'var(--shop-accent)' }}
        >
          <MessageCircle
            className="mt-0.5 h-5 w-5 shrink-0"
            style={{ color: 'var(--shop-accent)' }}
          />
          <div className="flex-1">
            <p
              className="text-[10px] uppercase"
              style={{
                color: 'var(--shop-ink-muted)',
                letterSpacing: '0.28em',
                fontWeight: 600,
              }}
            >
              รับข่าวสาร
            </p>
            <p
              className="mt-1 text-sm"
              style={{
                fontFamily: TRUST_DISPLAY_FONT,
                color: 'var(--shop-ink)',
                fontWeight: 500,
              }}
            >
              เพิ่ม {storeName} เป็นเพื่อนใน LINE เพื่อรับข้อมูลการจัดส่งและชมคอลเลกชันใหม่ก่อนใคร
            </p>
          </div>
          <a
            href="https://line.me"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center justify-center rounded-sm px-4 text-[11px] font-semibold uppercase text-white transition hover:opacity-90"
            style={{
              background: 'var(--shop-primary)',
              letterSpacing: '0.22em',
            }}
          >
            เพิ่มเพื่อน LINE
          </a>
        </div>

        {/* Footer reference block — caps labels + mono ID. */}
        <div
          className="mt-12 space-y-2 text-center text-[10px] uppercase"
          style={{
            color: 'var(--shop-ink-muted)',
            letterSpacing: '0.22em',
            fontWeight: 600,
          }}
        >
          <p>
            รหัสอ้างอิงเต็ม ·{' '}
            <span className="font-mono normal-case" style={{ letterSpacing: '0.05em' }}>
              {fullId}
            </span>
          </p>
          {paymentStatusLabel && (
            <p>
              การชำระเงิน ·{' '}
              <span style={{ color: 'var(--shop-ink)' }}>{paymentStatusLabel}</span>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
