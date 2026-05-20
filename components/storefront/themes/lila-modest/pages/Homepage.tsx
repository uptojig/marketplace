'use client';
import React, { useState, useMemo } from 'react';
import { useCart } from '@/lib/store/cart';
import { useCartConfirmation } from '@/lib/store/cartConfirm';

/* ──────────────────────────── Types ──────────────────────────── */

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

/* ──────────────────────────── Component ──────────────────────── */

export function Homepage({ store, products, categories }: HomepageProps) {
  const add = useCart((s) => s.add);
  const showConfirm = useCartConfirmation((s) => s.show);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter((p) => p.categoryName === selectedCategory);
  }, [selectedCategory, products]);

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

  /* percentage discount helper */
  const discountPct = (price: number, compare: number) =>
    Math.round(((compare - price) / compare) * 100);

  return (
    <main className="bg-[#f5efe6] text-[#2a2118] min-h-screen">

      {/* ═══════════════════ Hero Section ═══════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#ede5d8] to-[#f5efe6]">
        {/* Subtle textile-inspired pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, #5b4636 0px, #5b4636 1px, transparent 1px, transparent 16px), repeating-linear-gradient(90deg, #5b4636 0px, #5b4636 1px, transparent 1px, transparent 16px)',
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left: Copy */}
            <div className="space-y-6 text-center lg:text-left">
              {/* Small badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#5b4636]/8 border border-[#5b4636]/15 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c9974b]" />
                <span className="font-[family:var(--font-prompt)] text-[11px] text-[#5b4636] font-medium tracking-wide">
                  modest wear · thai made
                </span>
              </div>

              <h1 className="font-[family:var(--font-kanit)] font-bold text-4xl sm:text-5xl lg:text-6xl text-[#2a2118] leading-[1.15] tracking-tight">
                คลุมได้ทุกโอกาส
              </h1>

              <p className="font-[family:var(--font-prompt)] text-sm sm:text-base text-[#6b5c47] max-w-md mx-auto lg:mx-0 leading-relaxed">
                เดรสยาว เสื้อคลุม และผ้าฮิญาบที่ออกแบบให้ใส่ได้ตั้งแต่ทำงานยันเที่ยว เนื้อผ้าระบายอากาศดี เหมาะกับอากาศไทย
              </p>

              <div className="flex flex-wrap gap-3 justify-center lg:justify-start pt-2">
                <a
                  href="#products"
                  className="inline-flex items-center gap-2 px-7 py-3 bg-[#5b4636] text-[#f5efe6] font-[family:var(--font-prompt)] text-sm font-semibold rounded-full hover:bg-[#4a392c] transition-colors shadow-lg shadow-[#5b4636]/20"
                >
                  เลือกเดรส
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-0.5">
                    <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
                <a
                  href={`/stores/${store.slug}/about`}
                  className="inline-flex items-center px-7 py-3 bg-transparent text-[#5b4636] border border-[#5b4636]/25 font-[family:var(--font-prompt)] text-sm font-medium rounded-full hover:bg-[#5b4636]/5 transition-colors"
                >
                  เรื่องของเรา
                </a>
              </div>
            </div>

            {/* Right: Decorative "fabric swatch" composition */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-sm">
                {/* Swatch 1 – tall */}
                <div className="col-span-1 row-span-2 rounded-2xl bg-[#c9974b]/15 aspect-[3/5] overflow-hidden relative group">
                  {products[0]?.imageUrl ? (
                    <img
                      src={products[0].imageUrl}
                      alt={products[0]?.title || ''}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-b from-[#c9974b]/20 to-[#c9974b]/10 flex items-center justify-center">
                      <span className="font-[family:var(--font-kanit)] text-[#c9974b]/40 text-3xl">ลี</span>
                    </div>
                  )}
                </div>
                {/* Swatch 2 – small */}
                <div className="rounded-2xl bg-[#e6dcc9] overflow-hidden relative group">
                  {products[1]?.imageUrl ? (
                    <img
                      src={products[1].imageUrl}
                      alt={products[1]?.title || ''}
                      className="w-full h-full object-cover aspect-square group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full aspect-square bg-gradient-to-br from-[#e6dcc9] to-[#d6c9b1]" />
                  )}
                </div>
                {/* Swatch 3 – small */}
                <div className="rounded-2xl bg-[#5b4636]/10 overflow-hidden relative group">
                  {products[2]?.imageUrl ? (
                    <img
                      src={products[2].imageUrl}
                      alt={products[2]?.title || ''}
                      className="w-full h-full object-cover aspect-square group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full aspect-square bg-gradient-to-br from-[#5b4636]/15 to-[#5b4636]/5" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ Trust Strip ═══════════════════ */}
      <section className="bg-[#ede5d8] border-y border-[#e6dcc9]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: '🧵', label: 'ผ้าเรยอน×ลินิน' },
              { icon: '🌿', label: 'ระบายอากาศดี' },
              { icon: '🇹🇭', label: 'ผลิตในนครปฐม' },
              { icon: '📦', label: 'ส่งฟรี ฿1,500+' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2.5 justify-center sm:justify-start">
                <span className="text-lg">{item.icon}</span>
                <span className="font-[family:var(--font-prompt)] text-xs text-[#5b4636] font-medium">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ Story Block ═══════════════════ */}
      <section className="py-16 sm:py-20 bg-[#f5efe6]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-[#e6dcc9] shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">

              {/* Story image side */}
              <div className="bg-[#e6dcc9] min-h-[280px] md:min-h-[360px] relative overflow-hidden">
                {products[3]?.imageUrl ? (
                  <img
                    src={products[3].imageUrl}
                    alt="เรื่องราวของเรา"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#e6dcc9] to-[#d6c9b1] flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <span className="font-[family:var(--font-kanit)] text-5xl text-[#c9974b]/30">ลีลา</span>
                      <p className="font-[family:var(--font-prompt)] text-xs text-[#8b7355]/50">textile on wood</p>
                    </div>
                  </div>
                )}
                {/* Soft overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#5b4636]/10 to-transparent" />
              </div>

              {/* Story copy side */}
              <div className="p-8 sm:p-10 md:p-12 flex flex-col justify-center">
                <span className="font-[family:var(--font-prompt)] text-[11px] tracking-wider text-[#c9974b] font-semibold uppercase mb-4 block">
                  our story
                </span>
                <h2 className="font-[family:var(--font-kanit)] font-bold text-2xl sm:text-3xl text-[#2a2118] leading-snug mb-5">
                  เริ่มจากตู้เสื้อผ้าตัวเอง
                </h2>
                <p className="font-[family:var(--font-prompt)] text-sm text-[#6b5c47] leading-relaxed mb-6">
                  เราเริ่มจากปัญหาว่าหาเดรสยาวที่ทรงสวยและเย็นไม่ได้ในไทย ทุกตัวถูกพัฒนากับโรงทอผ้าในนครปฐม ใช้ผ้าเรยอนผสมลินิน นุ่มและระบายอากาศ
                </p>

                {/* Fabric detail list */}
                <div className="space-y-3">
                  {[
                    { title: 'ผ้าเรยอน × ลินิน', desc: 'นุ่มลื่น ไม่ร้อน ซับเหงื่อได้ดี' },
                    { title: 'โรงทอนครปฐม', desc: 'ร่วมพัฒนากับช่างทอผ้าท้องถิ่น' },
                    { title: 'ใส่ได้ทุกวัน', desc: 'ทำงาน เดินห้าง ออกทริป' },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#c9974b] mt-1.5 flex-shrink-0" />
                      <div>
                        <span className="font-[family:var(--font-prompt)] text-xs font-semibold text-[#2a2118]">
                          {item.title}
                        </span>
                        <span className="font-[family:var(--font-prompt)] text-xs text-[#8b7355] ml-1.5">
                          — {item.desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <a
                  href={`/stores/${store.slug}/about`}
                  className="inline-flex items-center gap-2 mt-8 font-[family:var(--font-prompt)] text-sm text-[#c9974b] font-semibold hover:text-[#5b4636] transition-colors group"
                >
                  อ่านเพิ่มเติม
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="group-hover:translate-x-1 transition-transform">
                    <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ Product Grid ═══════════════════ */}
      <section id="products" className="py-14 sm:py-20 bg-[#f5efe6]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section heading */}
          <div className="text-center mb-10">
            <span className="font-[family:var(--font-prompt)] text-[11px] tracking-wider text-[#c9974b] font-semibold uppercase mb-2 block">
              collection
            </span>
            <h2 className="font-[family:var(--font-kanit)] font-bold text-2xl sm:text-3xl text-[#2a2118]">
              สินค้าแนะนำ
            </h2>
            <p className="font-[family:var(--font-prompt)] text-xs text-[#8b7355] mt-2">
              ผ้าคลุมไหล่และเดรสยาว สำหรับผู้หญิงที่ชอบใส่สบาย
            </p>
          </div>

          {/* Category filter chips */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mb-10">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full text-xs font-[family:var(--font-prompt)] font-medium transition-all ${
                  !selectedCategory
                    ? 'bg-[#5b4636] text-[#f5efe6] shadow-md shadow-[#5b4636]/15'
                    : 'bg-white text-[#5b4636] border border-[#e6dcc9] hover:border-[#c9974b] hover:text-[#c9974b]'
                }`}
              >
                ทั้งหมด
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-[family:var(--font-prompt)] font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#5b4636] text-[#f5efe6] shadow-md shadow-[#5b4636]/15'
                      : 'bg-white text-[#5b4636] border border-[#e6dcc9] hover:border-[#c9974b] hover:text-[#c9974b]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Product cards */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-[family:var(--font-prompt)] text-sm text-[#8b7355]">
                ยังไม่มีสินค้าในหมวดนี้
              </p>
              <button
                onClick={() => setSelectedCategory(null)}
                className="mt-4 px-5 py-2 bg-[#5b4636] text-[#f5efe6] text-xs font-[family:var(--font-prompt)] font-semibold rounded-full"
              >
                ดูทั้งหมด
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="group bg-white rounded-2xl border border-[#e6dcc9]/60 overflow-hidden hover:shadow-lg hover:shadow-[#5b4636]/8 transition-all duration-300 flex flex-col"
                >
                  {/* Image */}
                  <a
                    href={`/stores/${store.slug}/products/${p.id}`}
                    className="block relative overflow-hidden aspect-[3/4] bg-[#ede5d8]"
                  >
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-[#ede5d8] to-[#e6dcc9]">
                        <span className="font-[family:var(--font-kanit)] text-2xl text-[#c9974b]/25">ลี</span>
                      </div>
                    )}

                    {/* Discount badge */}
                    {p.compareAtPriceTHB && p.compareAtPriceTHB > p.priceTHB && (
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-[#c9974b] text-white text-[10px] font-[family:var(--font-prompt)] font-bold rounded-full">
                        -{discountPct(p.priceTHB, p.compareAtPriceTHB)}%
                      </span>
                    )}

                    {/* Category pill */}
                    {p.categoryName && (
                      <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 bg-white/80 backdrop-blur-sm text-[#5b4636] text-[10px] font-[family:var(--font-prompt)] font-medium rounded-full">
                        {p.categoryName}
                      </span>
                    )}

                    {/* Quick-add overlay — shows on hover */}
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-[#2a2118]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center">
                      <button
                        onClick={(e) => handleAddToCart(p, e)}
                        className="px-5 py-2 bg-white text-[#5b4636] text-xs font-[family:var(--font-prompt)] font-semibold rounded-full hover:bg-[#f5efe6] transition-colors shadow-lg"
                      >
                        + หยิบใส่ตะกร้า
                      </button>
                    </div>
                  </a>

                  {/* Info */}
                  <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                    <a href={`/stores/${store.slug}/products/${p.id}`} className="block">
                      <h3 className="font-[family:var(--font-prompt)] text-xs sm:text-sm font-medium text-[#2a2118] leading-snug line-clamp-2 group-hover:text-[#5b4636] transition-colors">
                        {p.title}
                      </h3>
                    </a>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-[family:var(--font-prompt)] text-sm sm:text-base font-bold text-[#2a2118] tabular-nums">
                          ฿{p.priceTHB.toLocaleString()}
                        </span>
                        {p.compareAtPriceTHB && p.compareAtPriceTHB > p.priceTHB && (
                          <span className="font-[family:var(--font-prompt)] text-[10px] sm:text-xs text-[#b5a48e] line-through tabular-nums">
                            ฿{p.compareAtPriceTHB.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Mobile-friendly add button */}
                      <button
                        onClick={(e) => handleAddToCart(p, e)}
                        className="sm:hidden w-8 h-8 rounded-full bg-[#5b4636] text-[#f5efe6] flex items-center justify-center hover:bg-[#4a392c] transition-colors flex-shrink-0"
                        aria-label="เพิ่มลงตะกร้า"
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* "View all" link */}
          <div className="text-center mt-12">
            <a
              href={`/stores/${store.slug}/category`}
              className="inline-flex items-center gap-2 px-7 py-3 bg-white text-[#5b4636] border border-[#e6dcc9] font-[family:var(--font-prompt)] text-sm font-medium rounded-full hover:border-[#c9974b] hover:text-[#c9974b] transition-all"
            >
              ดูสินค้าทั้งหมด
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════ Testimonial / Social Proof ═══════════════════ */}
      <section className="py-16 sm:py-20 bg-[#ede5d8]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="font-[family:var(--font-prompt)] text-[11px] tracking-wider text-[#c9974b] font-semibold uppercase mb-6 block">
            review
          </span>
          <blockquote className="font-[family:var(--font-prompt)] text-base sm:text-lg text-[#2a2118] leading-relaxed italic">
            &ldquo;ใส่ไปทำงานก็ได้ ออกทริปก็เท่ ผ้านิ่มมาก แถมระบายอากาศดีมากในหน้าร้อน ชอบที่ไม่ต้องรีดด้วย พับใส่กระเป๋าเดินทางได้สบาย&rdquo;
          </blockquote>
          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#c9974b]/20 flex items-center justify-center">
              <span className="font-[family:var(--font-kanit)] text-xs text-[#c9974b] font-bold">น</span>
            </div>
            <div className="text-left">
              <span className="font-[family:var(--font-prompt)] text-xs font-semibold text-[#2a2118] block">
                คุณนิดา
              </span>
              <span className="font-[family:var(--font-prompt)] text-[10px] text-[#8b7355]">
                ลูกค้าประจำ · กรุงเทพฯ
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ Newsletter / CTA ═══════════════════ */}
      <section className="py-14 sm:py-18 bg-[#5b4636]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-[family:var(--font-kanit)] font-bold text-xl sm:text-2xl text-[#f5efe6] mb-2">
            รับข่าวสารคอลเลกชันใหม่
          </h2>
          <p className="font-[family:var(--font-prompt)] text-xs text-[#c4b59b] mb-6">
            สมัครรับข่าวสาร ลด 10% สำหรับออเดอร์แรก
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="อีเมลของคุณ"
              className="flex-1 px-5 py-3 bg-[#4a392c] text-[#f5efe6] placeholder-[#8b7355] rounded-full font-[family:var(--font-prompt)] text-sm border border-[#6b5c47] focus:outline-none focus:border-[#c9974b] transition-colors"
            />
            <button className="px-7 py-3 bg-[#c9974b] text-white font-[family:var(--font-prompt)] text-sm font-semibold rounded-full hover:bg-[#b5873f] transition-colors shadow-lg shadow-[#c9974b]/20">
              สมัครเลย
            </button>
          </div>
        </div>
      </section>

    </main>
  );
}
