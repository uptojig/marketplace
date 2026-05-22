'use client';
import React from 'react';
import type {
  HomepageProps as ScaffoldHomepageProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { Header as TaladSeeSodHeader } from './chrome/Header';
import { Footer as TaladSeeSodFooter } from './chrome/Footer';
import { Homepage as TaladSeeSodHomepage } from './pages/Homepage';
import { TaladSeeSodTrending } from './sections/Trending';

export function TaladSeeSodHeaderAdapter(props: ScaffoldHeaderProps) {
  return (
    <TaladSeeSodHeader
      storeSlug={props.storeSlug}
      storeName={props.storeName}
      storeLogoUrl={props.storeLogoUrl}
      categories={props.categories ?? []}
    />
  );
}

export function TaladSeeSodFooterAdapter(props: ScaffoldFooterProps) {
  return (
    <TaladSeeSodFooter
      store={{
        name: props.store.name,
        slug: props.store.slug,
        logoUrl: props.store.logoUrl,
        description: props.store.description,
        tagline: props.store.tagline,
        contactEmail: props.store.contactEmail,
        contactPhone: props.store.contactPhone,
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

const DEFAULT_TALAD_ANNOUNCEMENT =
  'ส่งฟรีเมื่อช้อปครบ ฿199.- · ร้านแนะนำของแท้ 100%';

export function TaladSeeSodStripAdapter(props: ScaffoldStripProps) {
  const message = props.message?.trim() || DEFAULT_TALAD_ANNOUNCEMENT;
  const mobileMessage = props.mobileMessage?.trim() || message;
  return (
    <div className="bg-gradient-to-r from-[#dc2626] to-[#f97316] text-white text-xs font-bold py-2 px-4 text-center tracking-wider uppercase font-[family:var(--font-kanit)]">
      <span className="hidden sm:inline">{message}</span>
      <span className="sm:hidden">{mobileMessage}</span>
    </div>
  );
}

export function TaladSeeSodHomepageAdapter(props: ScaffoldHomepageProps) {
  const products = props.products.map((p) => ({
    id: p.id,
    title: p.title,
    priceTHB: p.priceTHB,
    compareAtPriceTHB: p.compareAtPriceTHB ?? null,
    imageUrl: p.imageUrl ?? null,
    categoryName: p.categoryName ?? null,
  }));
  return (
    <>
      <TaladSeeSodHomepage
        store={{
          id: props.store.id,
          name: props.store.name,
          slug: props.store.slug,
          logoUrl: props.store.logoUrl,
        }}
        products={products}
        categories={props.categories}
        landingContent={props.landingContent ?? null}
      />
      <TaladSeeSodTrending
        store={{ slug: props.store.slug, name: props.store.name }}
        products={products}
      />
    </>
  );
}

// Page re-exports
export { default as talad_see_sod_Catalog } from './pages/Catalog';
export { default as talad_see_sod_ProductDetail } from './pages/ProductDetail';
export { default as talad_see_sod_Cart } from './pages/Cart';
export { default as talad_see_sod_Checkout } from './pages/Checkout';
