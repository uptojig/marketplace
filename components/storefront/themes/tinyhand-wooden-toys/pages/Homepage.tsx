'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/lib/store/cart';

interface Product {
  id: string;
  title: string;
  priceTHB: number;
  compareAtPriceTHB: number | null;
  imageUrl: string | null;
  categoryName: string | null;
}

interface HomepageProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
  products: Product[];
  categories: any[];
}

export function TinyhandHomepage({ store, products, categories }: HomepageProps) {
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

  const ageCategories = [
    { label: '1+ ขวบ', color: 'bg-[#e07a5f]', desc: 'เริ่มเรียนรู้' },
    { label: '2+ ขวบ', color: 'bg-[#3d405b]', desc: 'พัฒนาการ' },
    { label: '3+ ขวบ', color: 'bg-[#81b29a]', desc: 'จินตนาการ' },
    { label: '4+ ขวบ', color: 'bg-[#f2cc8f]', desc: 'ทักษะ' },
  ];

  return (
    <div className="bg-[#f7f1e3] min-h-screen text-[#3a2e22] font-[family:var(--font-prompt)] relative">
      {/* Kraft paper texture overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-40 pointer-events-none" 
        style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}
      ></div>
      
      {/* Hero Section */}
      <section className="relative z-10 px-4 py-16 md:py-24 overflow-hidden border-b-[8px] border-[#c9974b]">
        <div className="container mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left z-10">
            <h1 className="font-[family:var(--font-kanit)] text-4xl md:text-6xl font-extrabold text-[#3a2e22] mb-6 leading-tight">
              ของเล่นที่ส่งต่อให้รุ่นต่อไปได้
            </h1>
            <p className="text-lg md:text-xl text-[#4a3e32] mb-8 max-w-xl mx-auto md:mx-0">
              ของเล่นไม้สำหรับเด็ก 0-5 ขวบ ทำจากไม้บีชจากสวนป่ายุโรป สีย้อมจากผัก ผ่านการทดสอบ EN71 และ ASTM F963
            </p>
            <Link 
              href={`/stores/${store.slug}/products`}
              className="inline-block bg-[#c9974b] hover:bg-[#b0823b] text-[#f7f1e3] font-[family:var(--font-kanit)] text-lg px-8 py-4 rounded-full shadow-[0_4px_0_#8b6528] active:shadow-[0_0px_0_#8b6528] active:translate-y-[4px] transition-all font-bold"
            >
              เลือกตามอายุ
            </Link>
          </div>
          <div className="flex-1 relative w-full aspect-square max-w-md mx-auto md:max-w-full">
            <div className="absolute inset-0 bg-[#ebe1c8] rounded-[60px] rotate-3 transform z-0"></div>
            <div className="absolute inset-0 bg-white rounded-[60px] -rotate-3 transform shadow-xl overflow-hidden z-10 flex items-center justify-center p-8">
              <div className="relative w-full h-full rounded-[40px] overflow-hidden bg-[#f7f1e3] border-4 border-[#ebe1c8]">
                <Image
                  src="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80"
                  alt="Wooden Toys"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Age Categories - Colored Tiles */}
      <section className="relative z-10 py-16 container mx-auto px-4">
        <h2 className="font-[family:var(--font-kanit)] text-3xl font-bold text-center mb-12 text-[#3a2e22]">
          ของเล่นเหมาะสำหรับทุกช่วงวัย
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {ageCategories.map((cat, i) => (
            <Link href={`/stores/${store.slug}/category/age-${i+1}`} key={i} className="group block transform hover:-translate-y-2 transition-transform">
              <div className={`${cat.color} aspect-square rounded-3xl p-6 flex flex-col justify-center items-center text-center shadow-md`}>
                <span className="font-[family:var(--font-kanit)] text-4xl md:text-5xl font-black text-white mb-2 group-hover:scale-110 transition-transform">
                  {cat.label}
                </span>
                <span className="font-[family:var(--font-prompt)] text-white/90 font-medium">
                  {cat.desc}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section className="relative z-10 py-16 bg-white/50 border-y border-[#ebe1c8]">
        <div className="container mx-auto px-4">
          <h2 className="font-[family:var(--font-kanit)] text-3xl font-bold text-center mb-12 text-[#3a2e22]">
            สินค้ามาใหม่
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.slice(0, 8).map((product) => (
              <Link key={product.id} href={`/stores/${store.slug}/products/${product.id}`} className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-[#ebe1c8]">
                <div className="relative aspect-[4/3] bg-[#f7f1e3] p-4">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.title}
                      fill
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#c9974b] opacity-50 font-[family:var(--font-kanit)] text-xl font-bold">
                      TINYHAND
                    </div>
                  )}
                </div>
                <div className="p-6">
                  {product.categoryName && (
                    <div className="text-xs text-[#c9974b] font-bold mb-2 uppercase tracking-wider">
                      {product.categoryName}
                    </div>
                  )}
                  <h3 className="font-bold text-[#3a2e22] text-lg mb-3 line-clamp-2 leading-tight min-h-[3rem]">
                    {product.title}
                  </h3>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex flex-col">
                      {product.compareAtPriceTHB && product.compareAtPriceTHB > product.priceTHB ? (
                        <div className="flex items-baseline gap-2">
                          <span className="text-[#3a2e22] font-[family:var(--font-kanit)] font-bold text-xl">
                            ฿{product.priceTHB.toLocaleString()}
                          </span>
                          <span className="text-[#c9974b] text-sm line-through opacity-70">
                            ฿{product.compareAtPriceTHB.toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#3a2e22] font-[family:var(--font-kanit)] font-bold text-xl">
                          ฿{product.priceTHB.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={(e) => handleAddToCart(product, e)}
                      className="bg-[#3a2e22] hover:bg-[#c9974b] text-[#f7f1e3] w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-sm"
                      aria-label="Add to cart"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 9h14l1.5 7H3.5L5 9z"/><path d="M9 9V5a3 3 0 0 1 6 0v4"/></svg>
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href={`/stores/${store.slug}/products`} className="inline-block bg-transparent border-2 border-[#3a2e22] text-[#3a2e22] hover:bg-[#3a2e22] hover:text-[#f7f1e3] font-[family:var(--font-kanit)] font-bold py-3 px-8 rounded-full transition-colors">
              ดูของเล่นทั้งหมด
            </Link>
          </div>
        </div>
      </section>

      {/* Maker Family Photo Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto max-w-4xl bg-white rounded-3xl p-8 md:p-12 shadow-md flex flex-col md:flex-row items-center gap-12 border border-[#ebe1c8]">
          <div className="w-full md:w-1/2 relative aspect-square rounded-2xl overflow-hidden border-8 border-[#f7f1e3] shadow-inner rotate-[-2deg]">
            <Image
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80"
              alt="The Tinyhand Maker Family"
              fill
              className="object-cover"
            />
          </div>
          <div className="w-full md:w-1/2 text-center md:text-left">
            <h2 className="font-[family:var(--font-kanit)] text-3xl font-bold text-[#3a2e22] mb-4">
              จากครอบครัวนักทำไม้ ถึงครอบครัวของคุณ
            </h2>
            <p className="text-[#4a3e32] mb-6 leading-relaxed">
              เราเริ่มต้นทำของเล่นไม้ให้ลูกเล่นเองในครอบครัว ด้วยความตั้งใจที่อยากให้ลูกได้สัมผัสวัสดุธรรมชาติที่ปลอดภัยที่สุด เราคัดสรรไม้บีชจากป่าปลูกทดแทนในยุโรป และใช้สีย้อมจากผักผลไม้ที่ปลอดภัยแม้ลูกจะเผลอเอาเข้าปาก
            </p>
            <div className="font-[family:var(--font-kanit)] text-xl font-bold text-[#c9974b]">
              - พ่อทิน แม่อ้อ และน้องนิทาน
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
