'use client';
import React from 'react';
import type {
  HomepageProps as ScaffoldHomepageProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { SmartloopHomeHeader } from './chrome/Header';
import { SmartloopHomeFooter } from './chrome/Footer';
import { SmartloopHomeStrip } from './chrome/AnnouncementStrip';
import { SmartloopHomeHomepage } from './pages/Homepage';

export function SmartloopHomeHeaderAdapter(props: ScaffoldHeaderProps) {
  return <SmartloopHomeHeader store={props.store} />;
}

export function SmartloopHomeFooterAdapter(props: ScaffoldFooterProps) {
  return <SmartloopHomeFooter storeName={props.store.name} />;
}

export function SmartloopHomeStripAdapter(props: ScaffoldStripProps) {
  return <SmartloopHomeStrip desktopText={props.desktopText} mobileText={props.mobileText} />;
}

export function SmartloopHomeHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <SmartloopHomeHomepage
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
