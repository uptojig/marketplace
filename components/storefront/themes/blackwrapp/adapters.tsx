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

import { Header as BlackwrappHeader } from './chrome/Header';
import { Footer as BlackwrappFooter } from './chrome/Footer';
import { AnnouncementStrip as BlackwrappStrip } from './chrome/AnnouncementStrip';
import { Homepage as BlackwrappHomepage } from './pages/Homepage';
import { About as BlackwrappAbout } from './pages/About';
import { Help as BlackwrappHelp } from './pages/Help';

export function BlackwrappHeaderAdapter(props: ScaffoldHeaderProps) {
  return (
    <BlackwrappHeader
      storeSlug={props.storeSlug}
      storeName={props.storeName}
      storeLogoUrl={props.storeLogoUrl}
      categories={props.categories ?? []}
    />
  );
}

export function BlackwrappFooterAdapter(props: ScaffoldFooterProps) {
  return (
    <BlackwrappFooter
      store={props.store}
      categories={props.categories ?? []}
      availableSupportPages={props.availableSupportPages ?? []}
    />
  );
}

export function BlackwrappStripAdapter(props: ScaffoldStripProps) {
  return (
    <BlackwrappStrip
      storeName={props.storeName}
      message={props.message}
      mobileMessage={props.mobileMessage}
    />
  );
}

export function BlackwrappHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <BlackwrappHomepage
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

export function BlackwrappAboutAdapter(props: ScaffoldAboutProps) {
  return <BlackwrappAbout store={props.store} />;
}

export function BlackwrappHelpAdapter(props: ScaffoldHelpProps) {
  return (
    <BlackwrappHelp
      store={props.store}
      schemaPage={props.schemaPage}
      pageSlug={props.pageSlug}
    />
  );
}

// Page re-exports (default exports — used directly in registry)
export { default as blackwrapp_Catalog } from './pages/Catalog';
export { default as blackwrapp_ProductDetail } from './pages/ProductDetail';
export { default as blackwrapp_Cart } from './pages/Cart';
export { default as blackwrapp_Checkout } from './pages/Checkout';
export { default as blackwrapp_Contact } from './pages/Contact';
export { BlackwrappPolicyShell } from './PolicyShell';
