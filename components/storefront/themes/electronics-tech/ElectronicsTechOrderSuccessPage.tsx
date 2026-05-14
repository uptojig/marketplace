/**
 * ElectronicsTechOrderSuccessPage — bespoke ET post-payment confirmation.
 *
 * Structural difference from the generic checkout/success page AND
 * from FashionBeautyOrderSuccessPage:
 *   - Mint check-ring (vs FB's serif "Thank you" hero) + mono caps
 *     "ORDER #XXXX CONFIRMED" pill stamp.
 *   - Inter Tight display h1 "Thanks — your order is in" — sans bold,
 *     no italic, no serif.
 *   - ETA + status render as a 2-col mono spec-row strip rather than
 *     italic-serif lines, so the page reads as a shipping waybill.
 *   - Items render as spec-sheet rows: square 1/1 thumb + title + mono
 *     SKU subtitle + mono qty/total — replaces FB's portrait magazine
 *     cards. The items list IS the SKU manifest in this family.
 *   - Mono total row with mono-caps "TOTAL" label, tabular-num mono
 *     amount in electric blue.
 *   - Sharp-bordered CTA pair: filled-blue "Track shipment" + white
 *     outline "Continue shopping". Both rectangular (rounded-md).
 *
 * Auth + scoping behaviour matches the generic page (already enforced
 * at the page.tsx level before reaching this component).
 */

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle2, MessageCircle, Package } from 'lucide-react';
import { formatTHB } from '@/lib/utils';

const TECH_DISPLAY_FONT =
  'var(--font-tech-display, "Inter Tight"), "Inter", "IBM Plex Sans Thai", system-ui, sans-serif';

const TECH_MONO_FONT =
  'var(--font-tech-mono, "JetBrains Mono"), ui-monospace, "SFMono-Regular", Menlo, monospace';

export interface ElectronicsTechOrderItem {
  id: string;
  title: string;
  imageUrl: string | null;
  qty: number;
  lineTotalTHB: number;
}

export interface ElectronicsTechOrderSuccessPageProps {
  slug: string;
  storeName: string;
  shortCode: string;
  fullId: string;
  buyerEmail: string | null;
  totalTHB: number;
  items: ElectronicsTechOrderItem[];
  etaRange: string;
  statusLabel: string;
  paymentStatusLabel: string | null;
}

/**
 * Build a deterministic SKU from the product id — mirrors the PDP hero
 * + category grid + cart so the same product carries the same display
 * SKU in the order manifest. Format: "ET-XXXXXX".
 */
function techSku(id: string): string {
  const hash = id
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(-6)
    .padStart(6, '0');
  return `ET-${hash}`;
}

