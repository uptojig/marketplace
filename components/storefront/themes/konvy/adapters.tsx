'use client';

import React from 'react';
import type {
  HomepageProps as ScaffoldHomepageProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
  AboutProps as ScaffoldAboutProps,
  HelpProps as ScaffoldHelpProps,
} from '@/lib/templates/types';

import { Header as KonvyHeader } from './chrome/Header';
import { Footer as KonvyFooter } from './chrome/Footer';
import { AnnouncementStrip as KonvyStrip } from './chrome/AnnouncementStrip';
import { Homepage as KonvyHomepage } from './pages/Homepage';
import { About as KonvyAbout } from './pages/About';
import { Help as KonvyHelp } from './pages/Help';

export function KonvyHeaderAdapter(props: ScaffoldHeaderProps) {
  return (
    <KonvyHeader
      storeSlug={props.storeSlug}
      storeName={props.storeName}
      storeLogoUrl={props.storeLogoUrl}
      categories={props.categories ?? []}
    />
  );
}

export function KonvyFooterAdapter(props: ScaffoldFooterProps) {
  return (
    <KonvyFooter
      store={props.store}
      categories={props.categories ?? []}
      availableSupportPages={props.availableSupportPages ?? []}
    />
  );
}

export function KonvyStripAdapter(props: ScaffoldStripProps) {
  return (
    <KonvyStrip
      storeName={props.storeName}
      message={props.message}
      mobileMessage={props.mobileMessage}
    />
  );
}

export function KonvyHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <KonvyHomepage
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
      landingContent={props.landingContent ?? null}
    />
  );
}

export function KonvyAboutAdapter(props: ScaffoldAboutProps) {
  return <KonvyAbout store={props.store} />;
}

export function KonvyHelpAdapter(props: ScaffoldHelpProps) {
  return (
    <KonvyHelp
      store={props.store}
      schemaPage={props.schemaPage}
      pageSlug={props.pageSlug}
    />
  );
}

// Page re-exports (default exports — used directly in registry)
export { default as konvy_Catalog } from './pages/Catalog';
export { default as konvy_ProductDetail } from './pages/ProductDetail';
export { default as konvy_Cart } from './pages/Cart';
export { default as konvy_Checkout } from './pages/Checkout';
export { default as konvy_Contact } from './pages/Contact';
export { KonvyPolicyShell } from './PolicyShell';
