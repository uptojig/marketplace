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

import { Header as OmnipackHeader } from './chrome/Header';
import { Footer as OmnipackFooter } from './chrome/Footer';
import { AnnouncementStrip as OmnipackStrip } from './chrome/AnnouncementStrip';
import { Homepage as OmnipackHomepage } from './pages/Homepage';
import { About as OmnipackAbout } from './pages/About';
import { Help as OmnipackHelp } from './pages/Help';

export function OmnipackHeaderAdapter(props: ScaffoldHeaderProps) {
  return (
    <OmnipackHeader
      storeSlug={props.storeSlug}
      storeName={props.storeName}
      storeLogoUrl={props.storeLogoUrl}
      categories={props.categories ?? []}
    />
  );
}

export function OmnipackFooterAdapter(props: ScaffoldFooterProps) {
  return (
    <OmnipackFooter
      store={props.store}
      categories={props.categories ?? []}
      availableSupportPages={props.availableSupportPages ?? []}
    />
  );
}

export function OmnipackStripAdapter(props: ScaffoldStripProps) {
  return (
    <OmnipackStrip
      storeName={props.storeName}
      message={props.message}
      mobileMessage={props.mobileMessage}
    />
  );
}

export function OmnipackHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <OmnipackHomepage
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

export function OmnipackAboutAdapter(props: ScaffoldAboutProps) {
  return <OmnipackAbout store={props.store} />;
}

export function OmnipackHelpAdapter(props: ScaffoldHelpProps) {
  return (
    <OmnipackHelp
      store={props.store}
      schemaPage={props.schemaPage}
      pageSlug={props.pageSlug}
    />
  );
}

// Page re-exports (default exports — used directly in registry)
export { default as omnipack_Catalog } from './pages/Catalog';
export { default as omnipack_ProductDetail } from './pages/ProductDetail';
export { default as omnipack_Cart } from './pages/Cart';
export { default as omnipack_Checkout } from './pages/Checkout';
export { default as omnipack_Contact } from './pages/Contact';
export { OmnipackPolicyShell } from './PolicyShell';
