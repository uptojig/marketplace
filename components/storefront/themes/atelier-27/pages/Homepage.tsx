'use client';
import React, { useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useCart } from '@/lib/store/cart';

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
  const add = useCart((s) => s.add);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

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

  const filteredProducts = useMemo(() => {
    if (!activeCategory) return products;
    return products.filter((p) => p.categoryName === activeCategory);
  }, [activeCategory, products]);

  // Pick a hero product (first with image)
  const heroProduct = products.find((p) => p.imageUrl) || products[0];

  return (
    <main className="bg-[#fafaf9] text-[#1c1917] min-h-screen">

      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[85vh] lg:min-h-[90vh]">

            {/* Left text column — asymmetric, narrow */}
            <div className="lg:col-span-5 flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-16 lg:py-24 order-2 lg:order-1">
              {/* Eyebrow */}
              <span className="font-[family:var(--font-kanit)] font-light text-[10px] tracking-[0.5em] uppercase text-[#a8a29e] mb-8 block">
                Bespoke
              </span>

              {/* Headline — Kanit Light, massive, wide tracking */}
              <h1 className="font-[family:var(--font-kanit)] font-light text-[clamp(2rem,5vw,3.5rem)] leading-[1.15] tracking-[0.08em] text-[#1c1917] mb-8">
                ทุกตะเข็บ
                <br />
                วัดจากร่างกาย
                <br />
                ของคุณ
              </h1>

              {/* Subheadline */}
              <p className="font-[family:var(--font-prompt)] text-sm leading-relaxed text-[#78716c] max-w-md mb-10">
                บริการตัดสูทผู้ชายและผู้หญิง ฟิตติ้งฟรีที่สาขาสุขุมวิท 27
                ระยะเวลาตัด 14 วัน ขั้นต่ำสองชิ้น
              </p>

              {/* CTA */}
              <a
                href={`/stores/${store.slug}/about`}
                className="group inline-flex items-center gap-3 font-[family:var(--font-kanit)] font-light text-xs tracking-[0.35em] uppercase text-[#1c1917] border-b border-[#1c1917] pb-2 hover:border-[#a8a29e] hover:text-[#78716c] transition-all duration-500 w-fit"
              >
                นัดวัดตัว
                <ArrowRight size={14} strokeWidth={1.25} className="group-hover:translate-x-1 transition-transform duration-300" />
              </a>
            </div>

            {/* Right hero image — asymmetric, dominant */}
            <div className="lg:col-span-7 relative bg-[#f5f5f4] order-1 lg:order-2 min-h-[50vh] lg:min-h-0">
              {heroProduct?.imageUrl ? (
                <img
                  src={heroProduct.imageUrl}
                  alt={heroProduct.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-[family:var(--font-kanit)] font-light text-6xl tracking-[0.5em] text-[#e7e5e4] uppercase">
                    A27
                  </span>
                </div>
              )}

              {/* Floating eyebrow over the image, top-right */}
              <div className="absolute top-8 right-8 hidden lg:block">
                <span className="font-[family:var(--font-kanit)] font-light text-[10px] tracking-[0.5em] uppercase text-white/60 mix-blend-difference">
                  สุขุมวิท 27
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── Tagline divider ─── */}
      <section className="py-16 sm:py-20 border-y border-[#e7e5e4]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <p className="font-[family:var(--font-kanit)] font-light text-lg sm:text-xl tracking-[0.2em] text-[#a8a29e] uppercase">
            สูทตัดเฉพาะบุคคล สั่งจองล่วงหน้า 14 วัน
          </p>
        </div>
      </section>

      {/* ─── Atelier values — horizontal scroll on mobile ─── */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-8 lg:gap-16">
            {[
              { label: 'วัดตัว', desc: 'ทุกชิ้นวัดจากร่างกายจริง ไม่ใช้ไซส์สำเร็จรูป', eng: 'Measurement' },
              { label: 'ตัดเย็บ', desc: 'ช่างตัดเย็บประสบการณ์กว่า 20 ปี ผ้าคุณภาพนำเข้า', eng: 'Craftsmanship' },
              { label: 'ฟิตติ้ง', desc: 'ลองเสื้อฟรีก่อนรับ ปรับแก้จนสมบูรณ์', eng: 'Fitting' },
            ].map((item, i) => (
              <div key={i} className="text-center sm:text-left space-y-4">
                <span className="font-[family:var(--font-prompt)] text-[10px] tracking-[0.35em] uppercase text-[#a8a29e] block">
                  {item.eng}
                </span>
                <h3 className="font-[family:var(--font-kanit)] font-light text-2xl tracking-[0.15em] text-[#1c1917]">
                  {item.label}
                </h3>
                <p className="font-[family:var(--font-prompt)] text-sm text-[#78716c] leading-relaxed max-w-xs mx-auto sm:mx-0">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Category filter chips ─── */}
      {categories.length > 0 && (
        <section className="border-t border-[#e7e5e4] pt-12 pb-4">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar pb-2">
              <button
                onClick={() => setActiveCategory(null)}
                className={`font-[family:var(--font-kanit)] font-light text-[11px] tracking-[0.3em] uppercase whitespace-nowrap pb-1 border-b transition-all duration-300 ${
                  activeCategory === null
                    ? 'text-[#1c1917] border-[#1c1917]'
                    : 'text-[#a8a29e] border-transparent hover:text-[#78716c]'
                }`}
              >
                ทั้งหมด
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`font-[family:var(--font-kanit)] font-light text-[11px] tracking-[0.3em] uppercase whitespace-nowrap pb-1 border-b transition-all duration-300 ${
                    activeCategory === cat
                      ? 'text-[#1c1917] border-[#1c1917]'
                      : 'text-[#a8a29e] border-transparent hover:text-[#78716c]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Products grid ─── */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">

          {/* Section header */}
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="font-[family:var(--font-prompt)] text-[10px] tracking-[0.35em] uppercase text-[#a8a29e] block mb-3">
                Collection
              </span>
              <h2 className="font-[family:var(--font-kanit)] font-light text-2xl sm:text-3xl tracking-[0.12em] text-[#1c1917]">
                ผลงานของเรา
              </h2>
            </div>
            <a
              href={`/stores/${store.slug}/category`}
              className="hidden sm:inline-flex items-center gap-2 font-[family:var(--font-prompt)] text-[11px] tracking-[0.2em] uppercase text-[#78716c] hover:text-[#1c1917] transition-colors duration-300"
            >
              ดูทั้งหมด
              <ArrowRight size={12} strokeWidth={1.25} />
            </a>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-[family:var(--font-prompt)] text-sm text-[#a8a29e]">
                ไม่พบสินค้าในหมวดหมู่นี้
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 lg:gap-x-8 lg:gap-y-16">
              {filteredProducts.map((p) => (
                <div key={p.id} className="group">
                  {/* Product image */}
                  <a
                    href={`/stores/${store.slug}/products/${p.id}`}
                    className="block aspect-[3/4] bg-[#f5f5f4] overflow-hidden mb-5 relative"
                  >
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="font-[family:var(--font-kanit)] font-light text-3xl tracking-[0.4em] text-[#e7e5e4] uppercase">
                          A27
                        </span>
                      </div>
                    )}

                    {/* Quick add — appears on hover */}
                    <button
                      onClick={(e) => handleAddToCart(p, e)}
                      className="absolute bottom-0 left-0 right-0 bg-[#1c1917]/90 backdrop-blur-sm text-[#fafaf9] py-3 font-[family:var(--font-kanit)] font-light text-[11px] tracking-[0.35em] uppercase text-center translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"
                    >
                      เพิ่มลงตะกร้า
                    </button>
                  </a>

                  {/* Product info — no ratings, pure minimal */}
                  <a href={`/stores/${store.slug}/products/${p.id}`} className="block space-y-2">
                    {p.categoryName && (
                      <span className="font-[family:var(--font-prompt)] text-[10px] tracking-[0.3em] uppercase text-[#a8a29e] block">
                        {p.categoryName}
                      </span>
                    )}
                    <h3 className="font-[family:var(--font-prompt)] text-sm text-[#1c1917] leading-snug line-clamp-2 group-hover:text-[#78716c] transition-colors duration-300">
                      {p.title}
                    </h3>
                    <div className="flex items-center gap-3 pt-1">
                      <span className="font-[family:var(--font-prompt)] text-sm text-[#1c1917] tabular-nums">
                        ฿{p.priceTHB.toLocaleString()}
                      </span>
                      {p.compareAtPriceTHB && (
                        <span className="font-[family:var(--font-prompt)] text-xs text-[#a8a29e] line-through tabular-nums">
                          ฿{p.compareAtPriceTHB.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Mobile view-all link */}
          <div className="sm:hidden text-center mt-12">
            <a
              href={`/stores/${store.slug}/category`}
              className="inline-flex items-center gap-2 font-[family:var(--font-kanit)] font-light text-xs tracking-[0.3em] uppercase text-[#1c1917] border-b border-[#1c1917] pb-1 hover:border-[#a8a29e] hover:text-[#78716c] transition-all duration-300"
            >
              ดูทั้งหมด
              <ArrowRight size={12} strokeWidth={1.25} />
            </a>
          </div>
        </div>
      </section>

      {/* ─── Editorial / testimonial band ─── */}
      <section className="border-t border-[#e7e5e4] bg-[#f5f5f4]">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-20 sm:py-28 text-center">
          <span className="font-[family:var(--font-prompt)] text-[10px] tracking-[0.4em] uppercase text-[#a8a29e] block mb-8">
            Craftsmanship
          </span>
          <blockquote className="font-[family:var(--font-kanit)] font-light text-xl sm:text-2xl lg:text-3xl tracking-[0.06em] leading-relaxed text-[#44403c]">
            &ldquo;เราไม่ได้ขายสูท เราออกแบบสิ่งที่อยู่บนร่างกายคุณ
            ให้เข้ากับทุกสัดส่วนอย่างที่ไม่มีแบรนด์ไหนทำซ้ำได้&rdquo;
          </blockquote>
          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="w-8 h-px bg-[#a8a29e]" />
            <span className="font-[family:var(--font-prompt)] text-[10px] tracking-[0.3em] uppercase text-[#a8a29e]">
              Atelier 27
            </span>
            <div className="w-8 h-px bg-[#a8a29e]" />
          </div>
        </div>
      </section>

      {/* ─── Appointment CTA band ─── */}
      <section className="bg-[#1c1917] text-[#fafaf9]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-20 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="text-center sm:text-left">
            <h3 className="font-[family:var(--font-kanit)] font-light text-xl sm:text-2xl tracking-[0.15em] mb-3">
              เริ่มต้นสร้างสูทของคุณ
            </h3>
            <p className="font-[family:var(--font-prompt)] text-xs text-[#78716c] tracking-wide">
              นัดวัดตัวฟรีที่สาขาสุขุมวิท 27 เปิดเฉพาะนัดล่วงหน้า
            </p>
          </div>
          <a
            href={`/stores/${store.slug}/about`}
            className="group inline-flex items-center gap-3 font-[family:var(--font-kanit)] font-light text-xs tracking-[0.35em] uppercase text-[#fafaf9] border border-[#44403c] px-8 py-4 hover:bg-[#fafaf9] hover:text-[#1c1917] transition-all duration-500"
          >
            นัดวัดตัว
            <ArrowRight size={14} strokeWidth={1.25} className="group-hover:translate-x-1 transition-transform duration-300" />
          </a>
        </div>
      </section>

    </main>
  );
}
