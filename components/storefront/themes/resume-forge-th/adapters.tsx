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

import { Header as ResumeForgeHeader } from './chrome/Header';
import { Footer as ResumeForgeFooter } from './chrome/Footer';
import { AnnouncementStrip as ResumeForgeStrip } from './chrome/AnnouncementStrip';
import { Homepage as ResumeForgeHomepage } from './pages/Homepage';
import { About as ResumeForgeAbout } from './pages/About';
import { Help as ResumeForgeHelp } from './pages/Help';

export function ResumeForgeHeaderAdapter(props: ScaffoldHeaderProps) {
  return (
    <ResumeForgeHeader
      storeSlug={props.storeSlug}
      storeName={props.storeName}
      storeLogoUrl={props.storeLogoUrl}
      categories={props.categories ?? []}
    />
  );
}

export function ResumeForgeFooterAdapter(props: ScaffoldFooterProps) {
  return (
    <ResumeForgeFooter
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

export function ResumeForgeStripAdapter(props: ScaffoldStripProps) {
  return (
    <ResumeForgeStrip
      storeName={props.storeName}
      message={props.message}
      mobileMessage={props.mobileMessage}
    />
  );
}

export function ResumeForgeHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <ResumeForgeHomepage
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

export function ResumeForgeAboutAdapter(props: ScaffoldAboutProps) {
  return <ResumeForgeAbout store={props.store} />;
}

export function ResumeForgeHelpAdapter(props: ScaffoldHelpProps) {
  return (
    <ResumeForgeHelp
      store={props.store}
      schemaPage={props.schemaPage}
      pageSlug={props.pageSlug}
    />
  );
}

// Default-export page re-exports (used directly in registry)
export { default as resume_forge_th_Catalog } from './pages/Catalog';
export { default as resume_forge_th_ProductDetail } from './pages/ProductDetail';
export { default as resume_forge_th_Cart } from './pages/Cart';
export { default as resume_forge_th_Checkout } from './pages/Checkout';
export { default as resume_forge_th_Contact } from './pages/Contact';
export { PolicyShell as ResumeForgePolicyShell } from './PolicyShell';
