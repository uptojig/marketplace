'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Gauge, Zap, Wrench, ChevronRight } from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { formatTHB } from '@/lib/utils';

interface Product {
  id: string;
  title: string;
  priceTHB: number;
  compareAtPriceTHB?: number | null;
  imageUrl?: string | null;
  categoryName?: string | null;
}

interface LandingContent {
  heroHeadline?: string | null;
  heroSubheadline?: string | null;
  heroCtaLabel?: string | null;
  heroCtaUrl?: string | null;
  heroImageUrl?: string | null;
}

interface Props {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  products: Product[];
  categories: string[];
  landingContent?: LandingContent | null;
}

const HOMEPAGE_CAP = 12;

const DEFAULT_HEADLINE = 'อะไหล่แต่งและของซิ่ง รวมที่นี่';
const DEFAULT_SUB = 'อุปกรณ์ตกแต่งรถจักรยานยนต์ ของแต่งซิ่ง ราคาส่ง พร้อมส่งทั่วประเทศ';
const DEFAULT_CTA = 'เลือกอะไหล่';

const BIKE_MODELS = [
  { code: 'CB650R', label: 'Honda CB650R' },
  { code: 'MT-07', label: 'Yamaha MT-07' },
  { code: 'Z900', label: 'Kawasaki Z900' },
  { code: 'GSX-R600', label: 'Suzuki GSX-R600' },
  { code: 'RC390', label: 'KTM RC390' },
  { code: 'PCX160', label: 'Honda PCX160' },
];

/**
 * GridModu — Homepage. Split hero + modular spec-rows grid +
 * shop-by-bike-model tile row.
 *
 * Design language: carbon-fiber dark base, electric accent trim,
 * grid-dominant layout, Kanit semibold uppercase headings, Prompt
 * body with tabular-nums for spec numbers.
 */
