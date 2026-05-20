'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/store/cart';
import { useCartConfirmation } from '@/lib/store/cartConfirm';
import { ArrowRight, Plus } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  priceTHB: number;
  compareAtPriceTHB: number | null;
  imageUrl: string | null;
  categoryName: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface LinenAndLoomHomepageProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
  products: Product[];
  categories: Category[];
}

export function LinenAndLoomHomepage({ store, products, categories }: LinenAndLoomHomepageProps) {
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

  const featuredProducts = products.slice(0, 8);

  return (
    <div className="bg-[#f8fafc] min-h-screen text-[#0f172a] font-[family:var(--font-prompt)]">
      
      {/* Hero Section */}
      <section className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Soft fabric-like background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] opacity-80 mix-blend-multiply pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=2600&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          <span className="text-[#475569] font-[family:var(--font-kanit)] tracking-[0.2em] text-sm uppercase mb-6 block">
            Linen & Loom
          </span>
          <h1 className="text-5xl md:text-7xl font-light text-[#0f172a] font-[family:var(--font-kanit)] mb-8 leading-tight">
            ผ้าลินินที่ยิ่งซัก ยิ่งนุ่ม
          </h1>
          <p className="text-lg md:text-xl text-[#475569] mb-12 max-w-2xl font-light leading-relaxed">
            ผ้าปูที่นอน ผ้าห่ม และผ้าม่านจากลินินยุโรปทอเอง สีย้อมธรรมชาติทั้งหมด ส่งภายใน 3 วันทำการ
          </p>
          <Link
            href={`/${store.slug}/products`}
            className="inline-flex items-center gap-2 bg-[#475569] text-[#f8fafc] px-8 py-4 rounded-none hover:bg-[#0f172a] transition-all duration-300 tracking-wide font-[family:var(--font-kanit)]"
          >
            เลือกผ้าปูที่นอน
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Philosophy/Material Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#e2e8f0]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="aspect-[4/5] bg-[#f1f5f9] relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1616627547584-bf28cee262db?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-105 opacity-80 mix-blend-multiply"></div>
          </div>
          <div className="pl-0 md:pl-12">
            <h2 className="text-3xl font-light font-[family:var(--font-kanit)] text-[#0f172a] mb-6">สัมผัสธรรมชาติในทุกการพักผ่อน</h2>
            <p className="text-[#475569] leading-relaxed mb-8">
              เราคัดสรรเส้นใยลินินคุณภาพสูงจากยุโรป ผ่านกระบวนการทอที่พิถีพิถันและย้อมสีด้วยวิถีธรรมชาติ 
              ปราศจากสารเคมีตกค้าง เพื่อให้คุณได้สัมผัสถึงความโปร่งสบาย ระบายอากาศได้ดี 
              และยิ่งนุ่มขึ้นทุกครั้งที่ซัก เหมาะกับสภาพอากาศและไลฟ์สไตล์ของบ้านเรา
            </p>
            <div className="grid grid-cols-2 gap-8 border-t border-[#e2e8f0] pt-8">
              <div>
                <span className="block text-2xl text-[#475569] font-light mb-2">100%</span>
                <span className="text-sm text-[#94a3b8]">เส้นใยลินินธรรมชาติ</span>
              </div>
              <div>
                <span className="block text-2xl text-[#475569] font-light mb-2">0%</span>
                <span className="text-sm text-[#94a3b8]">สารเคมีอันตราย</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light font-[family:var(--font-kanit)] text-[#0f172a]">เลือกตามห้อง</h2>
            <div className="w-12 h-px bg-[#94a3b8] mx-auto mt-6"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.slice(0, 3).map((category, index) => (
              <Link
                key={category.id}
                href={`/${store.slug}/categories/${category.slug}`}
                className="group block relative aspect-square overflow-hidden bg-[#f1f5f9]"
              >
                {/* Fallback image for categories using unsplash fabric/home images */}
                <div className={`absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-60 mix-blend-multiply ${
                  index === 0 ? "bg-[url('https://images.unsplash.com/photo-1522771731478-44eb10e5c776?q=80&w=1000&auto=format&fit=crop')]" :
                  index === 1 ? "bg-[url('https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1000&auto=format&fit=crop')]" :
                  "bg-[url('https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1000&auto=format&fit=crop')]"
                }`}></div>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-white/90 backdrop-blur-sm px-8 py-3 text-[#0f172a] font-[family:var(--font-kanit)] text-lg tracking-wide uppercase transition-transform group-hover:-translate-y-1">
                    {category.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-white border-y border-[#e2e8f0]">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h2 className="text-3xl font-light font-[family:var(--font-kanit)] text-[#0f172a] mb-2">สินค้าแนะนำ</h2>
            <p className="text-[#475569]">คอลเลกชันที่ได้รับความนิยมที่สุดของเรา</p>
          </div>
          <Link href={`/${store.slug}/products`} className="hidden md:flex items-center gap-2 text-[#475569] hover:text-[#0f172a] transition-colors pb-1 border-b border-transparent hover:border-[#0f172a]">
            ดูทั้งหมด
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {featuredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/${store.slug}/products/${product.id}`}
              className="group flex flex-col"
            >
              <div className="relative aspect-[3/4] bg-[#f8fafc] mb-6 overflow-hidden">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[#94a3b8] font-light">
                    ไม่มีรูปภาพ
                  </div>
                )}
                
                {/* Quick Add Button */}
                <button
                  onClick={(e) => handleAddToCart(product, e)}
                  className="absolute bottom-0 left-0 w-full bg-white/90 backdrop-blur text-[#0f172a] py-3 flex items-center justify-center gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 font-[family:var(--font-kanit)] border-t border-[#e2e8f0]"
                >
                  <Plus className="w-4 h-4" />
                  เพิ่มลงตะกร้า
                </button>
              </div>

              <div className="flex flex-col flex-1">
                {product.categoryName && (
                  <span className="text-xs text-[#94a3b8] mb-2 font-[family:var(--font-kanit)] uppercase tracking-wider">
                    {product.categoryName}
                  </span>
                )}
                <h3 className="text-[#0f172a] font-light mb-2 line-clamp-2 leading-relaxed group-hover:text-[#475569] transition-colors">
                  {product.title}
                </h3>
                <div className="mt-auto pt-4 flex items-center gap-3">
                  <span className="text-[#475569] font-medium">
                    ฿{product.priceTHB.toLocaleString()}
                  </span>
                  {product.compareAtPriceTHB && product.compareAtPriceTHB > product.priceTHB && (
                    <span className="text-[#94a3b8] line-through text-sm">
                      ฿{product.compareAtPriceTHB.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter / Closing */}
      <section className="py-32 px-4 text-center bg-[#f8fafc]">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-light font-[family:var(--font-kanit)] text-[#0f172a] mb-6">ความสบายที่รอคุณอยู่</h2>
          <p className="text-[#475569] mb-10 leading-relaxed">
            ติดตามข่าวสาร คอลเลกชันใหม่ และแรงบันดาลใจในการตกแต่งบ้าน<br className="hidden sm:block"/>
            พร้อมรับส่วนลด 10% สำหรับการสั่งซื้อครั้งแรก
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="อีเมลของคุณ" 
              className="flex-1 px-4 py-3 bg-white border border-[#e2e8f0] focus:outline-none focus:border-[#475569] text-[#0f172a]"
            />
            <button className="bg-[#0f172a] text-white px-8 py-3 hover:bg-[#475569] transition-colors font-[family:var(--font-kanit)] whitespace-nowrap">
              ติดตาม
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
