'use client';
import React, { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Wrench, Shield, Zap, Sparkles } from 'lucide-react';
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
  const searchParams = useSearchParams();
  const currentModel = searchParams.get('model') || 'ทุกรุ่น';

  const add = useCart((s) => s.add);
  const showConfirm = useCartConfirmation((s) => s.show);

  // Filter products based on the selected vehicle model
  const filteredProducts = useMemo(() => {
    if (currentModel === 'ทุกรุ่น') return products;
    
    // Heuristic matching model name inside the product title
    // e.g. CB650R, MT-07, R3, GPX, Wave
    const query = currentModel.toLowerCase().replace(/\s+/g, '');
    return products.filter((p) => {
      const title = p.title.toLowerCase().replace(/\s+/g, '');
      const category = (p.categoryName || '').toLowerCase().replace(/\s+/g, '');
      return title.includes(query) || category.includes(query) || title.includes(query.replace('r', ''));
    });
  }, [currentModel, products]);

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

  // Predefined stats helper for our tachometer block
  const specStats = [
    { label: 'MAX TORQUE', value: '95 NM', desc: '@8,500 RPM', unit: 'NM' },
    { label: 'HORSEPOWER', value: '120 HP', desc: '@11,000 RPM', unit: 'HP' },
    { label: 'DRY WEIGHT', value: '175 KG', desc: 'CARBON-BODY', unit: 'KG' },
    { label: 'SOUND LEVEL', value: '92 DB', desc: 'STREET LEGAL', unit: 'DB' },
  ];

  return (
    <main className="bg-[#0a0a0a] text-[#fafafa] min-h-screen font-sans">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[#1f1f1f] bg-gradient-to-b from-[#111111] to-[#0a0a0a] py-20 lg:py-32">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#171717] border border-[#262626] text-[#facc15] font-sans text-xs uppercase tracking-widest font-bold">
                <Sparkles size={12} className="animate-spin" />
                <span>STREET RACER EVOLUTION</span>
              </div>
              <h1 className="font-[family:var(--font-kanit)] font-extrabold text-5xl sm:text-6xl lg:text-7xl uppercase leading-none tracking-tighter">
                VOLT-7 <span className="text-[#facc15]">GARAGE</span>
              </h1>
              <p className="text-sm sm:text-base text-[#a3a3a3] max-w-xl font-sans leading-relaxed">
                สำนักแต่งรถลาดพร้าว บริการอะไหล่แต่งซิ่งระดับโปร ท่อสูตร คาร์บอนแท้ และโช้คอัพสเปคสนามแข่ง ล็อกรุ่นรถเพื่อค้นหาอะไหล่ที่ใส่ตรงรุ่นทันที 100%
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <a
                  href="#products-list"
                  className="px-6 py-3 bg-[#facc15] text-black font-sans text-xs uppercase tracking-widest font-bold hover:bg-[#e2b813] transition-colors"
                >
                  เลือกซื้อสินค้า
                </a>
                <a
                  href={`/stores/${store.slug}/about`}
                  className="px-6 py-3 bg-transparent text-[#fafafa] border border-[#262626] hover:border-[#facc15] transition-colors font-sans text-xs uppercase tracking-widest font-bold"
                >
                  เรื่องราวของเรา
                </a>
              </div>
            </div>

            {/* Right Hero Specs (Tachometer/Torque-style Bento Blocks) */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              {specStats.map((stat, i) => (
                <div key={i} className="bg-[#121212] border border-[#1f1f1f] p-6 hover:border-[#facc15]/30 transition-all duration-300 relative group">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-transparent group-hover:bg-[#facc15] transition-colors" />
                  <span className="font-[family:var(--font-prompt)] text-[10px] tracking-widest uppercase text-[#525252] font-bold block mb-1">
                    {stat.label}
                  </span>
                  <span className="font-[family:var(--font-prompt)] text-3xl font-extrabold uppercase text-[#fafafa] tracking-tight block tabular-nums">
                    {stat.value}
                  </span>
                  <span className="text-[10px] text-[#737373] uppercase tracking-wider block mt-2 font-sans font-medium">
                    {stat.desc}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* Model locked banner */}
      {currentModel !== 'ทุกรุ่น' && (
        <div className="bg-[#171717] border-b border-[#1f1f1f] py-4 text-center">
          <p className="font-[family:var(--font-prompt)] text-xs uppercase tracking-widest text-[#facc15] font-bold">
            กำลังแสดงอะไหล่แต่งซิ่งเฉพาะสำหรับรุ่นรถ: <span className="underline underline-offset-4 decoration-2">{currentModel}</span>
          </p>
        </div>
      )}

      {/* Value Prop Banner */}
      <section className="bg-[#0c0c0c] border-b border-[#1f1f1f] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#171717] border border-[#262626] text-[#facc15]">
                <Wrench size={20} />
              </div>
              <div>
                <h3 className="font-[family:var(--font-prompt)] text-xs tracking-wider uppercase font-bold text-[#fafafa]">100% Fitment Guarantee</h3>
                <p className="text-xs text-[#737373] mt-1">ล็อกรุ่นรถแล้ว อะไหล่ทุกชิ้นใส่ได้พอดีแน่นอน ไม่ต้องดัดแปลง</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#171717] border border-[#262626] text-[#facc15]">
                <Zap size={20} />
              </div>
              <div>
                <h3 className="font-[family:var(--font-prompt)] text-xs tracking-wider uppercase font-bold text-[#fafafa]">Same-Day Delivery</h3>
                <p className="text-xs text-[#737373] mt-1">จัดส่งด่วนในกรุงเทพฯ ได้รับสินค้าภายในวันเดียวกัน</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#171717] border border-[#262626] text-[#facc15]">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="font-[family:var(--font-prompt)] text-xs tracking-wider uppercase font-bold text-[#fafafa]">18-Year Heritage</h3>
                <p className="text-xs text-[#737373] mt-1">การันตีความเชี่ยวชาญ คัดสรรเฉพาะอะไหล่คุณภาพมาตลอดยาวนาน</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section id="products-list" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
            <div>
              <h2 className="font-[family:var(--font-kanit)] font-extrabold text-3xl uppercase tracking-tight text-[#fafafa]">
                อะไหล่แนะนำสำหรับคุณ
              </h2>
              <p className="text-xs text-[#737373] mt-1">
                มีสินค้าให้เลือก {filteredProducts.length} รายการ {currentModel !== 'ทุกรุ่น' && `สำหรับ ${currentModel}`}
              </p>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-[#121212] border border-[#1f1f1f] py-16 text-center">
              <p className="text-sm text-[#737373]">ไม่พบอะไหล่แต่งซิ่งสำหรับรุ่น {currentModel} ในขณะนี้</p>
              <button 
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.delete('model');
                  window.history.pushState({}, '', url.toString());
                  window.location.reload();
                }}
                className="mt-4 px-4 py-2 bg-[#facc15] text-black text-xs font-bold uppercase tracking-wider"
              >
                ดูสินค้าทั้งหมด
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-[#121212] border border-[#1f1f1f] group flex flex-col justify-between hover:border-[#facc15] transition-all duration-300"
                >
                  <a href={`/stores/${store.slug}/products/${p.id}`} className="block overflow-hidden relative aspect-square bg-[#0f0f0f]">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#171717] text-[#525252]">
                        NO IMAGE
                      </div>
                    )}
                    
                    {/* Model tag overlay */}
                    {p.categoryName && (
                      <span className="absolute top-3 left-3 bg-black/80 border border-[#262626] text-[#a3a3a3] text-[9px] uppercase tracking-wider px-2 py-0.5 font-bold font-sans">
                        {p.categoryName}
                      </span>
                    )}
                  </a>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <a href={`/stores/${store.slug}/products/${p.id}`} className="block">
                        <h3 className="font-[family:var(--font-prompt)] text-xs font-semibold text-[#fafafa] uppercase tracking-wide group-hover:text-[#facc15] transition-colors leading-snug line-clamp-2">
                          {p.title}
                        </h3>
                      </a>
                      
                      {/* Tachometer Spec Row Mock */}
                      <div className="flex gap-2 mt-2 py-1 px-2 bg-[#171717] border border-[#262626] w-fit">
                        <span className="font-[family:var(--font-prompt)] text-[9px] font-bold text-[#facc15] tracking-wider uppercase tabular-nums">
                          HP +5% | -1.5 KG | 95 DB
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#1f1f1f] flex items-center justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="font-[family:var(--font-prompt)] text-sm font-bold text-[#fafafa] tabular-nums">
                          ฿{p.priceTHB.toLocaleString()}
                        </span>
                        {p.compareAtPriceTHB && (
                          <span className="font-[family:var(--font-prompt)] text-[10px] text-[#525252] line-through tabular-nums">
                            ฿{p.compareAtPriceTHB.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => handleAddToCart(p, e)}
                        className="px-3 py-1.5 bg-[#facc15] text-black font-sans text-[10px] font-bold uppercase tracking-wider hover:bg-[#e2b813] transition-colors"
                      >
                        ADD TO BAG
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* Social Proof Testimonials */}
      <section className="bg-[#0c0c0c] border-y border-[#1f1f1f] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="font-[family:var(--font-prompt)] text-[10px] tracking-widest text-[#525252] font-extrabold uppercase block">
            RIDER TESTIMONIAL
          </span>
          <p className="font-[family:var(--font-prompt)] text-lg sm:text-xl font-medium tracking-tight text-[#e5e5e5] italic leading-relaxed">
            "อะไหล่ของแต่งคาร์บอนและท่อสูตร ฟิตลงตัวพอดีกับรถ CB650R ของผมเป๊ะๆ เลยครับ สั่งเช้าได้บ่าย ทันขี่ออกทริปเช้าวันเสาร์พอดี แนะนำเลยร้านนี้!"
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#facc15]" />
            <span className="text-xs font-sans uppercase font-bold text-[#fafafa] tracking-wider">
              คุณอนุสรณ์, เจ้าของ CB650R
            </span>
          </div>
        </div>
      </section>

    </main>
  );
}
