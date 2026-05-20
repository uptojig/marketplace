'use client';
import React from 'react';
import type {
  HomepageProps as ScaffoldHomepageProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { HinokiHeader } from './chrome/Header';
import { HinokiFooter } from './chrome/Footer';
import { HinokiAnnouncementStrip } from './chrome/AnnouncementStrip';
import { HinokiHomepage } from './pages/Homepage';

export function HinokiHeaderAdapter(props: ScaffoldHeaderProps) {
  return <HinokiHeader store={{ name: props.storeName, slug: props.storeSlug, logoUrl: props.storeLogoUrl || undefined }} />;
}

export function HinokiFooterAdapter(props: ScaffoldFooterProps) {
  return <HinokiFooter store={props.store} />;
}

export function HinokiStripAdapter(props: ScaffoldStripProps) {
  return <HinokiAnnouncementStrip store={props.store} />;
}

export function HinokiHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <HinokiHomepage
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
