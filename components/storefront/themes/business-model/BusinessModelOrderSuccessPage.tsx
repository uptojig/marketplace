/**
 * BusinessModelOrderSuccessPage — bespoke deal-dashboard / wholesale
 * post-payment confirmation.
 *
 * Structural difference from the generic checkout/success page and
 * from FashionBeautyOrderSuccessPage / TrustOrderSuccessPage:
 *   - "ORDER #XXXX PLACED" hero — green caps eyebrow with mint
 *     status dot + bold sans h1 ("Order received") + mono short-code
 *     readout. Reads as a B2B order-confirmation header, NOT a
 *     magazine "thank you" letter.
 *   - Order short code rendered in OVERSIZED JetBrains Mono with
 *     tabular-nums and a copy chip — looks like a transaction
 *     reference, not an editorial flourish.
 *   - ETA + status sit in a 2-up dashboard chip strip ("ETA · MM-DD"
 *     | "STATUS · …"). Mono caps on labels, mono on values. NO italic.
 *   - Items render as LEDGER ROWS in a single bordered table-card
 *     ("Item / Qty / Subtotal" header strip, alternating yellow-50
 *     row striping via data-bm-row="alt"). Mono prices.
 *   - Savings summary panel under the items: subtotal, savings (mint
 *     chip), shipping, total — same dotted-leader ledger as the cart
 *     summary so the experience is consistent end-to-end. Total in
 *     oversized red mono.
 *   - Dashboard CTAs: "TRACK ORDER" (red rectangular) + "REORDER"
 *     (outlined slate rectangular) — both square corners, NOT pills.
 *   - LINE follow nudge under the CTAs as a sober utility row, not
 *     a soft-pink stationery card.
 *
 * Auth + scoping behaviour matches the generic page (already enforced
 * at the page.tsx level before reaching this component).
 *
 * Props shape mirrors FashionBeautyOrderSuccessPageProps exactly so
 * the page.tsx dispatch can swap variants without remapping.
 */

import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  MessageCircle,
  Package,
  RotateCcw,
  Timer,
  TrendingDown,
  Truck,
} from 'lucide-react';
import { formatTHB } from '@/lib/utils';

const BM_MONO_FONT =
  'var(--font-bm-mono, "JetBrains Mono"), ui-monospace, "Cascadia Mono", "Source Code Pro", monospace';

export interface BusinessModelOrderItem {
  id: string;
  title: string;
  imageUrl: string | null;
  qty: number;
  lineTotalTHB: number;
}

export interface BusinessModelOrderSuccessPageProps {
  slug: string;
  storeName: string;
  shortCode: string;
  fullId: string;
  buyerEmail: string | null;
  totalTHB: number;
  items: BusinessModelOrderItem[];
  etaRange: string;
  statusLabel: string;
  paymentStatusLabel: string | null;
}

