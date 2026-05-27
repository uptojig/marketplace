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

import { Header as VectorBazaarHeader } from './chrome/Header';
import { Footer as VectorBazaarFooter } from './chrome/Footer';
import { AnnouncementStrip as VectorBazaarStrip } from './chrome/AnnouncementStrip';
import { Homepage as VectorBazaarHomepage } from './pages/Homepage';
import { About as VectorBazaarAbout } from './pages/About';
import { Help as VectorBazaarHelp } from './pages/Help';

export function VectorBazaarHeaderAdapter(props: ScaffoldHeaderProps) {
  return (
    <VectorBazaarHeader
      storeSlug={props.storeSlug}
      storeName={props.storeName}
      storeLogoUrl={props.storeLogoUrl}
      categories={props.categories ?? []}
    />
  );
}

export function VectorBazaarFooterAdapter(props: ScaffoldFooterProps) {
  return (
    <VectorBazaarFooter
      store={{
        name: props.store.name,
        slug: props.store.slug,
        logoUrl: props.store.logoUrl,
        description: props.store.description,
        tagline: props.store.tagline,
        contactEmail: props.store.contactEmail,
        contactPhone: props.store.contactPhone,
        facebookUrl: props.store.facebookUrl,
        instagramUrl: props.store.instagramUrl,
        lineId: props.store.lineId,
        addressLine1: props.store.addressLine1,
        addressLine2: props.store.addressLine2,
        subdistrict: props.store.subdistrict,
        district: props.store.district,
        province: props.store.province,
        postalCode: props.store.postalCode,
        country: props.store.country,
      }}
      categories={props.categories ?? []}
      availableSupportPages={props.availableSupportPages ?? []}
    />
  );
}

export function VectorBazaarStripAdapter(props: ScaffoldStripProps) {
  return (
    <VectorBazaarStrip
      storeName={props.storeName}
      message={props.message}
      mobileMessage={props.mobileMessage}
    />
  );
}

export function VectorBazaarHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <VectorBazaarHomepage
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

export function VectorBazaarAboutAdapter(props: ScaffoldAboutProps) {
  return <VectorBazaarAbout store={props.store} />;
}

export function VectorBazaarHelpAdapter(props: ScaffoldHelpProps) {
  return (
    <VectorBazaarHelp
      store={props.store}
      schemaPage={props.schemaPage}
      pageSlug={props.pageSlug}
    />
  );
}

// Default-export page re-exports (used directly in registry)
export { default as vector_bazaar_th_Catalog } from './pages/Catalog';
export { default as vector_bazaar_th_ProductDetail } from './pages/ProductDetail';
export { default as vector_bazaar_th_Cart } from './pages/Cart';
export { default as vector_bazaar_th_Checkout } from './pages/Checkout';
export { default as vector_bazaar_th_Contact } from './pages/Contact';
export { PolicyShell as VectorBazaarPolicyShell } from './PolicyShell';
