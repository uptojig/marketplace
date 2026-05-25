'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowRight, Heart } from 'lucide-react';
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
  heroImageUrl?: string | null;
}

export interface HomepageProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
    bannerUrl?: string | null;
  };
  products: Product[];
  categories: string[];
  landingContent?: LandingContent | null;
}

const FEATURED_CAP = 8;
const MARQUEE_TEXT =
  'DROP IT. WE DARE YOU. · MILITARY GRADE PROTECTION · SHOW YOUR COLORS · WORLDWIDE SHIPPING · ';

/**
 * Casetify Clone — full-page homepage.
 *
 * Hero (full-bleed image with white headline + gradient accent word) →
 * red marquee strip → category circles row → "Signature Prints" product
 * grid → black eco-CTA band. Adapted from the casetify-clone reference
 * design with marketplace-native data and accent tokens.
 */
export function Homepage({ store, products, categories, landingContent }: HomepageProps) {
  const featured = products.slice(0, FEATURED_CAP);
  const totalCount = products.length;

  const heroImage =
    landingContent?.heroImageUrl ||
    store.bannerUrl ||
    featured.find((p) => p.imageUrl)?.imageUrl ||
    null;

  const headlineRaw = landingContent?.heroHeadline?.trim() || 'Show Your\nTrue Colors';
  const headlineLines = headlineRaw.split(/\n/).filter(Boolean);
  // Last line gets the gradient accent — mirrors the source design.
  const accentLine = headlineLines.pop() || 'True Colors';

  const subheadline =
    landingContent?.heroSubheadline?.trim() ||
    'แต่งแต้มตัวตนของคุณผ่านเคสมือถือดีไซน์เฉพาะตัว — กันกระแทกระดับ military grade ดีไซน์ไม่ซ้ำใคร';

  const ctaLabel = landingContent?.heroCtaLabel?.trim() || 'Shop Now';

  const urls = {
    shop: `/stores/${store.slug}/category`,
  };

  return (
    <main className="font-[family:var(--font-prompt)] bg-white text-gray-900">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative w-full h-[85vh] min-h-[600px] overflow-hidden bg-[#F3F4F6] flex items-center">
        {/* Background image / fallback gradient */}
        <div className="absolute inset-0 w-full h-full">
          {heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroImage}
              alt={store.name}
              className="absolute inset-0 h-full w-full object-cover opacity-90"
              loading="eager"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(135deg, #18181b 0%, #3f3f46 50%, var(--shop-primary, #EA1C5C) 130%)',
              }}
            />
          )}
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full flex flex-col md:flex-row items-center">
          <div className="max-w-2xl text-white">
            <div
              className="inline-block bg-white text-xs font-bold px-3 py-1 mb-6 rounded-full uppercase tracking-widest"
              style={{ color: 'var(--shop-primary, #EA1C5C)' }}
            >
              New Arrival
            </div>
            <h1 className="font-[family:var(--font-kanit)] text-5xl md:text-7xl font-black leading-[1.1] tracking-tight mb-6 uppercase">
              {headlineLines.map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, #ec4899, var(--shop-primary, #EA1C5C), #f59e0b)',
                }}
              >
                {accentLine}
              </span>
            </h1>
            <p className="text-lg md:text-xl font-medium mb-10 max-w-lg opacity-90 leading-relaxed">
              {subheadline}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={urls.shop}
                className="bg-white text-black font-extrabold uppercase tracking-widest text-sm px-8 py-4 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center h-14 min-w-[200px]"
              >
                {ctaLabel}
                <ArrowRight size={18} className="ml-2" />
              </Link>
              <Link
                href={`/stores/${store.slug}/about`}
                className="bg-transparent border-2 border-white text-white font-extrabold uppercase tracking-widest text-sm px-8 py-4 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center h-14 min-w-[200px]"
              >
                เกี่ยวกับเรา
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee strip ────────────────────────────────────────── */}
      <div
        className="w-full text-white py-3 overflow-hidden flex items-center border-y-4 border-black"
        style={{ background: 'var(--shop-primary, #EA1C5C)' }}
        aria-hidden="true"
      >
        <div className="flex whitespace-nowrap font-[family:var(--font-kanit)] font-black text-xl md:text-2xl tracking-widest uppercase animate-[casetify-marquee_18s_linear_infinite]">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="mx-4">{MARQUEE_TEXT}</span>
          ))}
        </div>
        <style jsx>{`
          @keyframes casetify-marquee {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
        `}</style>
      </div>

      {/* ── Category circles ─────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="py-16 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="font-[family:var(--font-kanit)] text-3xl font-black tracking-tight uppercase text-center mb-12">
              ช้อปตามหมวด
            </h2>
            <div className="flex space-x-6 overflow-x-auto pb-6 snap-x md:justify-center">
              {categories.slice(0, 8).map((cat, idx) => {
                const seed = featured[idx % Math.max(featured.length, 1)];
                const img = seed?.imageUrl ?? null;
                return (
                  <Link
                    key={cat}
                    href={`${urls.shop}?cat=${encodeURIComponent(cat)}`}
                    className="flex flex-col items-center flex-shrink-0 snap-center group"
                  >
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-transparent group-hover:border-black transition-colors mb-4 relative p-1 inline-block">
                      <div className="w-full h-full rounded-full overflow-hidden relative bg-gray-100">
                        {img ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={img}
                            alt={cat}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center font-[family:var(--font-kanit)] font-black text-2xl text-gray-300 uppercase">
                            {cat.charAt(0)}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-xs sm:text-sm uppercase tracking-wider text-gray-800 text-center max-w-[8rem] truncate">
                      {cat}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Signature Prints product grid ────────────────────────── */}
      <section id="shop" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="font-[family:var(--font-kanit)] text-3xl md:text-4xl font-black tracking-tight uppercase mb-2">
                Signature Prints
              </h2>
              <p className="text-gray-500 font-medium">
                ดีไซน์ยอดนิยมที่คนทั่วโลกเลือก
              </p>
            </div>
            <Link
              href={urls.shop}
              className="hidden md:block underline font-bold uppercase tracking-widest text-sm hover:text-[var(--shop-primary,#EA1C5C)] transition-colors"
            >
              ดูทั้งหมด
            </Link>
          </div>

          {featured.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-gray-200 rounded-2xl">
              <p className="text-sm text-gray-400">ยังไม่มีสินค้าในร้านนี้</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
              {featured.map((p, idx) => (
                <CasetifyProductCard
                  key={p.id}
                  product={p}
                  storeSlug={store.slug}
                  badge={
                    idx === 0
                      ? 'Best Seller'
                      : idx === 2
                      ? 'New'
                      : idx === 7
                      ? 'Trending'
                      : undefined
                  }
                />
              ))}
            </div>
          )}

          {totalCount > FEATURED_CAP && (
            <div className="mt-12 text-center md:hidden">
              <Link
                href={urls.shop}
                className="block border-2 border-black font-bold uppercase tracking-widest text-sm px-8 py-3 rounded-full w-full hover:bg-gray-100 transition-colors"
              >
                ดูทั้งหมด {totalCount} รายการ
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Eco CTA band ─────────────────────────────────────────── */}
      <section className="bg-black text-white py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <h2 className="font-[family:var(--font-kanit)] text-4xl md:text-5xl font-black uppercase tracking-tight mb-8">
            Protect Your Tech.
            <br className="hidden md:block" /> Protect Our Planet.
          </h2>
          <p className="max-w-2xl mx-auto text-gray-400 text-lg mb-10 leading-relaxed font-medium">
            เคสของเราผลิตจากวัสดุรีไซเคิลและฐานพืช 65% ส่งในแพ็คเกจที่รีไซเคิลได้ 100%
            ดีต่อเครื่องของคุณและดีต่อโลก
          </p>
          <Link
            href={urls.shop}
            className="inline-flex items-center bg-white text-black font-extrabold uppercase tracking-widest text-sm px-10 py-4 rounded-full hover:bg-gray-200 transition-colors"
          >
            สำรวจคอลเลกชัน
            <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </section>
    </main>
  );
}

