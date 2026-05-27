'use client';

import React from 'react';

import { Header as PromptHubHeader } from './chrome/Header';
import { Footer as PromptHubFooter } from './chrome/Footer';
import { AnnouncementStrip as PromptHubStrip } from './chrome/AnnouncementStrip';
import { Homepage as PromptHubHomepage } from './pages/Homepage';
import { About as PromptHubAbout } from './pages/About';
import { Help as PromptHubHelp } from './pages/Help';

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

export function PromptHubHeaderAdapter(props: AdapterHeaderProps) {
  return (
    <PromptHubHeader
      storeSlug={props.storeSlug}
      storeName={props.storeName}
      storeLogoUrl={props.storeLogoUrl}
      categories={props.categories ?? []}
    />
  );
}

export function PromptHubFooterAdapter(props: AdapterFooterProps) {
  return (
    <PromptHubFooter
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

export function PromptHubStripAdapter(props: AdapterStripProps) {
  return (
    <PromptHubStrip
      storeName={props.storeName}
      message={props.message}
      mobileMessage={props.mobileMessage}
    />
  );
}

export function PromptHubHomepageAdapter(props: AdapterHomepageProps) {
  return (
    <PromptHubHomepage
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

export function PromptHubAboutAdapter(props: AdapterAboutProps) {
  return <PromptHubAbout store={props.store} />;
}

export function PromptHubHelpAdapter(props: AdapterHelpProps) {
  return (
    <PromptHubHelp
      store={props.store}
      schemaPage={props.schemaPage}
      pageSlug={props.pageSlug}
    />
  );
}

// Page re-exports (default exports — used directly in registry)
export { default as prompt_hub_th_Catalog } from './pages/Catalog';
export { default as prompt_hub_th_ProductDetail } from './pages/ProductDetail';
export { default as prompt_hub_th_Cart } from './pages/Cart';
export { default as prompt_hub_th_Checkout } from './pages/Checkout';
export { default as prompt_hub_th_Contact } from './pages/Contact';
export { PolicyShell as PromptHubPolicyShell } from './PolicyShell';
