'use client';
import React from 'react';
import type {
  HomepageProps as ScaffoldHomepageProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { TrailcraftHeader } from './chrome/Header';
import { TrailcraftFooter } from './chrome/Footer';
import { TrailcraftStrip } from './chrome/AnnouncementStrip';
import { TrailcraftHomepage } from './pages/Homepage';

export function TrailcraftHeaderAdapter(props: ScaffoldHeaderProps) {
  return (
    <TrailcraftHeader
      store={{ name: props.storeName, slug: props.storeSlug, logoUrl: props.storeLogoUrl }}
      categories={(props.categories ?? []).map((name) => ({ id: name, slug: name, name }))}
    />
  );
}
export function TrailcraftFooterAdapter(props: ScaffoldFooterProps) {
  return <TrailcraftFooter {...props} />;
}
export function TrailcraftStripAdapter(props: ScaffoldStripProps) {
  return <TrailcraftStrip {...props} />;
}
export function TrailcraftHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <TrailcraftHomepage
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
      categories={(props.categories ?? []).map((name) => ({ id: name, slug: name, name }))}
    />
  );
}

// Page re-exports
export { default as trailcraft_outdoors_Catalog } from './pages/Catalog';
export { default as trailcraft_outdoors_ProductDetail } from './pages/ProductDetail';
export { default as trailcraft_outdoors_Cart } from './pages/Cart';
export { default as trailcraft_outdoors_Checkout } from './pages/Checkout';