export function BusinessModelOrderSuccessPage({
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
}: BusinessModelOrderSuccessPageProps) {
  const itemSubtotal = items.reduce((acc, it) => acc + it.lineTotalTHB, 0);
  const totalQty = items.reduce((acc, it) => acc + it.qty, 0);
  // Savings derive from the difference between summed line totals and
  // recorded order total so the panel reads accurately even when
  // shipping / discounts shift the bottom line. Treats "savings" as
  // any difference where (subtotal > total).
  const inferredSavings = Math.max(0, itemSubtotal - totalTHB);
  const inferredShipping = Math.max(0, totalTHB - itemSubtotal);

  return (
    <div style={{ background: 'var(--shop-bg)', minHeight: '100vh' }}>
      <main className="mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12 lg:px-8">
        {/* B2B order header */}
        <header>
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-2 rounded-md border px-3 py-1 text-[11px] font-semibold uppercase"
              style={{
                background: 'var(--shop-muted)',
                borderColor: 'var(--shop-savings, #10b981)',
                color: 'var(--shop-savings, #10b981)',
                letterSpacing: '0.12em',
              }}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              คำสั่งซื้อ #
              <span
                data-bm-mono="true"
                className="font-bold"
                style={{
                  fontFamily: BM_MONO_FONT,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {shortCode}
              </span>
              สำเร็จ
            </span>
          </div>
          <h1
            className="mt-4 text-3xl sm:text-4xl"
            style={{
              color: 'var(--shop-ink)',
              fontWeight: 700,
              letterSpacing: '-0.015em',
              lineHeight: 1.05,
            }}
          >
            สั่งซื้อสำเร็จ
          </h1>
          <p
            className="mt-3 max-w-xl text-sm"
            style={{ color: 'var(--shop-ink-muted)' }}
          >
            {storeName} ได้รับคำสั่งซื้อของคุณเรียบร้อยแล้ว
            {buyerEmail ? (
              <>
                {' '}อีเมลยืนยันถูกส่งไปที่{' '}
                <span
                  data-bm-mono="true"
                  className="font-bold"
                  style={{
                    color: 'var(--shop-ink)',
                    fontFamily: BM_MONO_FONT,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {buyerEmail}
                </span>
              </>
            ) : (
              ' เราจะเริ่มเตรียมสินค้าให้ในเร็วๆ นี้'
            )}
          </p>

          {/* Big mono short-code panel */}
          <div
            className="mt-6 flex flex-wrap items-center gap-4 rounded-md border p-4 sm:gap-6"
            style={{
              background: 'var(--shop-muted)',
              borderColor: 'var(--shop-border)',
            }}
          >
            <div className="min-w-0">
              <p
                className="text-[11px] font-semibold uppercase"
                style={{
                  color: 'var(--shop-ink-muted)',
                  letterSpacing: '0.12em',
                }}
              >
                เลขที่อ้างอิง
              </p>
              <p
                data-bm-mono="true"
                className="mt-0.5 text-3xl sm:text-4xl"
                style={{
                  color: 'var(--shop-primary)',
                  fontFamily: BM_MONO_FONT,
                  fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '-0.02em',
                }}
              >
                #{shortCode}
              </p>
            </div>
            <span
              className="ml-auto inline-flex items-center gap-1.5 rounded-md border bg-white px-2.5 py-1.5 text-[11px] font-semibold uppercase"
              style={{
                borderColor: 'var(--shop-border)',
                color: 'var(--shop-ink-muted)',
                letterSpacing: '0.12em',
              }}
            >
              <Copy className="h-3.5 w-3.5" />
              คัดลอก
            </span>
          </div>

          {/* ETA + status chip strip */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div
              className="flex items-center gap-3 rounded-md border bg-white p-3"
              style={{ borderColor: 'var(--shop-border)' }}
            >
              <Timer
                className="h-4 w-4 shrink-0"
                style={{ color: 'var(--shop-primary)' }}
              />
              <div className="min-w-0">
                <p
                  className="text-[10px] font-semibold uppercase"
                  style={{
                    color: 'var(--shop-ink-muted)',
                    letterSpacing: '0.12em',
                  }}
                >
                  คาดว่าจะได้รับ
                </p>
                <p
                  data-bm-mono="true"
                  className="text-sm font-bold"
                  style={{
                    color: 'var(--shop-ink)',
                    fontFamily: BM_MONO_FONT,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {etaRange}
                </p>
              </div>
            </div>
            <div
              className="flex items-center gap-3 rounded-md border bg-white p-3"
              style={{ borderColor: 'var(--shop-border)' }}
            >
              <Package
                className="h-4 w-4 shrink-0"
                style={{ color: 'var(--shop-primary)' }}
              />
              <div className="min-w-0">
                <p
                  className="text-[10px] font-semibold uppercase"
                  style={{
                    color: 'var(--shop-ink-muted)',
                    letterSpacing: '0.12em',
                  }}
                >
                  สถานะ
                </p>
                <p
                  className="truncate text-sm font-bold uppercase"
                  style={{
                    color: 'var(--shop-ink)',
                    letterSpacing: '0.06em',
                  }}
                >
                  {statusLabel}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Items — ledger rows */}
        <section className="mt-8">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2
              className="text-xl"
              style={{
                color: 'var(--shop-ink)',
                fontWeight: 700,
                letterSpacing: '-0.015em',
              }}
            >
              บัญชีคำสั่งซื้อ
            </h2>
            <span
              className="text-[11px] font-semibold uppercase"
              style={{
                color: 'var(--shop-ink-muted)',
                letterSpacing: '0.12em',
              }}
            >
              รายการ{' '}
              <span
                data-bm-mono="true"
                className="font-bold"
                style={{
                  color: 'var(--shop-ink)',
                  fontFamily: BM_MONO_FONT,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {items.length}
              </span>{' '}
              · จำนวน{' '}
              <span
                data-bm-mono="true"
                className="font-bold"
                style={{
                  color: 'var(--shop-ink)',
                  fontFamily: BM_MONO_FONT,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {totalQty}
              </span>
            </span>
          </div>

          <div
            className="overflow-hidden rounded-md border bg-white"
            style={{ borderColor: 'var(--shop-border)' }}
          >
            {/* Spreadsheet header strip */}
            <div
              className="hidden grid-cols-[3.5rem_minmax(0,1fr)_5rem_7rem] gap-3 border-b px-4 py-2.5 text-[10px] font-semibold uppercase sm:grid"
              style={{
                background: '#fafafa',
                borderColor: 'var(--shop-border)',
                color: 'var(--shop-ink-muted)',
                letterSpacing: '0.12em',
              }}
            >
              <span className="sr-only">รูปภาพ</span>
              <span>สินค้า</span>
              <span>จำนวน</span>
              <span className="text-right">รวม</span>
            </div>

            <ul>
              {items.map((it, idx) => (
                <li
                  key={it.id}
                  data-bm-row={idx % 2 === 1 ? 'alt' : undefined}
                  className="grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-3 border-t px-4 py-3 sm:grid-cols-[3.5rem_minmax(0,1fr)_5rem_7rem]"
                  style={{
                    borderColor: 'var(--shop-border)',
                    background: idx % 2 === 1 ? 'var(--shop-muted)' : undefined,
                  }}
                >
                  <div
                    className="relative aspect-square overflow-hidden rounded-sm border bg-white"
                    style={{ borderColor: 'var(--shop-border)' }}
                  >
                    {it.imageUrl ? (
                      <Image
                        src={it.imageUrl}
                        alt={it.title}
                        fill
                        sizes="56px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package
                          className="h-4 w-4"
                          style={{ color: 'var(--shop-ink-muted)' }}
                        />
                      </div>
                    )}
                  </div>

                  <p
                    className="line-clamp-2 text-sm font-bold leading-snug"
                    style={{ color: 'var(--shop-ink)' }}
                  >
                    {it.title}
                  </p>

                  <span
                    data-bm-mono="true"
                    className="hidden text-sm font-bold sm:block"
                    style={{
                      color: 'var(--shop-ink)',
                      fontFamily: BM_MONO_FONT,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    × {it.qty}
                  </span>

                  <span
                    data-bm-mono="true"
                    className="text-right text-sm font-bold sm:text-base"
                    style={{
                      color: 'var(--shop-primary)',
                      fontFamily: BM_MONO_FONT,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {formatTHB(it.lineTotalTHB)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Savings summary panel — dotted-leader ledger */}
        <section
          className="mt-6 rounded-md border bg-white p-5"
          style={{ borderColor: 'var(--shop-border)' }}
        >
          <div className="mb-3 flex items-center justify-between gap-3 border-b pb-3" style={{ borderColor: 'var(--shop-border)' }}>
            <h2
              className="text-sm font-bold uppercase"
              style={{
                color: 'var(--shop-ink)',
                letterSpacing: '0.12em',
              }}
            >
              สรุปคำสั่งซื้อ
            </h2>
            {inferredSavings > 0 && (
              <span
                data-bm-savings="true"
                className="rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase"
                style={{
                  background: 'var(--shop-savings, #10b981)',
                  color: '#ffffff',
                  letterSpacing: '0.06em',
                }}
              >
                <TrendingDown className="mr-1 inline h-3 w-3" />
                ประหยัดไป {formatTHB(inferredSavings)}
              </span>
            )}
          </div>

          <dl className="space-y-2.5 text-sm">
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
                  ({totalQty})
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
                {formatTHB(itemSubtotal)}
              </dd>
            </div>

            {inferredSavings > 0 && (
              <div className="flex items-center justify-between">
                <dt style={{ color: 'var(--shop-ink-muted)' }}>ส่วนลดจากปริมาณ</dt>
                <dd
                  data-bm-mono="true"
                  className="font-bold"
                  style={{
                    color: 'var(--shop-savings, #10b981)',
                    fontFamily: BM_MONO_FONT,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  -{formatTHB(inferredSavings)}
                </dd>
              </div>
            )}

            {inferredShipping > 0 && (
              <div className="flex items-center justify-between">
                <dt style={{ color: 'var(--shop-ink-muted)' }}>ค่าจัดส่ง</dt>
                <dd
                  data-bm-mono="true"
                  className="font-bold"
                  style={{
                    color: 'var(--shop-ink)',
                    fontFamily: BM_MONO_FONT,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatTHB(inferredShipping)}
                </dd>
              </div>
            )}

            <div
              className="flex items-baseline justify-between border-t pt-3"
              style={{ borderColor: 'var(--shop-border)' }}
            >
              <dt
                className="text-sm font-bold uppercase"
                style={{
                  color: 'var(--shop-ink)',
                  letterSpacing: '0.12em',
                }}
              >
                ยอดที่ชำระ
              </dt>
              <dd
                data-bm-mono="true"
                className="text-2xl font-bold sm:text-3xl"
                style={{
                  color: 'var(--shop-primary)',
                  fontFamily: BM_MONO_FONT,
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '-0.02em',
                }}
              >
                {formatTHB(totalTHB)}
              </dd>
            </div>
          </dl>
        </section>

        {/* Dashboard CTAs */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            href={`/stores/${slug}/account/orders/${fullId}`}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md text-xs font-bold uppercase tracking-[0.08em] text-white shadow-sm transition hover:opacity-90"
            style={{ background: 'var(--shop-primary)' }}
          >
            <Truck className="h-4 w-4" />
            ติดตามคำสั่งซื้อ
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={`/stores/${slug}/category`}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md border text-xs font-bold uppercase tracking-[0.08em] transition hover:bg-[var(--shop-muted)]"
            style={{
              borderColor: 'var(--shop-ink)',
              color: 'var(--shop-ink)',
            }}
          >
            <RotateCcw className="h-4 w-4" />
            สั่งซื้อใหม่
          </Link>
        </div>

        {/* LINE follow nudge — sober utility row */}
        <div
          className="mt-6 flex items-center gap-3 rounded-md border px-4 py-3"
          style={{
            background: 'var(--shop-muted)',
            borderColor: 'var(--shop-border)',
          }}
        >
          <MessageCircle
            className="h-4 w-4 shrink-0"
            style={{ color: 'var(--shop-primary)' }}
          />
          <div className="min-w-0 flex-1">
            <p
              className="text-[11px] font-semibold uppercase"
              style={{
                color: 'var(--shop-ink-muted)',
                letterSpacing: '0.12em',
              }}
            >
              การแจ้งเตือน
            </p>
            <p
              className="text-sm font-semibold"
              style={{ color: 'var(--shop-ink)' }}
            >
              รับการแจ้งเตือนสถานะการจัดส่งจาก {storeName} ผ่าน LINE
            </p>
          </div>
          <a
            href="https://line.me"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center justify-center rounded-md px-4 text-[11px] font-bold uppercase tracking-[0.08em] text-white shadow-sm transition hover:opacity-90"
            style={{ background: 'var(--shop-primary)' }}
          >
            เพิ่ม LINE
          </a>
        </div>

        {/* Footer reference strip — full id + payment status */}
        <div
          className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-center text-[11px] font-semibold uppercase"
          style={{
            color: 'var(--shop-ink-muted)',
            letterSpacing: '0.12em',
          }}
        >
          <span>
            อ้างอิง ·{' '}
            <span
              data-bm-mono="true"
              style={{
                color: 'var(--shop-ink)',
                fontFamily: BM_MONO_FONT,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {fullId}
            </span>
          </span>
          {paymentStatusLabel && (
            <span>
              การชำระเงิน ·{' '}
              <span style={{ color: 'var(--shop-ink)' }}>{paymentStatusLabel}</span>
            </span>
          )}
        </div>
      </main>
    </div>
  );
}
