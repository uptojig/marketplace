'use client';

import React from 'react';
import type {
  HomepageProps as ScaffoldHomepageProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { GlowLampCoHeader } from './chrome/Header';
import { GlowLampCoFooter } from './chrome/Footer';
import { GlowLampCoAnnouncementStrip } from './chrome/AnnouncementStrip';
import { GlowLampCoHomepage } from './pages/Homepage';

export function GlowLampCoHeaderAdapter(props: ScaffoldHeaderProps) {
  return <GlowLampCoHeader store={props.store} />;
}

export function GlowLampCoFooterAdapter(props: ScaffoldFooterProps) {
  return <GlowLampCoFooter store={props.store} />;
}

export function GlowLampCoStripAdapter(props: ScaffoldStripProps) {
  return <GlowLampCoAnnouncementStrip />;
}

export function GlowLampCoHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <GlowLampCoHomepage
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
