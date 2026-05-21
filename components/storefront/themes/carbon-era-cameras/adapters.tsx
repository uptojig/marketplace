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
  return <CarbonEraCamerasHeader store={{ name: props.storeName, slug: props.storeSlug, logoUrl: props.storeLogoUrl }} categories={props.categories ?? []} />;
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
