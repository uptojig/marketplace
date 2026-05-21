'use client';
import React from 'react';
import type {
  HomepageProps as ScaffoldHomepageProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { InkstonePaperHeader } from './chrome/Header';
import { InkstonePaperFooter } from './chrome/Footer';
import { InkstonePaperStrip } from './chrome/AnnouncementStrip';
import { InkstonePaperHomepage } from './pages/Homepage';

export function InkstonePaperHeaderAdapter(props: ScaffoldHeaderProps) {
  return <InkstonePaperHeader store={{ name: props.storeName, slug: props.storeSlug, logoUrl: props.storeLogoUrl }} categories={props.categories ?? []} />;
}

export function InkstonePaperFooterAdapter(props: ScaffoldFooterProps) {
  return <InkstonePaperFooter {...props} />;
}

export function InkstonePaperStripAdapter(props: ScaffoldStripProps) {
  return <InkstonePaperStrip {...props} />;
}

export function InkstonePaperHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <InkstonePaperHomepage
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
export { default as inkstone_paper_Catalog } from './pages/Catalog';
export { default as inkstone_paper_ProductDetail } from './pages/ProductDetail';
export { default as inkstone_paper_Cart } from './pages/Cart';
export { default as inkstone_paper_Checkout } from './pages/Checkout';
