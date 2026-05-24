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

import { Header as MotofogHeader } from './chrome/Header';
import { Footer as MotofogFooter } from './chrome/Footer';
import { AnnouncementStrip as MotofogStrip } from './chrome/AnnouncementStrip';
import { Homepage as MotofogHomepage } from './pages/Homepage';
import { About as MotofogAbout } from './pages/About';
import { Help as MotofogHelp } from './pages/Help';

export function MotofogHeaderAdapter(props: ScaffoldHeaderProps) {
  return (
    <MotofogHeader
      storeSlug={props.storeSlug}
      storeName={props.storeName}
      storeLogoUrl={props.storeLogoUrl}
      categories={props.categories ?? []}
    />
  );
}

export function MotofogFooterAdapter(props: ScaffoldFooterProps) {
  return (
    <MotofogFooter
      store={props.store}
      categories={props.categories ?? []}
      availableSupportPages={props.availableSupportPages ?? []}
    />
  );
}

export function MotofogStripAdapter(props: ScaffoldStripProps) {
  return (
    <MotofogStrip
      storeName={props.storeName}
      message={props.message}
      mobileMessage={props.mobileMessage}
    />
  );
}

export function MotofogHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <MotofogHomepage
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

export function MotofogAboutAdapter(props: ScaffoldAboutProps) {
  return <MotofogAbout store={props.store} />;
}

export function MotofogHelpAdapter(props: ScaffoldHelpProps) {
  return (
    <MotofogHelp
      store={props.store}
      schemaPage={props.schemaPage}
      pageSlug={props.pageSlug}
    />
  );
}

// Page re-exports (default exports — used directly in registry)
export { default as motofog_Catalog } from './pages/Catalog';
export { default as motofog_ProductDetail } from './pages/ProductDetail';
export { default as motofog_Cart } from './pages/Cart';
export { default as motofog_Checkout } from './pages/Checkout';
export { default as motofog_Contact } from './pages/Contact';
export { MotofogPolicyShell } from './PolicyShell';
