/**
 * Shared related-products carousel — single-row horizontal scroll, 5
 * cards visible at desktop. Used by everyday / taobao / packaging /
 * community PDPs that don't ship a bespoke related-products component.
 *
 * Caller supplies the theme's primary color (used for the FLASH chip,
 * price text, "ดูสินค้าทั้งหมด" CTA border).
 */

import Link from 'next/link';
import Image from 'next/image';
import { TrendingDown } from 'lucide-react';

export interface SimpleRelatedProduct {
  id: string;
  title: string;
  titleTh: string | null;
  imageUrl: string | null;
  priceTHB: number;
  compareAtPriceTHB: number | null;
}

interface Props {
  storeSlug: string;
  storeName: string;
  products: SimpleRelatedProduct[];
  /** Primary color — used for FLASH chip, price text, CTA outline. */
  primaryColor: string;
  /** Accent color — used for the discount sticker bg + eyebrow. */
  accentColor?: string;
  /** Override the eyebrow label. */
  eyebrow?: string;
  /** Override the section heading. */
  title?: string;
}

export function SimpleRelatedProducts({
  storeSlug,
  storeName,
  products,
  primaryColor,
  accentColor = primaryColor,
  eyebrow = '★ สินค้าอื่นๆ',
  title,
}: Props) {
  if (!products || products.length === 0) return null;

  const sectionTitle = title ?? `สินค้าอื่นจาก ${storeName}`;

  return (
    <section
      className="my-12 rounded-2xl border bg-white p-6 sm:p-8"
      style={{ borderColor: 'var(--shop-border, #E5E5E5)' }}
    >
      <header className="mb-6 sm:mb-8">
        <p
          className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em]"
          style={{ color: accentColor }}
        >
          {eyebrow}
        </p>
        <h2
          className="text-2xl font-extrabold tracking-tight sm:text-3xl"
          style={{ color: 'var(--shop-ink, #0A0A0A)' }}
        >
          {sectionTitle}
        </h2>
      </header>

      <ul className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 sm:gap-4 sm:mx-0 sm:px-0 snap-x snap-mandatory">
        {products.map((p) => {
          const displayTitle = p.titleTh ?? p.title;
          const discount =
            p.compareAtPriceTHB && p.compareAtPriceTHB > p.priceTHB
              ? Math.round((1 - p.priceTHB / p.compareAtPriceTHB) * 100)
              : null;
          return (
            <li
              key={p.id}
              className="snap-start shrink-0 w-[calc((100%-4*0.75rem)/5)] sm:w-[calc((100%-4*1rem)/5)] min-w-[10rem]"
            >
              <Link
                href={`/stores/${storeSlug}/products/${p.id}`}
                className="group block"
              >
                <div
                  className="relative aspect-square overflow-hidden rounded-xl border bg-white transition group-hover:shadow-md"
                  style={{ borderColor: 'var(--shop-border, #E5E5E5)' }}
                >
                  {p.imageUrl && (
                    <Image
                      src={p.imageUrl}
                      alt={displayTitle}
                      fill
                      sizes="(max-width: 768px) 40vw, 20vw"
                      className="object-cover transition group-hover:scale-[1.03]"
                    />
                  )}
                  {discount != null && (
                    <span
                      className="absolute left-2 top-2 inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase text-white shadow-sm"
                      style={{ background: primaryColor, letterSpacing: '0.04em' }}
                    >
                      <TrendingDown className="h-3 w-3" /> -{discount}%
                    </span>
                  )}
                </div>
                <p
                  className="mt-2 line-clamp-2 text-sm font-semibold leading-tight"
                  style={{ color: 'var(--shop-ink, #0A0A0A)' }}
                >
                  {displayTitle}
                </p>
                <div className="mt-1.5 flex flex-wrap items-baseline gap-2">
                  <span
                    className="text-base font-extrabold tabular-nums"
                    style={{ color: primaryColor }}
                  >
                    ฿{p.priceTHB.toLocaleString('th-TH')}
                  </span>
                  {p.compareAtPriceTHB && p.compareAtPriceTHB > p.priceTHB && (
                    <span
                      className="text-xs font-medium line-through"
                      style={{ color: 'var(--shop-ink-muted, #737373)' }}
                    >
                      ฿{p.compareAtPriceTHB.toLocaleString('th-TH')}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <div
        className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-5"
        style={{ borderColor: 'var(--shop-border, #E5E5E5)' }}
      >
        <p
          className="text-[11px] font-semibold uppercase"
          style={{ color: 'var(--shop-ink-muted, #737373)', letterSpacing: '0.12em' }}
        >
          อัปเดตทุกวัน · สินค้าสด
        </p>
        <Link
          href={`/stores/${storeSlug}/category`}
          className="inline-flex h-10 items-center justify-center rounded-md border-2 bg-white px-4 text-xs font-bold uppercase tracking-[0.08em] transition hover:opacity-80"
          style={{ borderColor: primaryColor, color: primaryColor }}
        >
          ดูสินค้าทั้งหมด →
        </Link>
      </div>
    </section>
  );
}
