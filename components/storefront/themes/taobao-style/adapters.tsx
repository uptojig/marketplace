'use client';
/**
 * taobao-style — scaffold→designer Prop adapters.
 *
 * The downstream registry entry plugs these wrappers in via
 * `chrome.Header`, `chrome.Footer`, `chrome.AnnouncementStrip` and the
 * `pages.{home,catalog,pdp,cart,checkout}` slots. Each wrapper takes
 * the scaffold's canonical Props shape from `lib/templates/types.ts`
 * and forwards a slimmed/translated set of fields to the bespoke
 * component.
 *
 * Wiring into `lib/templates/registry.ts` happens after the batch
 * agents merge (per CLAUDE.md "don't touch the registry from a theme
 * agent"). The exports here intentionally mirror the talad-see-sod
 * naming convention so downstream wiring is symmetrical.
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

import { Header as TaobaoStyleHeader } from './chrome/Header';
import { Footer as TaobaoStyleFooter } from './chrome/Footer';
import { AnnouncementStrip as TaobaoStyleStrip } from './chrome/AnnouncementStrip';
import { Homepage as TaobaoStyleHomepage } from './pages/Homepage';
import { Catalog as TaobaoStyleCatalog } from './pages/Catalog';
import { ProductDetail as TaobaoStyleProductDetail } from './pages/ProductDetail';
import { Cart as TaobaoStyleCart } from './pages/Cart';
import { Checkout as TaobaoStyleCheckout } from './pages/Checkout';

// ── Chrome ─────────────────────────────────────────────────────────

export function TaobaoStyleHeaderAdapter(props: ScaffoldHeaderProps) {
  return (
    <TaobaoStyleHeader
      storeSlug={props.storeSlug}
      storeName={props.storeName}
      storeLogoUrl={props.storeLogoUrl}
      categories={props.categories ?? []}
    />
  );
}

export function TaobaoStyleFooterAdapter(props: ScaffoldFooterProps) {
  return (
    <TaobaoStyleFooter
      store={{
        name: props.store.name,
        slug: props.store.slug,
        logoUrl: props.store.logoUrl ?? null,
        contactEmail: props.store.contactEmail ?? null,
        contactPhone: props.store.contactPhone ?? null,
        lineId: props.store.lineId ?? null,
        addressLine1: props.store.addressLine1 ?? null,
        addressLine2: props.store.addressLine2 ?? null,
        subdistrict: props.store.subdistrict ?? null,
        district: props.store.district ?? null,
        province: props.store.province ?? null,
        postalCode: props.store.postalCode ?? null,
        country: props.store.country ?? null,
      }}
      categories={props.categories ?? []}
    />
  );
}

export function TaobaoStyleStripAdapter(props: ScaffoldStripProps) {
  return (
    <TaobaoStyleStrip storeName={props.storeName} message={props.message} />
  );
}

// ── Pages ──────────────────────────────────────────────────────────

export function TaobaoStyleHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <TaobaoStyleHomepage
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

export function TaobaoStyleCatalogAdapter(props: ScaffoldCatalogProps) {
  return (
    <TaobaoStyleCatalog
      store={{
        id: props.store.id,
        name: props.store.name,
        slug: props.store.slug,
        logoUrl: props.store.logoUrl,
      }}
      pageProducts={props.pageProducts.map((p) => ({
        id: p.id,
        title: p.title,
        priceTHB: p.priceTHB,
        compareAtPriceTHB: p.compareAtPriceTHB ?? null,
        imageUrl: p.imageUrl ?? null,
        categoryName: p.categoryName ?? null,
      }))}
      categoryNames={props.categoryNames}
      categoryCounts={props.categoryCounts}
      selectedCats={props.selectedCats}
      sortKey={props.sortKey}
      currentPage={props.currentPage}
      totalPages={props.totalPages}
      filteredCount={props.filteredCount}
      buildUrl={props.buildUrl}
      buildSortUrl={props.buildSortUrl}
    />
  );
}

export function TaobaoStyleProductDetailAdapter(props: ScaffoldProductDetailProps) {
  return (
    <TaobaoStyleProductDetail
      store={{
        id: props.store.id,
        name: props.store.name,
        slug: props.store.slug,
        logoUrl: props.store.logoUrl,
      }}
      product={{
        id: props.product.id,
        title: props.product.title,
        description: props.product.description ?? null,
        priceTHB: props.product.priceTHB,
        originalPriceTHB: props.product.originalPriceTHB ?? null,
        imageUrl: props.product.imageUrl ?? null,
        images: props.product.images,
        variants: props.product.variants.map((v) => ({
          id: v.id,
          attributes: v.attributes,
          colorLabel: v.colorLabel ?? null,
          sizeLabel: v.sizeLabel ?? null,
          materialLabel: v.materialLabel ?? null,
          priceTHB: v.priceTHB,
          imageUrl: v.imageUrl ?? null,
          inventory: v.inventory,
        })),
        stockLeft: props.product.stockLeft ?? null,
        videoUrl: props.product.videoUrl ?? null,
        categoryName: props.product.categoryName ?? null,
      }}
      related={props.related.map((r) => ({
        id: r.id,
        title: r.title,
        priceTHB: r.priceTHB,
        compareAtPriceTHB: r.compareAtPriceTHB ?? null,
        imageUrl: r.imageUrl ?? null,
        categoryName: r.categoryName ?? null,
      }))}
    />
  );
}

export function TaobaoStyleCartAdapter(props: ScaffoldCartProps) {
  return (
    <TaobaoStyleCart
      store={{
        id: props.store.id,
        name: props.store.name,
        slug: props.store.slug,
        logoUrl: props.store.logoUrl,
      }}
      items={props.items.map((l) => ({
        productId: l.productId,
        title: l.title,
        imageUrl: l.imageUrl ?? null,
        priceTHB: l.priceTHB,
        qty: l.qty,
        storeSlug: l.storeSlug,
      }))}
      freeShippingThreshold={props.freeShippingThreshold}
      flatShippingTHB={props.flatShippingTHB}
    />
  );
}

export function TaobaoStyleCheckoutAdapter(props: ScaffoldCheckoutProps) {
  return (
    <TaobaoStyleCheckout
      store={{
        id: props.store.id,
        name: props.store.name,
        slug: props.store.slug,
        logoUrl: props.store.logoUrl,
      }}
      items={props.items.map((l) => ({
        productId: l.productId,
        title: l.title,
        imageUrl: l.imageUrl ?? null,
        priceTHB: l.priceTHB,
        qty: l.qty,
        storeSlug: l.storeSlug,
      }))}
    />
  );
}

// ── Page re-exports (registry sometimes wires `pages.<route>` to a
// default export instead of a named adapter; mirror the talad-see-sod
// pattern so either style works downstream) ─────────────────────────

export { default as taobao_style_Homepage } from './pages/Homepage';
export { default as taobao_style_Catalog } from './pages/Catalog';
export { default as taobao_style_ProductDetail } from './pages/ProductDetail';
export { default as taobao_style_Cart } from './pages/Cart';
export { default as taobao_style_Checkout } from './pages/Checkout';
