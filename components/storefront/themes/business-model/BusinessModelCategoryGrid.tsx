/**
 * BusinessModelCategoryGrid — deal-dashboard catalog grid for the
 * category page when the store is in the business-model family.
 *
 * Difference from the default shadcn-studio product-list-03 AND from
 * TrustCategoryGrid / FashionBeautyCategoryGrid:
 *   - 4-up at lg / 2-up at md / 2-up at sm (DENSE).
 *   - Rectangular `rounded-md` cards with hairline zinc-200 border.
 *   - Square 1/1 imagery — edge-to-edge, no inner mat, no frame.
 *   - Big amber "-XX%" deal sticker overlay in top-left corner.
 *   - Optional red "FLASH DEAL" sticker top-right.
 *   - Bold mono price + smaller slashed original below.
 *   - Mint "Save XX%" chip in the price row.
 *   - Stock-low warning chip in amber under the price when applicable.
 *   - SKU caption in mono caps.
 *
 * Renders as a server component — each card is a Link to PDP.
 */

import Link from 'next/link';
import Image from 'next/image';
import { TrendingDown } from 'lucide-react';
import { bmSku } from '@/lib/landing/business-model';

const BM_MONO_FONT =
  'var(--font-bm-mono, "JetBrains Mono"), ui-monospace, "Cascadia Mono", "Source Code Pro", monospace';

export interface BusinessModelCategoryProduct {
  id: string;
  title: string;
  imageUrl: string | null;
  priceTHB: number;
  compareAtPriceTHB: number | null;
  /** Optional stockTotal — drives the low-stock warning chip on the card.
   *  Pass null/undefined to suppress. */
  stockLeft?: number | null;
}

export function BusinessModelCategoryGrid({
  storeSlug,
  products,
}: {
  storeSlug: string;
  products: BusinessModelCategoryProduct[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
      {products.map((p) => {
        const discount =
          p.compareAtPriceTHB && p.compareAtPriceTHB > p.priceTHB
            ? Math.round((1 - p.priceTHB / p.compareAtPriceTHB) * 100)
            : null;
        const lowStock = p.stockLeft != null && p.stockLeft > 0 && p.stockLeft < 20;

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
                    alt={p.title}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-[var(--shop-ink-muted)]">
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
                    ดีลด่วน
                  </span>
                )}
                {lowStock && (
                  <span
                    className="absolute bottom-2 left-2 rounded-sm px-1.5 py-0.5 text-[9px] font-bold uppercase shadow-sm"
                    style={{
                      background: '#0f172a',
                      color: '#f59e0b',
                      letterSpacing: '0.08em',
                    }}
                  >
                    <span
                      data-bm-mono="true"
                      style={{
                        fontFamily: BM_MONO_FONT,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      เหลือ {p.stockLeft}
                    </span>
                  </span>
                )}
              </div>
            </div>

            <div className="px-1 pt-2.5">
              <p
                className="line-clamp-2 text-sm font-semibold leading-tight"
                style={{ color: 'var(--shop-ink)' }}
              >
                {p.title}
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
                {p.compareAtPriceTHB && p.compareAtPriceTHB > p.priceTHB && (
                  <span
                    data-bm-mono="true"
                    className="text-xs text-[var(--shop-ink-muted)] line-through"
                    style={{
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
                    -{discount}%
                  </span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
