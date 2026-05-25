'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Zap, Sparkles, Star, ChevronRight } from 'lucide-react';
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

const DEFAULT_HEADLINE = 'สว่างไสว\nทุกปาร์ตี้';
const DEFAULT_SUB =
  'รวมไอเท็มสายปาร์ตี้ แสงนีออน และของแต่งคอนเสิร์ต ให้คุณโดดเด่นที่สุดในงาน ดึงดูดทุกสายตา';
const DEFAULT_CTA = 'ช้อปเลย';

const CATEGORY_ICONS = [Zap, Sparkles, Star] as const;

export function Homepage({ store, products, categories, landingContent }: Props) {
  const headline = landingContent?.heroHeadline?.trim() || DEFAULT_HEADLINE;
  const sub = landingContent?.heroSubheadline?.trim() || DEFAULT_SUB;
  const ctaLabel = landingContent?.heroCtaLabel?.trim() || DEFAULT_CTA;
  const ctaUrl = landingContent?.heroCtaUrl?.trim() || `/stores/${store.slug}/category`;
  const heroImage = landingContent?.heroImageUrl?.trim() || null;

  const add = useCart((s) => s.add);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add({
      productId: product.id,
      storeSlug: store.slug,
      storeName: store.name,
      title: product.title,
      priceTHB: product.priceTHB,
      imageUrl: product.imageUrl || undefined,
    });
  };

  const featured = products.slice(0, 8);

  return (
    <div className="bg-[#fafafa] text-black font-[family:var(--font-prompt)]">
      {/* Hero */}
      <section className="relative overflow-hidden py-16 md:py-24 px-4 border-b-4 border-black bg-blue-600">
        <div
          className="absolute -top-10 -right-10 w-64 h-64 bg-green-400 border-4 border-black rotate-12 flex items-end p-8 z-0 hidden md:flex"
          aria-hidden
        >
          <div className="text-black font-[family:var(--font-kanit)] font-black text-5xl uppercase italic leading-none">
            NEW<br />SALE
          </div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left space-y-6">
            <div className="inline-block bg-yellow-400 border-4 border-black px-4 py-1 text-xs font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-[family:var(--font-kanit)]">
              Collection {new Date().getFullYear() + 543}
            </div>
            <h1 className="font-[family:var(--font-kanit)] text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] uppercase italic tracking-tighter text-white drop-shadow-[4px_4px_0_rgba(0,0,0,1)] whitespace-pre-line">
              {headline}
            </h1>
            <p className="text-white font-bold text-base sm:text-lg max-w-lg mx-auto md:mx-0 border-l-4 border-yellow-400 pl-4 bg-black/20 p-4">
              {sub}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-2">
              <Link
                href={ctaUrl}
                className="inline-flex items-center justify-center h-14 px-8 italic bg-white text-black hover:bg-yellow-400 border-4 border-black font-[family:var(--font-kanit)] font-black uppercase tracking-widest text-base shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-2 active:translate-y-2 active:shadow-none transition-all"
              >
                {ctaLabel} <ChevronRight className="w-6 h-6 ml-1" />
              </Link>
              <Link
                href={`/stores/${store.slug}/category`}
                className="inline-flex items-center justify-center h-14 px-8 italic bg-pink-500 text-white hover:bg-yellow-400 hover:text-black border-4 border-black font-[family:var(--font-kanit)] font-black uppercase tracking-widest text-base shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-2 active:translate-y-2 active:shadow-none transition-all"
              >
                ดูสินค้าทั้งหมด
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md aspect-square flex justify-center items-center">
            <div className="absolute inset-0 bg-yellow-400 border-4 border-black -rotate-6 transition-transform duration-500 hover:rotate-0" />
            <div className="absolute inset-0 bg-pink-400 border-4 border-black rotate-6 transition-transform duration-500 hover:rotate-12" />
            <div className="relative h-full w-full border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden">
              {heroImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={heroImage}
                  alt={store.name}
                  className="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pink-400 via-yellow-400 to-blue-400">
                  <div className="font-[family:var(--font-kanit)] font-black text-7xl text-black uppercase italic rotate-[-8deg] drop-shadow-[4px_4px_0_rgba(255,255,255,1)]">
                    {store.name.slice(0, 1)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Rail */}
      {categories.length > 0 && (
        <section className="py-8 bg-green-400 border-b-4 border-black">
          <div className="max-w-7xl mx-auto px-4 flex flex-nowrap overflow-x-auto gap-4 sm:gap-6 hide-scrollbar items-center">
            <span className="shrink-0 font-[family:var(--font-kanit)] font-black text-lg sm:text-xl italic uppercase px-4 border-r-4 border-black">
              หมวดหมู่
            </span>
            {categories.slice(0, 8).map((cat, idx) => {
              const Icon = CATEGORY_ICONS[idx % CATEGORY_ICONS.length];
              return (
                <Link
                  key={cat}
                  href={`/stores/${store.slug}/category?cat=${encodeURIComponent(cat)}`}
                  className="shrink-0 h-12 sm:h-14 border-4 border-black bg-white text-black hover:bg-black hover:text-white px-4 sm:px-6 flex items-center gap-2 active:translate-x-1 active:translate-y-1"
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-[family:var(--font-kanit)] text-sm sm:text-base font-black uppercase">
                    {cat}
                  </span>
                </Link>
              );
            })}
            <Link
              href={`/stores/${store.slug}/category`}
              className="shrink-0 h-12 sm:h-14 px-4 sm:px-6 flex items-center font-[family:var(--font-kanit)] font-black uppercase tracking-widest text-black hover:bg-white border-4 border-transparent hover:border-black active:translate-x-1 active:translate-y-1"
            >
              ดูทั้งหมด →
            </Link>
          </div>
        </section>
      )}

      {/* Product Grid */}
      <section className="py-12 sm:py-16 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6 border-b-4 border-black pb-8">
          <h2 className="font-[family:var(--font-kanit)] text-3xl sm:text-5xl font-black flex items-center gap-3 uppercase italic">
            <Zap className="w-10 h-10 sm:w-12 sm:h-12 text-pink-500 fill-pink-500" />
            <span>สินค้ามาแรง</span>
          </h2>
          <Link
            href={`/stores/${store.slug}/category`}
            className="h-12 px-6 sm:px-8 flex items-center justify-center font-[family:var(--font-kanit)] font-black uppercase tracking-widest bg-black text-white hover:bg-pink-500 hover:text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-colors"
          >
            ดูทั้งหมด →
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="text-center py-16 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <p className="font-[family:var(--font-kanit)] text-2xl font-black uppercase italic">
              ยังไม่มีสินค้าในร้าน
            </p>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-2">
              เพิ่มสินค้าผ่านระบบจัดการร้านได้เลย
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {featured.map((product, idx) => {
              const hasDiscount =
                product.compareAtPriceTHB && product.compareAtPriceTHB > product.priceTHB;
              const tag = hasDiscount
                ? `ลด ${Math.round(((product.compareAtPriceTHB! - product.priceTHB) / product.compareAtPriceTHB!) * 100)}%`
                : idx === 0
                ? 'ขายดี'
                : idx === 3
                ? 'ใหม่'
                : null;
              return (
                <Link
                  key={product.id}
                  href={`/stores/${store.slug}/products/${product.id}`}
                  className="group bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400 active:translate-x-2 active:translate-y-2 active:shadow-none transition-all flex flex-col"
                >
                  <div className="relative aspect-square overflow-hidden border-b-4 border-black bg-slate-100">
                    {tag && (
                      <div className="absolute top-4 -left-2 z-10 bg-pink-500 text-white font-[family:var(--font-kanit)] font-black text-xs uppercase px-4 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        {tag}
                      </div>
                    )}
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pink-300 to-yellow-300">
                        <Sparkles className="w-12 h-12 text-black/40" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(product, e)}
                      aria-label="เพิ่มในตะกร้า"
                      className="absolute bottom-4 right-4 z-10 w-12 h-12 border-4 border-black flex items-center justify-center bg-yellow-400 text-black hover:bg-black hover:text-white active:translate-x-1 active:translate-y-1 transition-transform"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-4 sm:p-5 space-y-2 sm:space-y-3 flex-1 flex flex-col">
                    <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                      Item #{product.id.slice(-6)}
                    </div>
                    <h3 className="font-[family:var(--font-kanit)] font-black text-lg sm:text-xl uppercase leading-tight line-clamp-2 flex-1">
                      {product.title}
                    </h3>
                    <div className="flex items-baseline gap-3 pt-1">
                      <span className="font-[family:var(--font-kanit)] font-black text-xl sm:text-2xl text-pink-600">
                        {formatTHB(product.priceTHB)}
                      </span>
                      {hasDiscount && (
                        <span className="text-sm font-bold text-slate-400 line-through">
                          {formatTHB(product.compareAtPriceTHB!)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
