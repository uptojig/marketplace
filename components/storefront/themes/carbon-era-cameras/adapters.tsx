'use client';

import React from 'react';
import type {
  HomepageProps as ScaffoldHomepageProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { CarbonEraCamerasHeader } from './chrome/Header';
import { CarbonEraCamerasFooter } from './chrome/Footer';
import { CarbonEraCamerasAnnouncementStrip } from './chrome/AnnouncementStrip';
import { CarbonEraCamerasHomepage } from './pages/Homepage';

export function CarbonEraCamerasHeaderAdapter(props: ScaffoldHeaderProps) {
  return (
    <CarbonEraCamerasHeader
      store={{ name: props.storeName, slug: props.storeSlug, logoUrl: props.storeLogoUrl }}
      categories={(props.categories ?? []).map((name) => ({ id: name, slug: name, name }))}
    />
  );
}

export function CarbonEraCamerasFooterAdapter(props: ScaffoldFooterProps) {
  return <CarbonEraCamerasFooter {...props} />;
}

export function CarbonEraCamerasStripAdapter(props: ScaffoldStripProps) {
  return <CarbonEraCamerasAnnouncementStrip {...props} />;
}

export function CarbonEraCamerasHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <CarbonEraCamerasHomepage
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
      categories={props.categories}
    />
  );
}

// Page re-exports
export { default as carbon_era_cameras_Catalog } from './pages/Catalog';
export { default as carbon_era_cameras_ProductDetail } from './pages/ProductDetail';
export { default as carbon_era_cameras_Cart } from './pages/Cart';
export { default as carbon_era_cameras_Checkout } from './pages/Checkout';
