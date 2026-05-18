/**
 * ElectronicsTechRelatedProducts — bespoke spec-sheet "compare similar"
 * related-products section for electronics-tech PDPs.
 *
 * Sits at the bottom of the PDP, below the spec/description tabs, and
 * gives the related items the same Newegg / Best-Buy spec-sheet vibe
 * as the rest of the ET surface: mono caps eyebrow, Inter Tight bold
 * h2, mint hairline rule, 4-up grid of square white cards with mono
 * SKU subtitle, mono mint price, and mint "In stock" chip.
 *
 * Intentionally a server component — every card is a plain Link to
 * the PDP, no interactivity needed. Renders nothing if `products`
 * is empty so unfilled stores see no awkward placeholder frame.
 *
 * Visual parity with ElectronicsTechCategoryGrid is deliberate so a
 * shopper bouncing between the catalog and the PDP related strip
 * reads them as the same product family.
 */
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';

const TECH_DISPLAY_FONT =
  'var(--font-tech-display, "Inter Tight"), "Inter", "IBM Plex Sans Thai", system-ui, sans-serif';

const TECH_MONO_FONT =
  'var(--font-tech-mono, "JetBrains Mono"), ui-monospace, "SFMono-Regular", Menlo, monospace';

export interface ElectronicsTechRelatedProduct {
  id: string;
  title: string;
  titleTh: string | null;
  imageUrl: string | null;
  priceTHB: number;
  compareAtPriceTHB: number | null;
}

export interface ElectronicsTechRelatedProductsProps {
  storeSlug: string;
  storeName: string;
  products: ElectronicsTechRelatedProduct[];
}

/**
 * Build a deterministic SKU from the product id — mirrors the PDP
 * hero + the category grid so the same product carries the same
 * display SKU across every ET surface.
 */
function techSku(id: string): string {
  const hash = id
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(-6)
    .padStart(6, '0');
  return `ET-${hash}`;
}

export function ElectronicsTechRelatedProducts({
  storeSlug,
  storeName,
  products,
}: ElectronicsTechRelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="my-12">
      {/* Spec-sheet header strip — mono eyebrow + Inter Tight h2 + mint
          hairline. Mirrors the eyebrow + display rhythm used on every
          other ET section header. */}
      <header className="mb-6">
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
          COMPARE SIMILAR PRODUCTS
        </p>
        <div className="mt-2 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-baseline">
          <h2
            className="text-2xl sm:text-3xl"
            style={{
              fontFamily: TECH_DISPLAY_FONT,
              color: 'var(--shop-ink)',
              fontWeight: 700,
              letterSpacing: '-0.015em',
              lineHeight: 1.15,
            }}
          >
            Related products
          </h2>
          <span
            data-tech-mono="true"
            className="hidden text-[10px] uppercase sm:inline-flex"
            style={{
              color: 'var(--shop-ink-muted)',
              fontFamily: TECH_MONO_FONT,
              letterSpacing: '0.16em',
              fontWeight: 600,
            }}
          >
            FROM {storeName.toUpperCase()}
          </span>
        </div>
        {/* Mint hairline rule — same accent the brand-story panel uses,
            so the section ties back to the ET highlight color. */}
        <div
          aria-hidden
          className="mt-4 h-px w-full"
          style={{ background: 'var(--shop-highlight, #34d399)' }}
        />
      </header>

      {/* 4-up at lg, 3-up at md, 2-up at sm — matches the catalog grid
          density so the cards are immediately legible as the same
          product family. */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
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
                      alt={displayTitle}
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
                  {/* Mint stock chip — borderless mint pill, same voice
                      as the category grid card so the strip reads as a
                      direct continuation of the catalog. */}
                  <span
                    data-tech-stock="true"
                    className="absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase"
                    style={{
                      borderColor: 'var(--shop-highlight, #34d399)',
                      backgroundColor: '#ffffff',
                      color: 'var(--shop-highlight, #34d399)',
                      fontFamily: TECH_MONO_FONT,
                      letterSpacing: '0.12em',
                    }}
                  >
                    <CheckCircle2 className="h-2.5 w-2.5" />
                    In stock
                  </span>
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
                  {displayTitle}
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
                  {/* Mono mint price — uses the highlight token instead
                      of the electric-blue primary so the related strip
                      visually distinguishes itself from the catalog grid
                      while still respecting the spec-sheet aesthetic. */}
                  <span
                    data-tech-mono="true"
                    className="text-base font-bold"
                    style={{
                      color: 'var(--shop-highlight, #34d399)',
                      fontFamily: TECH_MONO_FONT,
                      letterSpacing: '-0.01em',
                      fontVariantNumeric: 'tabular-nums',
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
                        fontVariantNumeric: 'tabular-nums',
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
    </section>
  );
}
