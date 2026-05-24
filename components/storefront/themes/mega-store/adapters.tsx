'use client';

/**
 * Mega Store — scaffold→designer Prop adapters.
 *
 * The designer's Taobao-style components expect their own dense
 * shapes: `flashSales`, `justForYou`, `selectedItemIds`, `storeName`
 * per cart row, `addresses[]` for checkout, etc. These wrappers
 * derive everything from the scaffold's HomepageProps / CartProps /
 * etc. so the per-store dispatcher can pass exactly what it already
 * does and the bespoke pages render.
 *
 * Cart + Checkout are client adapters that read `useCart()` to seed
 * items + handlers — server-side the dispatcher passes `items=[]`
 * because cart state lives in zustand on the browser.
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

import { Header as MegaHeader } from './chrome/Header';
import { Footer as MegaFooter } from './chrome/Footer';
import { AnnouncementStrip as MegaStrip } from './chrome/AnnouncementStrip';
import { Homepage as MegaHomepage } from './pages/Homepage';
import { Catalog as MegaCatalog } from './pages/Catalog';
import { ProductDetail as MegaProductDetail } from './pages/ProductDetail';
import { Cart as MegaCart } from './pages/Cart';
import { Checkout as MegaCheckout } from './pages/Checkout';
import { About as MegaAbout } from './pages/About';
import { Help as MegaHelp } from './pages/Help';

// ── URL helpers ────────────────────────────────────────────────────
function storeUrls(slug: string) {
  const base = `/stores/${slug}`;
  return {
    home: base,
    shop: `${base}/category`,
    cart: `${base}/cart`,
    checkout: `${base}/checkout`,
    products: `${base}/products`,
    account: `${base}/account`,
  };
}

// ── Chrome ─────────────────────────────────────────────────────────

export function MegaStoreHeaderAdapter(props: ScaffoldHeaderProps) {
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
    <MegaHeader
      logoUrl={props.storeLogoUrl ?? undefined}
      storeName={props.storeName}
      navItems={navItems}
      cartCount={cartCount}
      onSearch={() => {}}
      onSignIn={() => {}}
      homeUrl={urls.home}
      cartUrl={urls.cart}
      accountUrl={urls.account}
    />
  );
}

export function MegaStoreFooterAdapter(props: ScaffoldFooterProps) {
  const urls = storeUrls(props.store.slug);
  const socialLinks: { platform: string; url: string }[] = [];
  if (props.store.facebookUrl) socialLinks.push({ platform: 'Facebook', url: props.store.facebookUrl });
  if (props.store.instagramUrl) socialLinks.push({ platform: 'Instagram', url: props.store.instagramUrl });
  if (props.store.twitterUrl) socialLinks.push({ platform: 'Twitter', url: props.store.twitterUrl });

  const navColumns = [
    {
      title: 'หมวดสินค้า',
      links: (props.categories ?? []).slice(0, 5).map((c) => ({
        label: c,
        url: `${urls.shop}?cat=${encodeURIComponent(c)}`,
      })),
    },
    {
      title: 'ช่วยเหลือ',
      links: [
        { label: 'คำถามที่พบบ่อย', url: `/stores/${props.store.slug}/faq` },
        { label: 'การจัดส่ง', url: `/stores/${props.store.slug}/shipping` },
        { label: 'การคืนสินค้า', url: `/stores/${props.store.slug}/returns` },
      ],
    },
    {
      title: 'เกี่ยวกับเรา',
      links: [
        { label: 'เกี่ยวกับ', url: `/stores/${props.store.slug}/about` },
        { label: 'ติดต่อ', url: `/stores/${props.store.slug}/help` },
      ],
    },
  ];

  return (
    <MegaFooter
      storeName={props.store.name}
      navColumns={navColumns}
      paymentMethods={['VISA', 'Mastercard', 'JCB', 'PromptPay', 'TrueMoney']}
      socialLinks={socialLinks}
    />
  );
}

export function MegaStoreStripAdapter(_props: ScaffoldStripProps) {
  return (
    <MegaStrip
      messages={[
        'SUPER BRAND DAY ลดสูงสุด 80%',
        'ส่งฟรีไม่มีขั้นต่ำเฉพาะวันนี้',
        'เก็บโค้ดลดเพิ่ม 20% สำหรับสมาชิกใหม่',
      ]}
      rotateMs={4000}
    />
  );
}

// ── Pages ──────────────────────────────────────────────────────────

export function MegaStoreHomepageAdapter(props: ScaffoldHomepageProps) {
  const urls = storeUrls(props.store.slug);

  // Designer splits products into flashSales (top 6 with originalPrice)
  // and justForYou (remaining). We approximate by using compareAtPrice
  // to populate flashSales and the rest fill justForYou.
  const flashSales = props.products
    .filter((p) => p.compareAtPriceTHB && p.compareAtPriceTHB > p.priceTHB)
    .slice(0, 6)
    .map((p) => ({
      id: p.id,
      name: p.title,
      image: p.imageUrl ?? undefined,
      price: p.priceTHB,
      originalPrice: p.compareAtPriceTHB ?? undefined,
    }));

  const justForYou = props.products.slice(0, 24).map((p) => ({
    id: p.id,
    name: p.title,
    image: p.imageUrl ?? undefined,
    price: p.priceTHB,
    originalPrice: p.compareAtPriceTHB ?? undefined,
  }));

  return (
    <MegaHomepage
      categories={props.categories.map((c) => ({ id: c, name: c }))}
      flashSales={flashSales}
      justForYou={justForYou}
      shopUrl={urls.shop}
      productBaseUrl={urls.products}
    />
  );
}

export function MegaStoreCatalogAdapter(props: ScaffoldCatalogProps) {
  const urls = storeUrls(props.store.slug);

  const filters = [
    {
      label: 'หมวดหมู่',
      key: 'cat',
      options: props.categoryNames.map((c) => ({
        label: `${c} (${props.categoryCounts[c] ?? 0})`,
        value: c,
      })),
    },
  ];

  const sortOptions = [
    { label: 'ยอดนิยม', value: 'recommended' },
    { label: 'ขายดี', value: 'best-seller' },
    { label: 'มาใหม่', value: 'newest' },
    { label: 'ราคา ↑', value: 'price-asc' },
    { label: 'ราคา ↓', value: 'price-desc' },
  ];

  return (
    <MegaCatalog
      products={props.pageProducts.map((p) => ({
        id: p.id,
        name: p.title,
        image: p.imageUrl ?? undefined,
        price: p.priceTHB,
        originalPrice: p.compareAtPriceTHB ?? undefined,
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
      productBaseUrl={urls.products}
    />
  );
}

export function MegaStoreProductDetailAdapter(props: ScaffoldProductDetailProps) {
  const urls = storeUrls(props.store.slug);
  const router = useRouter();
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);

  const handleAdd = () => {
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
  };

  return (
    <MegaProductDetail
      product={{
        id: props.product.id,
        name: props.product.title,
        price: props.product.priceTHB,
        originalPrice: props.product.originalPriceTHB ?? undefined,
        images: props.product.imageUrl
          ? [props.product.imageUrl, ...props.product.images.filter((i) => i !== props.product.imageUrl)]
          : props.product.images,
        soldCount: 0,
        rating: 4.9,
        reviewCount: 0,
      }}
      storeConfig={{
        name: props.store.name,
        followerCount: '1.2k',
        isOfficial: false,
      }}
      onAddToCart={handleAdd}
      onBuyNow={() => {
        handleAdd();
        router.push(urls.cart);
      }}
      qty={qty}
      onChangeQty={setQty}
      homeUrl={urls.home}
      shopUrl={urls.shop}
    />
  );
}

export function MegaStoreCartAdapter(props: ScaffoldCartProps) {
  const urls = storeUrls(props.store.slug);
  const allLines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const removeItem = useCart((s) => s.remove);

  const [mounted, setMounted] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  useEffect(() => setMounted(true), []);

  const lines = allLines.filter((l) => l.storeSlug === props.store.slug);

  // Default-select all on first hydration so the checkout total isn't
  // 0 right after mount.
  useEffect(() => {
    if (mounted && selectedIds.length === 0 && lines.length > 0) {
      setSelectedIds(lines.map((l) => l.productId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, lines.length]);

  const items = lines.map((l) => ({
    id: l.productId,
    productId: l.productId,
    name: l.title,
    price: l.priceTHB,
    qty: l.qty,
    image: l.imageUrl,
    storeName: props.store.name,
  }));

  if (!mounted) {
    return <div className="min-h-[60vh]" />;
  }

  return (
    <MegaCart
      items={items}
      selectedItemIds={selectedIds}
      onToggleSelectItem={(id, selected) => {
        setSelectedIds((prev) =>
          selected ? [...new Set([...prev, id])] : prev.filter((x) => x !== id),
        );
      }}
      onToggleSelectAll={(selected) => {
        setSelectedIds(selected ? lines.map((l) => l.productId) : []);
      }}
      onUpdateQty={(id, q) => setQty(id, q, props.store.slug)}
      onRemove={(id) => removeItem(id, props.store.slug)}
      shopUrl={urls.shop}
      checkoutUrl={urls.checkout}
    />
  );
}

export function MegaStoreCheckoutAdapter(props: ScaffoldCheckoutProps) {
  const urls = storeUrls(props.store.slug);
  const router = useRouter();
  const allLines = useCart((s) => s.lines);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const lines = allLines.filter((l) => l.storeSlug === props.store.slug);
  const items = lines.map((l) => ({
    id: l.productId,
    name: l.title,
    price: l.priceTHB,
    qty: l.qty,
    image: l.imageUrl,
    storeName: props.store.name,
  }));

  if (!mounted) {
    return <div className="min-h-[60vh]" />;
  }

  return (
    <MegaCheckout
      items={items}
      addresses={[]}
      paymentMethods={[
        { id: 'anypay', name: 'ANYPAY · พร้อมเพย์ / บัตร / TrueMoney' },
      ]}
      shippingFee={50}
      onSubmitOrder={() => {
        router.push(urls.home);
      }}
      shopUrl={urls.shop}
    />
  );
}

export function MegaStoreAboutAdapter(props: ScaffoldAboutProps) {
  return (
    <MegaAbout
      storeName={props.store.name}
      story={
        props.store.description ??
        'ศูนย์รวมสินค้าออนไลน์ที่ใหญ่ที่สุด ช้อปสนุก ถูกใจ มั่นใจได้ทุกการสั่งซื้อ'
      }
      values={[
        { title: 'ราคาดีที่สุด', desc: 'ราคาแข่งขันได้ในตลาด', icon: 'target' },
        { title: 'ดูแลลูกค้า 24/7', desc: 'พร้อมตอบทุกคำถามทุกวัน', icon: 'users' },
        { title: 'จัดส่งเร็ว', desc: 'ส่งภายใน 24 ชม.', icon: 'zap' },
        { title: 'ปลอดภัย', desc: 'รับประกันสินค้าแท้ 100%', icon: 'shield' },
      ]}
    />
  );
}

export function MegaStoreHelpAdapter(_props: ScaffoldHelpProps) {
  return (
    <MegaHelp
      faqs={[
        { q: 'ใช้เวลาส่งกี่วัน?', a: '1-3 วันทำการ ผ่าน Kerry / Flash / EMS หลังชำระเงินแล้ว' },
        { q: 'ชำระเงินอย่างไรได้บ้าง?', a: 'ANYPAY รองรับบัตรเครดิต/เดบิต, PromptPay, TrueMoney และอื่นๆ — ' },
        { q: 'คืนหรือเปลี่ยนสินค้าได้ไหม?', a: 'ภายใน 15 วัน หากสินค้าชำรุดหรือไม่ตรงคำสั่งซื้อ' },
        { q: 'ติดต่อร้านได้ที่ไหน?', a: 'แชท 24 ชม. ผ่านหน้าศูนย์ช่วยเหลือ หรือโทร Call Center' },
      ]}
      onContactSubmit={() => {}}
    />
  );
}

// ── Contact (bespoke standalone page) ──────────────────────────────
// Re-exported under the registry-naming convention so the per-store
// /contact route dispatcher (wired separately in lib/templates/registry.ts)
// can mount it directly. The page receives `{ store }` with the
// FooterProps-shaped store record.
export { default as mega_store_Contact } from './pages/Contact';
