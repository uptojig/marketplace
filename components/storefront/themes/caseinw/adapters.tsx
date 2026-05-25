'use client';
import React from 'react';
import type {
  HomepageProps as ScaffoldHomepageProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { Header as CaseinwHeader } from './chrome/Header';
import { Footer as CaseinwFooter } from './chrome/Footer';
import { AnnouncementStrip as CaseinwStrip } from './chrome/AnnouncementStrip';
import { Homepage as CaseinwHomepage } from './pages/Homepage';

export function CaseinwHeaderAdapter(props: ScaffoldHeaderProps) {
  return (
    <CaseinwHeader
      storeSlug={props.storeSlug}
      storeName={props.storeName}
      storeLogoUrl={props.storeLogoUrl}
      categories={props.categories ?? []}
      accent={props.accent}
    />
  );
}

export function CaseinwFooterAdapter(props: ScaffoldFooterProps) {
  return (
    <CaseinwFooter
      store={{
        id: props.store.id,
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
      }}
      categories={props.categories ?? []}
    />
  );
}

export function CaseinwStripAdapter(props: ScaffoldStripProps) {
  return (
    <CaseinwStrip
      storeName={props.storeName}
      message={props.message}
      mobileMessage={props.mobileMessage}
    />
  );
}

export function CaseinwHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <CaseinwHomepage
      store={{
        id: props.store.id,
        name: props.store.name,
        slug: props.store.slug,
        logoUrl: props.store.logoUrl,
        bannerUrl: props.store.bannerUrl ?? null,
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
