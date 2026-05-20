'use client';
import React from 'react';
import type {
  HomepageProps as ScaffoldHomepageProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { CalderaSkinHeader } from './chrome/Header';
import { CalderaSkinFooter } from './chrome/Footer';
import { CalderaSkinAnnouncementStrip } from './chrome/AnnouncementStrip';
import { CalderaSkinHomepage } from './pages/Homepage';

export function CalderaSkinHeaderAdapter(props: ScaffoldHeaderProps) {
  return <CalderaSkinHeader {...props} />;
}

export function CalderaSkinFooterAdapter(props: ScaffoldFooterProps) {
  return <CalderaSkinFooter {...props} />;
}

export function CalderaSkinStripAdapter(props: ScaffoldStripProps) {
  return <CalderaSkinAnnouncementStrip {...props} />;
}

export function CalderaSkinHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <CalderaSkinHomepage
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
