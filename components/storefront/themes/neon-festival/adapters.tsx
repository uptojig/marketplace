'use client';

import React from 'react';

import { Header as NeonFestivalHeader } from './chrome/Header';
import { Footer as NeonFestivalFooter } from './chrome/Footer';
import { AnnouncementStrip as NeonFestivalStrip } from './chrome/AnnouncementStrip';
import { Homepage as NeonFestivalHomepage } from './pages/Homepage';
import { About as NeonFestivalAbout } from './pages/About';
import { Help as NeonFestivalHelp } from './pages/Help';

type AdapterHeaderProps = {
  storeSlug: string;
  storeName: string;
  storeLogoUrl?: string | null;
  categories?: string[];
};

type AdapterFooterProps = {
  store: {
    id: string;
    slug: string;
    name: string;
    description?: string | null;
    tagline?: string | null;
    logoUrl?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    facebookUrl?: string | null;
    instagramUrl?: string | null;
    lineId?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    subdistrict?: string | null;
    district?: string | null;
    province?: string | null;
    postalCode?: string | null;
    country?: string | null;
  };
  categories?: string[];
  availableSupportPages?: string[];
};

type AdapterStripProps = {
  storeName: string;
  message?: string;
  mobileMessage?: string;
};

interface ProductCard {
  id: string;
  title: string;
  imageUrl?: string | null;
  priceTHB: number;
  compareAtPriceTHB?: number | null;
  categoryName?: string | null;
}

type AdapterHomepageProps = {
  store: { id: string; name: string; slug: string; logoUrl?: string | null };
  products: ProductCard[];
  categories: string[];
  landingContent?: {
    heroHeadline?: string | null;
    heroSubheadline?: string | null;
    heroCtaLabel?: string | null;
    heroCtaUrl?: string | null;
    heroImageUrl?: string | null;
  } | null;
};

type AdapterAboutProps = {
  store: {
    id: string;
    slug: string;
    name: string;
    logoUrl?: string | null;
    description?: string | null;
    tagline?: string | null;
  };
};

type AdapterHelpProps = {
  store: {
    id: string;
    slug: string;
    name: string;
    logoUrl?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    lineId?: string | null;
  };
  schemaPage?: unknown;
  pageSlug?: string;
};

export function NeonFestivalHeaderAdapter(props: AdapterHeaderProps) {
  return (
    <NeonFestivalHeader
      storeSlug={props.storeSlug}
      storeName={props.storeName}
      storeLogoUrl={props.storeLogoUrl}
      categories={props.categories ?? []}
    />
  );
}

export function NeonFestivalFooterAdapter(props: AdapterFooterProps) {
  return (
    <NeonFestivalFooter
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

export function NeonFestivalStripAdapter(props: AdapterStripProps) {
  return (
    <NeonFestivalStrip
      storeName={props.storeName}
      message={props.message}
      mobileMessage={props.mobileMessage}
    />
  );
}

export function NeonFestivalHomepageAdapter(props: AdapterHomepageProps) {
  return (
    <NeonFestivalHomepage
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

export function NeonFestivalAboutAdapter(props: AdapterAboutProps) {
  return <NeonFestivalAbout store={props.store} />;
}

export function NeonFestivalHelpAdapter(props: AdapterHelpProps) {
  return (
    <NeonFestivalHelp
      store={props.store}
      schemaPage={props.schemaPage}
      pageSlug={props.pageSlug}
    />
  );
}

// Page re-exports (default exports — used directly in registry)
export { default as neon_festival_Catalog } from './pages/Catalog';
export { default as neon_festival_ProductDetail } from './pages/ProductDetail';
export { default as neon_festival_Cart } from './pages/Cart';
export { default as neon_festival_Checkout } from './pages/Checkout';
export { default as neon_festival_Contact } from './pages/Contact';
export { PolicyShell as NeonFestivalPolicyShell } from './PolicyShell';
