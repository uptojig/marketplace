'use client';
import React from 'react';
import type {
  HomepageProps as ScaffoldHomepageProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { Header as BrutalistThaiHeader } from './chrome/Header';
import { Footer as BrutalistThaiFooter } from './chrome/Footer';
import { Homepage as BrutalistThaiHomepage } from './pages/Homepage';

export function BrutalistThaiHeaderAdapter(props: ScaffoldHeaderProps) {
  return (
    <BrutalistThaiHeader
      storeSlug={props.storeSlug}
      storeName={props.storeName}
      storeLogoUrl={props.storeLogoUrl}
      categories={props.categories ?? []}
    />
  );
}

export function BrutalistThaiFooterAdapter(props: ScaffoldFooterProps) {
  return (
    <BrutalistThaiFooter
      store={{
        name: props.store.name,
        slug: props.store.slug,
      }}
      categories={props.categories ?? []}
    />
  );
}

// Brutalist design embeds the announcement directly or does not use a secondary announcement strip.
export function BrutalistThaiStripAdapter(props: ScaffoldStripProps) {
  return null;
}

export function BrutalistThaiHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <BrutalistThaiHomepage
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