export function ElectronicsTechOrderSuccessPage({
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
}: ElectronicsTechOrderSuccessPageProps) {
  return (
    <div style={{ background: 'var(--shop-bg)', minHeight: '100vh' }}>
      <main className="mx-auto max-w-4xl px-4 pb-24 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        {/* Confirmation hero */}
        <header className="text-center">
          {/* Mint check-ring */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full border-2"
              style={{
                borderColor: 'var(--shop-highlight, #34d399)',
                background:
                  'color-mix(in srgb, var(--shop-highlight, #34d399) 12%, transparent)',
              }}
            >
              <CheckCircle2
                className="h-10 w-10"
                strokeWidth={2}
                style={{ color: 'var(--shop-highlight, #34d399)' }}
              />
            </div>
          </div>

          {/* Mono "ORDER #XXXX CONFIRMED" stamp */}
          <p
            data-tech-mono="true"
            className="mx-auto mt-6 inline-flex items-center rounded-md border bg-[var(--shop-muted)] px-3 py-1.5 text-[11px] uppercase"
            style={{
              borderColor: 'var(--shop-border)',
              color: 'var(--shop-ink)',
              fontFamily: TECH_MONO_FONT,
              letterSpacing: '0.18em',
              fontWeight: 700,
            }}
          >
            คำสั่งซื้อ #{shortCode} ยืนยันแล้ว
          </p>

          <h1
            className="mt-4 text-3xl sm:text-4xl"
            style={{
              fontFamily: TECH_DISPLAY_FONT,
              color: 'var(--shop-ink)',
              fontWeight: 700,
              letterSpacing: '-0.015em',
              lineHeight: 1.1,
            }}
          >
            ขอบคุณ — เราได้รับคำสั่งซื้อแล้ว
          </h1>

          <p
            className="mx-auto mt-3 max-w-xl text-sm"
            style={{
              color: 'var(--shop-ink-muted)',
              fontFamily: TECH_DISPLAY_FONT,
            }}
          >
            เราได้บันทึกคำสั่งซื้อของคุณกับ {storeName} แล้ว
            {buyerEmail ? (
              <>
                {' '}อีเมลยืนยันถูกส่งไปยัง{' '}
                <span
                  data-tech-mono="true"
                  style={{
                    color: 'var(--shop-ink)',
                    fontFamily: TECH_MONO_FONT,
                    fontWeight: 600,
                  }}
                >
                  {buyerEmail}
                </span>
                .
              </>
            ) : (
              '.'
            )}
          </p>
        </header>

        {/* Spec-row dispatch strip — ETA / Status */}
        <div
          className="mt-10 grid grid-cols-2 gap-3 rounded-md border bg-white p-4 sm:p-5"
          style={{ borderColor: 'var(--shop-border)' }}
        >
          <div>
            <p
              data-tech-mono="true"
              className="text-[10px] uppercase"
              style={{
                color: 'var(--shop-ink-muted)',
                fontFamily: TECH_MONO_FONT,
                letterSpacing: '0.18em',
                fontWeight: 600,
              }}
            >
              วันที่คาดว่าจะได้รับ
            </p>
            <p
              data-tech-mono="true"
              className="mt-1 text-sm"
              style={{
                color: 'var(--shop-ink)',
                fontFamily: TECH_MONO_FONT,
                fontWeight: 700,
                letterSpacing: '-0.005em',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {etaRange}
            </p>
          </div>
          <div>
            <p
              data-tech-mono="true"
              className="text-[10px] uppercase"
              style={{
                color: 'var(--shop-ink-muted)',
                fontFamily: TECH_MONO_FONT,
                letterSpacing: '0.18em',
                fontWeight: 600,
              }}
            >
              สถานะ
            </p>
            <p
              data-tech-mono="true"
              className="mt-1 text-sm"
              style={{
                color: 'var(--shop-ink)',
                fontFamily: TECH_MONO_FONT,
                fontWeight: 700,
                letterSpacing: '-0.005em',
              }}
            >
              {statusLabel}
            </p>
          </div>
        </div>

        {/* Items — spec-sheet manifest */}
        <section className="mt-10">
          <div className="flex items-baseline justify-between">
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
              รายการจัดส่ง
            </p>
            <p
              data-tech-mono="true"
              className="text-[11px] uppercase"
              style={{
                color: 'var(--shop-ink-muted)',
                fontFamily: TECH_MONO_FONT,
                letterSpacing: '0.16em',
                fontWeight: 600,
              }}
            >
              {items.length} ชิ้น
            </p>
          </div>

          <ul className="mt-3 space-y-2">
            {items.map((it) => (
              <li
                key={it.id}
                className="grid grid-cols-[4rem_1fr_auto] items-center gap-4 rounded-md border bg-white p-3 sm:grid-cols-[5rem_1fr_auto] sm:gap-5 sm:p-4"
                style={{ borderColor: 'var(--shop-border)' }}
              >
                <div
                  className="relative overflow-hidden rounded-md border"
                  style={{
                    aspectRatio: '1 / 1',
                    background: 'var(--shop-muted)',
                    borderColor: 'var(--shop-border)',
                  }}
                >
                  {it.imageUrl ? (
                    <Image
                      src={it.imageUrl}
                      alt={it.title}
                      fill
                      sizes="(max-width: 640px) 64px, 80px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Package
                        className="h-5 w-5"
                        style={{ color: 'var(--shop-ink-muted)' }}
                      />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p
                    className="line-clamp-2 text-sm"
                    style={{
                      color: 'var(--shop-ink)',
                      fontFamily: TECH_DISPLAY_FONT,
                      fontWeight: 600,
                      letterSpacing: '-0.005em',
                      lineHeight: 1.3,
                    }}
                  >
                    {it.title}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
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
                      SKU · {techSku(it.id)}
                    </span>
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
                      จำนวน · {it.qty}
                    </span>
                  </div>
                </div>
                <p
                  data-tech-mono="true"
                  className="whitespace-nowrap text-base"
                  style={{
                    color: 'var(--shop-primary)',
                    fontFamily: TECH_MONO_FONT,
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatTHB(it.lineTotalTHB)}
                </p>
              </li>
            ))}
          </ul>

          {/* Mono total row */}
          <div
            className="mt-3 flex items-baseline justify-between rounded-md border bg-[var(--shop-muted)] px-4 py-3 sm:px-5"
            style={{ borderColor: 'var(--shop-border)' }}
          >
            <span
              data-tech-mono="true"
              className="text-xs uppercase"
              style={{
                color: 'var(--shop-ink)',
                fontFamily: TECH_MONO_FONT,
                letterSpacing: '0.18em',
                fontWeight: 700,
              }}
            >
              ยอดรวม
            </span>
            <span
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
              {formatTHB(totalTHB)}
            </span>
          </div>
        </section>

        {/* Sharp-bordered CTA pair */}
        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          <Link
            href={`/stores/${slug}/account/orders/${fullId}`}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md text-sm font-semibold uppercase text-white transition hover:opacity-90"
            style={{
              background: 'var(--shop-primary)',
              fontFamily: TECH_DISPLAY_FONT,
              letterSpacing: '0.08em',
            }}
          >
            ติดตามการจัดส่ง
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={`/stores/${slug}`}
            className="inline-flex h-12 items-center justify-center rounded-md border bg-white text-sm font-semibold uppercase transition hover:border-[var(--shop-primary)] hover:text-[var(--shop-primary)]"
            style={{
              borderColor: 'var(--shop-border)',
              color: 'var(--shop-ink)',
              fontFamily: TECH_DISPLAY_FONT,
              letterSpacing: '0.08em',
            }}
          >
            เลือกซื้อต่อ
          </Link>
        </div>

        {/* LINE follow nudge — translated to ET voice */}
        <div
          className="mt-10 flex items-start gap-3 rounded-md border bg-white p-4 sm:p-5"
          style={{ borderColor: 'var(--shop-border)' }}
        >
          <MessageCircle
            className="mt-0.5 h-5 w-5 shrink-0"
            style={{ color: 'var(--shop-primary)' }}
          />
          <div className="flex-1">
            <p
              data-tech-mono="true"
              className="text-[11px] uppercase"
              style={{
                color: 'var(--shop-ink-muted)',
                fontFamily: TECH_MONO_FONT,
                letterSpacing: '0.18em',
                fontWeight: 700,
              }}
            >
              แจ้งเตือนสถานะการจัดส่ง
            </p>
            <p
              className="mt-1 text-sm"
              style={{
                color: 'var(--shop-ink)',
                fontFamily: TECH_DISPLAY_FONT,
                fontWeight: 500,
              }}
            >
              เพิ่ม {storeName} บน LINE เพื่อรับการติดตามแบบเรียลไทม์ + แจ้งเตือนสินค้าเข้าใหม่
            </p>
          </div>
          <a
            href="https://line.me"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-md px-4 text-[11px] font-semibold uppercase text-white transition hover:opacity-90"
            style={{
              background: 'var(--shop-primary)',
              fontFamily: TECH_DISPLAY_FONT,
              letterSpacing: '0.1em',
            }}
          >
            เพิ่ม LINE
          </a>
        </div>

        {/* Mono full-id footer */}
        <div className="mt-10 space-y-1 text-center">
          <p
            data-tech-mono="true"
            className="text-[10px] uppercase"
            style={{
              color: 'var(--shop-ink-muted)',
              fontFamily: TECH_MONO_FONT,
              letterSpacing: '0.18em',
              fontWeight: 600,
            }}
          >
            REF · {fullId}
          </p>
          {paymentStatusLabel && (
            <p
              data-tech-mono="true"
              className="text-[10px] uppercase"
              style={{
                color: 'var(--shop-ink-muted)',
                fontFamily: TECH_MONO_FONT,
                letterSpacing: '0.18em',
                fontWeight: 600,
              }}
            >
              การชำระเงิน · {paymentStatusLabel}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
