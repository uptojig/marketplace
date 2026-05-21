'use client';
import React from 'react';
import type {
  HomepageProps as ScaffoldHomepageProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { TinyhandHeader } from './chrome/Header';
import { TinyhandFooter } from './chrome/Footer';
import { TinyhandStrip } from './chrome/AnnouncementStrip';
import { TinyhandHomepage } from './pages/Homepage';

export function TinyhandWoodenToysHeaderAdapter(props: ScaffoldHeaderProps) {
  return <TinyhandHeader storeName={props.storeName} storeSlug={props.storeSlug} />;
}

export function TinyhandWoodenToysFooterAdapter(props: ScaffoldFooterProps) {
  return <TinyhandFooter storeName={props.store.name} storeSlug={props.store.slug} />;
}

export function TinyhandWoodenToysStripAdapter(props: ScaffoldStripProps) {
  return <TinyhandStrip />;
}

export function TinyhandWoodenToysHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <TinyhandHomepage
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
export { default as tinyhand_wooden_toys_Catalog } from './pages/Catalog';
export { default as tinyhand_wooden_toys_ProductDetail } from './pages/ProductDetail';
export { default as tinyhand_wooden_toys_Cart } from './pages/Cart';
export { default as tinyhand_wooden_toys_Checkout } from './pages/Checkout';