/**
 * Product card — phone-case framed product image with hover "Heart"
 * action, optional badge ribbon, color swatch row underneath.
 * Replicates the signature "camera ring + bezel" CASETiFY look.
 */
function CasetifyProductCard({
  product,
  storeSlug,
  badge,
}: {
  product: Product;
  storeSlug: string;
  badge?: string;
}) {
  return (
    <div className="group relative flex flex-col items-center">
      <Link
        href={`/stores/${storeSlug}/products/${product.id}`}
        className="relative w-full aspect-[3/4] bg-gray-50 rounded-2xl overflow-hidden mb-4 hover:bg-gray-100 transition-colors p-6 flex items-center justify-center"
      >
        {/* "Phone case" inner frame — black bezel + camera-ring ornament */}
        <div className="relative w-[70%] h-[90%] rounded-[2rem] shadow-xl overflow-hidden border-[3px] border-black group-hover:-translate-y-2 group-hover:scale-105 transition-transform duration-500 bg-white">
          {/* Camera ring */}
          <div className="absolute top-3 left-3 w-12 h-12 sm:w-14 sm:h-14 border-[3px] border-black rounded-lg z-10 bg-black/10 backdrop-blur-sm flex items-center justify-center overflow-hidden">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-md border border-gray-300" />
          </div>

          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.title}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <span className="font-[family:var(--font-kanit)] font-black text-3xl text-gray-300 uppercase">
                {product.title.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Heart action (desktop hover) */}
        <span
          className="absolute top-4 right-4 p-2 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
          aria-hidden="true"
        >
          <Heart size={16} className="text-gray-900" />
        </span>

        {/* Badge ribbon */}
        {badge && (
          <span className="absolute bottom-4 left-4 bg-black text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
            {badge}
          </span>
        )}
      </Link>

      <div className="text-center w-full px-2">
        <Link
          href={`/stores/${storeSlug}/products/${product.id}`}
          className="block font-bold text-sm tracking-wide text-gray-900 truncate mb-1 hover:underline"
        >
          {product.title}
        </Link>
        <p className="text-gray-700 text-sm font-medium tabular-nums">
          {formatTHB(product.priceTHB)}
          {product.compareAtPriceTHB ? (
            <span className="ml-2 text-gray-400 line-through text-xs">
              {formatTHB(product.compareAtPriceTHB)}
            </span>
          ) : null}
        </p>
      </div>

      {/* Color swatch row — decorative */}
      <div className="mt-3 flex space-x-1.5" aria-hidden="true">
        <span className="w-4 h-4 rounded-full bg-black border border-gray-200" />
        <span className="w-4 h-4 rounded-full bg-pink-300 border border-gray-200" />
        <span className="w-4 h-4 rounded-full bg-blue-300 border border-gray-200" />
        <span className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center">
          <span className="text-[9px] text-gray-500">+3</span>
        </span>
      </div>
    </div>
  );
}

export default Homepage;
