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

import { Header as NotionMartHeader } from './chrome/Header';
import { Footer as NotionMartFooter } from './chrome/Footer';
import { AnnouncementStrip as NotionMartStrip } from './chrome/AnnouncementStrip';
import { Homepage as NotionMartHomepage } from './pages/Homepage';
import { About as NotionMartAbout } from './pages/About';
import { Help as NotionMartHelp } from './pages/Help';

export function NotionMartHeaderAdapter(props: ScaffoldHeaderProps) {
  return (
    <NotionMartHeader
      storeSlug={props.storeSlug}
      storeName={props.storeName}
      storeLogoUrl={props.storeLogoUrl}
      categories={props.categories ?? []}
    />
  );
}

export function NotionMartFooterAdapter(props: ScaffoldFooterProps) {
  return (
    <NotionMartFooter
      store={props.store}
      categories={props.categories ?? []}
      availableSupportPages={props.availableSupportPages ?? []}
    />
  );
}

export function NotionMartStripAdapter(props: ScaffoldStripProps) {
  return (
    <NotionMartStrip
      storeName={props.storeName}
      message={props.message}
      mobileMessage={props.mobileMessage}
    />
  );
}

export function NotionMartHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <NotionMartHomepage
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
      landingContent={
        props.landingContent
          ? {
              heroHeadline: props.landingContent.heroHeadline ?? null,
              heroSubheadline: props.landingContent.heroSubheadline ?? null,
              heroCtaLabel: props.landingContent.heroCtaLabel ?? null,
              heroCtaUrl: props.landingContent.heroCtaUrl ?? null,
              heroImageUrl: props.landingContent.heroImageUrl ?? null,
              brandStory: null,
            }
          : null
      }
    />
  );
}

export function NotionMartAboutAdapter(props: ScaffoldAboutProps) {
  return <NotionMartAbout store={props.store} />;
}

export function NotionMartHelpAdapter(props: ScaffoldHelpProps) {
  return (
    <NotionMartHelp
      store={props.store}
      schemaPage={props.schemaPage}
      pageSlug={props.pageSlug}
    />
  );
}

export { default as notion_mart_th_Catalog } from './pages/Catalog';
export { default as notion_mart_th_ProductDetail } from './pages/ProductDetail';
export { default as notion_mart_th_Cart } from './pages/Cart';
export { default as notion_mart_th_Checkout } from './pages/Checkout';
export { default as notion_mart_th_Contact } from './pages/Contact';
export { NotionMartPolicyShell } from './PolicyShell';
