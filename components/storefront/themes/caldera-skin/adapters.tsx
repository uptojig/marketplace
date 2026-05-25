'use client';
import React from 'react';
import type {
  HomepageProps as ScaffoldHomepageProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { CalderaSkinHeader } from './chrome/Header';
import { CalderaSkinFooter } from './chrome/Footer';
import { CalderaSkinAnnouncementStrip } from './chrome/AnnouncementStrip';
import { CalderaSkinHomepage } from './pages/Homepage';

export function CalderaSkinHeaderAdapter(props: ScaffoldHeaderProps) {
  return (
    <CalderaSkinHeader
      store={{ name: props.storeName, slug: props.storeSlug, logoUrl: props.storeLogoUrl }}
    />
  );
}

export function CalderaSkinFooterAdapter(props: ScaffoldFooterProps) {
  return <CalderaSkinFooter {...props} />;
}

export function CalderaSkinStripAdapter(props: ScaffoldStripProps) {
  return <CalderaSkinAnnouncementStrip {...props} />;
}

export function CalderaSkinHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <CalderaSkinHomepage
      store={{
        id: props.store.id,
        name: props.store.name,
        slug: props.store.slug,
        logoUrl: props.store.logoUrl ?? null,
      }}
      products={props.products.map((p) => ({
        id: p.id,
        title: p.title,
        priceTHB: p.priceTHB,
        compareAtPriceTHB: p.compareAtPriceTHB ?? null,
        imageUrl: p.imageUrl ?? null,
        categoryName: p.categoryName ?? null,
      }))}
      categories={(props.categories ?? []).map((name) => ({ id: name, name }))}
    />
  );
}

// Page re-exports
export { default as caldera_skin_Catalog } from './pages/Catalog';
export { default as caldera_skin_ProductDetail } from './pages/ProductDetail';
export { default as caldera_skin_Cart } from './pages/Cart';
export { default as caldera_skin_Checkout } from './pages/Checkout';
