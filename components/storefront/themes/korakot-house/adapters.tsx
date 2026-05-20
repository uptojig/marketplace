'use client';

import React from 'react';
import type {
  HomepageProps as ScaffoldHomepageProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { KorakotHouseHeader } from './chrome/Header';
import { KorakotHouseFooter } from './chrome/Footer';
import { KorakotHouseAnnouncementStrip } from './chrome/AnnouncementStrip';
import { KorakotHouseHomepage } from './pages/Homepage';

export function KorakotHouseHeaderAdapter(props: ScaffoldHeaderProps) {
  return <KorakotHouseHeader store={props.store} />;
}

export function KorakotHouseFooterAdapter(props: ScaffoldFooterProps) {
  return <KorakotHouseFooter store={props.store} />;
}

export function KorakotHouseStripAdapter(props: ScaffoldStripProps) {
  return <KorakotHouseAnnouncementStrip />;
}

export function KorakotHouseHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <KorakotHouseHomepage
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
