'use client';

/**
 * Bikini Beach — scaffold→designer Prop adapters.
 *
 * The BIKINI551 designer's components (`./pages/Homepage`, `./pages/
 * Cart`, …) have their own bespoke Prop shapes (`featuredProducts`,
 * `reviews`, `onAddToCart` callbacks, `shopUrl`, `lookbookUrl`, …)
 * that don't line up 1:1 with the scaffold's `HomepageProps` /
 * `CartProps` / etc. from `lib/templates/types.ts`. These small
 * wrappers translate scaffold Props → designer Props so the per-store
 * route dispatchers can hand the registry entry exactly what they
 * already provide and the designer's bespoke pages render.
 *
 * Cart + Checkout are client adapters that read `useCart()` to seed
 * items + handlers — server-side the dispatcher always passes
 * `items=[]` since cart state lives in zustand on the browser.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/store/cart';
import type {
  HomepageProps as ScaffoldHomepageProps,
  CatalogProps as ScaffoldCatalogProps,
  ProductDetailProps as ScaffoldProductDetailProps,
  CartProps as ScaffoldCartProps,
  CheckoutProps as ScaffoldCheckoutProps,
  LookbookProps as ScaffoldLookbookProps,
  AboutProps as ScaffoldAboutProps,
  HelpProps as ScaffoldHelpProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { Header as BikiniHeader } from './chrome/Header';
import { Footer as BikiniFooter } from './chrome/Footer';
import { AnnouncementStrip as BikiniStrip } from './chrome/AnnouncementStrip';
import { Homepage as BikiniHomepage } from './pages/Homepage';
import { Catalog as BikiniCatalog } from './pages/Catalog';
import { ProductDetail as BikiniProductDetail } from './pages/ProductDetail';
import { Cart as BikiniCart } from './pages/Cart';
// Bespoke Cart page (scaffold-CartProps shape) exported under the
// `<theme>_Cart` snake-case convention so the registry can wire it
// into the `cart` slot. Lives alongside the original designer `Cart`
// named export (which BikiniCartAdapter below still consumes).
export { default as bikini_beach_Cart } from './pages/Cart';
import { Checkout as BikiniCheckout } from './pages/Checkout';
import { Lookbook as BikiniLookbook } from './pages/Lookbook';
import { About as BikiniAbout } from './pages/About';
import { Help as BikiniHelp } from './pages/Help';

// ── URL helpers ────────────────────────────────────────────────────
// Mirror of eco-pack's `storeUrls`. Lookbook is new — bikini-beach is
// the first template that ships a dedicated lookbook page, so we add
// a new `lookbook` slot here. `termsUrl` is top-level marketplace-wide
// (NOT per-store) — passes through to the bikini-551 Checkout footer.
function storeUrls(slug: string) {
  const base = `/stores/${slug}`;
  return {
    home: base,
    shop: `${base}/category`,
    cart: `${base}/cart`,
    checkout: `${base}/checkout`,
    products: `${base}/products`,
    lookbook: `${base}/lookbook`,
    terms: '/terms',
  };
}

// ── Chrome ─────────────────────────────────────────────────────────

export function BikiniHeaderAdapter(props: ScaffoldHeaderProps) {
  const urls = storeUrls(props.storeSlug);
  const cartCount = useCart((s) =>
    s.lines.filter((l) => l.storeSlug === props.storeSlug)
      .reduce((n, l) => n + l.qty, 0),
  );
  const navItems = (props.categories ?? []).slice(0, 5).map((c) => ({
    label: c.toUpperCase(),
    href: `${urls.shop}?cat=${encodeURIComponent(c)}`,
  }));
  // Always surface the bespoke Lookbook entry — bikini-beach is one
  // of the few templates that ships an editorial Lookbook route.
  navItems.push({ label: 'LOOKBOOK', href: urls.lookbook });
  return (
    <BikiniHeader
      logoUrl={props.storeLogoUrl ?? undefined}
      storeName={props.storeName}
      navItems={navItems}
      cartCount={cartCount}
      onSearch={() => {}}
      onSignIn={() => {}}
      homeUrl={urls.home}
      cartHref={urls.cart}
    />
  );
}

export function BikiniFooterAdapter(props: ScaffoldFooterProps) {
  const urls = storeUrls(props.store.slug);
  const socialLinks: { network: string; href: string }[] = [];
  if (props.store.instagramUrl) socialLinks.push({ network: 'instagram', href: props.store.instagramUrl });
  if (props.store.facebookUrl) socialLinks.push({ network: 'facebook', href: props.store.facebookUrl });
  if (props.store.twitterUrl) socialLinks.push({ network: 'tiktok', href: props.store.twitterUrl });

  const navColumns = [
    {
      heading: 'Shop',
      links: (props.categories ?? []).slice(0, 6).map((c) => ({
        label: c,
        href: `${urls.shop}?cat=${encodeURIComponent(c)}`,
      })),
    },
    {
      heading: 'Help',
      links: [
        { label: 'Size Guide', href: `/stores/${props.store.slug}/help/size-guide` },
        { label: 'Shipping', href: `/stores/${props.store.slug}/shipping` },
        { label: 'Returns', href: `/stores/${props.store.slug}/returns` },
        { label: 'FAQ', href: `/stores/${props.store.slug}/faq` },
      ],
    },
    {
      heading: 'Brand',
      links: [
        { label: 'Our Story', href: `/stores/${props.store.slug}/about` },
        { label: 'Lookbook', href: urls.lookbook },
      ],
    },
  ];

  return (
    <BikiniFooter
      storeName={props.store.name}
      storeLogoUrl={props.store.logoUrl ?? undefined}
      tagline={props.store.description ?? props.store.tagline ?? undefined}
      navColumns={navColumns}
      paymentMethods={['Thai QR PromptPay']}
      socialLinks={socialLinks}
      contact={{
        line: props.store.lineId ?? undefined,
        email: props.store.contactEmail ?? undefined,
        phone: props.store.contactPhone ?? undefined,
        address:
          [
            props.store.addressLine1,
            props.store.addressLine2,
            props.store.subdistrict,
            props.store.district,
            props.store.province,
            props.store.postalCode,
          ]
            .filter(Boolean)
            .join(' ') || undefined,
      }}
      bottomLinks={[
        { label: 'Privacy', href: '/privacy' },
        { label: 'Terms', href: urls.terms },
      ]}
    />
  );
}

export function BikiniStripAdapter(_props: ScaffoldStripProps) {
  return <BikiniStrip rotateMs={5000} />;
}

// ── Pages ──────────────────────────────────────────────────────────

export function BikiniHomepageAdapter(props: ScaffoldHomepageProps) {
  const urls = storeUrls(props.store.slug);
  // Cycle the eight bg variants over the featured grid so each
  // product card gets a different pastel background.
  const BG_VARIANTS = ['bg-rose', 'bg-sky', 'bg-yellow', 'bg-orange', 'bg-blue', 'bg-green', 'bg-purple', 'bg-coral'];
  return (
    <BikiniHomepage
      store={{ name: props.store.name, tagline: props.store.tagline ?? undefined }}
      featuredProducts={props.products.slice(0, 8).map((p, i) => ({
        id: p.id,
        slug: p.id,
        name: p.title,
        price: p.priceTHB,
        was: p.compareAtPriceTHB ?? undefined,
        bgVariant: BG_VARIANTS[i % BG_VARIANTS.length],
      }))}
      shopUrl={urls.shop}
      lookbookUrl={urls.lookbook}
    />
  );
}

export function BikiniCatalogAdapter(props: ScaffoldCatalogProps) {
  const urls = storeUrls(props.store.slug);

  const filters = [
    {
      key: 'cat',
      label: 'Category',
      type: 'checkbox' as const,
      options: props.categoryNames.map((c) => ({
        value: c,
        label: c,
        count: props.categoryCounts[c] ?? 0,
      })),
    },
  ];

  const sortOptions = [
    { value: 'newest', label: 'ใหม่ล่าสุด' },
    { value: 'price-asc', label: 'ราคา ต่ำ-สูง' },
    { value: 'price-desc', label: 'ราคา สูง-ต่ำ' },
  ];

  return (
    <BikiniCatalog
      title={props.store.name}
      lead={`${props.filteredCount} สไตล์ · พร้อมส่ง`}
      products={props.pageProducts.map((p) => ({
        id: p.id,
        slug: p.id,
        name: p.title,
        price: p.priceTHB,
        was: p.compareAtPriceTHB ?? undefined,
      }))}
      filters={filters}
      activeFilters={{ cat: props.selectedCats }}
      sortOptions={sortOptions}
      currentSort={props.sortKey}
      pagination={{
        page: props.currentPage,
        totalPages: props.totalPages,
        total: props.filteredCount,
        pageSize: 12,
      }}
      onFilterChange={(_key, value) => {
        if (typeof window !== 'undefined') {
          window.location.href = props.buildUrl(value);
        }
      }}
      onSortChange={(s) => {
        if (typeof window !== 'undefined') {
          window.location.href = props.buildSortUrl(s);
        }
      }}
      onPageChange={(p) => {
        if (typeof window !== 'undefined') {
          window.location.href = props.buildUrl(undefined, p);
        }
      }}
      homeUrl={urls.home}
      shopUrl={urls.shop}
    />
  );
}

export function BikiniProductDetailAdapter(props: ScaffoldProductDetailProps) {
  const urls = storeUrls(props.store.slug);
  const add = useCart((s) => s.add);
  const router = useRouter();
  const [qty, setQty] = useState(1);

  return (
    <BikiniProductDetail
      product={{
        id: props.product.id,
        slug: props.product.id,
        name: props.product.title,
        desc: props.product.description ?? undefined,
        description: props.product.description ?? undefined,
        price: props.product.priceTHB,
        was: props.product.originalPriceTHB ?? undefined,
        bgVariant: 'bg-rose',
      }}
      relatedProducts={props.related.map((r) => ({
        id: r.id,
        slug: r.id,
        name: r.title,
        price: r.priceTHB,
        was: r.compareAtPriceTHB ?? undefined,
      }))}
      reviews={[]}
      qty={qty}
      onChangeQty={setQty}
      onSelectColor={() => {}}
      onSelectSize={() => {}}
      onAddToCart={() => {
        add(
          {
            productId: props.product.id,
            title: props.product.title,
            imageUrl: props.product.imageUrl ?? undefined,
            priceTHB: props.product.priceTHB,
            storeSlug: props.store.slug,
            storeName: props.store.name,
          },
          qty,
        );
      }}
      onBuyNow={() => {
        add(
          {
            productId: props.product.id,
            title: props.product.title,
            imageUrl: props.product.imageUrl ?? undefined,
            priceTHB: props.product.priceTHB,
            storeSlug: props.store.slug,
            storeName: props.store.name,
          },
          qty,
        );
        router.push(urls.checkout);
      }}
      homeUrl={urls.home}
      shopUrl={urls.shop}
    />
  );
}

export function BikiniCartAdapter(props: ScaffoldCartProps) {
  const urls = storeUrls(props.store.slug);
  const router = useRouter();
  const allLines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const removeItem = useCart((s) => s.remove);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const lines = allLines.filter((l) => l.storeSlug === props.store.slug);
  const items = lines.map((l) => ({
    id: l.productId,
    productId: l.productId,
    slug: l.productId,
    name: l.title,
    variant: '',
    price: l.priceTHB,
    qty: l.qty,
    bgVariant: 'bg-rose',
  }));
  const subtotal = lines.reduce((n, l) => n + l.priceTHB * l.qty, 0);

  if (!mounted) {
    return <div className="min-h-[60vh]" />;
  }

  return (
    <BikiniCart
      items={items}
      freeShippingThreshold={props.freeShippingThreshold ?? 890}
      currentSubtotal={subtotal}
      onUpdateQty={(id, q) => setQty(id, q, props.store.slug)}
      onRemove={(id) => removeItem(id, props.store.slug)}
      onApplyPromo={() => {}}
      onCheckout={() => router.push(urls.checkout)}
      shopUrl={urls.shop}
    />
  );
}

export function BikiniCheckoutAdapter(props: ScaffoldCheckoutProps) {
  const urls = storeUrls(props.store.slug);
  const router = useRouter();
  const allLines = useCart((s) => s.lines);

  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<'address' | 'shipping' | 'payment'>('address');
  useEffect(() => setMounted(true), []);

  const lines = allLines.filter((l) => l.storeSlug === props.store.slug);
  const items = lines.map((l) => ({
    id: l.productId,
    productId: l.productId,
    slug: l.productId,
    name: l.title,
    variant: '',
    price: l.priceTHB,
    qty: l.qty,
    bgVariant: 'bg-rose',
  }));
  const subtotal = lines.reduce((n, l) => n + l.priceTHB * l.qty, 0);

  if (!mounted) {
    return <div className="min-h-[60vh]" />;
  }

  return (
    <BikiniCheckout
      items={items}
      subtotal={subtotal}
      currentStep={step}
      onSubmitStep={(s) => {
        if (s === 'address') setStep('shipping');
        else if (s === 'shipping') setStep('payment');
        else router.push(urls.home);
      }}
      onSelectShipping={() => {}}
      onSelectPayment={() => {}}
      termsUrl={urls.terms}
    />
  );
}

export function BikiniLookbookAdapter(props: ScaffoldLookbookProps) {
  const urls = storeUrls(props.store.slug);
  return (
    <BikiniLookbook
      featuredLookProducts={props.products.slice(0, 4).map((p) => ({
        id: p.id,
        slug: p.id,
        name: p.title,
        price: p.priceTHB,
        was: p.compareAtPriceTHB ?? undefined,
        bgVariant: 'bg-rose',
      }))}
      shopUrl={urls.shop}
    />
  );
}

export function BikiniAboutAdapter(props: ScaffoldAboutProps) {
  const urls = storeUrls(props.store.slug);
  return (
    <BikiniAbout
      store={{
        name: props.store.name,
        tagline: props.store.tagline ?? props.store.description ?? undefined,
      }}
      shopUrl={urls.shop}
      lookbookUrl={urls.lookbook}
    />
  );
}

export function BikiniHelpAdapter(_props: ScaffoldHelpProps) {
  return (
    <BikiniHelp
      onSubmitContact={() => {}}
    />
  );
}
