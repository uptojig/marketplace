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

const PLACEHOLDER_IMAGE = 'https://placehold.co/400x400/f4f4f5/a1a1aa?text=No+Image';
const DEFAULT_FEATURES = ['จัดส่งฟรี', 'ของแท้รับประกัน', 'คืนสินค้าได้ใน 7 วัน'];

interface ProductSeed {
  image: string;
  title: string;
  productLink: string;
  productReviewLink: string;
  category: string;
  rating: number;
  reviewCount: number;
  features: string[];
  currentPrice: number;
  originalPrice: number;
  salePrice?: number;
  salePercentage: number;
  sold: number;
  available: number;
  soldProgress: number;
}

function toProductSeed(products: ProductInput[], storeSlug: string): ProductSeed[] {
  return products.map((p, index) => {
    const safePrice = Number.isFinite(p.priceTHB) ? p.priceTHB : 0;
    const compareAt =
      typeof p.compareAtPriceTHB === 'number' && Number.isFinite(p.compareAtPriceTHB) ? p.compareAtPriceTHB : null;
    const hasSale = compareAt !== null && compareAt > safePrice;
    const currentPrice = safePrice;
    const originalPrice = hasSale ? compareAt : safePrice;
    const salePrice = hasSale ? safePrice : undefined;
    const salePercentage = hasSale && originalPrice > 0
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0;
    const sold = 18 + index * 3;
    const available = Math.max(20, 120 - ((index * 7) % 70));
    const soldProgress = Math.max(10, Math.min(95, Math.round((sold / (sold + available)) * 100)));
    const rating = Number((4.5 + (index % 5) * 0.1).toFixed(1));
    const reviewCount = 24 + index * 7;
    const productLink = `/stores/${storeSlug}/products/${p.id}`;

    return {
      image: p.imageUrl ?? PLACEHOLDER_IMAGE,
      title: p.title,
      productLink,
      productReviewLink: `${productLink}#reviews`,
      category: p.categoryName ?? 'Featured',
      rating,
      reviewCount,
      features: DEFAULT_FEATURES,
      currentPrice,
      originalPrice,
      salePrice,
      salePercentage,
      sold,
      available,
      soldProgress,
    };
  });
}

function toList01(products: ProductSeed[]) {
  return products.map((p) => ({
    image: p.image,
    imgAlt: p.title,
    name: p.title,
    price: p.originalPrice,
    salePrice: p.salePrice,
    badges: [p.category],
    productLink: p.productLink,
  }));
}

function toList02(products: ProductSeed[]) {
  return products.map((p) => ({
    image: p.image,
    imgAlt: p.title,
    name: p.title,
    price: p.originalPrice,
    salePrice: p.salePrice,
    productLink: p.productLink,
  }));
}

function toList03(products: ProductSeed[]) {
  return products.map((p) => ({
    productSrc: p.image,
    productAlt: p.title,
    name: p.title,
    price: p.currentPrice,
    productLink: p.productLink,
    sellerName: 'Official Store',
    avatarFallback: 'OS',
    category: p.category,
  }));
}

function toList04(products: ProductSeed[]) {
  return products.map((p) => ({
    productSrc: p.image,
    productAlt: p.title,
    name: p.title,
    rating: p.rating,
    reviewCount: p.reviewCount,
    features: p.features,
    price: p.originalPrice,
    discountedPrice: p.currentPrice,
    productLink: p.productLink,
  }));
}

function toList05(products: ProductSeed[]) {
  return products.map((p) => ({
    productImages: [p.image],
    name: p.title,
    price: p.originalPrice,
    salePrice: p.salePrice,
    category: p.category,
    productLink: p.productLink,
  }));
}

function toList07(products: ProductSeed[]) {
  return products.map((p) => ({
    productSrc: p.image,
    productAlt: p.title,
    name: p.title,
    rating: p.rating,
    reviewCount: p.reviewCount,
    features: p.features,
    originalPrice: p.originalPrice,
    discountedPrice: p.currentPrice,
    productLink: p.productLink,
  }));
}

function toList08(products: ProductSeed[]) {
  return products.map((p, index) => ({
    productSrc: p.image,
    productAlt: p.title,
    productLink: p.productLink,
    name: p.title,
    salePercentage: p.salePercentage,
    soldProgress: p.soldProgress,
    sold: p.sold,
    available: p.available,
    discountedPrice: p.currentPrice,
    originalPrice: p.originalPrice,
    cardClassName: index % 2 === 0 ? 'bg-primary/20' : undefined,
  }));
}

function toList09(products: ProductSeed[]) {
  return products.map((p) => ({
    productSrc: p.image,
    productAlt: p.title,
    productLink: p.productLink,
    productReviewLink: p.productReviewLink,
    name: p.title,
    rating: p.rating,
    reviewCount: p.reviewCount,
    price: p.currentPrice,
  }));
}

/** Variant 06 uses productCards with rating + numeric price. */
function toList06Cards(products: ProductSeed[]) {
  return products.map((p) => ({
    rating: p.rating,
    productSrc: p.image,
    productAlt: p.title,
    productCategory: p.category,
    name: p.title,
    price: p.currentPrice,
    productLink: p.productLink,
  }));
}

export interface ProductListSectionProps {
  products: ProductInput[];
  storeSlug: string;
}

export function makeProductListSection(variant: ProductListVariant) {
  return function ProductListSection({ products, storeSlug }: ProductListSectionProps) {
    const Block = productListVariants[variant];
    const BlockComponent = Block as React.ComponentType<{ products?: unknown; productCards?: unknown }>;
    const productSeed = toProductSeed(products, storeSlug);

    if (variant === '06') {
      const productCards = toList06Cards(productSeed);
      return (
        <Suspense fallback={<div className="h-48" />}>
          <BlockComponent productCards={productCards} />
        </Suspense>
      );
    }

    const itemsByVariant: Record<Exclude<ProductListVariant, '06'>, unknown> = {
      '01': toList01(productSeed),
      '02': toList02(productSeed),
      '03': toList03(productSeed),
      '04': toList04(productSeed),
      '05': toList05(productSeed),
      '07': toList07(productSeed),
      '08': toList08(productSeed),
      '09': toList09(productSeed),
    };

    return (
      <Suspense fallback={<div className="h-48" />}>
        <BlockComponent products={itemsByVariant[variant]} />
      </Suspense>
    );
  };
}
