'use client';
import React from 'react';
import type {
  HomepageProps as ScaffoldHomepageProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { SalukiHeader } from './chrome/Header';
import { SalukiFooter } from './chrome/Footer';
import { SalukiStrip } from './chrome/AnnouncementStrip';
import { SalukiHomepage } from './pages/Homepage';

export function SalukiYogaHeaderAdapter(props: ScaffoldHeaderProps) {
  return (
    <SalukiHeader 
      storeSlug={props.storeSlug}
      storeName={props.storeName}
      logoUrl={props.storeLogoUrl ?? null}
    />
  );
}

export function SalukiYogaFooterAdapter(props: ScaffoldFooterProps) {
  return <SalukiFooter store={props.store} />;
}

export function SalukiYogaStripAdapter(props: ScaffoldStripProps) {
  return (
    <SalukiStrip 
      desktopText="ทุกชุดทำจากขวดน้ำพลาสติก 18 ขวด ลดขยะลงทะเล"
      mobileText="18 ขวดต่อชุด"
    />
  );
}

export function SalukiYogaHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <SalukiHomepage
      store={{
        id: props.store.id,
        name: props.store.name,
        slug: props.store.slug,
        logoUrl: props.store.logoUrl ?? null,
      }}
      products={props.products.map((p) => ({
        id: p.id,
        title: p.title,
        priceTHB: p.priceTHB,
        compareAtPriceTHB: p.compareAtPriceTHB ?? null,
        imageUrl: p.imageUrl ?? null,
        categoryName: p.categoryName ?? null,
      }))}
      categories={(props.categories ?? []).map((name) => ({ id: name, name }))}
    />
  );
}

// Page re-exports
export { default as saluki_yoga_Catalog } from './pages/Catalog';
export { default as saluki_yoga_ProductDetail } from './pages/ProductDetail';
export { default as saluki_yoga_Cart } from './pages/Cart';
export { default as saluki_yoga_Checkout } from './pages/Checkout';
