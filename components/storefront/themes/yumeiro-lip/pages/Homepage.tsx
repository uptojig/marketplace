'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/store/cart';
import { Sparkles, ArrowRight, Heart } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  priceTHB: number;
  compareAtPriceTHB: number | null;
  imageUrl: string | null;
  categoryName: string | null;
}

interface YumeiroLipHomepageProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
  };
  products: Product[];
  categories: { id: string; name: string }[];
}

// Generate 32 distinct lip colors for the swatch row
const lipSwatches = [
  '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d',
  '#fed7aa', '#fdba74', '#fb923c', '#f97316', '#ea580c', '#c2410c', '#9a3412', '#7c2d12',
  '#fbcfe8', '#f9a8d4', '#f472b6', '#ec4899', '#db2777', '#be185d', '#9d174d', '#831843',
  '#fce7f3', '#fbcfe8', '#f9a8d4', '#f472b6', '#ec4899', '#db2777', '#be185d', '#9d174d'
];

export function YumeiroLipHomepage({ store, products, categories }: YumeiroLipHomepageProps) {
  const add = useCart((s) => s.add);
  const [selectedSwatch, setSelectedSwatch] = useState<number | null>(null);

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

  return (
    <div className="bg-[#fff0f5] min-h-screen font-[family:var(--font-prompt)] text-[#831843]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fbcfe8] to-[#fff0f5] pt-20 pb-16 px-4 text-center">
        <div className="absolute top-10 left-10 text-[#ec4899] opacity-20 animate-pulse">
          <Sparkles className="w-16 h-16" />
        </div>
        <div className="absolute bottom-20 right-10 text-[#fb7185] opacity-20 animate-pulse delay-75">
          <Heart className="w-20 h-20" />
        </div>
        
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#fb7185] mb-4">
            K-BEAUTY REINVENTED
          </h2>
          <h1 className="text-5xl md:text-7xl font-black text-[#ec4899] mb-6 tracking-tight leading-tight drop-shadow-sm">
            เลือกเฉดที่ใช่<br />จาก 32 สี
          </h1>
          <p className="text-lg md:text-xl text-[#831843]/80 mb-10 max-w-2xl mx-auto font-[family:var(--font-kanit)]">
            ลิปทินต์ ลิปแมตต์ และครีมบลัชเชอร์สไตล์เกาหลี ปั้มเดียวขึ้นสีจริง ทดสอบบนผิวเอเชีย เลือกได้จาก 32 เฉดสี
          </p>
          <button className="bg-[#ec4899] hover:bg-[#fb7185] text-white px-10 py-4 rounded-full font-bold text-lg transition-all shadow-lg shadow-[#ec4899]/30 hover:shadow-xl hover:scale-105 inline-flex items-center gap-2">
            เลือกเฉด <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Swatch Navigation Row */}
      <section className="py-8 bg-white border-y border-[#fbcfe8] shadow-sm relative z-20">
        <div className="max-w-[1400px] mx-auto px-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex gap-2 min-w-max items-center justify-center">
            {lipSwatches.map((color, index) => (
              <button
                key={index}
                onClick={() => setSelectedSwatch(index)}
                className={`w-10 h-10 rounded-full border-2 transition-all duration-300 hover:scale-110 flex-shrink-0 ${
                  selectedSwatch === index 
                    ? 'border-[#831843] scale-110 shadow-md' 
                    : 'border-white shadow-sm'
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Select color ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-black text-[#ec4899] mb-2">สินค้ายอดฮิต</h2>
            <p className="text-[#831843]/70 font-[family:var(--font-kanit)]">ลิปและบลัชเชอร์ที่สาวๆ เลิฟที่สุด</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/stores/${store.slug}/products/${product.id}`}
              className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-[#fbcfe8]/50 flex flex-col h-full"
            >
              <div className="relative aspect-square overflow-hidden bg-[#fff0f5]">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#fbcfe8]/20 text-[#ec4899]">
                    <Heart className="w-12 h-12 opacity-50" />
                  </div>
                )}
                {product.compareAtPriceTHB && product.compareAtPriceTHB > product.priceTHB && (
                  <div className="absolute top-4 right-4 bg-[#fb7185] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    Sale
                  </div>
                )}
                <button
                  onClick={(e) => handleAddToCart(product, e)}
                  className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur text-[#ec4899] font-bold py-3 rounded-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg hover:bg-[#ec4899] hover:text-white"
                >
                  ใส่ตะกร้า
                </button>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <div className="text-xs font-bold text-[#fb7185] mb-2 uppercase tracking-wide">
                  {product.categoryName || 'Lipstick'}
                </div>
                <h3 className="font-bold text-[#831843] mb-4 line-clamp-2 leading-tight group-hover:text-[#ec4899] transition-colors flex-grow">
                  {product.title}
                </h3>
                <div className="flex items-baseline gap-2 font-[family:var(--font-kanit)] mt-auto">
                  <span className="font-black text-xl text-[#ec4899]">
                    ฿{product.priceTHB.toLocaleString()}
                  </span>
                  {product.compareAtPriceTHB && (
                    <span className="text-sm text-[#831843]/50 line-through">
                      ฿{product.compareAtPriceTHB.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Categories */}
      <section className="bg-white py-20 px-4 border-t border-[#fbcfe8]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-black text-center text-[#ec4899] mb-12">คอลเลกชัน</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.slice(0, 3).map((cat, i) => (
              <Link 
                key={`${cat.id}-${cat.name}-${i}`} 
                href={`/stores/${store.slug}/category/${cat.id}`}
                className="relative overflow-hidden rounded-3xl aspect-[4/3] group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${
                  i === 0 ? 'from-[#fb7185] to-[#ec4899]' : 
                  i === 1 ? 'from-[#ec4899] to-[#be185d]' : 
                  'from-[#f472b6] to-[#db2777]'
                } opacity-90 transition-opacity group-hover:opacity-100`}></div>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                  <h3 className="text-2xl font-black mb-2">{cat.name}</h3>
                  <p className="font-[family:var(--font-kanit)] text-white/80 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    ดูสินค้าทั้งหมด
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
