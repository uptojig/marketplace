'use client';
import React from 'react';
import type {
  HomepageProps as ScaffoldHomepageProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { PigmentStudioHeader } from './chrome/Header';
import { PigmentStudioFooter } from './chrome/Footer';
import { PigmentStudioAnnouncementStrip } from './chrome/AnnouncementStrip';
import { PigmentStudioHomepage } from './pages/Homepage';

export function PigmentStudioHeaderAdapter(props: ScaffoldHeaderProps) {
  return <PigmentStudioHeader store={{ name: props.storeName, slug: props.storeSlug, logoUrl: props.storeLogoUrl || undefined }} categories={props.categories} />;
}

export function PigmentStudioFooterAdapter(props: ScaffoldFooterProps) {
  return <PigmentStudioFooter store={props.store} />;
}

export function PigmentStudioStripAdapter(props: ScaffoldStripProps) {
  return <PigmentStudioAnnouncementStrip />;
}

export function PigmentStudioHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <PigmentStudioHomepage
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
export { default as pigment_studio_Catalog } from './pages/Catalog';
export { default as pigment_studio_ProductDetail } from './pages/ProductDetail';
export { default as pigment_studio_Cart } from './pages/Cart';
export { default as pigment_studio_Checkout } from './pages/Checkout';
