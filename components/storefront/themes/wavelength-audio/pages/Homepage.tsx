'use client';

import React, { useEffect, useState } from 'react';
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

interface WavelengthAudioHomepageProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
  products: Product[];
  categories: any[];
}

export function WavelengthAudioHomepage({ store, products }: WavelengthAudioHomepageProps) {
  const add = useCart((s) => s.add);
  const showConfirm = useCartConfirmation((s) => s.show);

  const product = products[0] || {
    id: 'wv1-default',
    title: 'WV1',
    priceTHB: 12900,
    compareAtPriceTHB: null,
    imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=2000',
    categoryName: 'Headphones',
  };

  const handleAddToCart = (productToBuy: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add({
      productId: productToBuy.id,
      storeSlug: store.slug,
      storeName: store.name,
      title: productToBuy.title,
      priceTHB: productToBuy.priceTHB,
      imageUrl: productToBuy.imageUrl || undefined,
    });
    showConfirm(productToBuy.title, store.slug);
  };

  return (
    <div className="bg-[#fafafa] min-h-screen relative text-[#0a0a0a]">
      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 w-full z-50 bg-[#fafafa]/90 backdrop-blur-xl border-t border-[#0a0a0a]/10 p-4 md:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="container mx-auto flex items-center justify-between">
          <div className="hidden md:block">
            <h2 className="font-[family:var(--font-prompt)] text-xl tracking-[0.16em] uppercase font-bold text-[#0a0a0a]">
              {product.title}
            </h2>
            <p className="font-[family:var(--font-kanit)] text-sm text-[#0a0a0a]/60 mt-1 font-medium">
              {product.priceTHB.toLocaleString('th-TH')} THB
            </p>
          </div>
          <button
            onClick={(e) => handleAddToCart(product, e)}
            className="w-full md:w-auto bg-[#dc2626] hover:bg-[#b91c1c] text-[#fafafa] font-[family:var(--font-kanit)] py-4 px-12 rounded-none text-lg font-medium tracking-wider uppercase transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)]"
          >
            สั่งจอง WV1
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[120svh] w-full overflow-hidden flex flex-col justify-start pt-32">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-90"
          style={{
            backgroundImage: `url('${product.imageUrl || "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=2000"}')`,
            backgroundAttachment: 'fixed',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#fafafa] via-[#fafafa]/40 to-[#fafafa] z-10" />
        
        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto">
          <h1 className="font-[family:var(--font-prompt)] text-5xl md:text-7xl lg:text-8xl tracking-[0.16em] uppercase font-bold text-[#0a0a0a] mb-8 leading-tight drop-shadow-sm">
            WV1 — หูฟังที่เราอยากใส่เอง
          </h1>
          <p className="font-[family:var(--font-kanit)] text-lg md:text-2xl text-[#0a0a0a]/80 font-medium leading-relaxed max-w-2xl mx-auto">
            หูฟัง over-ear ไดรเวอร์ planar magnetic ขนาด 50mm สั่งล่วงหน้า 14 วัน ผลิตในไต้หวัน รับประกัน 5 ปี
          </p>
        </div>

        {/* Feature / Spec Callouts */}
        <div id="specs" className="relative z-20 w-full mt-auto pb-48 pt-32">
          <div className="container mx-auto max-w-5xl px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24 bg-[#fafafa]/80 backdrop-blur-md p-12 shadow-2xl border border-[#0a0a0a]/5">
              <div className="text-center group">
                <div className="text-6xl font-[family:var(--font-prompt)] text-[#dc2626] mb-6 font-light group-hover:scale-105 transition-transform duration-500">50</div>
                <h3 className="font-[family:var(--font-prompt)] font-normal text-sm tracking-[0.16em] uppercase text-[#0a0a0a] mb-4">
                  PLANAR MAGNETIC
                </h3>
                <p className="font-[family:var(--font-kanit)] text-[#0a0a0a]/70 text-sm leading-relaxed font-medium">
                  ไดรเวอร์ขนาด 50 มิลลิเมตร ที่ให้รายละเอียดเสียงที่ครบถ้วนและแม่นยำที่สุด
                </p>
              </div>
              
              <div className="text-center group">
                <div className="text-6xl font-[family:var(--font-prompt)] text-[#dc2626] mb-6 font-light group-hover:scale-105 transition-transform duration-500">Al</div>
                <h3 className="font-[family:var(--font-prompt)] font-normal text-sm tracking-[0.16em] uppercase text-[#0a0a0a] mb-4">
                  AEROSPACE GRADE
                </h3>
                <p className="font-[family:var(--font-kanit)] text-[#0a0a0a]/70 text-sm leading-relaxed font-medium">
                  โครงสร้างอลูมิเนียมเกรดอากาศยาน น้ำหนักเบาแต่แข็งแรงทนทานเป็นเลิศ
                </p>
              </div>
              
              <div className="text-center group">
                <div className="text-6xl font-[family:var(--font-prompt)] text-[#dc2626] mb-6 font-light group-hover:scale-105 transition-transform duration-500">14</div>
                <h3 className="font-[family:var(--font-prompt)] font-normal text-sm tracking-[0.16em] uppercase text-[#0a0a0a] mb-4">
                  DAYS CRAFTING
                </h3>
                <p className="font-[family:var(--font-kanit)] text-[#0a0a0a]/70 text-sm leading-relaxed font-medium">
                  ทุกตัวประกอบด้วยมือ ใช้เวลา 14 วันเพื่อความสมบูรณ์แบบก่อนส่งมอบ
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
