/**
 * BusinessModelRelatedProducts — bespoke "DEAL DASHBOARD · RELATED"
 * ledger panel that renders below the spec/description tabs on
 * business-model PDPs.
 *
 * Difference from the generic related-products grid in
 * `app/stores/[slug]/products/[id]/page.tsx`:
 *   - Wraps the grid in a card-styled section so it reads as a
 *     dedicated dashboard panel ("RELATED DEALS" ledger) rather than
 *     a loose tail strip below the tabs.
 *   - Uses the BM voice: tight-caps eyebrow ("DEAL DASHBOARD ·
 *     RELATED") + bold sans h2 + red 1×12 accent bar underneath.
 *   - Surfaces a row-count chip ("ROWS · 06") in the header so the
 *     panel feels like a spreadsheet block.
 *   - Each card mirrors BusinessModelCategoryGrid for visual
 *     consistency: rectangular `rounded-md` border, square 1/1
 *     imagery, amber `-XX%` deal sticker, mono SKU caption, mono
 *     price and the mint "Save XX%" chip in the price row.
 *
 * Renders nothing if `products` is empty so unfilled stores see no
 * empty frame.
 *
 * Server component — every card is a Link to the PDP and there is no
 * client-side state. Reuses `bmSku()` so the SKU caption matches the
 * one shown on the catalog grid.
 */

import Link from 'next/link';
import Image from 'next/image';
import { TrendingDown } from 'lucide-react';
import { bmSku } from '@/lib/landing/business-model';

const BM_HEADING_FONT =
  'var(--font-sans, "Inter"), "Prompt", system-ui, sans-serif';

const BM_MONO_FONT =
  'var(--font-bm-mono, "JetBrains Mono"), ui-monospace, "Cascadia Mono", "Source Code Pro", monospace';

export interface BusinessModelRelatedProduct {
  id: string;
  title: string;
  titleTh: string | null;
  imageUrl: string | null;
  priceTHB: number;
  compareAtPriceTHB: number | null;
}

export interface BusinessModelRelatedProductsProps {
  storeSlug: string;
  storeName: string;
  products: BusinessModelRelatedProduct[];
}

