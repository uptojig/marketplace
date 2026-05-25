'use client';

/**
 * MotoFog — scaffold → designer Prop adapters.
 *
 * Bridges the storefront scaffold's HeaderProps/HomepageProps/etc.
 * (lib/templates/types.ts) into the MotoFog theme components. All
 * pages are bespoke (not shared-block adapters) because the racing
 * aesthetic needs custom layout & motion.
 */

import React from 'react';
import type {
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
  HomepageProps as ScaffoldHomepageProps,
  CatalogProps as ScaffoldCatalogProps,
  ProductDetailProps as ScaffoldProductDetailProps,
  CartProps as ScaffoldCartProps,
  CheckoutProps as ScaffoldCheckoutProps,
} from '@/lib/templates/types';

import { MotoFogHeader } from './chrome/Header';
import { MotoFogFooter } from './chrome/Footer';
import { MotoFogStrip } from './chrome/AnnouncementStrip';
import { MotoFogHomepage } from './pages/Homepage';
import { MotoFogCatalog } from './pages/Catalog';
import { MotoFogProductDetail } from './pages/ProductDetail';
import { MotoFogCart } from './pages/Cart';
import { MotoFogCheckout } from './pages/Checkout';

export function MotoFogHeaderAdapter(props: ScaffoldHeaderProps) {
  return <MotoFogHeader {...props} />;
}

export function MotoFogFooterAdapter(props: ScaffoldFooterProps) {
  return <MotoFogFooter {...props} />;
}

export function MotoFogStripAdapter(props: ScaffoldStripProps) {
  return <MotoFogStrip {...props} />;
}

export function MotoFogHomepageAdapter(props: ScaffoldHomepageProps) {
  return <MotoFogHomepage {...props} />;
}

export function MotoFogCatalogAdapter(props: ScaffoldCatalogProps) {
  return <MotoFogCatalog {...props} />;
}

export function MotoFogProductDetailAdapter(props: ScaffoldProductDetailProps) {
  return <MotoFogProductDetail {...props} />;
}

export function MotoFogCartAdapter(props: ScaffoldCartProps) {
  return <MotoFogCart {...props} />;
}

export function MotoFogCheckoutAdapter(props: ScaffoldCheckoutProps) {
  return <MotoFogCheckout {...props} />;
}

// Per-route page re-exports (matching trailcraft-outdoors convention).
export { default as motofog_Homepage } from './pages/Homepage';
export { default as motofog_Catalog } from './pages/Catalog';
export { default as motofog_ProductDetail } from './pages/ProductDetail';
export { default as motofog_Cart } from './pages/Cart';
export { default as motofog_Checkout } from './pages/Checkout';
