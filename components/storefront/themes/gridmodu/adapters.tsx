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

import { Header as GridmoduHeader } from './chrome/Header';
import { Footer as GridmoduFooter } from './chrome/Footer';
import { AnnouncementStrip as GridmoduStrip } from './chrome/AnnouncementStrip';
import { Homepage as GridmoduHomepage } from './pages/Homepage';
import { About as GridmoduAbout } from './pages/About';
import { Help as GridmoduHelp } from './pages/Help';

export function GridmoduHeaderAdapter(props: ScaffoldHeaderProps) {
  return (
    <GridmoduHeader
      storeSlug={props.storeSlug}
      storeName={props.storeName}
      storeLogoUrl={props.storeLogoUrl}
      categories={props.categories ?? []}
    />
  );
}

export function GridmoduFooterAdapter(props: ScaffoldFooterProps) {
  return (
    <GridmoduFooter
      store={props.store}
      categories={props.categories ?? []}
      availableSupportPages={props.availableSupportPages ?? []}
    />
  );
}

export function GridmoduStripAdapter(props: ScaffoldStripProps) {
  return (
    <GridmoduStrip
      storeName={props.storeName}
      message={props.message}
      mobileMessage={props.mobileMessage}
    />
  );
}

export function GridmoduHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <GridmoduHomepage
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

export function GridmoduAboutAdapter(props: ScaffoldAboutProps) {
  return <GridmoduAbout store={props.store} />;
}

export function GridmoduHelpAdapter(props: ScaffoldHelpProps) {
  return (
    <GridmoduHelp
      store={props.store}
      schemaPage={props.schemaPage}
      pageSlug={props.pageSlug}
    />
  );
}

// Page re-exports (default exports — used directly in registry)
export { default as gridmodu_Catalog } from './pages/Catalog';
export { default as gridmodu_ProductDetail } from './pages/ProductDetail';
export { default as gridmodu_Cart } from './pages/Cart';
export { default as gridmodu_Checkout } from './pages/Checkout';
export { default as gridmodu_Contact } from './pages/Contact';
export { GridmoduPolicyShell } from './PolicyShell';
