'use client';
import React from 'react';
import type {
  HomepageProps as ScaffoldHomepageProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { Header as MonoEightHeader } from './chrome/Header';
import { Footer as MonoEightFooter } from './chrome/Footer';
import { AnnouncementStrip as MonoEightStrip } from './chrome/AnnouncementStrip';
import { Homepage as MonoEightHomepage } from './pages/Homepage';

export function MonoEightHeaderAdapter(props: ScaffoldHeaderProps) {
  return (
    <MonoEightHeader
      storeSlug={props.storeSlug}
      storeName={props.storeName}
      storeLogoUrl={props.storeLogoUrl}
      categories={props.categories ?? []}
    />
  );
}

export function MonoEightFooterAdapter(props: ScaffoldFooterProps) {
  return (
    <MonoEightFooter
      store={{
        name: props.store.name,
        slug: props.store.slug,
      }}
      categories={props.categories ?? []}
    />
  );
}

export function MonoEightStripAdapter(props: ScaffoldStripProps) {
  return <MonoEightStrip storeName={props.storeName} />;
}

export function MonoEightHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <MonoEightHomepage
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
