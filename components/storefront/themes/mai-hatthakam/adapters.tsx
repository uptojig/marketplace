'use client';

import React from 'react';
import type {
  HomepageProps as ScaffoldHomepageProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { MaiHatthakamHeader } from './chrome/Header';
import { MaiHatthakamFooter } from './chrome/Footer';
import { MaiHatthakamAnnouncementStrip } from './chrome/AnnouncementStrip';
import { MaiHatthakamHomepage } from './pages/Homepage';

export function MaiHatthakamHeaderAdapter(props: ScaffoldHeaderProps) {
  return <MaiHatthakamHeader store={{ name: props.storeName, slug: props.storeSlug, logoUrl: props.storeLogoUrl || undefined }} categories={props.categories} />;
}

export function MaiHatthakamFooterAdapter(props: ScaffoldFooterProps) {
  return <MaiHatthakamFooter store={props.store} />;
}

export function MaiHatthakamStripAdapter(props: ScaffoldStripProps) {
  return <MaiHatthakamAnnouncementStrip text={props.text} mobileText={props.mobileText} />;
}

export function MaiHatthakamHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <MaiHatthakamHomepage
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
export { default as mai_hatthakam_Catalog } from './pages/Catalog';
export { default as mai_hatthakam_ProductDetail } from './pages/ProductDetail';
export { default as mai_hatthakam_Cart } from './pages/Cart';
export { default as mai_hatthakam_Checkout } from './pages/Checkout';
