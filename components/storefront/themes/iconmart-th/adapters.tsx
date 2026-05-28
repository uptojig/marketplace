'use client';

/**
 * iconmart-th — Theme adapters
 *
 * The chrome + Homepage components in this theme take nested-`store`
 * prop shapes for ergonomics (mirroring sheetlab-formula). These
 * adapters repack the flatter scaffold props from
 * `lib/templates/types.ts` into the local component shapes so the
 * registry can wire them up cleanly.
 *
 * No bespoke Catalog / PDP / Cart / Checkout pages are authored here —
 * the standard marketplace flows handle those. When such pages are added
 * later, re-export each as `iconmart_th_<PageName>` following the
 * snake_case convention the registry expects.
 */

import React from 'react';
import type {
  HomepageProps as ScaffoldHomepageProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { IconMartHeader } from './chrome/Header';
import { IconMartFooter } from './chrome/Footer';
import { IconMartStrip } from './chrome/AnnouncementStrip';
import { IconMartHomepage } from './pages/Homepage';

export function IconMartHeaderAdapter(props: ScaffoldHeaderProps) {
  return (
    <IconMartHeader
      store={{
        name: props.storeName,
        slug: props.storeSlug,
        logoUrl: props.storeLogoUrl,
      }}
      categories={props.categories}
    />
  );
}

export function IconMartFooterAdapter(props: ScaffoldFooterProps) {
  return <IconMartFooter {...props} />;
}

export function IconMartStripAdapter(props: ScaffoldStripProps) {
  return <IconMartStrip {...props} />;
}

export function IconMartHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <IconMartHomepage
      store={{
        id: props.store.id,
        name: props.store.name,
        slug: props.store.slug,
        logoUrl: props.store.logoUrl ?? null,
        bannerUrl: props.store.bannerUrl ?? null,
      }}
      products={props.products.map((p) => ({
        id: p.id,
        title: p.title,
        priceTHB: p.priceTHB,
        compareAtPriceTHB: p.compareAtPriceTHB ?? null,
        imageUrl: p.imageUrl ?? null,
        categoryName: p.categoryName ?? null,
      }))}
      categories={(props.categories ?? []).map((name) => ({ id: name, name }))}
      landingContent={props.landingContent ?? null}
    />
  );
}
