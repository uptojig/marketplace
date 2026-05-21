'use client';

import React from 'react';
import type {
  HomepageProps as ScaffoldHomepageProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { PastelPackHeader } from './chrome/Header';
import { PastelPackFooter } from './chrome/Footer';
import { PastelPackAnnouncementStrip } from './chrome/AnnouncementStrip';
import { PastelPackHomepage } from './pages/Homepage';

export function PastelPackHeaderAdapter(props: ScaffoldHeaderProps) {
  return (
    <PastelPackHeader
      storeName={props.storeName}
      storeSlug={props.storeSlug}
      logoUrl={props.storeLogoUrl}
      categories={props.categories}
    />
  );
}

export function PastelPackFooterAdapter(props: ScaffoldFooterProps) {
  return (
    <PastelPackFooter
      storeName={props.store.name}
      storeSlug={props.store.slug}
    />
  );
}

export function PastelPackStripAdapter(props: ScaffoldStripProps) {
  return (
    <PastelPackAnnouncementStrip
      messageDesktop="พิมพ์โลโก้ฟรี เมื่อสั่งครบ 500 ชิ้น"
      messageMobile="พิมพ์โลโก้ฟรี 500.-"
    />
  );
}

export function PastelPackHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <PastelPackHomepage
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
