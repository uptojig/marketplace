'use client';

import React from 'react';
import type {
  HomepageProps as ScaffoldHomepageProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { SirinHeader } from './chrome/Header';
import { SirinFooter } from './chrome/Footer';
import { SirinAnnouncementStrip } from './chrome/AnnouncementStrip';
import { SirinHomepage } from './pages/Homepage';

export function SirinHeaderAdapter(props: ScaffoldHeaderProps) {
  return <SirinHeader store={{ name: props.storeName, slug: props.storeSlug, logoUrl: props.storeLogoUrl || undefined }} />;
}

export function SirinFooterAdapter(props: ScaffoldFooterProps) {
  return <SirinFooter store={props.store} />;
}

export function SirinStripAdapter(props: ScaffoldStripProps) {
  return <SirinAnnouncementStrip />;
}

export function SirinHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <SirinHomepage
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
      categories={(props.categories ?? []).map((name) => ({ id: name, name }))}
    />
  );
}

// Page re-exports
export { default as sirin_womenswear_Catalog } from './pages/Catalog';
export { default as sirin_womenswear_ProductDetail } from './pages/ProductDetail';
export { default as sirin_womenswear_Cart } from './pages/Cart';
export { default as sirin_womenswear_Checkout } from './pages/Checkout';
