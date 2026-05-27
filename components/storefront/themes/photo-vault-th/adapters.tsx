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

import { Header as PhotoVaultHeader } from './chrome/Header';
import { Footer as PhotoVaultFooter } from './chrome/Footer';
import { AnnouncementStrip as PhotoVaultStrip } from './chrome/AnnouncementStrip';
import { Homepage as PhotoVaultHomepage } from './pages/Homepage';
import { About as PhotoVaultAbout } from './pages/About';
import { Help as PhotoVaultHelp } from './pages/Help';

export function PhotoVaultHeaderAdapter(props: ScaffoldHeaderProps) {
  return (
    <PhotoVaultHeader
      storeSlug={props.storeSlug}
      storeName={props.storeName}
      storeLogoUrl={props.storeLogoUrl}
      categories={props.categories ?? []}
    />
  );
}

export function PhotoVaultFooterAdapter(props: ScaffoldFooterProps) {
  return (
    <PhotoVaultFooter
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
        twitterUrl: props.store.twitterUrl,
        messengerUrl: props.store.messengerUrl,
        websiteUrl: props.store.websiteUrl,
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

export function PhotoVaultStripAdapter(props: ScaffoldStripProps) {
  return (
    <PhotoVaultStrip
      storeName={props.storeName}
      message={props.message}
      mobileMessage={props.mobileMessage}
    />
  );
}

export function PhotoVaultHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <PhotoVaultHomepage
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

export function PhotoVaultAboutAdapter(props: ScaffoldAboutProps) {
  return <PhotoVaultAbout store={props.store} />;
}

export function PhotoVaultHelpAdapter(props: ScaffoldHelpProps) {
  return (
    <PhotoVaultHelp
      store={props.store}
      schemaPage={props.schemaPage}
      pageSlug={props.pageSlug}
    />
  );
}

// Page re-exports (default exports — used directly in registry)
export { default as photo_vault_th_Catalog } from './pages/Catalog';
export { default as photo_vault_th_ProductDetail } from './pages/ProductDetail';
export { default as photo_vault_th_Cart } from './pages/Cart';
export { default as photo_vault_th_Checkout } from './pages/Checkout';
export { default as photo_vault_th_Contact } from './pages/Contact';
export { PolicyShell as PhotoVaultPolicyShell } from './PolicyShell';
