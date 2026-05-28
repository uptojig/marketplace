/**
 * resume-studio-th — Theme adapters
 *
 * The chrome + Homepage components in this theme take nested-`store`
 * prop shapes for ergonomics. The scaffold contract in
 * `lib/templates/types.ts` exposes a different (flatter) shape on the
 * chrome side. These adapters repack scaffold props into the local
 * component shapes so the registry can wire them up cleanly.
 *
 * This module is server-importable: it has NO `'use client'` pragma
 * and contains no hooks. Only the underlying render components
 * (Header / Footer / AnnouncementStrip / Homepage) are client
 * components — they carry their own `'use client'`.
 */

import React from 'react';
import type {
  HomepageProps as ScaffoldHomepageProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { ResumeStudioHeader } from './chrome/Header';
import { ResumeStudioFooter } from './chrome/Footer';
import { ResumeStudioStrip } from './chrome/AnnouncementStrip';
import { ResumeStudioHomepage } from './pages/Homepage';

export function ResumeStudioHeaderAdapter(props: ScaffoldHeaderProps) {
  return (
    <ResumeStudioHeader
      store={{
        name: props.storeName,
        slug: props.storeSlug,
        logoUrl: props.storeLogoUrl,
      }}
      categories={props.categories}
    />
  );
}

export function ResumeStudioFooterAdapter(props: ScaffoldFooterProps) {
  return <ResumeStudioFooter {...props} />;
}

export function ResumeStudioStripAdapter(props: ScaffoldStripProps) {
  return <ResumeStudioStrip {...props} />;
}

export function ResumeStudioHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <ResumeStudioHomepage
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

// Page re-exports — the registry imports bespoke pages by the
// snake_case `<themeId>_<PageName>` naming convention. Only the
// Homepage is authored here; Catalog / ProductDetail / Cart / Checkout
// fall through to the standard marketplace flows.
