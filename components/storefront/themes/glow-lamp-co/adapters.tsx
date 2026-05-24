'use client';

import React from 'react';
import type {
  HomepageProps as ScaffoldHomepageProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { GlowLampCoHeader } from './chrome/Header';
import { GlowLampCoFooter } from './chrome/Footer';
import { GlowLampCoAnnouncementStrip } from './chrome/AnnouncementStrip';
import { GlowLampCoHomepage } from './pages/Homepage';

export function GlowLampCoHeaderAdapter(props: ScaffoldHeaderProps) {
  return <GlowLampCoHeader store={{ name: props.storeName, slug: props.storeSlug, logoUrl: props.storeLogoUrl || undefined }} />;
}

export function GlowLampCoFooterAdapter(props: ScaffoldFooterProps) {
  return <GlowLampCoFooter store={props.store} />;
}

export function GlowLampCoStripAdapter(props: ScaffoldStripProps) {
  return <GlowLampCoAnnouncementStrip />;
}

export function GlowLampCoHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <GlowLampCoHomepage
      store={{
        id: props.store.id,
        name: props.store.name,
        slug: props.store.slug,
        logoUrl: props.store.logoUrl ?? undefined,
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
export { default as glow_lamp_co_Catalog } from './pages/Catalog';
export { default as glow_lamp_co_ProductDetail } from './pages/ProductDetail';
export { default as glow_lamp_co_Cart } from './pages/Cart';
export { default as glow_lamp_co_Checkout } from './pages/Checkout';
