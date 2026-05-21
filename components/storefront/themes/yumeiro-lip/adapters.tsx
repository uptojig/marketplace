'use client';
import React from 'react';
import type {
  HomepageProps as ScaffoldHomepageProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { YumeiroLipHeader } from './chrome/Header';
import { YumeiroLipFooter } from './chrome/Footer';
import { YumeiroLipStrip } from './chrome/AnnouncementStrip';
import { YumeiroLipHomepage } from './pages/Homepage';

export function YumeiroLipHeaderAdapter(props: ScaffoldHeaderProps) {
  return (
    <YumeiroLipHeader
      store={{
        name: props.storeName,
        slug: props.storeSlug,
        logoUrl: props.storeLogoUrl,
      }}
      categories={props.categories}
    />
  );
}

export function YumeiroLipFooterAdapter(props: ScaffoldFooterProps) {
  return (
    <YumeiroLipFooter
      store={{
        name: props.store.name,
      }}
    />
  );
}

export function YumeiroLipStripAdapter(props: ScaffoldStripProps) {
  return <YumeiroLipStrip />;
}

export function YumeiroLipHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <YumeiroLipHomepage
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
export { default as yumeiro_lip_Catalog } from './pages/Catalog';
export { default as yumeiro_lip_ProductDetail } from './pages/ProductDetail';
export { default as yumeiro_lip_Cart } from './pages/Cart';
export { default as yumeiro_lip_Checkout } from './pages/Checkout';