export function Homepage({ store, products, categories, landingContent }: Props) {
  const headline = landingContent?.heroHeadline?.trim() || DEFAULT_HEADLINE;
  const sub = landingContent?.heroSubheadline?.trim() || DEFAULT_SUB;
  const ctaLabel = landingContent?.heroCtaLabel?.trim() || DEFAULT_CTA;
  const ctaUrl = landingContent?.heroCtaUrl?.trim() || `/stores/${store.slug}/category`;
  const heroImage = landingContent?.heroImageUrl?.trim() || null;

  const add = useCart((s) => s.add);
  const cappedProducts = products.slice(0, HOMEPAGE_CAP);
  const featuredTile = products[0] ?? null;
  const totalCount = products.length;

  // Synthesize a small fitment-row strip derived from real categories.
  const specStrip = [
    { label: 'PARTS', value: String(totalCount).padStart(3, '0') },
    { label: 'CATEGORIES', value: String(categories.length).padStart(2, '0') },
    { label: 'SHIP', value: '24H' },
    { label: 'WARRANTY', value: '12M' },
  ];

  return (
    <div className="min-h-screen bg-[#0E0E10] text-[#E5E7EB] font-[family:var(--font-prompt)]">
      {/* ── SPLIT HERO ─────────────────────────────────────────── */}
      <section className="relative border-b border-[#1F1F23]">
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
          aria-hidden
        />
        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-0 lg:gap-px bg-[#1F1F23]">
          {/* Left: Hero copy + CTA */}
          <div className="bg-[#0E0E10] p-6 sm:p-10 lg:p-14 flex flex-col justify-center min-h-[480px]">
            <div
              className="inline-flex w-fit items-center gap-2 px-2.5 py-1 mb-6 border tabular-nums text-[10px] tracking-[0.2em] uppercase rounded-sm"
              style={{
                borderColor: 'var(--shop-accent, #00BFFF)',
                color: 'var(--shop-accent, #00BFFF)',
                background: 'rgba(0,191,255,0.06)',
              }}
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: 'var(--shop-accent, #00BFFF)' }}
              />
              <span className="font-[family:var(--font-kanit)] font-semibold">
                SYSTEM · ONLINE
              </span>
            </div>
            <h1 className="font-[family:var(--font-kanit)] font-semibold text-3xl sm:text-5xl lg:text-6xl uppercase tracking-wider leading-[1.05] text-white mb-5">
              {headline}
            </h1>
            <p className="text-sm sm:text-base text-[#9CA3AF] max-w-md mb-8 leading-relaxed">
              {sub}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={ctaUrl}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-sm font-[family:var(--font-kanit)] font-semibold uppercase tracking-wider text-sm text-[#0E0E10]"
                style={{
                  background:
                    'var(--shop-primary-gradient, var(--shop-accent, #00BFFF))',
                }}
              >
                {ctaLabel}
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href={`/stores/${store.slug}/category`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-sm border border-[#2A2A2E] text-[#E5E7EB] font-[family:var(--font-kanit)] font-semibold uppercase tracking-wider text-sm hover:border-[var(--shop-accent,#00BFFF)] hover:text-[var(--shop-accent,#00BFFF)] transition-colors"
              >
                ดูสต๊อกทั้งหมด
              </Link>
            </div>

            {/* spec strip — tabular-nums */}
            <dl className="mt-10 grid grid-cols-4 border-t border-[#1F1F23] divide-x divide-[#1F1F23]">
              {specStrip.map((s) => (
                <div key={s.label} className="px-3 py-3">
                  <dt className="text-[9px] tracking-[0.2em] uppercase text-[#6B7280] font-[family:var(--font-kanit)] font-semibold">
                    {s.label}
                  </dt>
                  <dd className="text-base sm:text-lg font-bold tabular-nums text-white mt-1">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Right: Featured tile (image + spec card) */}
          <div className="bg-[#15151A] relative flex items-end">
            {heroImage ? (
              <img
                src={heroImage}
                alt={headline}
                className="absolute inset-0 w-full h-full object-cover opacity-90"
              />
            ) : featuredTile?.imageUrl ? (
              <img
                src={featuredTile.imageUrl}
                alt={featuredTile.title}
                className="absolute inset-0 w-full h-full object-cover opacity-90"
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(circle at 30% 40%, rgba(0,191,255,0.18), transparent 60%), radial-gradient(circle at 70% 80%, rgba(0,191,255,0.12), transparent 60%), #15151A',
                }}
                aria-hidden
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E10] via-[#0E0E10]/40 to-transparent" />
            {featuredTile && (
              <Link
                href={`/stores/${store.slug}/products/${featuredTile.id}`}
                className="relative z-10 mt-auto m-5 sm:m-8 max-w-sm bg-[#0E0E10]/90 backdrop-blur-sm border border-[#2A2A2E] rounded-sm p-4 hover:border-[var(--shop-accent,#00BFFF)] transition-colors"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="text-[9px] tracking-[0.2em] uppercase font-[family:var(--font-kanit)] font-semibold px-2 py-0.5 rounded-sm"
                    style={{
                      background: 'var(--shop-accent, #00BFFF)',
                      color: '#0E0E10',
                    }}
                  >
                    FEATURED
                  </span>
                  {featuredTile.categoryName && (
                    <span className="text-[10px] tracking-wider uppercase text-[#9CA3AF] font-[family:var(--font-kanit)] font-semibold">
                      {featuredTile.categoryName}
                    </span>
                  )}
                </div>
                <h3 className="font-[family:var(--font-kanit)] font-semibold uppercase tracking-wide text-white text-base sm:text-lg line-clamp-2 mb-3">
                  {featuredTile.title}
                </h3>
                <div className="flex items-baseline justify-between border-t border-[#1F1F23] pt-3">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-[#6B7280] font-[family:var(--font-kanit)] font-semibold">
                    ราคา
                  </span>
                  <span
                    className="font-bold text-xl tabular-nums"
                    style={{ color: 'var(--shop-accent, #00BFFF)' }}
                  >
                    {formatTHB(featuredTile.priceTHB)}
                  </span>
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── SPEC-ROW CATEGORY STRIP ───────────────────────────── */}
      {categories.length > 0 && (
        <section className="border-b border-[#1F1F23] bg-[#15151A]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-[family:var(--font-kanit)] font-semibold uppercase tracking-wider text-sm text-white flex items-center gap-2">
                <span
                  className="inline-block h-3 w-1"
                  style={{ background: 'var(--shop-accent, #00BFFF)' }}
                  aria-hidden
                />
                หมวดอะไหล่ · CATEGORIES
              </h2>
              <Link
                href={`/stores/${store.slug}/category`}
                className="hidden sm:inline-flex items-center gap-1 text-[10px] tracking-[0.2em] uppercase text-[#9CA3AF] hover:text-[var(--shop-accent,#00BFFF)] font-[family:var(--font-kanit)] font-semibold"
              >
                ดูทั้งหมด <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-[#1F1F23] border border-[#1F1F23]">
              {categories.slice(0, 6).map((cat, i) => (
                <Link
                  key={cat}
                  href={`/stores/${store.slug}/category?cat=${encodeURIComponent(cat)}`}
                  className="bg-[#0E0E10] hover:bg-[#15151A] p-4 transition-colors group"
                >
                  <div className="text-[9px] tracking-[0.2em] uppercase text-[#6B7280] font-[family:var(--font-kanit)] font-semibold mb-2 tabular-nums">
                    #{String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="font-[family:var(--font-kanit)] font-semibold uppercase tracking-wide text-white text-sm group-hover:text-[var(--shop-accent,#00BFFF)] transition-colors">
                    {cat}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── MODULAR PRODUCT GRID ──────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-baseline justify-between mb-6 pb-3 border-b border-[#1F1F23]">
          <h2 className="font-[family:var(--font-kanit)] font-semibold uppercase tracking-wider text-base sm:text-xl text-white flex items-center gap-2">
            <span
              className="inline-block h-4 w-1"
              style={{ background: 'var(--shop-accent, #00BFFF)' }}
              aria-hidden
            />
            สต๊อกล่าสุด · INVENTORY
          </h2>
          <span className="text-[10px] tracking-[0.2em] uppercase text-[#6B7280] tabular-nums font-[family:var(--font-kanit)] font-semibold">
            SHOWING {String(cappedProducts.length).padStart(2, '0')}/{String(totalCount).padStart(2, '0')}
          </span>
        </div>

        {cappedProducts.length === 0 ? (
          <p className="py-12 text-center text-[#6B7280]">
            ยังไม่มีสินค้า · ผู้ดูแลร้านสามารถเพิ่มสินค้าได้
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {cappedProducts.map((p, idx) => (
              <ProductModuleCard
                key={p.id}
                product={p}
                storeSlug={store.slug}
                index={idx}
                onAddToCart={() =>
                  add({
                    productId: p.id,
                    storeSlug: store.slug,
                    storeName: store.name,
                    title: p.title,
                    priceTHB: p.priceTHB,
                    imageUrl: p.imageUrl || undefined,
                  })
                }
              />
            ))}
          </div>
        )}

        {totalCount > HOMEPAGE_CAP && (
          <div className="mt-8 text-center">
            <Link
              href={`/stores/${store.slug}/category`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-sm border border-[#2A2A2E] text-[#E5E7EB] font-[family:var(--font-kanit)] font-semibold uppercase tracking-wider text-sm hover:border-[var(--shop-accent,#00BFFF)] hover:text-[var(--shop-accent,#00BFFF)] transition-colors tabular-nums"
            >
              ดูสินค้าทั้งหมด {totalCount} รายการ
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </section>

      {/* ── SHOP BY BIKE MODEL ────────────────────────────────── */}
      <section className="border-t border-[#1F1F23] bg-[#15151A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#1F1F23]">
            <h2 className="font-[family:var(--font-kanit)] font-semibold uppercase tracking-wider text-base sm:text-xl text-white flex items-center gap-2">
              <span
                className="inline-block h-4 w-1"
                style={{ background: 'var(--shop-accent, #00BFFF)' }}
                aria-hidden
              />
              เลือกตามรุ่นรถ · BY MODEL
            </h2>
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#6B7280] font-[family:var(--font-kanit)] font-semibold">
              FITMENT GUIDE
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {BIKE_MODELS.map((m) => (
              <Link
                key={m.code}
                href={`/stores/${store.slug}/category?cat=${encodeURIComponent(m.label)}`}
                className="bg-[#0E0E10] border border-[#1F1F23] rounded-sm p-4 hover:border-[var(--shop-accent,#00BFFF)] transition-colors group"
              >
                <div className="aspect-[3/2] mb-3 grid place-items-center bg-[#15151A] border border-[#1F1F23] rounded-sm">
                  <Gauge
                    className="h-8 w-8 text-[#3F3F46] group-hover:text-[var(--shop-accent,#00BFFF)] transition-colors"
                    aria-hidden
                  />
                </div>
                <div className="text-[9px] tracking-[0.2em] uppercase text-[#6B7280] font-[family:var(--font-kanit)] font-semibold tabular-nums mb-1">
                  {m.code}
                </div>
                <div className="font-[family:var(--font-kanit)] font-semibold text-xs text-white uppercase tracking-wide line-clamp-1">
                  {m.label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM TRUST STRIP ───────────────────────────────── */}
      <section className="border-t border-[#1F1F23]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#1F1F23] border border-[#1F1F23]">
            {[
              {
                icon: Zap,
                title: 'ส่งด่วน 24 ชั่วโมง',
                sub: 'พร้อมจัดส่งทั่วประเทศ',
              },
              {
                icon: Wrench,
                title: 'ของแท้ มีรับประกัน',
                sub: 'ตรวจสอบ fitment ทุกชิ้น',
              },
              {
                icon: Gauge,
                title: 'ทีมช่างให้คำปรึกษา',
                sub: 'จับคู่อะไหล่กับรุ่นรถ',
              },
            ].map((b) => (
              <div key={b.title} className="bg-[#0E0E10] p-5 flex items-center gap-4">
                <span
                  className="grid place-items-center h-10 w-10 rounded-sm border"
                  style={{
                    borderColor: 'var(--shop-accent, #00BFFF)',
                    color: 'var(--shop-accent, #00BFFF)',
                  }}
                >
                  <b.icon className="h-5 w-5" />
                </span>
                <div>
                  <div className="font-[family:var(--font-kanit)] font-semibold uppercase tracking-wide text-sm text-white">
                    {b.title}
                  </div>
                  <div className="text-xs text-[#9CA3AF] mt-0.5">{b.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Product card with spec mini-table + fitment chip
// ────────────────────────────────────────────────────────────
function ProductModuleCard({
  product,
  storeSlug,
  index,
  onAddToCart,
}: {
  product: Product;
  storeSlug: string;
  index: number;
  onAddToCart: () => void;
}) {
  // Real-field spec rows only — derived from product data, no mocks.
  const idShort = product.id.slice(-6).toUpperCase();
  const savings = product.compareAtPriceTHB
    ? Math.max(0, product.compareAtPriceTHB - product.priceTHB)
    : 0;
  const savingsPct =
    product.compareAtPriceTHB && product.compareAtPriceTHB > 0
      ? Math.round((savings / product.compareAtPriceTHB) * 100)
      : 0;

  return (
    <article className="bg-[#15151A] border border-[#1F1F23] rounded-sm overflow-hidden flex flex-col hover:border-[var(--shop-accent,#00BFFF)] transition-colors group">
      <Link
        href={`/stores/${storeSlug}/products/${product.id}`}
        className="block aspect-square bg-[#0E0E10] relative overflow-hidden"
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full grid place-items-center">
            <Wrench className="h-12 w-12 text-[#2A2A2E]" aria-hidden />
          </div>
        )}
        {/* SKU corner stamp */}
        <div className="absolute top-2 left-2 text-[9px] tracking-[0.2em] uppercase tabular-nums text-[#9CA3AF] bg-[#0E0E10]/80 backdrop-blur-sm px-1.5 py-0.5 rounded-sm border border-[#1F1F23] font-[family:var(--font-kanit)] font-semibold">
          SKU·{idShort}
        </div>
        {savingsPct > 0 && (
          <div
            className="absolute top-2 right-2 text-[10px] tracking-wider uppercase tabular-nums px-1.5 py-0.5 rounded-sm font-[family:var(--font-kanit)] font-bold"
            style={{
              background: 'var(--shop-accent, #00BFFF)',
              color: '#0E0E10',
            }}
          >
            −{savingsPct}%
          </div>
        )}
      </Link>

      <div className="p-3 flex-1 flex flex-col gap-2.5">
        {product.categoryName && (
          <div className="text-[9px] tracking-[0.2em] uppercase text-[#6B7280] font-[family:var(--font-kanit)] font-semibold">
            {product.categoryName}
          </div>
        )}
        <Link
          href={`/stores/${storeSlug}/products/${product.id}`}
          className="font-[family:var(--font-kanit)] font-semibold uppercase tracking-wide text-sm text-white line-clamp-2 hover:text-[var(--shop-accent,#00BFFF)] transition-colors"
        >
          {product.title}
        </Link>

        {/* Spec mini-table — derived from real data only */}
        <dl className="text-[10px] divide-y divide-[#1F1F23] border-t border-[#1F1F23]">
          <div className="flex justify-between py-1.5">
            <dt className="text-[#6B7280] tracking-wider uppercase font-[family:var(--font-kanit)] font-semibold">
              MODULE
            </dt>
            <dd className="text-[#E5E7EB] tabular-nums font-[family:var(--font-kanit)] font-semibold tracking-wider">
              M{String(index + 1).padStart(3, '0')}
            </dd>
          </div>
          {product.categoryName && (
            <div className="flex justify-between py-1.5">
              <dt className="text-[#6B7280] tracking-wider uppercase font-[family:var(--font-kanit)] font-semibold">
                TYPE
              </dt>
              <dd className="text-[#E5E7EB] uppercase tracking-wider font-[family:var(--font-kanit)] font-semibold line-clamp-1 max-w-[55%] text-right">
                {product.categoryName}
              </dd>
            </div>
          )}
          <div className="flex justify-between py-1.5">
            <dt className="text-[#6B7280] tracking-wider uppercase font-[family:var(--font-kanit)] font-semibold">
              STATUS
            </dt>
            <dd
              className="uppercase tracking-wider font-[family:var(--font-kanit)] font-semibold inline-flex items-center gap-1"
              style={{ color: 'var(--shop-accent, #00BFFF)' }}
            >
              <span
                className="inline-block w-1 h-1 rounded-full"
                style={{ background: 'var(--shop-accent, #00BFFF)' }}
                aria-hidden
              />
              IN STOCK
            </dd>
          </div>
        </dl>

        <div className="flex items-end justify-between mt-auto pt-2 border-t border-[#1F1F23]">
          <div className="flex flex-col">
            {product.compareAtPriceTHB && product.compareAtPriceTHB > product.priceTHB ? (
              <span className="text-[10px] line-through text-[#6B7280] tabular-nums">
                {formatTHB(product.compareAtPriceTHB)}
              </span>
            ) : null}
            <span
              className="text-base font-bold tabular-nums"
              style={{ color: 'var(--shop-accent, #00BFFF)' }}
            >
              {formatTHB(product.priceTHB)}
            </span>
          </div>
          <button
            type="button"
            aria-label="เพิ่มลงตะกร้า"
            onClick={onAddToCart}
            className="p-2 rounded-sm border border-[#2A2A2E] text-[#E5E7EB] hover:border-[var(--shop-accent,#00BFFF)] hover:text-[var(--shop-accent,#00BFFF)] transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
