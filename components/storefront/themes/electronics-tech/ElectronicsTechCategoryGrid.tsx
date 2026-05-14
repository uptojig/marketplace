/**
 * ElectronicsTechCategoryGrid — spec-sheet catalog grid for the
 * category page when the store is in the electronics-tech family.
 *
 * Difference from the default shadcn-studio product-list-03 AND
 * from FashionBeautyCategoryGrid + TrustCategoryGrid:
 *   - Compare-chip filter row at the top: Brand / Price / Rating
 *     pill triggers — visual placeholders that mirror the spec-sheet
 *     filter strip on Best Buy / Newegg. (They link to the existing
 *     sort + filter URL state for now; client-side dropdown logic
 *     lives in the page-level sort dropdown.)
 *   - 4-up at lg / 3-up at md / 2-up at sm (denser than FB, same
 *     density as trust).
 *   - Squared cards (rounded-md) with hairline + subtle blue-glow
 *     shadow under the image — provided by the .theme-electronics-tech
 *     [class*="rounded-md"][class*="border"] selector.
 *   - Square 1/1 imagery, no inner mat.
 *   - Mono SKU subtext below the title.
 *   - Blue price in JetBrains Mono with tabular numerics.
 *   - "In stock" mint chip in the bottom-right when available.
 *
 * Renders as a server component — no interactivity needed at this
 * level (each card is a Link to PDP). The filter chips render as
 * <Link>s to the existing /category?cat= state.
 */

import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, ChevronDown } from 'lucide-react';

const TECH_DISPLAY_FONT =
  'var(--font-tech-display, "Inter Tight"), "Inter", "IBM Plex Sans Thai", system-ui, sans-serif';

const TECH_MONO_FONT =
  'var(--font-tech-mono, "JetBrains Mono"), ui-monospace, "SFMono-Regular", Menlo, monospace';

export interface ElectronicsTechCategoryProduct {
  id: string;
  title: string;
  imageUrl: string | null;
  priceTHB: number;
  compareAtPriceTHB: number | null;
  /** Optional — when truthy the card paints an "In stock" mint chip. */
  inStock?: boolean;
}

/**
 * Build a deterministic SKU from the product id — mirrors the PDP
 * hero so the same product carries the same display SKU on both
 * category cards and the PDP eyebrow.
 */
function techSku(id: string): string {
  const hash = id
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(-6)
    .padStart(6, '0');
  return `ET-${hash}`;
}

export function ElectronicsTechCategoryGrid({
  storeSlug,
  products,
}: {
  storeSlug: string;
  products: ElectronicsTechCategoryProduct[];
}) {
  return (
    <div className="space-y-5">
      {/* Compare-chip filter strip — short rectangular triggers, mono
          label, dropdown caret. Visually anchors the page as a
          spec-sheet / Best-Buy comparison view. */}
      <div
        className="flex flex-wrap gap-2 rounded-md border bg-[var(--shop-muted)] px-3 py-2"
        style={{ borderColor: 'var(--shop-border)' }}
      >
        <span
          data-tech-mono="true"
          className="inline-flex items-center self-center pr-2 text-[11px] uppercase"
          style={{
            color: 'var(--shop-ink-muted)',
            fontFamily: TECH_MONO_FONT,
            letterSpacing: '0.16em',
            fontWeight: 600,
          }}
        >
          Filter
        </span>
        <CompareChip label="Brand" />
        <CompareChip label="Price" />
        <CompareChip label="Rating" />
        <CompareChip label="In Stock" highlight />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => {
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
                className="relative overflow-hidden rounded-md border bg-white transition duration-300"
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
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-[var(--shop-ink-muted)]">
                      ไม่มีรูป
                    </div>
                  )}
                  {discount != null && (
                    <span
                      data-tech-mono="true"
                      className="absolute left-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase"
                      style={{
                        backgroundColor: 'var(--shop-primary)',
                        color: '#ffffff',
                        fontFamily: TECH_MONO_FONT,
                        letterSpacing: '0.1em',
                      }}
                    >
                      -{discount}%
                    </span>
                  )}
                  {p.inStock !== false && (
                    <span
                      data-tech-stock="true"
                      className="absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase"
                      style={{ letterSpacing: '0.1em' }}
                    >
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      In stock
                    </span>
                  )}
                </div>
              </div>

              <div className="px-1 pt-3">
                <p
                  className="line-clamp-2 text-sm leading-tight"
                  style={{
                    color: 'var(--shop-ink)',
                    fontFamily: TECH_DISPLAY_FONT,
                    fontWeight: 600,
                    letterSpacing: '-0.005em',
                  }}
                >
                  {p.title}
                </p>
                <p
                  data-tech-mono="true"
                  className="mt-1 text-[10px] uppercase"
                  style={{
                    color: 'var(--shop-ink-muted)',
                    fontFamily: TECH_MONO_FONT,
                    letterSpacing: '0.16em',
                    fontWeight: 600,
                  }}
                >
                  SKU · {techSku(p.id)}
                </p>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <span
                    data-tech-mono="true"
                    className="text-base font-bold"
                    style={{
                      color: 'var(--shop-primary)',
                      fontFamily: TECH_MONO_FONT,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    ฿ {p.priceTHB.toLocaleString('th-TH')}
                  </span>
                  {p.compareAtPriceTHB && p.compareAtPriceTHB > p.priceTHB && (
                    <span
                      data-tech-mono="true"
                      className="text-xs line-through"
                      style={{
                        color: 'var(--shop-ink-muted)',
                        fontFamily: TECH_MONO_FONT,
                      }}
                    >
                      ฿ {p.compareAtPriceTHB.toLocaleString('th-TH')}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Compare-chip filter trigger — visual placeholder for an inline
 * filter dropdown. Renders as a sans-bold label + chevron in a
 * rectangular tab. Lives next to its siblings in the filter strip
 * at the top of the grid.
 *
 * Note: this is intentionally non-interactive at the grid level
 * (the page-level <FilterSection> + <SortDropdown> in
 * /stores/[slug]/category/page.tsx own the actual state). It's
 * here purely to anchor the spec-sheet aesthetic — Newegg-style
 * filter bar without making the page client-rendered.
 */
function CompareChip({
  label,
  highlight = false,
}: {
  label: string;
  highlight?: boolean;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md border bg-white px-3 py-1 text-xs font-semibold uppercase transition"
      style={{
        borderColor: highlight ? 'var(--shop-primary)' : 'var(--shop-border)',
        color: highlight ? 'var(--shop-primary)' : 'var(--shop-ink)',
        fontFamily: TECH_DISPLAY_FONT,
        letterSpacing: '0.12em',
      }}
    >
      {label}
      <ChevronDown className="h-3 w-3" />
    </span>
  );
}
