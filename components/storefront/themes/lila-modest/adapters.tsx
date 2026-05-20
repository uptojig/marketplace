'use client';
import React from 'react';
import type {
  HomepageProps as ScaffoldHomepageProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { Header as LilaModestHeader } from './chrome/Header';
import { Footer as LilaModestFooter } from './chrome/Footer';
import { AnnouncementStrip as LilaModestStrip } from './chrome/AnnouncementStrip';
import { Homepage as LilaModestHomepage } from './pages/Homepage';

export function LilaModestHeaderAdapter(props: ScaffoldHeaderProps) {
  return (
    <LilaModestHeader
      storeSlug={props.storeSlug}
      storeName={props.storeName}
      storeLogoUrl={props.storeLogoUrl}
      categories={props.categories ?? []}
      accent={props.accent}
    />
  );
}

export function LilaModestFooterAdapter(props: ScaffoldFooterProps) {
  return (
    <LilaModestFooter
      store={{
        name: props.store.name,
        slug: props.store.slug,
        facebookUrl: props.store.facebookUrl,
        instagramUrl: props.store.instagramUrl,
        lineId: props.store.lineId,
      }}
      categories={props.categories ?? []}
      accent={props.accent}
    />
  );
}

export function LilaModestStripAdapter(props: ScaffoldStripProps) {
  return (
    <LilaModestStrip
      storeName={props.storeName}
      message={props.message}
      mobileMessage={props.mobileMessage}
    />
  );
}

export function LilaModestHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <LilaModestHomepage
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
