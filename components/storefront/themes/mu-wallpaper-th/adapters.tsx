'use client';

/**
 * mu-wallpaper-th — Theme adapters
 *
 * The chrome + Homepage components in this theme take nested-`store`
 * prop shapes for ergonomics. The scaffold contract in
 * `lib/templates/types.ts` exposes a different (flatter) shape on the
 * chrome side. These adapters repack scaffold props into the local
 * component shapes so the registry can wire them up cleanly.
 *
 * Mirrors `sheetlab-formula/adapters.tsx`. This module is safe to import
 * from a server module — it only re-exports components; the rendering
 * components that use hooks carry their own `'use client'`.
 */

import React from 'react';
import type {
  HomepageProps as ScaffoldHomepageProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { MuWallpaperHeader } from './chrome/Header';
import { MuWallpaperFooter } from './chrome/Footer';
import { MuWallpaperStrip } from './chrome/AnnouncementStrip';
import { MuWallpaperHomepage } from './pages/Homepage';

export function MuWallpaperHeaderAdapter(props: ScaffoldHeaderProps) {
  return (
    <MuWallpaperHeader
      store={{
        name: props.storeName,
        slug: props.storeSlug,
        logoUrl: props.storeLogoUrl,
      }}
      categories={props.categories}
    />
  );
}

export function MuWallpaperFooterAdapter(props: ScaffoldFooterProps) {
  return <MuWallpaperFooter {...props} />;
}

export function MuWallpaperStripAdapter(props: ScaffoldStripProps) {
  return <MuWallpaperStrip {...props} />;
}

export function MuWallpaperHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <MuWallpaperHomepage
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
