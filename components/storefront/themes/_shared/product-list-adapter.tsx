'use client';

/**
 * Shared product-list adapter — bridges HomepageProps from the storefront
 * to shadcn-studio product-list blocks (01–09).
 *
 * Used as a section within homepage templates to display a curated
 * product grid using premium shadcn UI components.
 */

import React, { lazy, Suspense } from 'react';

// Lazy-load all 9 product-list variants
const productListVariants = {
  '01': lazy(() => import('@/components/shadcn-studio/blocks/product-list-01/product-list-01')),
  '02': lazy(() => import('@/components/shadcn-studio/blocks/product-list-02/product-list-02')),
  '03': lazy(() => import('@/components/shadcn-studio/blocks/product-list-03/product-list-03')),
  '04': lazy(() => import('@/components/shadcn-studio/blocks/product-list-04/product-list-04')),
  '05': lazy(() => import('@/components/shadcn-studio/blocks/product-list-05/product-list-05')),
  '06': lazy(() => import('@/components/shadcn-studio/blocks/product-list-06/product-list-06')),
  '07': lazy(() => import('@/components/shadcn-studio/blocks/product-list-07/product-list-07')),
  '08': lazy(() => import('@/components/shadcn-studio/blocks/product-list-08/product-list-08')),
  '09': lazy(() => import('@/components/shadcn-studio/blocks/product-list-09/product-list-09')),
} as const;

export type ProductListVariant = keyof typeof productListVariants;

interface ProductInput {
  id: string;
  title: string;
  priceTHB: number;
  compareAtPriceTHB?: number | null;
  imageUrl?: string | null;
  categoryName?: string | null;
}

/** Convert storefront products → product-list ProductItem format */
function toProductItems(products: ProductInput[], storeSlug: string) {
  return products.map((p) => ({
    image: p.imageUrl ?? 'https://placehold.co/400x400/f4f4f5/a1a1aa?text=No+Image',
    imgAlt: p.title,
    name: p.title,
    price: p.priceTHB,
    salePrice: p.compareAtPriceTHB && p.compareAtPriceTHB > p.priceTHB
      ? p.priceTHB
      : undefined,
    badges: p.categoryName ? [p.categoryName] : [],
    productLink: `/stores/${storeSlug}/products/${p.id}`,
  }));
}

/** Variant 06 uses productCards instead of products */
function toProductCards(products: ProductInput[], storeSlug: string) {
  return products.map((p) => ({
    img: p.imageUrl ?? 'https://placehold.co/400x400/f4f4f5/a1a1aa?text=No+Image',
    title: p.title,
    misc: `฿${p.priceTHB.toLocaleString()}`,
    badge: p.categoryName ?? '',
    mainClass: '',
    productLink: `/stores/${storeSlug}/products/${p.id}`,
  }));
}

export interface ProductListSectionProps {
  products: ProductInput[];
  storeSlug: string;
}

export function makeProductListSection(variant: ProductListVariant) {
  return function ProductListSection({ products, storeSlug }: ProductListSectionProps) {
    const Block = productListVariants[variant];

    if (variant === '06') {
      const productCards = toProductCards(products, storeSlug);
      return (
        <Suspense fallback={<div className="h-48" />}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Block productCards={productCards as any} {...({} as any)} />
        </Suspense>
      );
    }

    const items = toProductItems(products, storeSlug);
    return (
      <Suspense fallback={<div className="h-48" />}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <Block products={items as any} {...({} as any)} />
      </Suspense>
    );
  };
}
