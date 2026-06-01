'use client';
import React from 'react';
import type {
  HomepageProps as ScaffoldHomepageProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { Header as SmsupHeader } from './chrome/Header';
import { Footer as SmsupFooter } from './chrome/Footer';
import { AnnouncementStrip as SmsupStrip } from './chrome/AnnouncementStrip';
import { Homepage as SmsupHomepage } from './pages/Homepage';

export function SmsupPlusHeaderAdapter(props: ScaffoldHeaderProps) {
  return (
    <SmsupHeader
      storeSlug={props.storeSlug}
      storeName={props.storeName}
      storeLogoUrl={props.storeLogoUrl}
      categories={props.categories ?? []}
      accent={props.accent}
    />
  );
}

export function SmsupPlusFooterAdapter(props: ScaffoldFooterProps) {
  return (
    <SmsupFooter
      store={{
        name: props.store.name,
        slug: props.store.slug,
        facebookUrl: props.store.facebookUrl,
        instagramUrl: props.store.instagramUrl,
        twitterUrl: props.store.twitterUrl,
      }}
      categories={props.categories ?? []}
      accent={props.accent}
    />
  );
}

export function SmsupPlusStripAdapter(props: ScaffoldStripProps) {
  return <SmsupStrip storeName={props.storeName} />;
}

export function SmsupPlusHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <SmsupHomepage
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

export { default as smsup_plus_th_Catalog } from './pages/Catalog';
export { default as smsup_plus_th_ProductDetail } from './pages/ProductDetail';
export { default as smsup_plus_th_Cart } from './pages/Cart';
export { default as smsup_plus_th_Checkout } from './pages/Checkout';
