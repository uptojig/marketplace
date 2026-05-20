'use client';
import React from 'react';
import type {
  HomepageProps as ScaffoldHomepageProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { TrailcraftHeader } from './chrome/Header';
import { TrailcraftFooter } from './chrome/Footer';
import { TrailcraftStrip } from './chrome/AnnouncementStrip';
import { TrailcraftHomepage } from './pages/Homepage';

export function TrailcraftHeaderAdapter(props: ScaffoldHeaderProps) {
  return <TrailcraftHeader {...props} />;
}
export function TrailcraftFooterAdapter(props: ScaffoldFooterProps) {
  return <TrailcraftFooter {...props} />;
}
export function TrailcraftStripAdapter(props: ScaffoldStripProps) {
  return <TrailcraftStrip {...props} />;
}
export function TrailcraftHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <TrailcraftHomepage
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
