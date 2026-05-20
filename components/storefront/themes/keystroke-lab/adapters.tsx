'use client';
import React from 'react';
import type {
  HomepageProps as ScaffoldHomepageProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { KeystrokeLabHeader } from './chrome/Header';
import { KeystrokeLabFooter } from './chrome/Footer';
import { KeystrokeLabAnnouncementStrip } from './chrome/AnnouncementStrip';
import { KeystrokeLabHomepage } from './pages/Homepage';

export function KeystrokeLabHeaderAdapter(props: ScaffoldHeaderProps) {
  return <KeystrokeLabHeader store={{ name: props.storeName, slug: props.storeSlug, logoUrl: props.storeLogoUrl || undefined }} categories={props.categories} />;
}
export function KeystrokeLabFooterAdapter(props: ScaffoldFooterProps) {
  return <KeystrokeLabFooter store={props.store} />;
}
export function KeystrokeLabStripAdapter(props: ScaffoldStripProps) {
  return <KeystrokeLabAnnouncementStrip />;
}
export function KeystrokeLabHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <KeystrokeLabHomepage
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
