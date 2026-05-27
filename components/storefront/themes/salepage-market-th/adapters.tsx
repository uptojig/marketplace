'use client';

import React from 'react';

import { Header as SalepageMarketHeader } from './chrome/Header';
import { Footer as SalepageMarketFooter } from './chrome/Footer';
import { AnnouncementStrip as SalepageMarketStrip } from './chrome/AnnouncementStrip';
import { Homepage as SalepageMarketHomepage } from './pages/Homepage';
import { About as SalepageMarketAbout } from './pages/About';
import { Help as SalepageMarketHelp } from './pages/Help';

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

export function SalepageMarketHeaderAdapter(props: AdapterHeaderProps) {
  return (
    <SalepageMarketHeader
      storeSlug={props.storeSlug}
      storeName={props.storeName}
      storeLogoUrl={props.storeLogoUrl}
      categories={props.categories ?? []}
    />
  );
}

export function SalepageMarketFooterAdapter(props: AdapterFooterProps) {
  return (
    <SalepageMarketFooter
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

export function SalepageMarketStripAdapter(props: AdapterStripProps) {
  return (
    <SalepageMarketStrip
      storeName={props.storeName}
      message={props.message}
      mobileMessage={props.mobileMessage}
    />
  );
}

export function SalepageMarketHomepageAdapter(props: AdapterHomepageProps) {
  return (
    <SalepageMarketHomepage
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

export function SalepageMarketAboutAdapter(props: AdapterAboutProps) {
  return <SalepageMarketAbout store={props.store} />;
}

export function SalepageMarketHelpAdapter(props: AdapterHelpProps) {
  return (
    <SalepageMarketHelp
      store={props.store}
      schemaPage={props.schemaPage}
      pageSlug={props.pageSlug}
    />
  );
}

// Page re-exports (default exports — used directly in registry)
export { default as salepage_market_th_Catalog } from './pages/Catalog';
export { default as salepage_market_th_ProductDetail } from './pages/ProductDetail';
export { default as salepage_market_th_Cart } from './pages/Cart';
export { default as salepage_market_th_Checkout } from './pages/Checkout';
export { default as salepage_market_th_Contact } from './pages/Contact';
export { SalepageMarketPolicyShell } from './PolicyShell';
