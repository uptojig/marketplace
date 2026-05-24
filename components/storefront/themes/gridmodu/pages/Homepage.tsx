'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';

interface Product {
  id: string;
  title: string;
  priceTHB: number;
  compareAtPriceTHB?: number | null;
  imageUrl?: string | null;
  categoryName?: string | null;
}

interface LandingContent {
  heroHeadline?: string | null;
  heroSubheadline?: string | null;
  heroCtaLabel?: string | null;
  heroCtaUrl?: string | null;
  heroImageUrl?: string | null;
}

interface Props {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  products: Product[];
  categories: string[];
  landingContent?: LandingContent | null;
}

const DEFAULT_HEADLINE = 'ยินดีต้อนรับสู่ร้าน';
const DEFAULT_SUB = 'คัดสรรสินค้าคุณภาพให้คุณ พร้อมส่งทั่วประเทศ';
const DEFAULT_CTA = 'ดูสินค้าทั้งหมด';

/**
 * GridModu — homepage (scaffold).
 *
 * Designer should replace hero + grid styling. Hero copy already reads
 * from `landingContent` so admin edits flow through without changes.
 */
export function Homepage({ store, products, categories, landingContent }: Props) {
  const headline = landingContent?.heroHeadline?.trim() || DEFAULT_HEADLINE;
  const sub = landingContent?.heroSubheadline?.trim() || DEFAULT_SUB;
  const ctaLabel = landingContent?.heroCtaLabel?.trim() || DEFAULT_CTA;
  const ctaUrl = landingContent?.heroCtaUrl?.trim() || `/stores/${store.slug}/category`;

  const add = useCart((s) => s.add);
  const featured = products.slice(0, 8);

  return (
    <div className="bg-[var(--shop-bg)] text-[var(--shop-ink)] font-[family:var(--font-prompt)]">
      <section className="px-4 py-16 sm:py-24 bg-[var(--shop-bg-soft)]">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="font-[family:var(--font-kanit)] text-4xl sm:text-6xl font-black mb-4">
            {headline}
          </h1>
          <p className="text-base sm:text-lg text-[var(--shop-ink-muted)] mb-8 max-w-2xl mx-auto">
            {sub}
          </p>
          <Link
            href={ctaUrl}
            className="inline-block px-6 py-3 rounded-full text-white font-bold"
            style={{ background: 'var(--shop-primary)' }}
          >
            {ctaLabel}
          </Link>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-10">
          <h2 className="font-[family:var(--font-kanit)] text-xl font-bold mb-4">
            หมวดหมู่
          </h2>
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat}
                href={`/stores/${store.slug}/category?cat=${encodeURIComponent(cat)}`}
                className="px-4 py-2 rounded-full border border-[var(--shop-border)] hover:bg-[var(--shop-muted)] text-sm"
              >
                {cat}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="font-[family:var(--font-kanit)] text-2xl font-bold mb-6">
          สินค้าแนะนำ
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {featured.map((p) => (
            <article
              key={p.id}
              className="bg-white border border-[var(--shop-border)] rounded overflow-hidden flex flex-col"
            >
              <Link
                href={`/stores/${store.slug}/products/${p.id}`}
                className="block aspect-square bg-[var(--shop-bg-soft)]"
              >
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : null}
              </Link>
              <div className="p-3 flex-1 flex flex-col gap-2">
                <Link
                  href={`/stores/${store.slug}/products/${p.id}`}
                  className="text-sm font-medium line-clamp-2"
                >
                  {p.title}
                </Link>
                <div className="mt-auto flex items-center justify-between">
                  <span
                    className="font-bold"
                    style={{ color: 'var(--shop-primary)' }}
                  >
                    {formatTHB(p.priceTHB)}
                  </span>
                  <button
                    type="button"
                    aria-label="เพิ่มลงตะกร้า"
                    className="p-2 rounded-full text-white"
                    style={{ background: 'var(--shop-primary)' }}
                    onClick={() =>
                      add({
                        productId: p.id,
                        storeSlug: store.slug,
                        storeName: store.name,
                        title: p.title,
                        priceTHB: p.priceTHB,
                        imageUrl: p.imageUrl || undefined,
                      })
                    }
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
