'use client';
import React from 'react';
import type {
  HomepageProps as ScaffoldHomepageProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { Header as TaladSeeSodHeader } from './chrome/Header';
import { Footer as TaladSeeSodFooter } from './chrome/Footer';
import { Homepage as TaladSeeSodHomepage } from './pages/Homepage';

export function TaladSeeSodHeaderAdapter(props: ScaffoldHeaderProps) {
  return (
    <TaladSeeSodHeader
      storeSlug={props.storeSlug}
      storeName={props.storeName}
      storeLogoUrl={props.storeLogoUrl}
      categories={props.categories ?? []}
    />
  );
}

export function TaladSeeSodFooterAdapter(props: ScaffoldFooterProps) {
  return (
    <TaladSeeSodFooter
      store={{
        name: props.store.name,
        slug: props.store.slug,
      }}
      categories={props.categories ?? []}
    />
  );
}

// Since the header already has a custom built-in announcement bar, we can return null here
export function TaladSeeSodStripAdapter(props: ScaffoldStripProps) {
  return null;
}

export function TaladSeeSodHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <TaladSeeSodHomepage
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
