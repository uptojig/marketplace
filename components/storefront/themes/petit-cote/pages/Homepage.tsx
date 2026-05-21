'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/store/cart';
import { useCartConfirmation } from '@/lib/store/cartConfirm';
import { Gift, ArrowRight } from 'lucide-react';

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
  categories: { id: string; name: string }[];
}

export function PetitCoteHomepage({ store, products, categories }: HomepageProps) {
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

  const newArrivals = products.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#fafafa] font-[family:var(--font-kanit)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#fafafa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 flex flex-col lg:flex-row items-center relative z-10">
          <div className="w-full lg:w-1/2 pr-0 lg:pr-12 text-center lg:text-left mb-12 lg:mb-0 relative">
            
            {/* Gift Registry Sticker */}
            <div className="absolute -top-12 -left-4 lg:-top-16 lg:-left-12 rotate-[-12deg] bg-[#fbcfe8] text-[#27272a] rounded-full w-24 h-24 lg:w-32 lg:h-32 flex flex-col items-center justify-center shadow-sm animate-[bounce_3s_ease-in-out_infinite]">
              <Gift className="h-6 w-6 lg:h-8 lg:w-8 mb-1" />
              <span className="text-[10px] lg:text-xs font-bold uppercase tracking-wider text-center leading-tight">Gift<br/>Registry</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-[#27272a] mb-6 leading-tight mt-12 lg:mt-0">
              เสื้อผ้าเด็กที่เลือกง่าย<br className="hidden lg:block"/> ใช้ทุกวัน
            </h1>
            <p className="text-lg text-[#525252] font-light mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              เสื้อผ้า ผ้าอ้อม และของใช้สำหรับเด็ก 0-24 เดือน เนื้อผ้าออร์แกนิคคอตตอน 100% ตัดในโปรตุเกส ใส่ได้ตั้งแต่นอนยันออกข้างนอก
            </p>
            <Link
              href={`/stores/${store.slug}/products`}
              className="inline-flex items-center justify-center px-8 py-4 bg-[#27272a] text-[#fafafa] font-light tracking-widest hover:bg-[#525252] transition-colors rounded-full uppercase text-sm"
            >
              ดูเสื้อผ้าเด็ก <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          <div className="w-full lg:w-1/2 relative">
             <div className="aspect-[4/5] bg-[#f4f4f5] rounded-tl-full rounded-tr-full overflow-hidden relative shadow-sm border-[8px] border-white">
                <img 
                  src="https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=1000&auto=format&fit=crop" 
                  alt="Baby clothes" 
                  className="object-cover w-full h-full opacity-90 grayscale-[20%]"
                />
             </div>
          </div>
        </div>
        
        {/* Soft abstract shapes */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#fbcfe8]/20 blur-3xl -z-10 rounded-full mix-blend-multiply translate-x-1/2 -translate-y-1/4" />
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light text-[#27272a] tracking-wider mb-4 uppercase">La Collection</h2>
            <div className="w-12 h-[1px] bg-[#fbcfe8] mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {newArrivals.map((product) => (
              <Link key={product.id} href={`/stores/${store.slug}/products/${product.id}`} className="group block">
                <div className="relative aspect-[3/4] mb-4 bg-[#fafafa] rounded-sm overflow-hidden group-hover:shadow-md transition-shadow duration-300 border border-[#f4f4f5]">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#525252] font-light">
                      No Image
                    </div>
                  )}
                  {product.compareAtPriceTHB && product.compareAtPriceTHB > product.priceTHB && (
                    <div className="absolute top-3 left-3 bg-[#fbcfe8] text-[#525252] text-xs px-2 py-1 uppercase tracking-wider font-medium rounded-sm">
                      Sale
                    </div>
                  )}
                  
                  {/* Quick Add Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-4 group-hover:translate-y-0">
                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      className="w-full py-3 bg-white/90 backdrop-blur-sm text-[#27272a] font-light uppercase tracking-widest text-sm hover:bg-[#27272a] hover:text-white transition-colors rounded-sm"
                    >
                      Quick Add
                    </button>
                  </div>
                </div>
                
                <div className="text-center">
                  <h3 className="text-sm font-light text-[#525252] mb-2 uppercase tracking-wide">
                    {product.title}
                  </h3>
                  <div className="flex justify-center items-center gap-3">
                    <span className="text-[#27272a] font-light">฿{product.priceTHB.toLocaleString()}</span>
                    {product.compareAtPriceTHB && (
                      <span className="text-xs text-[#525252] line-through">
                        ฿{product.compareAtPriceTHB.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <Link href={`/stores/${store.slug}/products`} className="text-[#525252] hover:text-[#27272a] font-light underline underline-offset-4 tracking-widest uppercase text-sm transition-colors">
              View All Pieces
            </Link>
          </div>
        </div>
      </section>

      {/* Registry Promo Section */}
      <section className="py-24 bg-[#fafafa]">
         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Gift className="h-12 w-12 text-[#fbcfe8] mx-auto mb-6" />
            <h2 className="text-3xl font-light text-[#27272a] mb-6">เตรียมของขวัญให้ลูกน้อย</h2>
            <p className="text-[#525252] font-light mb-10 max-w-2xl mx-auto text-lg">
              สร้างรายการของขวัญสำหรับวันเกิด แรกเกิด หรือโอกาสพิเศษต่างๆ ให้เพื่อนๆ และครอบครัวเลือกซื้อได้อย่างง่ายดาย
            </p>
            <Link
              href={`/stores/${store.slug}/registry`}
              className="inline-block px-8 py-4 border border-[#27272a] text-[#27272a] font-light tracking-widest hover:bg-[#27272a] hover:text-white transition-colors rounded-full uppercase text-sm"
            >
              Create Registry
            </Link>
         </div>
      </section>
    </div>
  );
}
