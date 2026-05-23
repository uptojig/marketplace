'use client';
import React from 'react';
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
    logoUrl?: string | null;
  };
  products: Product[];
  categories: any[];
}

export function KorakotHouseHomepage({ store, products, categories }: HomepageProps) {
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

  // Select some featured products to highlight in big spreads
  const featured = products.slice(0, 3);
  const rest = products.slice(3);

  return (
    <div className="bg-[#f5ede0] text-[#3a2818] min-h-screen font-[family:var(--font-prompt)] selection:bg-[#d7a86e] selection:text-[#3a2818]">
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Mid-century interior living room" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3a2818]/60 via-[#3a2818]/30 to-transparent" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center mt-20">
          <span className="text-[#d7a86e] font-[family:var(--font-kanit)] tracking-[0.2em] text-sm uppercase mb-6 block drop-shadow-md">
            คอลเลกชันใหม่
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-[family:var(--font-kanit)] font-medium text-[#f5ede0] mb-8 leading-tight drop-shadow-lg">
            เฟอร์นิเจอร์ที่อยู่ได้<br/>สามชั่วอายุคน
          </h1>
          <p className="text-[#e8d5b7] text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light leading-relaxed drop-shadow-md">
            โซฟา เก้าอี้ และโต๊ะกาแฟทรงมิดเซนจูรี ตัดจากไม้สักจริงจากสวนป่าน่าน ผลิตเป็นล็อต 12 ชิ้น สั่งล่วงหน้า 21 วัน
          </p>
          <a href="#featured" className="inline-flex items-center justify-center px-8 py-4 bg-[#f5ede0]/10 backdrop-blur-sm border border-[#d7a86e] text-[#f5ede0] hover:bg-[#d7a86e] hover:text-[#3a2818] transition-all duration-300 font-[family:var(--font-kanit)] uppercase tracking-wider text-sm shadow-xl">
            ดูชิ้นเด่นของเดือน
          </a>
        </div>
      </section>

      {/* Featured Spreads - Interior Book Style */}
      <section id="featured" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <h2 className="text-3xl font-[family:var(--font-kanit)] font-medium text-[#7c4a1e] tracking-wide">
              ชิ้นเด่นของเดือน
            </h2>
            <div className="w-12 h-0.5 bg-[#d7a86e] mx-auto mt-6"></div>
          </div>

          <div className="space-y-32">
            {featured.map((product, index) => (
              <div key={product.id} className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 lg:gap-20 items-center`}>
                <div className="w-full lg:w-3/5">
                  <Link href={`/stores/${store.slug}/products/${product.id}`} className="group block relative overflow-hidden bg-[#e8d5b7] aspect-[4/3] shadow-lg">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#7c4a1e] font-[family:var(--font-kanit)] text-2xl opacity-50">
                        {product.title}
                      </div>
                    )}
                    <div className="absolute inset-0 ring-1 ring-inset ring-[#3a2818]/10 pointer-events-none" />
                  </Link>
                </div>
                
                <div className="w-full lg:w-2/5 flex flex-col justify-center">
                  <span className="text-[#7c4a1e] font-[family:var(--font-kanit)] text-sm tracking-widest uppercase mb-4">
                    {product.categoryName || 'เฟอร์นิเจอร์'}
                  </span>
                  <Link href={`/stores/${store.slug}/products/${product.id}`} className="group">
                    <h3 className="text-3xl md:text-4xl font-[family:var(--font-kanit)] font-medium text-[#3a2818] mb-6 group-hover:text-[#7c4a1e] transition-colors leading-tight">
                      {product.title}
                    </h3>
                  </Link>
                  <div className="flex items-baseline gap-3 mb-8">
                    <span className="text-2xl text-[#3a2818] font-medium">
                      ฿{product.priceTHB.toLocaleString()}
                    </span>
                    {product.compareAtPriceTHB && (
                      <span className="text-lg text-[#7c4a1e]/60 line-through">
                        ฿{product.compareAtPriceTHB.toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                  <div className="prose prose-sm text-[#3a2818]/80 mb-10 font-light leading-relaxed">
                    <p>
                      ผลงานคลาสสิกที่ถูกตีความใหม่ให้เข้ากับวิถีชีวิตปัจจุบัน โครงสร้างไม้สักแท้โชว์ลายไม้ธรรมชาติ
                      ขัดแต่งอย่างประณีตด้วยมือโดยช่างฝีมือชาวน่าน จัดวางในมุมพักผ่อนของคุณเพื่อสร้างบรรยากาศที่อบอุ่นและมีระดับ
                    </p>
                  </div>
                  
                  <button 
                    onClick={(e) => handleAddToCart(product, e)}
                    className="self-start px-8 py-4 bg-[#3a2818] text-[#f5ede0] hover:bg-[#7c4a1e] hover:shadow-lg transition-all duration-300 font-[family:var(--font-kanit)] tracking-wider text-sm"
                  >
                    เพิ่มลงตะกร้า
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FSC Certificate Highlight */}
      <section className="bg-[#7c4a1e] text-[#f5ede0] py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {/* subtle pattern or texture could go here */}
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="w-16 h-16 mx-auto mb-8 text-[#d7a86e]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
          </div>
          <h2 className="text-3xl md:text-4xl font-[family:var(--font-kanit)] font-medium mb-6 tracking-wide">
            ไม้ยั่งยืน มาตรฐาน FSC
          </h2>
          <div className="w-12 h-0.5 bg-[#d7a86e] mx-auto mb-8"></div>
          <p className="text-[#e8d5b7] text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-light">
            เฟอร์นิเจอร์ทุกชิ้นของเราใช้วัสดุจากสวนป่าที่ได้รับการรับรองมาตรฐานสากล FSC (Forest Stewardship Council) 
            เราเชื่อมั่นในการอยู่ร่วมกับธรรมชาติอย่างยั่งยืน เพื่อส่งต่อความสมบูรณ์สู่คนรุ่นหลัง
          </p>
        </div>
      </section>

      {/* Catalog Grid for remaining products */}
      {rest.length > 0 && (
        <section className="py-24 bg-[#e8d5b7]/20 border-t border-[#e8d5b7]/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-2xl md:text-3xl font-[family:var(--font-kanit)] font-medium text-[#3a2818] tracking-wide">
                คอลเลกชันทั้งหมด
              </h2>
              <div className="w-12 h-0.5 bg-[#d7a86e] mx-auto mt-6"></div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {rest.map((product) => (
                <Link href={`/stores/${store.slug}/products/${product.id}`} key={product.id} className="group block">
                  <div className="relative aspect-[4/5] bg-[#e8d5b7] mb-6 overflow-hidden shadow-sm group-hover:shadow-md transition-shadow duration-300">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#7c4a1e] opacity-50 font-[family:var(--font-kanit)] text-xl">
                        {product.title}
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-[#3a2818]/90 to-transparent flex justify-center translate-y-2 group-hover:translate-y-0">
                      <button 
                        onClick={(e) => handleAddToCart(product, e)}
                        className="px-6 py-3 bg-[#f5ede0] text-[#3a2818] hover:bg-[#d7a86e] transition-colors font-[family:var(--font-kanit)] text-sm tracking-wider w-full shadow-sm"
                      >
                        เพิ่มลงตะกร้า
                      </button>
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-[#7c4a1e] font-[family:var(--font-kanit)] tracking-widest uppercase block mb-2">
                      {product.categoryName || 'เฟอร์นิเจอร์'}
                    </span>
                    <h3 className="text-lg font-[family:var(--font-kanit)] font-medium text-[#3a2818] mb-2 group-hover:text-[#7c4a1e] transition-colors">
                      {product.title}
                    </h3>
                    <div className="flex justify-center items-baseline gap-3">
                      <span className="text-[#3a2818] font-medium">
                        ฿{product.priceTHB.toLocaleString()}
                      </span>
                      {product.compareAtPriceTHB && (
                        <span className="text-sm text-[#7c4a1e]/60 line-through">
                          ฿{product.compareAtPriceTHB.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
