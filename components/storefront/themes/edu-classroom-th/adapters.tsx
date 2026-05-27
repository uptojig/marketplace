'use client';
import React from 'react';
import type {
  HomepageProps as ScaffoldHomepageProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { Header as EduClassroomHeader } from './chrome/Header';
import { Footer as EduClassroomFooter } from './chrome/Footer';
import { Homepage as EduClassroomHomepage } from './pages/Homepage';

export function EduClassroomHeaderAdapter(props: ScaffoldHeaderProps) {
  return (
    <EduClassroomHeader
      storeSlug={props.storeSlug}
      storeName={props.storeName}
      storeLogoUrl={props.storeLogoUrl}
      categories={props.categories ?? []}
    />
  );
}

export function EduClassroomFooterAdapter(props: ScaffoldFooterProps) {
  return (
    <EduClassroomFooter
      store={{
        name: props.store.name,
        slug: props.store.slug,
      }}
      categories={props.categories ?? []}
    />
  );
}

// EduClassroom embeds its always-on "ดาวน์โหลดทันที" announcement strip
// directly into the Header. The scaffold-level strip slot stays null
// to avoid double-stacking; operators who want the rotating strip
// active should swap this for `AnnouncementStrip` from `./chrome`.
export function EduClassroomStripAdapter(_props: ScaffoldStripProps) {
  return null;
}

export function EduClassroomHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <EduClassroomHomepage
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

// Page re-exports — let the dispatcher import the bespoke pages lazily.
// Every page below is hand-written; none of them go through any of the
// shared catalog/pdp/cart/checkout adapter helpers (the bespoke spec
// forbids that indirection).
export { default as edu_classroom_th_Catalog } from './pages/Catalog';
export { default as edu_classroom_th_ProductDetail } from './pages/ProductDetail';
export { default as edu_classroom_th_Cart } from './pages/Cart';
export { default as edu_classroom_th_Checkout } from './pages/Checkout';
export { default as edu_classroom_th_About } from './pages/About';
export { default as edu_classroom_th_Help } from './pages/Help';
export { default as edu_classroom_th_Contact } from './pages/Contact';
