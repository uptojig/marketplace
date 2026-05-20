'use client';
import React from 'react';
import type {
  HomepageProps as ScaffoldHomepageProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { BulkboxHeader } from './chrome/Header';
import { BulkboxFooter } from './chrome/Footer';
import { BulkboxStrip } from './chrome/AnnouncementStrip';
import { BulkboxHomepage } from './pages/Homepage';

export function BulkboxHeaderAdapter(props: ScaffoldHeaderProps) {
  return <BulkboxHeader {...props} />;
}
export function BulkboxFooterAdapter(props: ScaffoldFooterProps) {
  return <BulkboxFooter {...props} />;
}
export function BulkboxStripAdapter(props: ScaffoldStripProps) {
  return <BulkboxStrip {...props} />;
}
export function BulkboxHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <BulkboxHomepage
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