export function BusinessModelRelatedProducts({
  storeSlug,
  storeName,
  products,
}: BusinessModelRelatedProductsProps) {
  if (!products || products.length === 0) return null;

  // Mono row-counter chip — pad to 2 digits so the readout stays
  // ledger-aligned even with single-digit counts ("ROWS · 06").
  const rowCount = String(products.length).padStart(2, '0');

  return (
    <section
      className="my-12 rounded-md border bg-white p-6 sm:p-8"
      style={{ borderColor: 'var(--shop-border)' }}
      aria-label={`ดีลที่เกี่ยวข้องจาก ${storeName}`}
    >
      {/* Dashboard header — eyebrow + bold sans h2 + row-count chip */}
      <header className="mb-6 sm:mb-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p
            className="text-[11px] font-semibold uppercase"
            style={{
              color: 'var(--shop-ink-muted)',
              letterSpacing: '0.12em',
            }}
          >
            <span>ดีลที่กำลังจะหมดเวลา</span>
            <span aria-hidden style={{ margin: '0 0.45em', opacity: 0.6 }}>
              ·
            </span>
            <span
              data-bm-mono="true"
              style={{
                fontFamily: BM_MONO_FONT,
                color: 'var(--shop-primary)',
                letterSpacing: '0.16em',
              }}
            >
              ที่เกี่ยวข้อง
            </span>
          </p>
          <span
            className="inline-flex items-center gap-2 rounded-md border px-3 py-1 text-[11px] font-semibold"
            style={{
              borderColor: 'var(--shop-border)',
              color: 'var(--shop-ink-muted)',
              background: 'var(--shop-muted)',
            }}
          >
            <span className="uppercase tracking-[0.12em]">รายการ</span>
            <span
              data-bm-mono="true"
              style={{
                color: 'var(--shop-ink)',
                fontFamily: BM_MONO_FONT,
                fontVariantNumeric: 'tabular-nums',
                fontWeight: 700,
              }}
            >
              {rowCount}
            </span>
          </span>
        </div>

        <div
          aria-hidden
          className="mt-3 h-1 w-12 rounded-md"
          style={{ background: 'var(--shop-primary)' }}
        />

        <h2
          className="mt-4 text-2xl sm:text-3xl"
          style={{
            fontFamily: BM_HEADING_FONT,
            color: 'var(--shop-ink)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}
        >
          ดีลที่เกี่ยวข้อง
        </h2>
        <p
          className="mt-2 text-sm"
          style={{
            color: 'var(--shop-ink-muted)',
            fontFamily: BM_HEADING_FONT,
          }}
        >
          SKU ที่ยังมีให้สั่งซื้อจาก {storeName} — เงื่อนไขดีลเดียวกัน ราคาขายส่งเดียวกัน
        </p>
      </header>

      {/* Dense rectangular ledger grid — 3-up at md/lg, 2-up at sm */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        {products.map((p) => {
          const displayTitle = p.titleTh ?? p.title;
          const discount =
            p.compareAtPriceTHB && p.compareAtPriceTHB > p.priceTHB
              ? Math.round((1 - p.priceTHB / p.compareAtPriceTHB) * 100)
              : null;

          return (
            <Link
              key={p.id}
              href={`/stores/${storeSlug}/products/${p.id}`}
              className="group block"
            >
              <div
                className="relative overflow-hidden rounded-md border bg-white transition duration-200 hover:shadow-md"
                style={{ borderColor: 'var(--shop-border)' }}
              >
                <div
                  className="relative overflow-hidden bg-[var(--shop-muted)]"
                  style={{ aspectRatio: '1 / 1' }}
                >
                  {p.imageUrl ? (
                    <Image
                      src={p.imageUrl}
                      alt={displayTitle}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center text-xs"
                      style={{ color: 'var(--shop-ink-muted)' }}
                    >
                      ไม่มีรูป
                    </div>
                  )}
                  {discount != null && (
                    <span
                      className="absolute left-2 top-2 inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase shadow-sm"
                      style={{
                        background: 'var(--shop-accent)',
                        color: '#0f172a',
                        letterSpacing: '0.06em',
                      }}
                    >
                      <TrendingDown className="h-2.5 w-2.5" />
                      <span
                        data-bm-mono="true"
                        style={{
                          fontFamily: BM_MONO_FONT,
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        -{discount}%
                      </span>
                    </span>
                  )}
                  {discount != null && discount >= 20 && (
                    <span
                      className="absolute right-2 top-2 rounded-md px-2 py-0.5 text-[9px] font-bold uppercase shadow-sm"
                      style={{
                        background: 'var(--shop-primary)',
                        color: '#ffffff',
                        letterSpacing: '0.12em',
                      }}
                    >
                      FLASH
                    </span>
                  )}
                </div>
              </div>

              <div className="px-1 pt-2.5">
                <p
                  className="line-clamp-2 text-sm font-semibold leading-tight"
                  style={{ color: 'var(--shop-ink)' }}
                >
                  {displayTitle}
                </p>
                <p
                  data-bm-mono="true"
                  className="mt-1 text-[10px] uppercase"
                  style={{
                    color: 'var(--shop-ink-muted)',
                    letterSpacing: '0.12em',
                    fontFamily: BM_MONO_FONT,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {bmSku(p.id)}
                </p>
                <div className="mt-1.5 flex flex-wrap items-baseline gap-2">
                  <span
                    data-bm-mono="true"
                    className="text-base font-bold"
                    style={{
                      color: 'var(--shop-primary)',
                      fontFamily: BM_MONO_FONT,
                      fontVariantNumeric: 'tabular-nums',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    ฿{p.priceTHB.toLocaleString('th-TH')}
                  </span>
                  {p.compareAtPriceTHB &&
                    p.compareAtPriceTHB > p.priceTHB && (
                      <span
                        data-bm-mono="true"
                        className="text-xs line-through"
                        style={{
                          color: 'var(--shop-ink-muted)',
                          fontFamily: BM_MONO_FONT,
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        ฿{p.compareAtPriceTHB.toLocaleString('th-TH')}
                      </span>
                    )}
                  {discount != null && (
                    <span
                      className="ml-auto rounded-sm px-1.5 py-0.5 text-[10px] font-bold uppercase"
                      style={{
                        background: 'var(--shop-savings, #10b981)',
                        color: '#ffffff',
                        letterSpacing: '0.06em',
                      }}
                    >
                      ประหยัด {discount}%
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer hairline + back-to-catalog link — keeps the panel
          self-contained for users who want to keep browsing the
          wholesale ledger rather than land on a sibling PDP. */}
      <div
        className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t pt-5"
        style={{ borderColor: 'var(--shop-border)' }}
      >
        <p
          className="text-[11px] font-semibold uppercase"
          style={{
            color: 'var(--shop-ink-muted)',
            letterSpacing: '0.12em',
          }}
        >
          เงื่อนไขดีลเดียวกัน · รีเซ็ตทุกวัน
        </p>
        <Link
          href={`/stores/${storeSlug}/category`}
          className="inline-flex h-10 items-center justify-center rounded-md border bg-white px-4 text-xs font-bold uppercase tracking-[0.08em] transition hover:border-[var(--shop-primary)]"
          style={{
            borderColor: 'var(--shop-border)',
            color: 'var(--shop-ink)',
          }}
        >
          ดูแคตตาล็อกทั้งหมด
        </Link>
      </div>
    </section>
  );
}
