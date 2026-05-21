'use client';

import React from 'react';
import type {
  HomepageProps as ScaffoldHomepageProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { LinenAndLoomHeader } from './chrome/Header';
import { LinenAndLoomFooter } from './chrome/Footer';
import { LinenAndLoomStrip } from './chrome/AnnouncementStrip';
import { LinenAndLoomHomepage } from './pages/Homepage';

export function LinenAndLoomHeaderAdapter(props: ScaffoldHeaderProps) {
  return <LinenAndLoomHeader store={{ name: props.storeName, slug: props.storeSlug, logoUrl: props.storeLogoUrl || undefined }} />;
}

export function LinenAndLoomFooterAdapter(props: ScaffoldFooterProps) {
  return <LinenAndLoomFooter store={props.store} />;
}

export function LinenAndLoomStripAdapter(props: ScaffoldStripProps) {
  return <LinenAndLoomStrip />;
}

export function LinenAndLoomHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <LinenAndLoomHomepage
      store={{
        id: props.store.id,
        name: props.store.name,
        slug: props.store.slug,
        logoUrl: props.store.logoUrl,
      }}
      products={props.products.map((p) => ({
        id: p.id,
        title: p.title,
        priceTHB: p.priceTHB,
        compareAtPriceTHB: p.compareAtPriceTHB ?? null,
        imageUrl: p.imageUrl ?? null,
        categoryName: p.categoryName ?? null,
      }))}
      categories={props.categories}
    />
  );
}

// Page re-exports
export { default as linen_and_loom_Catalog } from './pages/Catalog';
export { default as linen_and_loom_ProductDetail } from './pages/ProductDetail';
export { default as linen_and_loom_Cart } from './pages/Cart';
export { default as linen_and_loom_Checkout } from './pages/Checkout';
