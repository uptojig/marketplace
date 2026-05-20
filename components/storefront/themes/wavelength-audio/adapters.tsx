'use client';

import React from 'react';
import type {
  HomepageProps as ScaffoldHomepageProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { WavelengthAudioHeader } from './chrome/Header';
import { WavelengthAudioFooter } from './chrome/Footer';
import { WavelengthAudioStrip } from './chrome/AnnouncementStrip';
import { WavelengthAudioHomepage } from './pages/Homepage';

export function WavelengthAudioHeaderAdapter(props: ScaffoldHeaderProps) {
  return <WavelengthAudioHeader store={{ name: props.storeName, slug: props.storeSlug, logoUrl: props.storeLogoUrl || undefined }} />;
}

export function WavelengthAudioFooterAdapter(props: ScaffoldFooterProps) {
  return <WavelengthAudioFooter store={props.store} />;
}

export function WavelengthAudioStripAdapter(props: ScaffoldStripProps) {
  return <WavelengthAudioStrip />;
}

export function WavelengthAudioHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <WavelengthAudioHomepage
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
