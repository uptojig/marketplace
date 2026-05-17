'use client';

/**
 * Eco Pack — scaffold→designer Prop adapters.
 *
 * The designer's components have their own Prop shape (`featuredProducts`,
 * `reviews`, `onAddToCart` callbacks, `shopUrl`, `cartUrl`, ...) that
 * doesn't line up 1:1 with the scaffold's `HomepageProps` / `CartProps`
 * etc. from `lib/templates/types.ts`. These small wrappers translate
 * scaffold Props → designer Props so the per-store route dispatchers
 * can hand the registry entry exactly what they already provide and
 * the designer's bespoke pages render.
 *
 * Cart is a client adapter that reads `useCart()` to seed items +
 * handlers — server-side the dispatcher always passes `items=[]` since
 * cart state lives in zustand on the browser.
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
  AboutProps as ScaffoldAboutProps,
  HelpProps as ScaffoldHelpProps,
  HeaderProps as ScaffoldHeaderProps,
  FooterProps as ScaffoldFooterProps,
  AnnouncementStripProps as ScaffoldStripProps,
} from '@/lib/templates/types';

import { Header as EcoHeader } from './chrome/Header';
import { Footer as EcoFooter } from './chrome/Footer';
import { AnnouncementStrip as EcoStrip } from './chrome/AnnouncementStrip';
import { Homepage as EcoHomepage } from './pages/Homepage';
import { Catalog as EcoCatalog } from './pages/Catalog';
import { ProductDetail as EcoProductDetail } from './pages/ProductDetail';
import { Cart as EcoCart } from './pages/Cart';
import { Checkout as EcoCheckout } from './pages/Checkout';
import { About as EcoAbout } from './pages/About';
import { Help as EcoHelp } from './pages/Help';

// ── URL helpers ────────────────────────────────────────────────────
function storeUrls(slug: string) {
  const base = `/stores/${slug}`;
  return {
    home: base,
    shop: `${base}/category`,
    cart: `${base}/cart`,
    checkout: `${base}/checkout/address`,
    products: `${base}/products`,
  };
}

// ── Chrome ─────────────────────────────────────────────────────────

export function EcoPackHeaderAdapter(props: ScaffoldHeaderProps) {
  const urls = storeUrls(props.storeSlug);
  const cartCount = useCart((s) =>
    s.lines.filter((l) => l.storeSlug === props.storeSlug)
      .reduce((n, l) => n + l.qty, 0),
  );
  const navItems = (props.categories ?? []).slice(0, 6).map((c) => ({
    label: c,
    url: `${urls.shop}?cat=${encodeURIComponent(c)}`,
  }));
  return (
    <EcoHeader
      logoUrl={props.storeLogoUrl ?? undefined}
      storeName={props.storeName}
      navItems={navItems}
      cartCount={cartCount}
      onSearch={() => {}}
      onSignIn={() => {}}
      homeUrl={urls.home}
      cartUrl={urls.cart}
    />
  );
}

export function EcoPackFooterAdapter(props: ScaffoldFooterProps) {
  const urls = storeUrls(props.store.slug);
  const socialLinks: { platform: string; url: string }[] = [];
  if (props.store.facebookUrl) socialLinks.push({ platform: 'Facebook', url: props.store.facebookUrl });
  if (props.store.instagramUrl) socialLinks.push({ platform: 'Instagram', url: props.store.instagramUrl });
  if (props.store.twitterUrl) socialLinks.push({ platform: 'Twitter', url: props.store.twitterUrl });

  const navColumns = [
    {
      title: 'Shop',
      links: (props.categories ?? []).slice(0, 5).map((c) => ({
        label: c,
        url: `${urls.shop}?cat=${encodeURIComponent(c)}`,
      })),
    },
    {
      title: 'Help',
      links: [
        { label: 'FAQ', url: `/stores/${props.store.slug}/faq` },
        { label: 'Shipping', url: `/stores/${props.store.slug}/shipping` },
        { label: 'Returns', url: `/stores/${props.store.slug}/returns` },
      ],
    },
    {
      title: 'About',
      links: [
        { label: 'Our Story', url: `/stores/${props.store.slug}/about` },
        { label: 'Contact', url: `/stores/${props.store.slug}/help` },
      ],
    },
  ];

  return (
    <EcoFooter
      storeName={props.store.name}
      navColumns={navColumns}
      paymentMethods={['VISA', 'Mastercard', 'PromptPay', 'COD']}
      socialLinks={socialLinks}
    />
  );
}

export function EcoPackStripAdapter(_props: ScaffoldStripProps) {
  return (
    <EcoStrip
      messages={[
        'ส่งฟรีทั่วประเทศเมื่อสั่งครบ ฿990',
        'บรรจุภัณฑ์รักษ์โลก 100% รีไซเคิลได้',
      ]}
      rotateMs={5000}
    />
  );
}

// ── Pages ──────────────────────────────────────────────────────────

export function EcoPackHomepageAdapter(props: ScaffoldHomepageProps) {
  const urls = storeUrls(props.store.slug);
  return (
    <EcoHomepage
      store={{ name: props.store.name }}
      featuredProducts={props.products.slice(0, 8).map((p) => ({
        slug: p.id,
        name: p.title,
        image: p.imageUrl ?? undefined,
        price: p.priceTHB,
      }))}
      categories={props.categories.map((c) => ({
        id: c,
        name: c,
        slug: c,
      }))}
      reviews={[]}
      shopUrl={urls.shop}
      cartUrl={urls.cart}
    />
  );
}

export function EcoPackCatalogAdapter(props: ScaffoldCatalogProps) {
  const urls = storeUrls(props.store.slug);

  // Designer's Catalog has its own filter UI; we route filter clicks
  // back to the scaffold's buildUrl helper via window.location.
  const filters = [
    {
      label: 'Categories',
      key: 'cat',
      options: props.categoryNames.map((c) => ({
        label: `${c} (${props.categoryCounts[c] ?? 0})`,
        value: c,
      })),
    },
  ];

  const sortOptions = [
    { label: 'Recommended', value: 'recommended' },
    { label: 'Newest', value: 'newest' },
    { label: 'Price ↑', value: 'price-asc' },
    { label: 'Price ↓', value: 'price-desc' },
  ];

  return (
    <EcoCatalog
      products={props.pageProducts.map((p) => ({
        slug: p.id,
        name: p.title,
        image: p.imageUrl ?? undefined,
        category: p.categoryName ?? '',
        price: p.priceTHB,
      }))}
      filters={filters}
      activeFilters={{ cat: props.selectedCats }}
      sortOptions={sortOptions}
      pagination={{ currentPage: props.currentPage, totalPages: props.totalPages }}
      onFilterChange={(_key, value) => {
        if (typeof window !== 'undefined') {
          window.location.href = props.buildUrl(value);
        }
      }}
      shopUrl={urls.products}
    />
  );
}

export function EcoPackProductDetailAdapter(props: ScaffoldProductDetailProps) {
  const urls = storeUrls(props.store.slug);
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(50);

  return (
    <EcoProductDetail
      product={{
        id: props.product.id,
        name: props.product.title,
        price: props.product.priceTHB,
        images: props.product.imageUrl
          ? [props.product.imageUrl, ...props.product.images.filter((i) => i !== props.product.imageUrl)]
          : props.product.images,
      }}
      relatedProducts={props.related.map((r) => ({
        id: r.id,
        name: r.title,
        price: r.priceTHB,
        images: r.imageUrl ? [r.imageUrl] : [],
      }))}
      reviews={[]}
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
      onSelectColor={() => {}}
      onSelectSize={() => {}}
      qty={qty}
      onChangeQty={setQty}
      homeUrl={urls.home}
      shopUrl={urls.products}
    />
  );
}

export function EcoPackCartAdapter(props: ScaffoldCartProps) {
  const urls = storeUrls(props.store.slug);
  const allLines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const removeItem = useCart((s) => s.remove);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const lines = allLines.filter((l) => l.storeSlug === props.store.slug);
  const items = lines.map((l) => ({
    id: l.productId,
    productId: l.productId,
    name: l.title,
    price: l.priceTHB,
    qty: l.qty,
    image: l.imageUrl,
  }));
  const subtotal = lines.reduce((n, l) => n + l.priceTHB * l.qty, 0);

  if (!mounted) {
    return <div className="min-h-[60vh]" />;
  }

  return (
    <EcoCart
      items={items}
      freeShippingThreshold={props.freeShippingThreshold ?? 990}
      currentSubtotal={subtotal}
      onUpdateQty={(id, q) => setQty(id, q, props.store.slug)}
      onRemove={(id) => removeItem(id, props.store.slug)}
      onApplyPromo={() => {}}
      shopUrl={urls.shop}
      checkoutUrl={urls.checkout}
    />
  );
}

export function EcoPackCheckoutAdapter(props: ScaffoldCheckoutProps) {
  const urls = storeUrls(props.store.slug);
  const router = useRouter();
  const allLines = useCart((s) => s.lines);

  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  useEffect(() => setMounted(true), []);

  const lines = allLines.filter((l) => l.storeSlug === props.store.slug);
  const items = lines.map((l) => ({
    name: l.title,
    qty: l.qty,
    price: l.priceTHB,
  }));

  if (!mounted) {
    return <div className="min-h-[60vh]" />;
  }

  return (
    <EcoCheckout
      items={items}
      shippingOptions={[
        { label: 'Standard', time: '2-3 days', price: 50 },
        { label: 'Express', time: '1 day', price: 120 },
      ]}
      paymentMethods={[
        { id: 'card', name: 'Credit Card' },
        { id: 'promptpay', name: 'PromptPay' },
        { id: 'cod', name: 'COD' },
      ]}
      currentStep={step}
      onSubmitStep={(s) => {
        if (s < 3) setStep(s + 1);
        else router.push(urls.home);
      }}
      shopUrl={urls.shop}
    />
  );
}

export function EcoPackAboutAdapter(props: ScaffoldAboutProps) {
  return (
    <EcoAbout
      store={{ name: props.store.name, description: props.store.description ?? undefined }}
      stats={[
        { label: 'Happy clients', value: '10k+' },
        { label: 'Trees saved', value: '5k' },
        { label: 'Products shipped', value: '120k' },
        { label: 'Years operating', value: '6' },
      ]}
      values={[
        { title: 'Recyclable', description: '100% recyclable kraft paper, FSC-certified.' },
        { title: 'Crafted', description: 'Hand-finished mailers + boxes for premium feel.' },
        { title: 'Sustainable', description: 'Carbon-neutral production from day one.' },
      ]}
      teamMembers={[]}
      sustainability={props.store.description ?? ''}
    />
  );
}

export function EcoPackHelpAdapter(_props: ScaffoldHelpProps) {
  return (
    <EcoHelp
      contactChannels={[
        { type: 'email', value: 'support@ecopack.co' },
        { type: 'phone', value: '02-000-0000' },
      ]}
      faqs={[
        { question: 'How long does shipping take?', answer: '2-3 business days nationwide via Kerry / Flash.' },
        { question: 'Can I get a custom print on my boxes?', answer: 'Yes, MOQ 500 boxes for custom prints. Contact us via the form.' },
        { question: 'What materials are used?', answer: '100% recycled kraft paper + soy-based ink. Fully biodegradable.' },
        { question: 'Do you ship internationally?', answer: 'Currently Thailand-only. International shipping coming Q3.' },
      ]}
      onSubmitContact={(e) => {
        e.preventDefault();
      }}
    />
  );
}
