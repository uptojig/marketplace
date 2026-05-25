'use client';

/**
 * OmniPack — scaffold → designer prop adapters.
 *
 * Each adapter accepts the scaffold's generic `*Props` shape (from
 * `lib/templates/types`) and threads the per-store `storeSlug` (plus a
 * few derived helpers) into the bespoke OmniPack components. The
 * scaffold itself never sees the OmniPack-specific extensions.
 */

import React from 'react';
import type {
  HomepageProps as ScaffoldHomepageProps,
  CatalogProps as ScaffoldCatalogProps,
  ProductDetailProps as ScaffoldProductDetailProps,
  CartProps as ScaffoldCartProps,
  CheckoutProps as ScaffoldCheckoutProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { OmnipackHeader } from './chrome/Header';
import { OmnipackFooter } from './chrome/Footer';
import { OmnipackAnnouncementStrip } from './chrome/AnnouncementStrip';
import { OmnipackHomepage } from './pages/Homepage';
import { OmnipackCatalog } from './pages/Catalog';
import { OmnipackProductDetail } from './pages/ProductDetail';
import { OmnipackCart } from './pages/Cart';
import { OmnipackCheckout } from './pages/Checkout';

// ── Chrome adapters ───────────────────────────────────────────────

export function OmnipackHeaderAdapter(props: ScaffoldHeaderProps) {
  return <OmnipackHeader {...props} />;
}

export function OmnipackFooterAdapter(props: ScaffoldFooterProps) {
  return <OmnipackFooter {...props} />;
}

export function OmnipackStripAdapter(props: ScaffoldStripProps) {
  return <OmnipackAnnouncementStrip {...props} />;
}

// ── Page adapters ─────────────────────────────────────────────────

export function OmnipackHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <OmnipackHomepage
      {...props}
      storeSlug={props.store.slug}
      totalProductCount={props.products.length}
    />
  );
}

export function OmnipackCatalogAdapter(props: ScaffoldCatalogProps) {
  return <OmnipackCatalog {...props} storeSlug={props.store.slug} />;
}

export function OmnipackProductDetailAdapter(
  props: ScaffoldProductDetailProps,
) {
  return <OmnipackProductDetail {...props} storeSlug={props.store.slug} />;
}

export function OmnipackCartAdapter(props: ScaffoldCartProps) {
  return <OmnipackCart {...props} storeSlug={props.store.slug} />;
}

export function OmnipackCheckoutAdapter(props: ScaffoldCheckoutProps) {
  return <OmnipackCheckout {...props} storeSlug={props.store.slug} />;
}
