'use client';
import React from 'react';
import type {
  HomepageProps as ScaffoldHomepageProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { Header as BlackwrappHeader } from './chrome/Header';
import { Footer as BlackwrappFooter } from './chrome/Footer';
import { AnnouncementStrip as BlackwrappStrip } from './chrome/AnnouncementStrip';
import { Homepage as BlackwrappHomepage } from './pages/Homepage';

export function BlackwrappHeaderAdapter(props: ScaffoldHeaderProps) {
  return (
    <BlackwrappHeader
      storeSlug={props.storeSlug}
      storeName={props.storeName}
      storeLogoUrl={props.storeLogoUrl}
      categories={props.categories ?? []}
      accent={props.accent}
    />
  );
}

export function BlackwrappFooterAdapter(props: ScaffoldFooterProps) {
  return (
    <BlackwrappFooter
      store={{
        id: props.store.id,
        name: props.store.name,
        slug: props.store.slug,
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
      }}
      categories={props.categories ?? []}
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
    />
  );
}

// Page re-exports (default exports — used directly in registry)
export { default as blackwrapp_Catalog } from './pages/Catalog';
export { default as blackwrapp_ProductDetail } from './pages/ProductDetail';
export { default as blackwrapp_Cart } from './pages/Cart';
export { default as blackwrapp_Checkout } from './pages/Checkout';
