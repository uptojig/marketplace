/**
 * Shared catalog adapter — bridges CatalogProps from the storefront
 * scaffold to shadcn-studio product-category blocks.
 *
 * Each template picks a variant (01–12) and this adapter maps
 * TemplateProductCard[] → productCards[] that the block expects.
 */

import React, { lazy, Suspense } from 'react';
import type { CatalogProps } from '@/lib/templates/types';

// Lazy-load all 12 variants
const variants = {
  '01': lazy(() => import('@/components/shadcn-studio/blocks/product-category-01/product-category-01')),
  '02': lazy(() => import('@/components/shadcn-studio/blocks/product-category-02/product-category-02')),
  '03': lazy(() => import('@/components/shadcn-studio/blocks/product-category-03/product-category-03')),
  '04': lazy(() => import('@/components/shadcn-studio/blocks/product-category-04/product-category-04')),
  '05': lazy(() => import('@/components/shadcn-studio/blocks/product-category-05/product-category-05')),
  '06': lazy(() => import('@/components/shadcn-studio/blocks/product-category-06/product-category-06')),
  '07': lazy(() => import('@/components/shadcn-studio/blocks/product-category-07/product-category-07')),
  '08': lazy(() => import('@/components/shadcn-studio/blocks/product-category-08/product-category-08')),
  '09': lazy(() => import('@/components/shadcn-studio/blocks/product-category-09/product-category-09')),
  '12': lazy(() => import('@/components/shadcn-studio/blocks/product-category-12/product-category-12')),
} as const;

export type CatalogVariant = keyof typeof variants;

/** Convert CatalogProps.pageProducts → productCards for shadcn blocks */
function toProductCards(props: CatalogProps) {
  return props.pageProducts.map((p) => ({
    img: p.imageUrl ?? 'https://placehold.co/600x600/f4f4f5/a1a1aa?text=No+Image',
    misc: `฿${p.priceTHB.toLocaleString()}`,
    badge: p.categoryName ?? '',
    title: p.title,
    productLink: `/stores/${props.store.slug}/products/${p.id}`,
  }));
}

export function makeCatalogAdapter(variant: CatalogVariant) {
  return function CatalogAdapter(props: CatalogProps) {
    const Block = variants[variant];
    const productCards = toProductCards(props);

    return (
      <Suspense
        fallback={
          <div className="flex h-96 items-center justify-center text-zinc-400">
            กำลังโหลด...
          </div>
        }
      >
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <Block productCards={productCards as any} />
      </Suspense>
    );
  };
}
