'use client';

/**
 * sheetlab-formula — Theme adapters
 *
 * The chrome + Homepage components in this theme take nested-`store`
 * prop shapes for ergonomics. The scaffold contract in
 * `lib/templates/types.ts` exposes a different (flatter) shape on
 * the chrome side. These adapters repack scaffold props into the
 * local component shapes so the registry can wire them up cleanly.
 *
 * The Catalog + ProductDetail pages already consume the canonical
 * scaffold types directly, so they're re-exported with the
 * snake_case prefix that the registry expects.
 */

import React from 'react';
import type {
  HomepageProps as ScaffoldHomepageProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { SheetlabFormulaHeader } from './chrome/Header';
import { SheetlabFormulaFooter } from './chrome/Footer';
import { SheetlabFormulaStrip } from './chrome/AnnouncementStrip';
import { SheetlabFormulaHomepage } from './pages/Homepage';

export function SheetlabFormulaHeaderAdapter(props: ScaffoldHeaderProps) {
  return (
    <SheetlabFormulaHeader
      store={{
        name: props.storeName,
        slug: props.storeSlug,
        logoUrl: props.storeLogoUrl,
      }}
      categories={props.categories}
    />
  );
}

export function SheetlabFormulaFooterAdapter(props: ScaffoldFooterProps) {
  return <SheetlabFormulaFooter {...props} />;
}

export function SheetlabFormulaStripAdapter(props: ScaffoldStripProps) {
  return <SheetlabFormulaStrip {...props} />;
}

export function SheetlabFormulaHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <SheetlabFormulaHomepage
      store={{
        id: props.store.id,
        name: props.store.name,
        slug: props.store.slug,
        logoUrl: props.store.logoUrl ?? null,
      }}
      products={props.products.map((p) => ({
        id: p.id,
        title: p.title,
        priceTHB: p.priceTHB,
        compareAtPriceTHB: p.compareAtPriceTHB ?? null,
        imageUrl: p.imageUrl ?? null,
        categoryName: p.categoryName ?? null,
      }))}
      categories={(props.categories ?? []).map((name) => {
        const count = props.products.filter((p) => p.categoryName === name).length;
        return { id: name, name, count };
      })}
      landingContent={props.landingContent ?? null}
    />
  );
}

// Page re-exports — the registry imports these by the snake_case
// `<themeId>_<PageName>` naming convention. Cart + Checkout intentionally
// not authored; the standard marketplace flows handle them.
export { default as sheetlab_formula_Catalog } from './pages/Catalog';
export { default as sheetlab_formula_ProductDetail } from './pages/ProductDetail';
