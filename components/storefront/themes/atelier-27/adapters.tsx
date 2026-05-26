'use client';
import React from 'react';
import type {
  HomepageProps as ScaffoldHomepageProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { Header as Atelier27Header } from './chrome/Header';
import { Footer as Atelier27Footer } from './chrome/Footer';
import { AnnouncementStrip as Atelier27Strip } from './chrome/AnnouncementStrip';
import { Homepage as Atelier27Homepage } from './pages/Homepage';

export function Atelier27HeaderAdapter(props: ScaffoldHeaderProps) {
  return (
    <Atelier27Header
      storeSlug={props.storeSlug}
      storeName={props.storeName}
      storeLogoUrl={props.storeLogoUrl}
      categories={props.categories ?? []}
      accent={props.accent}
    />
  );
}

export function Atelier27FooterAdapter(props: ScaffoldFooterProps) {
  return (
    <Atelier27Footer
      store={{
        name: props.store.name,
        slug: props.store.slug,
        logoUrl: props.store.logoUrl,
        description: props.store.description,
        tagline: props.store.tagline,
        facebookUrl: props.store.facebookUrl,
        instagramUrl: props.store.instagramUrl,
        twitterUrl: props.store.twitterUrl,
        addressLine1: props.store.addressLine1,
        addressLine2: props.store.addressLine2,
        subdistrict: props.store.subdistrict,
        district: props.store.district,
        province: props.store.province,
        postalCode: props.store.postalCode,
      }}
      categories={props.categories ?? []}
      accent={props.accent}
    />
  );
}

export function Atelier27StripAdapter(props: ScaffoldStripProps) {
  return <Atelier27Strip storeName={props.storeName} />;
}

export function Atelier27HomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <Atelier27Homepage
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

// Page re-exports
export { default as atelier_27_Catalog } from './pages/Catalog';
export { default as atelier_27_ProductDetail } from './pages/ProductDetail';
export { default as atelier_27_Cart } from './pages/Cart';
export { default as atelier_27_Checkout } from './pages/Checkout';
