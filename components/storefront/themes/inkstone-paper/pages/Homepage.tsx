'use client';

import React from 'react';
import Link from 'next/link';
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

interface InkstonePaperHomepageProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
  products: Product[];
  categories: { id: string; name: string }[];
}

export function InkstonePaperHomepage({
  store,
  products,
  categories,
}: InkstonePaperHomepageProps) {
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

  const japaneseLabels = ['京都からの', '手作り', '限定版', '職人技', '特別な墨'];
  const thaiLabels = ['จากเกียวโต', 'ทำด้วยมือ', 'รุ่นลิมิเต็ด', 'ทักษะช่าง', 'หมึกพิเศษ'];

  return (
    <div className="min-h-screen bg-[#f7f1e3] text-[#3a2e22]">
      {/* HERO SECTION */}
      <section className="relative w-full h-[80vh] md:h-[90vh] flex flex-col justify-end pb-12 md:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#3a2e22]">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1516961642265-531546e84af2?auto=format&fit=crop&q=80&w=1600" 
            alt="Maker portrait" 
            className="w-full h-full object-cover object-center grayscale opacity-60 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#f7f1e3] via-[#f7f1e3]/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8 mt-auto">
          <div className="inline-block relative">
            <span className="absolute -top-6 -left-8 text-[#c9974b] text-xl font-[family:var(--font-kanit)] italic rotate-[-15deg] opacity-90 drop-shadow-sm">
              職人の魂
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-[family:var(--font-kanit)] font-light tracking-tight text-[#3a2e22] leading-tight">
              ปากกาที่ขีดได้เรียบ <br/><span className="italic">ตลอดทั้งชีวิต</span>
            </h1>
          </div>
          <p className="text-base md:text-lg font-[family:var(--font-prompt)] font-light text-[#3a2e22]/80 max-w-2xl mx-auto leading-relaxed">
            ปากกาหมึกซึม สมุดทำมือ และหมึกเฉพาะรุ่นนำเข้าจากญี่ปุ่น คัดเลือกจากร้านในเกียวโตและโตเกียว
          </p>
          <div className="pt-4">
            <Link 
              href={`/stores/${store.slug}`}
              className="inline-flex items-center justify-center px-10 py-4 border border-[#3a2e22] text-[#3a2e22] hover:bg-[#3a2e22] hover:text-[#f7f1e3] transition-all duration-500 font-[family:var(--font-prompt)] uppercase tracking-[0.2em] text-sm"
            >
              ดูปากกาทั้งหมด
            </Link>
          </div>
        </div>
      </section>

      {/* PRODUCTS SECTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-16 flex flex-col items-center text-center space-y-4">
          <h2 className="text-2xl md:text-3xl font-[family:var(--font-kanit)] font-light text-[#3a2e22] tracking-wide">
            เครื่องเขียนญี่ปุ่นและสมุดทำมือ
          </h2>
          <div className="w-12 h-[1px] bg-[#c9974b]"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {products.map((product, idx) => {
            const jpLabel = japaneseLabels[idx % japaneseLabels.length];
            const thLabel = thaiLabels[idx % thaiLabels.length];
            return (
              <Link key={product.id} href={`/stores/${store.slug}/products/${product.id}`} className="group flex flex-col">
                <div className="relative aspect-[4/5] mb-6 overflow-hidden bg-[#e6dcc4] p-4 shadow-sm group-hover:shadow-md transition-shadow duration-500 flex items-center justify-center">
                  
                  {/* Washi Paper Effect Background */}
                  <div className="absolute inset-0 bg-[#f7f1e3] opacity-90" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'100\\' height=\\'100\\' viewBox=\\'0 0 100 100\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cfilter id=\\'noise\\'%3E%3CfeTurbulence type=\\'fractalNoise\\' baseFrequency=\\'0.8\\' numOctaves=\\'4\\' stitchTiles=\\'stitch\\'/%3E%3C/filter%3E%3Crect width=\\'100\\' height=\\'100\\' filter=\\'url(%23noise)\\' opacity=\\'0.15\\'/%3E%3C/svg%3E')" }}></div>
                  
                  {/* Hand-written eyebrow label */}
                  <div className="absolute top-4 left-4 z-20 transform -rotate-2">
                    <div className="flex flex-col">
                      <span className="text-[#c9974b] text-sm font-[family:var(--font-kanit)] italic tracking-widest">{jpLabel}</span>
                      <span className="text-[#3a2e22]/60 text-[10px] font-[family:var(--font-prompt)]">{thLabel}</span>
                    </div>
                  </div>

                  <div className="relative z-10 w-full h-full flex items-center justify-center p-8">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.title} 
                        className="w-full h-full object-contain mix-blend-multiply drop-shadow-xl group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#e6dcc4]/50 flex items-center justify-center text-[#3a2e22]/30 font-[family:var(--font-prompt)] uppercase tracking-widest text-xs">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Add to Cart Overlay Button */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-20 w-[80%]">
                    <button 
                      onClick={(e) => handleAddToCart(product, e)}
                      className="w-full bg-[#3a2e22] text-[#f7f1e3] px-6 py-3 text-xs font-[family:var(--font-prompt)] uppercase tracking-widest hover:bg-[#c9974b] transition-colors"
                    >
                      ใส่ตะกร้า
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-center text-center space-y-2 px-4">
                  <h3 className="text-base font-[family:var(--font-kanit)] font-light text-[#3a2e22] group-hover:text-[#c9974b] transition-colors line-clamp-2">
                    {product.title}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-[family:var(--font-prompt)] text-[#3a2e22]">
                      ฿{product.priceTHB.toLocaleString()}
                    </span>
                    {product.compareAtPriceTHB && (
                      <span className="text-xs font-[family:var(--font-prompt)] text-[#3a2e22]/50 line-through">
                        ฿{product.compareAtPriceTHB.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* STORY SECTION */}
      <section className="bg-[#3a2e22] text-[#f7f1e3] py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <span className="text-[#c9974b] font-[family:var(--font-kanit)] text-xl italic tracking-widest">
            The Maker&apos;s Mark
          </span>
          <h2 className="text-3xl md:text-5xl font-[family:var(--font-kanit)] font-light leading-snug">
            ศิลปะแห่งการเขียน <br className="hidden md:block" /> ที่สืบทอดจากรุ่นสู่รุ่น
          </h2>
          <p className="font-[family:var(--font-prompt)] font-light text-[#e6dcc4] max-w-2xl mx-auto leading-relaxed text-sm md:text-base">
            ทุกหยดหมึกที่ซึมซับลงบนกระดาษคือเรื่องราว เราเดินทางไปยังเกียวโตและโตเกียว 
            เพื่อคัดสรรกระดาษ Washi และปากกาหมึกซึมที่ทำด้วยมือจากช่างฝีมือผู้หลงใหลในศิลปะการเขียน 
            ให้ทุกตัวอักษรของคุณมีชีวิตและจิตวิญญาณ
          </p>
          <div className="pt-8">
            <img 
              src="https://images.unsplash.com/photo-1583225214464-9296029427aa?auto=format&fit=crop&q=80&w=800" 
              alt="Artisan hands" 
              className="w-full h-64 md:h-96 object-cover grayscale opacity-80"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
