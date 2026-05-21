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
  return (
    <SalukiFooter 
      storeSlug={props.store.slug}
      storeName={props.store.name}
      tagline="เสื้อผ้าโยคะและพีลาทิส ผลิตจากผ้ารีไซเคิล"
    />
  );
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
      categories={props.categories}
    />
  );
}
