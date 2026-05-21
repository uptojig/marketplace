'use client';

import React from 'react';
import type {
  HomepageProps as ScaffoldHomepageProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { PetitCoteHeader } from './chrome/Header';
import { PetitCoteFooter } from './chrome/Footer';
import { PetitCoteAnnouncementStrip } from './chrome/AnnouncementStrip';
import { PetitCoteHomepage } from './pages/Homepage';

export function PetitCoteHeaderAdapter(props: ScaffoldHeaderProps) {
  return (
    <PetitCoteHeader
      store={{
        id: '',
        name: props.storeName,
        slug: props.storeSlug,
        logoUrl: props.storeLogoUrl,
      }}
      categories={props.categories ?? []}
      cartItemCount={0}
    />
  );
}

export function PetitCoteFooterAdapter(props: ScaffoldFooterProps) {
  return (
    <PetitCoteFooter
      store={{
        id: props.store.id,
        name: props.store.name,
        slug: props.store.slug,
        logoUrl: props.store.logoUrl,
      }}
    />
  );
}

export function PetitCoteStripAdapter(props: ScaffoldStripProps) {
  return <PetitCoteAnnouncementStrip message={props.message} />;
}

export function PetitCoteHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <PetitCoteHomepage
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
