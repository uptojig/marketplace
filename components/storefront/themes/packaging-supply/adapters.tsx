'use client';

/**
 * Packaging Supply — scaffold → designer Prop adapters.
 *
 * The bespoke chrome + 5 pages in this theme expose their own Prop
 * shapes (designer-friendly, deduped, with URL strings pre-built).
 * The marketplace scaffold passes us the canonical shapes from
 * `lib/templates/types.ts`. These thin wrappers translate one to the
 * other so `lib/templates/registry.ts` can wire the theme up with
 * zero touch to per-route page dispatchers.
 *
 * Cart + Checkout are intentionally pass-through — they read
 * `useCart()` client-side themselves (cart state lives in zustand on
 * the browser, not in the SSR props).
 */

import React from 'react';
import { useCart } from '@/lib/store/cart';
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

import { Header as PackagingSupplyHeader } from './chrome/Header';
import { Footer as PackagingSupplyFooter } from './chrome/Footer';
import { AnnouncementStrip as PackagingSupplyStrip } from './chrome/AnnouncementStrip';
import { Homepage as PackagingSupplyHomepage } from './pages/Homepage';
import { Catalog as PackagingSupplyCatalog } from './pages/Catalog';
import { ProductDetail as PackagingSupplyProductDetail } from './pages/ProductDetail';
import { Cart as PackagingSupplyCart } from './pages/Cart';
import { Checkout as PackagingSupplyCheckout } from './pages/Checkout';

// ── URL helpers ────────────────────────────────────────────────────
function storeUrls(slug: string) {
  const base = `/stores/${slug}`;
  return {
    home: base,
    shop: `${base}/category`,
    cart: `${base}/cart`,
    checkout: `${base}/checkout/address`,
    bulk: `${base}/category?cat=${encodeURIComponent('ขายส่ง')}`,
  };
}

// ── Chrome adapters ────────────────────────────────────────────────

export function PackagingSupplyHeaderAdapter(props: ScaffoldHeaderProps) {
  const urls = storeUrls(props.storeSlug);
  const cartCount = useCart((s) =>
    s.lines
      .filter((l) => l.storeSlug === props.storeSlug)
      .reduce((n, l) => n + l.qty, 0),
  );
  return (
    <PackagingSupplyHeader
      storeName={props.storeName}
      storeLogoUrl={props.storeLogoUrl}
      homeUrl={urls.home}
      shopUrl={urls.shop}
      cartUrl={urls.cart}
      bulkUrl={urls.bulk}
      categories={props.categories ?? []}
      cartCount={cartCount}
    />
  );
}

export function PackagingSupplyFooterAdapter(props: ScaffoldFooterProps) {
  return (
    <PackagingSupplyFooter
      storeName={props.store.name}
      storeSlug={props.store.slug}
      description={props.store.description}
      contactEmail={props.store.contactEmail}
      contactPhone={props.store.contactPhone}
      addressLine1={props.store.addressLine1}
      addressLine2={props.store.addressLine2}
      province={props.store.province}
      facebookUrl={props.store.facebookUrl}
      instagramUrl={props.store.instagramUrl}
      lineId={props.store.lineId}
      categories={props.categories ?? []}
    />
  );
}

export function PackagingSupplyStripAdapter(props: ScaffoldStripProps) {
  const messages: string[] = [];
  if (props.message) messages.push(props.message);
  return <PackagingSupplyStrip messages={messages.length > 0 ? messages : undefined} />;
}

// ── Page adapters ──────────────────────────────────────────────────

export function PackagingSupplyHomepageAdapter(props: ScaffoldHomepageProps) {
  return (
    <PackagingSupplyHomepage
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

export function PackagingSupplyCatalogAdapter(props: ScaffoldCatalogProps) {
  return (
    <PackagingSupplyCatalog
      store={{
        id: props.store.id,
        name: props.store.name,
        slug: props.store.slug,
        logoUrl: props.store.logoUrl,
      }}
      products={props.pageProducts.map((p) => ({
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

export function PackagingSupplyProductDetailAdapter(props: ScaffoldProductDetailProps) {
  return (
    <PackagingSupplyProductDetail
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

export function PackagingSupplyCartAdapter(props: ScaffoldCartProps) {
  return (
    <PackagingSupplyCart
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

export function PackagingSupplyCheckoutAdapter(props: ScaffoldCheckoutProps) {
  return (
    <PackagingSupplyCheckout
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

// ── Page re-exports for legacy named-import compatibility ──────────
export { Homepage as PackagingSupplyHomepage } from './pages/Homepage';
export { Catalog as PackagingSupplyCatalog } from './pages/Catalog';
export { ProductDetail as PackagingSupplyProductDetail } from './pages/ProductDetail';
export { Cart as PackagingSupplyCart } from './pages/Cart';
export { Checkout as PackagingSupplyCheckout } from './pages/Checkout';
