'use client';
import React, { useState } from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/lib/store/cart';
import { useCartConfirmation } from '@/lib/store/cartConfirm';

interface Product {
  id: string;
  title: string;
  priceTHB: number;
  compareAtPriceTHB: number | null;
  imageUrl: string | null;
  categoryName: string | null;
}

export interface HomepageProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  products: Product[];
  categories: string[];
}

export function Homepage({ store, products, categories }: HomepageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const add = useCart((s) => s.add);
  const showConfirm = useCartConfirmation((s) => s.show);

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
    showConfirm(product.title, store.slug);
  };

  const filteredProducts =
    selectedCategory === 'ALL'
      ? products
      : products.filter((p) => p.categoryName === selectedCategory);

  const heroProduct = products.find((p) => p.imageUrl) || products[0];

  return (
    <main className="bg-[#0a0a0a] text-[#e8e2d4] min-h-screen selection:bg-[#e8e2d4] selection:text-[#0a0a0a]">

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* HERO — full-width cinematic block                             */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="border-b border-[#1c1c1c]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 md:py-28 lg:py-36">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">

            {/* Left — Copy */}
            <div className="space-y-8">
              {/* Eyebrow */}
              <span className="font-[family:var(--font-kanit)] text-[10px] font-black uppercase tracking-[0.3em] text-[#e8e2d4]/40">
                MONO EIGHT · คอลเลกชันใหม่
              </span>

              {/* Headline */}
              <h1 className="font-[family:var(--font-kanit)] font-black text-4xl sm:text-5xl lg:text-6xl xl:text-7xl uppercase leading-[0.9] tracking-tight">
                ขาวดำ
                <br />
                ในชั้นเดียวกัน
              </h1>

              {/* Hairline */}
              <div className="w-16 border-t border-[#1c1c1c]" />

              {/* Subheadline */}
              <p className="font-[family:var(--font-prompt)] text-sm md:text-base leading-relaxed text-[#e8e2d4]/60 max-w-md">
                คอลเลกชันเสื้อผ้าสตรีทแวร์ไทย เน้นโครงสร้างผ้า ตัดเย็บในกรุงเทพฯ
                จำนวนจำกัด 80 ตัวต่อคอลเลกชัน
              </p>

              {/* CTA */}
              <a
                href={`/stores/${store.slug}/category`}
                className="inline-flex items-center gap-3 group"
              >
                <span className="font-[family:var(--font-kanit)] text-xs font-black uppercase tracking-[0.2em] border-b border-[#e8e2d4]/30 pb-1 group-hover:border-[#e8e2d4] transition-colors duration-300">
                  ดูคอลเลกชันใหม่
                </span>
                <ArrowRight size={14} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform duration-300" />
              </a>
            </div>

            {/* Right — Hero product card */}
            {heroProduct && (
              <div className="relative">
                <div className="bg-[#e8e2d4] aspect-[3/4] overflow-hidden relative group">
                  {heroProduct.imageUrl ? (
                    <img
                      src={heroProduct.imageUrl}
                      alt={heroProduct.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-[family:var(--font-kanit)] text-[10px] font-black uppercase tracking-[0.3em] text-[#0a0a0a]/30">
                        NO IMAGE
                      </span>
                    </div>
                  )}

                  {/* Overlay bottom info bar */}
                  <div className="absolute bottom-0 left-0 right-0 bg-[#0a0a0a]/80 backdrop-blur-sm px-5 py-4 flex items-center justify-between">
                    <div>
                      <span className="font-[family:var(--font-kanit)] text-[9px] font-black uppercase tracking-[0.25em] text-[#e8e2d4]/50 block">
                        FEATURED
                      </span>
                      <span className="font-[family:var(--font-prompt)] text-xs text-[#e8e2d4] mt-0.5 block truncate max-w-[180px]">
                        {heroProduct.title}
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleAddToCart(heroProduct, e)}
                      className="p-2.5 bg-[#e8e2d4] text-[#0a0a0a] hover:bg-white transition-colors duration-300"
                      aria-label="เพิ่มลงตะกร้า"
                    >
                      <ShoppingBag size={14} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAGLINE BAR — horizontal rule + micro text                    */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="border-b border-[#1c1c1c]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6 flex items-center justify-center gap-6">
          <div className="flex-1 border-t border-[#1c1c1c]" />
          <span className="font-[family:var(--font-kanit)] text-[10px] font-black uppercase tracking-[0.3em] text-[#e8e2d4]/30 whitespace-nowrap">
            ผ้าเนื้อหนา ตัดเรียบ ใส่ได้ทุกวัน
          </span>
          <div className="flex-1 border-t border-[#1c1c1c]" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* BRAND PILLARS — three columns with hairline dividers          */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="border-b border-[#1c1c1c]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#1c1c1c]">

            <div className="py-8 md:py-0 md:pr-10">
              <span className="font-[family:var(--font-kanit)] text-[10px] font-black uppercase tracking-[0.25em] text-[#e8e2d4]/40 block mb-3">
                โครงสร้างผ้า
              </span>
              <p className="font-[family:var(--font-prompt)] text-xs leading-relaxed text-[#e8e2d4]/50">
                คัดเลือกผ้าคอตตอนเนื้อหนาจากโรงทอในประเทศ เน้นเนื้อสัมผัสที่ตัดเย็บแล้วทรงไม่หลุด ไม่ย้วยหลังซัก
              </p>
            </div>

            <div className="py-8 md:py-0 md:px-10">
              <span className="font-[family:var(--font-kanit)] text-[10px] font-black uppercase tracking-[0.25em] text-[#e8e2d4]/40 block mb-3">
                ตัดเย็บ กรุงเทพฯ
              </span>
              <p className="font-[family:var(--font-prompt)] text-xs leading-relaxed text-[#e8e2d4]/50">
                ทุกชิ้นตัดเย็บด้วยมือในเวิร์กช็อปย่านเจริญกรุง ควบคุมคุณภาพตั้งแต่การตัดผ้าจนถึงการเก็บตะเข็บ
              </p>
            </div>

            <div className="py-8 md:py-0 md:pl-10">
              <span className="font-[family:var(--font-kanit)] text-[10px] font-black uppercase tracking-[0.25em] text-[#e8e2d4]/40 block mb-3">
                จำกัด 80 ตัว
              </span>
              <p className="font-[family:var(--font-prompt)] text-xs leading-relaxed text-[#e8e2d4]/50">
                ผลิตจำกัดคอลเลกชันละ 80 ตัวเท่านั้น ไม่ผลิตซ้ำ เพื่อให้ทุกตัวมีความพิเศษและไม่ซ้ำใคร
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* CATALOG — category filters + product grid                     */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section id="catalog-section" className="border-b border-[#1c1c1c]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">

          {/* Section eyebrow + filter row */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
            <div>
              <span className="font-[family:var(--font-kanit)] text-[10px] font-black uppercase tracking-[0.25em] text-[#e8e2d4]/40 block mb-2">
                สินค้าทั้งหมด
              </span>
              <h2 className="font-[family:var(--font-kanit)] font-black text-2xl md:text-3xl uppercase tracking-tight">
                คอลเลกชัน
              </h2>
              <span className="font-[family:var(--font-prompt)] text-[10px] text-[#e8e2d4]/30 mt-1 block">
                {filteredProducts.length} รายการ
              </span>
            </div>

            {/* Category chips */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`font-[family:var(--font-kanit)] text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 border transition-all duration-300 ${
                  selectedCategory === 'ALL'
                    ? 'border-[#e8e2d4] bg-[#e8e2d4] text-[#0a0a0a]'
                    : 'border-[#1c1c1c] text-[#e8e2d4]/40 hover:text-[#e8e2d4] hover:border-[#e8e2d4]/40'
                }`}
              >
                ทั้งหมด
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`font-[family:var(--font-kanit)] text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 border transition-all duration-300 ${
                    selectedCategory === c
                      ? 'border-[#e8e2d4] bg-[#e8e2d4] text-[#0a0a0a]'
                      : 'border-[#1c1c1c] text-[#e8e2d4]/40 hover:text-[#e8e2d4] hover:border-[#e8e2d4]/40'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Hairline */}
          <div className="border-b border-[#1c1c1c] mb-10" />

          {/* Product grid */}
          {filteredProducts.length === 0 ? (
            <div className="py-24 text-center">
              <span className="font-[family:var(--font-kanit)] text-[10px] font-black uppercase tracking-[0.3em] text-[#e8e2d4]/20">
                ไม่มีสินค้าในหมวดนี้
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-[#1c1c1c]">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-[#0a0a0a] group"
                >
                  {/* Product card interior */}
                  <a
                    href={`/stores/${store.slug}/products/${p.id}`}
                    className="block"
                  >
                    {/* Image in ivory container */}
                    <div className="bg-[#e8e2d4] aspect-[3/4] overflow-hidden relative">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="font-[family:var(--font-kanit)] text-[9px] font-black uppercase tracking-[0.3em] text-[#0a0a0a]/20">
                            NO IMAGE
                          </span>
                        </div>
                      )}

                      {/* Category eyebrow badge */}
                      {p.categoryName && (
                        <span className="absolute top-3 left-3 font-[family:var(--font-kanit)] text-[8px] font-black uppercase tracking-[0.2em] bg-[#0a0a0a]/80 text-[#e8e2d4] px-2.5 py-1 backdrop-blur-sm">
                          {p.categoryName}
                        </span>
                      )}

                      {/* Quick add overlay */}
                      <button
                        onClick={(e) => handleAddToCart(p, e)}
                        className="absolute bottom-3 right-3 p-2.5 bg-[#0a0a0a] text-[#e8e2d4] opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#e8e2d4] hover:text-[#0a0a0a]"
                        aria-label="เพิ่มลงตะกร้า"
                      >
                        <ShoppingBag size={14} strokeWidth={2} />
                      </button>
                    </div>
                  </a>

                  {/* Product info */}
                  <div className="px-4 py-4">
                    <a href={`/stores/${store.slug}/products/${p.id}`} className="block">
                      <h3 className="font-[family:var(--font-prompt)] text-xs text-[#e8e2d4]/80 line-clamp-2 leading-relaxed mb-2">
                        {p.title}
                      </h3>
                    </a>
                    <div className="flex items-baseline gap-2">
                      <span className="font-[family:var(--font-kanit)] text-sm font-black text-[#e8e2d4]">
                        ฿{p.priceTHB.toLocaleString()}
                      </span>
                      {p.compareAtPriceTHB && (
                        <span className="font-[family:var(--font-prompt)] text-[10px] text-[#e8e2d4]/25 line-through">
                          ฿{p.compareAtPriceTHB.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* BOTTOM CTA — view all with hairline aesthetic                 */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="border-b border-[#1c1c1c]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 text-center">
          <span className="font-[family:var(--font-kanit)] text-[10px] font-black uppercase tracking-[0.3em] text-[#e8e2d4]/30 block mb-6">
            MONO EIGHT
          </span>
          <a
            href={`/stores/${store.slug}/category`}
            className="inline-flex items-center gap-3 font-[family:var(--font-kanit)] text-xs font-black uppercase tracking-[0.2em] text-[#e8e2d4] border border-[#e8e2d4]/30 px-8 py-3.5 hover:bg-[#e8e2d4] hover:text-[#0a0a0a] transition-all duration-300 group"
          >
            ดูคอลเลกชันทั้งหมด
            <ArrowRight size={14} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform duration-300" />
          </a>
        </div>
      </section>

    </main>
  );
}
