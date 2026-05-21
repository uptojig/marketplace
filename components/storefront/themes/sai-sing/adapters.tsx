'use client';
import React from 'react';
import type {
  HomepageProps as ScaffoldHomepageProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { Header as SaiSingHeader } from './chrome/Header';
import { Footer as SaiSingFooter } from './chrome/Footer';
import { AnnouncementStrip as SaiSingStrip } from './chrome/AnnouncementStrip';
import { Homepage as SaiSingHomepage } from './pages/Homepage';

export function SaiSingHeaderAdapter(props: ScaffoldHeaderProps) {
  return (
    <SaiSingHeader
      storeSlug={props.storeSlug}
      storeName={props.storeName}
      storeLogoUrl={props.storeLogoUrl}
      categories={props.categories ?? []}
      accent={props.accent}
    />
  );
}

export function SaiSingFooterAdapter(props: ScaffoldFooterProps) {
  return (
    <SaiSingFooter
      store={{
        name: props.store.name,
        slug: props.store.slug,
        facebookUrl: props.store.facebookUrl,
        instagramUrl: props.store.instagramUrl,
        twitterUrl: props.store.twitterUrl,
      }}
      categories={props.categories ?? []}
      accent={props.accent}
    />
  );
}

export function SaiSingStripAdapter(props: ScaffoldStripProps) {
  return <SaiSingStrip storeName={props.storeName} />;
}

export function SaiSingHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <SaiSingHomepage
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
export { default as sai_sing_Catalog } from './pages/Catalog';
export { default as sai_sing_ProductDetail } from './pages/ProductDetail';
export { default as sai_sing_Cart } from './pages/Cart';
export { default as sai_sing_Checkout } from './pages/Checkout';
