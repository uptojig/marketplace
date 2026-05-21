'use client';
import React from 'react';
import type {
  HomepageProps as ScaffoldHomepageProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { ReclaimLeatherHeader } from './chrome/Header';
import { ReclaimLeatherFooter } from './chrome/Footer';
import { ReclaimLeatherAnnouncementStrip } from './chrome/AnnouncementStrip';
import { ReclaimLeatherHomepage } from './pages/Homepage';

export function ReclaimLeatherHeaderAdapter(props: ScaffoldHeaderProps) {
  return <ReclaimLeatherHeader store={{ name: props.storeName, slug: props.storeSlug, logoUrl: props.storeLogoUrl || undefined }} />;
}

export function ReclaimLeatherFooterAdapter(props: ScaffoldFooterProps) {
  return <ReclaimLeatherFooter store={props.store} />;
}

export function ReclaimLeatherStripAdapter(props: ScaffoldStripProps) {
  return <ReclaimLeatherAnnouncementStrip desktopText={props.desktopText} mobileText={props.mobileText} />;
}

export function ReclaimLeatherHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <ReclaimLeatherHomepage
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
export { default as reclaim_leather_Catalog } from './pages/Catalog';
export { default as reclaim_leather_ProductDetail } from './pages/ProductDetail';
export { default as reclaim_leather_Cart } from './pages/Cart';
export { default as reclaim_leather_Checkout } from './pages/Checkout';
