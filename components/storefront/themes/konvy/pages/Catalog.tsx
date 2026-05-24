'use client';

import React from 'react';
import Link from 'next/link';
import { formatTHB } from '@/lib/utils';
import type { CatalogProps } from '@/lib/templates/types';

/**
 * Konvy — catalog (scaffold).
 *
 * Default export so the registry can mount it directly.
 */
export default function Catalog(props: CatalogProps) {
  const {
    store,
    pageProducts,
    categoryNames,
    selectedCats,
    currentPage,
    totalPages,
    filteredCount,
    buildUrl,
  } = props;

  return (
    <div className="bg-[var(--shop-bg)] text-[var(--shop-ink)] font-[family:var(--font-prompt)]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="font-[family:var(--font-kanit)] text-3xl font-black mb-2">
          สินค้าทั้งหมด
        </h1>
        <p className="text-sm text-[var(--shop-ink-muted)] mb-6">
          {filteredCount} รายการ
        </p>

        {categoryNames.length > 0 && (
          <div
            className="flex flex-wrap gap-2 mb-6"
            role="group"
            aria-label="ตัวกรองหมวดหมู่"
          >
            {categoryNames.map((cat) => {
              const active = selectedCats.includes(cat);
              return (
                <Link
                  key={cat}
                  href={buildUrl(cat)}
                  className="px-3 py-1 rounded-full border text-sm"
                  style={{
                    background: active ? 'var(--shop-primary)' : 'transparent',
                    color: active ? '#fff' : 'var(--shop-ink)',
                    borderColor: 'var(--shop-border)',
                  }}
                  aria-pressed={active}
                >
                  {cat}
                </Link>
              );
            })}
          </div>
        )}

        {pageProducts.length === 0 ? (
          <p className="py-12 text-center text-[var(--shop-ink-muted)]">
            ยังไม่มีสินค้าตรงตามเงื่อนไข
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {pageProducts.map((p) => (
              <Link
                key={p.id}
                href={`/stores/${store.slug}/products/${p.id}`}
                className="bg-white border border-[var(--shop-border)] rounded overflow-hidden flex flex-col"
              >
                <div className="aspect-square bg-[var(--shop-bg-soft)]">
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : null}
                </div>
                <div className="p-3 flex-1 flex flex-col">
                  <span className="text-sm line-clamp-2 mb-2">{p.title}</span>
                  <span
                    className="font-bold mt-auto"
                    style={{ color: 'var(--shop-primary)' }}
                  >
                    {formatTHB(p.priceTHB)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav
            aria-label="หน้า"
            className="flex justify-center gap-2 mt-8"
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <Link
                key={pg}
                href={buildUrl(undefined, pg)}
                className="px-3 py-1 rounded border text-sm"
                style={{
                  background: pg === currentPage ? 'var(--shop-primary)' : 'transparent',
                  color: pg === currentPage ? '#fff' : 'var(--shop-ink)',
                  borderColor: 'var(--shop-border)',
                }}
                aria-current={pg === currentPage ? 'page' : undefined}
              >
                {pg}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
